<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('user')->where('is_active', true);

        if ($request->has('category') && $request->category !== 'Semua') {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->latest()->get();
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
