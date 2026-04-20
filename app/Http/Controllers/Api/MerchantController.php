<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use Illuminate\Support\Facades\Storage;

class MerchantController extends Controller
{
    /**
     * Get all products owned by the authenticated user (Merchant)
     */
    public function myProducts()
    {
        $products = Product::where('user_id', auth()->id())->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar Produk Jualan Anda',
            'data'    => $products
        ], 200);
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

        return response()->json([
            'success' => true,
            'message' => 'Produk Berhasil Ditambahkan ke Toko!',
            'data'    => $product
        ], 201);
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
                $oldPath = 'products/' . basename($product->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $image = $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $imagePath = $image->storeAs('products', $filename, 'public');
            $data['image_url'] = asset('storage/' . $imagePath);
        }

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data Produk Berhasil Diperbarui!',
            'data'    => $product
        ], 200);
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
