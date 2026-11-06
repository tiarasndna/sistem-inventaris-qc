<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Sesuaikan nama tabel 'peminjaman' dengan yang ada di database kamu
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->index(['alat_ukur_id', 'tanggal_kembali'], 'peminjaman_alat_kembali_index');
        });
    }

    public function down(): void
    {
        Schema::table('peminjaman', function (Blueprint $table) {
            $table->dropIndex('peminjaman_alat_kembali_index');
        });
    }
};