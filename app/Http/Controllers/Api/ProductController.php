<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::where('is_active', true)->latest()->get();
        return response()->json([
            'success' => true,
            'message' => 'List Data Produk',
            'data'    => $products
        ], 200);
    }

    public function show($id)
    {
        $product = Product::find($id);
        if ($product) {
            return response()->json([
                'success' => true,
                'message' => 'Detail Data Produk',
                'data'    => $product
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'Produk Tidak Ditemukan!',
        ], 404);
    }
}
