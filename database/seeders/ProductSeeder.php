<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $pedagang = User::where('role', 'pedagang')->first();
        $pedagangId = $pedagang ? $pedagang->id : null;

        $products = [
            [
                'user_id' => $pedagangId,
                'name' => 'Beras Pandan Wangi',
                'description' => 'Beras kualitas super dari petani lokal. Diproses alami tanpa pemutih dan pengawet. Stok segar langsung dari penggilingan.',
                'price' => 75000,
                'discount_percent' => 5,
                'stock' => 50,
                'unit' => '5kg',
                'emoji' => '🌾',
                'category' => 'Beras',
            ],
            [
                'user_id' => $pedagangId,
                'name' => 'Minyak Goreng Bimoli',
                'description' => 'Minyak goreng berkualitas dari kelapa sawit pilihan.',
                'price' => 35000,
                'discount_percent' => 0,
                'stock' => 100,
                'unit' => '2L',
                'emoji' => '🫙',
                'category' => 'Minyak',
            ],
            [
                'user_id' => $pedagangId,
                'name' => 'Gula Pasir Gulaku',
                'description' => 'Gula pasir kristal putih bersih dan manis alami.',
                'price' => 16000,
                'discount_percent' => 2,
                'stock' => 80,
                'unit' => '1kg',
                'emoji' => '🍬',
                'category' => 'Gula',
            ],
            [
                'user_id' => $pedagangId,
                'name' => 'Telur Ayam Negeri',
                'description' => 'Telur ayam negeri segar langsung dari peternakan.',
                'price' => 28000,
                'discount_percent' => 0,
                'stock' => 30,
                'unit' => '1kg',
                'emoji' => '🥚',
                'category' => 'Telur',
            ],
            [
                'user_id' => $pedagangId,
                'name' => 'Garam Meja Refina',
                'description' => 'Garam beryodium tinggi untuk kesehatan keluarga.',
                'price' => 5000,
                'discount_percent' => 0,
                'stock' => 200,
                'unit' => '250g',
                'emoji' => '🧂',
                'category' => 'Garam',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
