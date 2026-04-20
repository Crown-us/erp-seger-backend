<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\BusinessPartner;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    /**
     * Create a new order (Checkout)
     */
    public function checkout(Request $request)
    {
        $user = $request->user()->load('workplace');

        $validator = Validator::make($request->all(), [
            'items'            => 'required|array',
            'items.*.id'       => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method'   => 'required|in:qris,bank_jatim',
            'shipping_address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Logic: use shipping_address from request, or workplace relation address, or user's workplace_address field
        $shippingAddress = $request->shipping_address ?? ($user->workplace?->address ?? $user->workplace_address);

        if (!$shippingAddress) {
            return response()->json([
                'success' => false,
                'message' => 'Alamat pengiriman harus diisi atau pastikan alamat workplace sudah terisi.'
            ], 422);
        }

        try {
            return DB::transaction(function () use ($request, $user, $shippingAddress) {
                $totalPrice = 0;

                // 1. Buat Header Pesanan
                $order = Order::create([
                    'user_id'          => $user->id,
                    'total_price'      => 0,
                    'status'           => 'pending',
                    'payment_method'   => $request->payment_method,
                    'shipping_address' => $shippingAddress,
                    'notes'            => $request->notes,
                ]);

                foreach ($request->items as $item) {
                    $product = Product::lockForUpdate()->find($item['id']);
                    
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok produk {$product->name} tidak mencukupi!");
                    }

                    $price = $product->price;
                    $subTotal = $price * $item['quantity'];
                    $totalPrice += $subTotal;

                    $product->decrement('stock', $item['quantity']);

                    $order->items()->create([
                        'product_id' => $product->id,
                        'quantity'   => $item['quantity'],
                        'price'      => $price,
                    ]);
                }

                $order->update(['total_price' => $totalPrice]);

                return (new OrderResource($order->load(['user', 'items.product'])))->additional([
                    'success' => true,
                    'message' => 'Pesanan berhasil dibuat',
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Customer: My Purchases
     */
    public function myOrders()
    {
        $orders = Order::with(['items.product', 'user'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return OrderResource::collection($orders)->additional([
            'success' => true,
            'message' => 'Daftar Pesanan Saya',
        ]);
    }

    /**
     * Merchant: Incoming Orders for their products (only processing)
     */
    public function merchantOrders()
    {
        $orders = Order::with(['items' => function($query) {
                $query->whereHas('product', function($q) {
                    $q->where('user_id', auth()->id());
                })->with('product');
            }, 'user'])
            ->whereHas('items.product', function($query) {
                $query->where('user_id', auth()->id());
            })
            ->where('status', 'processing')
            ->latest()
            ->get();

        return OrderResource::collection($orders)->additional([
            'success' => true,
            'message' => 'Daftar Pesanan Masuk (Sedang Diproses)',
        ]);
    }

    /**
     * Buyer: Confirm Order Received
     */
    public function confirmReceived($id)
    {
        $order = Order::with(['user', 'items.product'])->where('user_id', auth()->id())->findOrFail($id);

        if ($order->status !== 'shipped') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan belum dikirim atau sudah selesai.'
            ], 400);
        }

        $order->update(['status' => 'completed']);

        return (new OrderResource($order))->additional([
            'success' => true,
            'message' => 'Pesanan telah diterima dan selesai.',
        ]);
    }

    /**
     * Merchant: Report by Workplace (PT)
     */
    public function reportByWorkplace()
    {
        $merchantId = auth()->id();

        $report = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->leftJoin('business_partners', 'users.workplace_id', '=', 'business_partners.id')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.user_id', $merchantId)
            ->select(
                DB::raw('COALESCE(business_partners.name, users.workplace) as pt_name'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_omzet'),
                DB::raw('COUNT(DISTINCT orders.id) as total_orders')
            )
            ->groupBy('pt_name')
            ->orderByDesc('total_omzet')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $report
        ]);
    }

    /**
     * Download Invoice PDF
     */
    public function downloadInvoice($id)
    {
        $order = Order::with(['items.product', 'user.workplace'])->findOrFail($id);

        // Security: Only the buyer or the involved merchant can download
        $isBuyer = $order->user_id === auth()->id();
        $isMerchant = $order->items()->whereHas('product', function($q) {
            $q->where('user_id', auth()->id());
        })->exists();

        if (!$isBuyer && !$isMerchant) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pdf = Pdf::loadView('pdf.invoice', compact('order'));
        
        return $pdf->download("invoice-{$order->id}.pdf");
    }

    /**
     * Merchant: Update Order Status (to shipped)
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:shipped,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $order = Order::findOrFail($id);
        
        $hasMerchantProduct = $order->items()->whereHas('product', function($q) {
            $q->where('user_id', auth()->id());
        })->exists();

        if (!$hasMerchantProduct) {
            return response()->json(['message' => 'Bukan pesanan produk Anda!'], 403);
        }

        if ($order->status !== 'processing') {
            return response()->json(['message' => 'Hanya pesanan berstatus processing yang bisa diupdate ke shipped'], 400);
        }

        $order->update(['status' => $request->status]);

        return (new OrderResource($order->load(['user', 'items.product'])))->additional([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui!',
        ]);
    }

}
