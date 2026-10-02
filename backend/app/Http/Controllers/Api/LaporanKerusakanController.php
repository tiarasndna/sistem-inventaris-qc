<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller; // Pastikan import Controller dasar
use App\Models\LaporanKerusakan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LaporanKerusakanController extends Controller
{
    /**
     * Menampilkan daftar laporan kerusakan.
     */
    public function index()
    {
        $laporans = LaporanKerusakan::with(['alatUkur', 'user'])->latest()->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar Laporan Kerusakan',
            'data'    => $laporans
        ], 200);
    }

    /**
     * Menyimpan data laporan baru ke database.
     */
    /**
     * Menyimpan data laporan baru ke database.
     */
    public function store(Request $request)
    {
        $request->validate([
            // UBAH 'alat_ukurs' menjadi 'alat_ukur' menyesuaikan nama tabel di database
            'alat_ukur_id' => 'required|exists:alat_ukur,id', 
            'deskripsi_kerusakan' => 'required|string',
        ]);

        $laporan = LaporanKerusakan::create([
            'alat_ukur_id' => $request->alat_ukur_id,
            'user_id' => Auth::id(), // Diambil dari token sanctum user yang login
            'deskripsi_kerusakan' => $request->deskripsi_kerusakan,
        ]);

        // Load relasi agar response lebih lengkap
        $laporan->load(['alatUkur', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Laporan kerusakan berhasil dikirim.',
            'data'    => $laporan
        ], 201);
    }

    /**
     * Menampilkan detail spesifik laporan.
     */
    public function show($id)
    {
        $laporan = LaporanKerusakan::with(['alatUkur', 'user'])->find($id);
        
        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail Laporan Kerusakan',
            'data'    => $laporan
        ], 200);
    }

    /**
     * Mengupdate status laporan.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:menunggu,diproses,selesai',
        ]);

        $laporan = LaporanKerusakan::find($id);

        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan'
            ], 404);
        }

        $laporan->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status laporan berhasil diperbarui.',
            'data'    => $laporan
        ], 200);
    }

    /**
     * Menghapus laporan dari database.
     */
    public function destroy($id)
    {
        $laporan = LaporanKerusakan::find($id);

        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan'
            ], 404);
        }

        $laporan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Laporan kerusakan berhasil dihapus.'
        ], 200);
    }
}