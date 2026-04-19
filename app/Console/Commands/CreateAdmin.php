<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdmin extends Command
{
    protected $signature = 'make:admin {nik?} {name?} {email?} {password?}';
    protected $description = 'Create a new admin user safely';

    public function handle()
    {
        $nik = $this->argument('nik') ?? $this->ask('Masukkan NIK untuk Admin');
        $name = $this->argument('name') ?? $this->ask('Masukkan Nama Admin');
        $email = $this->argument('email') ?? $this->ask('Masukkan Email Admin');
        $password = $this->argument('password') ?? $this->secret('Masukkan Password Admin');

        if (!$nik || !$name || !$email || !$password) {
            $this->error('Semua data (NIK, Nama, Email, Password) harus diisi!');
            return;
        }

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

        $this->info("Admin {$name} berhasil dibuat! Silakan login di /admin/login");
    }
}
