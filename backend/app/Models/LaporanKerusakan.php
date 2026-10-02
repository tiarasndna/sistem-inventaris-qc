<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LaporanKerusakan extends Model
{
    use HasFactory;

    // Menentukan tabel jika nama tidak plural standar (meskipun Laravel otomatis mendeteksi 'laporan_kerusakans')
    protected $table = 'laporan_kerusakans';

    // Kolom yang boleh diisi (mass assignable)
    protected $fillable = [
        'alat_ukur_id',
        'user_id',
        'deskripsi_kerusakan',
        'status',
    ];

    // Relasi ke tabel AlatUkur
    public function alatUkur()
    {
        return $this->belongsTo(AlatUkur::class);
    }

    // Relasi ke tabel User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}