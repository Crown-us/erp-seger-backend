<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('price');
            $table->integer('discount_percent')->default(0);
            $table->integer('stock')->default(0);
            $table->string('unit')->default('pcs'); // kg, liter, bks
            $table->string('emoji')->nullable();
            $table->string('image_url')->nullable();
            $table->string('category')->default('Sembako');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
