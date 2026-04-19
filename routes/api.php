<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\MerchantController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/test-users', function() {
    return response()->json([
        'users' => \App\Models\User::select('id', 'name', 'nik', 'role')->get()
    ]);
});
Route::get('/force-seed', function() {
    try {
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        return response()->json(['message' => 'Seeding success!', 'output' => \Illuminate\Support\Facades\Artisan::output()]);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Seeding failed!', 'error' => $e->getMessage()], 500);
    }
});
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User / Profile
    Route::get('/user', function (Request $request) {
        $user = $request->user()->load('workplace');
        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'nik' => $user->nik,
                'role' => $user->role,
                'workplace' => $user->workplace?->name ?? $user->workplace,
                'workplace_address' => $user->workplace?->address ?? $user->workplace_address,
            ]
        ]);
    });
    Route::put('/user/update-profile', [UserController::class, 'updateProfile']);
    Route::put('/user/update-address', [UserController::class, 'updateAddress']);
    Route::put('/user/update-password', [UserController::class, 'updatePassword']);

    // Universal Order Routes
    Route::get('/orders/{id}/invoice', [OrderController::class, 'downloadInvoice']);

    // Admin Routes
    Route::middleware('role:admin')->group(function () {
        // Employee Management
        Route::get('/admin/employees', [AdminController::class, 'indexEmployees']);
        Route::post('/admin/employees', [AdminController::class, 'storeEmployee']);
        Route::put('/admin/employees/{id}', [AdminController::class, 'updateEmployee']);
        Route::delete('/admin/employees/{id}', [AdminController::class, 'destroyEmployee']);

        // Shop Management
        Route::get('/admin/shops', [AdminController::class, 'indexShops']);
        Route::post('/admin/shops', [AdminController::class, 'storeShop']);
        Route::put('/admin/shops/{id}', [AdminController::class, 'updateShop']);
        Route::delete('/admin/shops/{id}', [AdminController::class, 'destroyShop']);

        // Order Management
        Route::get('/admin/orders', [AdminController::class, 'indexOrders']);
        Route::post('/admin/orders/{id}/confirm', [AdminController::class, 'confirmOrder']);
    });

    // Merchant (Pedagang) Routes
    Route::middleware('role:pedagang|admin')->group(function () {
        Route::get('/merchant/products', [MerchantController::class, 'myProducts']);
        Route::post('/merchant/products', [MerchantController::class, 'store']);
        Route::put('/merchant/products/{id}', [MerchantController::class, 'update']);
        Route::delete('/merchant/products/{id}', [MerchantController::class, 'destroy']);
        
        Route::get('/merchant/orders', [OrderController::class, 'merchantOrders']);
        Route::put('/merchant/orders/{id}/status', [OrderController::class, 'updateStatus']);
        
        Route::get('/merchant/reports/by-workplace', [OrderController::class, 'reportByWorkplace']);
    });

    // Customer (Pembeli) Routes
    Route::middleware('role:pembeli|admin')->group(function () {
        Route::post('/orders/checkout', [OrderController::class, 'checkout']);
        Route::get('/orders/my', [OrderController::class, 'myOrders']);
        Route::put('/buyer/orders/{id}/receive', [OrderController::class, 'confirmReceived']);
    });
});
