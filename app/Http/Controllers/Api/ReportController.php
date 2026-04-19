<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Merchant: Report by Workplace (PT)
     */
    public function reportByWorkplace(Request $request)
    {
        $merchantId = auth()->id();

        // Mengambil data omzet dikelompokkan berdasarkan workplace (baik dari kolom atau relasi)
        $reports = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->leftJoin('business_partners', 'users.workplace_id', '=', 'business_partners.id')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.user_id', $merchantId)
            // Hanya tampilkan yang statusnya sudah diproses/selesai (opsional, sesuaikan bisnis)
            // ->whereIn('orders.status', ['completed', 'shipped'])
            ->select(
                DB::raw('COALESCE(business_partners.name, users.workplace) as workplace_name'),
                DB::raw('COUNT(DISTINCT orders.id) as total_orders'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('workplace_name')
            ->orderByDesc('total_revenue')
            ->get();

        return response()->json(['data' => $reports]);
    }
}
