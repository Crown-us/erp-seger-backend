<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdmin extends Command
{
    protected $signature = 'make:admin';
    protected $description = 'Create a new admin user safely';

    public function handle()
    {
        $nik = $this->ask('Masukkan NIK untuk Admin');
        $name = $this->ask('Masukkan Nama Admin');
        $email = $this->ask('Masukkan Email Admin');
        $password = $this->secret('Masukkan Password Admin');

        if (User::where('nik', $nik)->exists()) {
            $this->error('User dengan NIK tersebut sudah ada!');
            return;
        }

        User::create([
            'nik' => $nik,
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'admin',
        ]);

        $this->info('Admin berhasil dibuat! Silakan login di /admin/login');
    }
}
