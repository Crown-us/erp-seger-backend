<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/setup-admin-web', function() {
    try {
        $user = \App\Models\User::updateOrCreate(
            ['nik' => '3578012004260001'],
            [
                'name' => 'KEVIN DWI WIJAYA',
                'email' => 'kevin@seger.com',
                'password' => \Illuminate\Support\Facades\Hash::make('SegerGacor2026!'),
                'role' => 'admin'
            ]
        );
        return "Admin KEVIN berhasil dibuat! Silakan login di /admin/login";
    } catch (\Exception $e) {
        return $e->getMessage();
    }
});

Route::get('/admin/{any?}', function () {
    return view('admin');
})->where('any', '.*');
