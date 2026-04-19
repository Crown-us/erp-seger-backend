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
        $driver = config('database.default');

        if ($driver === 'mysql') {
            \DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('pembeli', 'pedagang', 'admin') DEFAULT 'pembeli'");
        } elseif ($driver === 'pgsql') {
            // PostgreSQL butuh drop constraint dulu sebelum ganti type/check
            \DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
            \DB::statement("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255)");
            \DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('pembeli', 'pedagang', 'admin'))");
            \DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'pembeli'");
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('pembeli')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = config('database.default');

        if ($driver === 'mysql') {
            \DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('pembeli', 'pedagang') DEFAULT 'pembeli'");
        } elseif ($driver === 'pgsql') {
            \DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
            \DB::statement("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255)");
            \DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('pembeli', 'pedagang'))");
            \DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'pembeli'");
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('pembeli')->change();
            });
        }
    }
};
