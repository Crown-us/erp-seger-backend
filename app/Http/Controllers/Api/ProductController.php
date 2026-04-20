<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('user')->where('is_active', true)->latest()->get();
        return ProductResource::collection($products)->additional([
            'success' => true,
            'message' => 'List Data Produk',
        ]);
    }

    public function show($id)
    {
        $product = Product::with('user')->find($id);
        if ($product) {
            return (new ProductResource($product))->additional([
                'success' => true,
                'message' => 'Detail Data Produk',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Produk Tidak Ditemukan!',
        ], 404);
    }
}
