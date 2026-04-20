<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\ProductResource;

use Illuminate\Support\Facades\Storage;

class MerchantController extends Controller
{
    /**
     * Get all products owned by the authenticated user (Merchant)
     */
    public function myProducts()
    {
        $user = auth()->user();
        
        if ($user->role === 'admin') {
            $products = Product::with('user')->latest()->get();
        } else {
            $products = Product::where('user_id', $user->id)->latest()->get();
        }

        return ProductResource::collection($products)->additional([
            'success' => true,
            'message' => 'Daftar Produk Toko Anda',
        ]);
    }

    /**
     * Dashboard stats for merchant.
     */
    public function dashboardStats()
    {
        $merchantId = auth()->id();

        // 1. Total Turnover (Omzet) from completed/shipped orders
        $turnover = \App\Models\OrderItem::whereHas('product', function($q) use ($merchantId) {
                $q->where('user_id', $merchantId);
            })
            ->whereHas('order', function($q) {
                $q->whereIn('status', ['shipped', 'completed']);
            })
            ->sum(\Illuminate\Support\Facades\DB::raw('quantity * price'));

        // 2. Active Orders count (pending/processing)
        $activeOrders = \App\Models\Order::whereHas('items.product', function($q) use ($merchantId) {
                $q->where('user_id', $merchantId);
            })
            ->whereIn('status', ['pending', 'processing'])
            ->count();

        // 3. Low stock products (less than 5)
        $lowStockCount = Product::where('user_id', $merchantId)
            ->where('stock', '<', 5)
            ->count();

        // 4. Total products
        $totalProducts = Product::where('user_id', $merchantId)->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'turnover'       => (int) $turnover,
                'active_orders'  => $activeOrders,
                'low_stock'      => $lowStockCount,
                'total_products' => $totalProducts,
            ]
        ]);
    }

    /**
     * Merchant add new product
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'             => 'required',
            'original_price'   => 'required|numeric',
            'discount_percent' => 'nullable|integer|min:0|max:100',
            'stock'            => 'required|integer',
            'unit'             => 'required',
            'category'         => 'required',
            'image'            => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $originalPrice = $request->original_price;
        $discountPercent = $request->discount_percent ?? 0;
        $price = $originalPrice - ($originalPrice * ($discountPercent / 100));

        $imageUrl = $request->image_url;

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('products', $filename, 'public');
            $imageUrl = asset('storage/' . $imagePath);
        }

        $product = Product::create([
            'user_id'          => auth()->id(),
            'name'             => $request->name,
            'description'      => $request->description,
            'price'            => $price,
            'original_price'   => $originalPrice,
            'discount_percent' => $discountPercent,
            'stock'            => $request->stock,
            'unit'             => $request->unit,
            'emoji'            => $request->emoji ?? '📦',
            'image_url'        => $imageUrl,
            'category'         => $request->category,
            'is_active'        => true,
        ]);

        return (new ProductResource($product))->additional([
            'success' => true,
            'message' => 'Produk Berhasil Ditambahkan ke Toko!',
        ]);
    }

    /**
     * Merchant update their product
     */
    public function update(Request $request, $id)
    {
        $product = Product::where('user_id', auth()->id())->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan atau bukan milik Anda!',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'             => 'sometimes|required',
            'original_price'   => 'sometimes|required|numeric',
            'discount_percent' => 'nullable|integer|min:0|max:100',
            'stock'            => 'sometimes|required|integer',
            'unit'             => 'sometimes|required',
            'category'         => 'sometimes|required',
            'image'            => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->all();

        // Recalculate price if original_price or discount_percent is updated
        if ($request->has('original_price') || $request->has('discount_percent')) {
            $originalPrice = $request->original_price ?? $product->original_price;
            $discountPercent = $request->discount_percent ?? $product->discount_percent;
            $data['price'] = $originalPrice - ($originalPrice * ($discountPercent / 100));
        }

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($product->image_url) {
                // Get filename from URL
                $urlParts = explode('/', $product->image_url);
                $oldFilename = end($urlParts);
                $oldPath = 'products/' . $oldFilename;
                Storage::disk('public')->delete($oldPath);
            }

            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('products', $filename, 'public');
            $data['image_url'] = asset('storage/' . $imagePath);
        }

        $product->update($data);

        return (new ProductResource($product))->additional([
            'success' => true,
            'message' => 'Data Produk Berhasil Diperbarui!',
        ]);
    }

    /**
     * Merchant delete their product
     */
    public function destroy($id)
    {
        $product = Product::where('user_id', auth()->id())->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan atau bukan milik Anda!',
            ], 404);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk Berhasil Dihapus dari Toko!',
        ], 200);
    }
}
