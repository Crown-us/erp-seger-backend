<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Kolom workplace (Nama PT) & Alamat Workplace jika tidak pakai relasi
            if (!Schema::hasColumn('users', 'workplace')) {
                $table->string('workplace')->nullable()->after('workplace_id');
            }
            if (!Schema::hasColumn('users', 'workplace_address')) {
                $table->text('workplace_address')->nullable()->after('workplace');
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'image')) {
                $table->string('image')->nullable()->after('name');
            }
            // Description sudah ada di 2024_03_20_000000_create_products_table.php, tapi pastikan ada
            if (!Schema::hasColumn('products', 'description')) {
                $table->text('description')->nullable()->after('image');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['workplace', 'workplace_address']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['image', 'description']);
        });
    }
};
