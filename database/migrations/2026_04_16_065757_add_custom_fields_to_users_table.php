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
            $table->string('nik')->unique()->after('id');
            $table->enum('role', ['pembeli', 'pedagang'])->default('pembeli')->after('email');
            $table->unsignedBigInteger('workplace_id')->nullable()->after('role');

            $table->foreign('workplace_id')->references('id')->on('business_partners')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['workplace_id']);
            $table->dropColumn(['nik', 'role', 'workplace_id']);
        });
    }
};
