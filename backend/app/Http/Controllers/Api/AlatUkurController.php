<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlatUkur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AlatUkurController extends Controller
{
    /**
     * GET /api/alat-ukur
     *
     * Menampilkan semua data alat ukur beserta status ketersediaannya.
     * Status dihitung dengan withExists() sehingga hanya 1 query.
     */
    public function index()
    {
        $alatUkur = AlatUkur::query()
            ->withExists([
                'peminjaman as sedang_dipinjam' => function ($q) {
                    $q->whereNull('tanggal_kembali');
                },
            ])
            ->orderBy('kode_alat')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $alatUkur,
        ]);
    }

    /**
     * POST /api/alat-ukur (admin & petugas)
     */
    public function store(Request $request)
    {
        abort_unless($request->user()->hasRole('admin', 'petugas'), 403, 'Anda tidak memiliki akses untuk aksi ini.');

        $validated = Validator::make($request->all(), [
            'kode_alat' => ['required', 'string', 'unique:alat_ukur,kode_alat'],
            'nama_alat' => ['required', 'string'],
            'kategori' => ['nullable', 'string', 'in:Mekanik,Elektrik,Sipil'],
            'merk' => ['nullable', 'string'],
            'sn' => ['nullable', 'string'],
            'spesifikasi' => ['nullable', 'string'],
            'kondisi' => ['required', 'in:Baik,RPP,RT'],
            'tanggal_kalibrasi_terakhir' => ['nullable', 'date'],
            'tanggal_kalibrasi_selanjutnya' => ['nullable', 'date'],
            'keterangan' => ['nullable', 'string'],
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validated->errors(),
            ], 422);
        }

        try {
            $alat = AlatUkur::create($validated->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Alat ukur baru berhasil didaftarkan.',
                'data' => $alat,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Gagal menambahkan alat ukur', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menambahkan alat ukur.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /api/alat-ukur/{id}
     */
    public function show($id)
    {
        try {
            $alat = AlatUkur::with([
                'peminjaman.peminta',
                'riwayatKalibrasi',
            ])->find($id);

            if (!$alat) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Alat Ukur tidak ditemukan.',
                ], 404);
            }

            // Pakai relasi yang sudah di-load (tanpa query tambahan)
            $sedangDipinjam = $alat->peminjaman
                ->contains(fn ($p) => is_null($p->tanggal_kembali));

            return response()->json([
                'status' => 'success',
                'data' => [
                    'detail_alat' => $alat,
                    'status_saat_ini' => $sedangDipinjam ? 'Sedang Dipinjam' : 'Tersedia',
                ],
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Gagal mengambil detail alat ukur', [
                'id' => $id,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil detail alat ukur.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * PUT/PATCH /api/alat-ukur/{id} (admin & petugas)
     */
    public function update(Request $request, $id)
    {
        abort_unless($request->user()->hasRole('admin', 'petugas'), 403, 'Anda tidak memiliki akses untuk aksi ini.');

        $alat = AlatUkur::find($id);

        if (!$alat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Alat Ukur tidak ditemukan.',
            ], 404);
        }

        $validated = Validator::make($request->all(), [
            'kode_alat' => [
                'sometimes',
                'string',
                Rule::unique('alat_ukur', 'kode_alat')->ignore($id),
            ],
            'nama_alat' => ['sometimes', 'string'],
            'kategori' => ['nullable', 'string', 'in:Mekanik,Elektrik,Sipil'],
            'merk' => ['nullable', 'string'],
            'sn' => ['nullable', 'string'],
            'spesifikasi' => ['nullable', 'string'],
            'kondisi' => ['sometimes', 'in:Baik,RPP,RT'],
            'tanggal_kalibrasi_terakhir' => ['nullable', 'date'],
            'tanggal_kalibrasi_selanjutnya' => ['nullable', 'date'],
            'keterangan' => ['nullable', 'string'],
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validated->errors(),
            ], 422);
        }

        try {
            $alat->update($validated->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Data Alat Ukur berhasil diperbarui.',
                'data' => $alat->fresh(),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Gagal memperbarui alat ukur', [
                'id' => $id,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui data alat ukur.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * DELETE /api/alat-ukur/{id} (admin saja)
     */
    public function destroy(Request $request, $id)
    {
        abort_unless($request->user()->hasRole('admin'), 403, 'Anda tidak memiliki akses untuk aksi ini.');

        $alat = AlatUkur::find($id);

        if (!$alat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Alat Ukur tidak ditemukan.',
            ], 404);
        }

        try {
            $alat->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Alat Ukur berhasil dihapus secara permanen.',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Gagal menghapus alat ukur', [
                'id' => $id,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus alat ukur.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}