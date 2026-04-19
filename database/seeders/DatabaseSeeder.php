<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\BusinessPartner;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Business Partners (PT)
        $ptA = BusinessPartner::create([
            'name' => 'PT Sejahtera Bersama',
            'address' => 'Jl. Industri No. 12, Surabaya'
        ]);

        $ptB = BusinessPartner::create([
            'name' => 'CV Maju Jaya',
            'address' => 'Jl. Kebangkitan No. 45, Sidoarjo'
        ]);

        // 2. Create Pembeli (Karyawan PT A)
        User::create([
            'nik' => '123456789',
            'name' => 'Budi Pembeli',
            'email' => 'budi@example.com',
            'password' => Hash::make('123456789'),
            'role' => 'pembeli',
            'workplace_id' => $ptA->id
        ]);

        // 3. Create Pedagang (Karyawan PT B)
        User::create([
            'nik' => '987654321',
            'name' => 'Siti Pedagang',
            'email' => 'siti@example.com',
            'password' => Hash::make('987654321'),
            'role' => 'pedagang',
            'workplace_id' => $ptB->id
        ]);

        // Call other seeders if needed
        $this->call([
            ProductSeeder::class,
        ]);
    }
}
