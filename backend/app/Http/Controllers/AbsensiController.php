<?php

namespace App\Http\Controllers;

use App\Http\Resources\AbsensiResource;
use App\Models\Absensi;
use App\Models\Dosen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Tymon\JWTAuth\Facades\JWTAuth;

class AbsensiController extends Controller
{
    /**
     * POST /absensi
     */
    public function createAbsensi(Request $request): JsonResponse
    {
        $request->validate([
            'mahasiswaId' => 'required|string',
            'status' => 'required|string|in:Hadir,Sakit,Izin,Alpa,Terlambat',
            'waktu' => 'nullable|date',
            'jam_masuk' => 'nullable|date_format:H:i',
        ]);

        $token = str_replace('Bearer ', '', $request->header('Authorization'));
        $payload = JWTAuth::setToken($token)->getPayload();
        $userId = $payload->get('id');

        // Resolve dosenId from logged-in user
        $dosen = Dosen::where('user_id', $userId)->first();
        if (!$dosen) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Hanya dosen yang dapat mencatat absensi',
            ], 403);
        }

        $absensiId = 'abs-' . time();
        $waktu = $request->waktu ?? now()->toISOString();
        $jamMasuk = $request->jam_masuk ? $request->jam_masuk . ':00' : null;

        $absensi = Absensi::create([
            'id' => $absensiId,
            'mahasiswa_id' => $request->mahasiswaId,
            'dosen_id' => $dosen->id,
            'status' => $request->status,
            'waktu' => $waktu,
            'jam_masuk' => $jamMasuk,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Absensi berhasil dicatat',
            'data' => ['absensiId' => $absensiId],
        ], 201);
    }

    /**
     * GET /absensi
     */
    public function getAllAbsensi(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 50), 200);

        $absensi = Absensi::select(
                'absensi.id',
                'absensi.mahasiswa_id',
                'absensi.dosen_id',
                'absensi.status',
                'absensi.waktu',
                'absensi.jam_masuk',
                'mahasiswa.nama',
                'mahasiswa.nim'
            )
            ->join('mahasiswa', 'absensi.mahasiswa_id', '=', 'mahasiswa.id')
            ->orderBy('absensi.waktu', 'desc')
            ->paginate($perPage);

        // Apply keterlambatan calculation via resource
        $absensi->getCollection()->transform(fn($a) => new AbsensiResource($a));

        return response()->json([
            'status' => 'success',
            'data' => ['absensi' => $absensi],
        ]);
    }

    /**
     * GET /absensi/{id}
     */
    public function getAbsensiById(string $id): JsonResponse
    {
        $absensi = Absensi::find($id);

        if (!$absensi) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Absensi tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => ['absensi' => new AbsensiResource($absensi)],
        ]);
    }

    /**
     * GET /absensi/mahasiswa/{mahasiswaId}
     */
    public function getAbsensiByMahasiswaId(Request $request, string $mahasiswaId): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 30), 100);

        $absensi = Absensi::where('mahasiswa_id', $mahasiswaId)
            ->orderBy('waktu', 'desc')
            ->paginate($perPage);

        $absensi->getCollection()->transform(fn($a) => new AbsensiResource($a));

        return response()->json([
            'status' => 'success',
            'data' => ['absensi' => $absensi],
        ]);
    }

    /**
     * PUT /absensi/{id}
     */
    public function editAbsensiById(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:Hadir,Sakit,Izin,Alpa,Terlambat',
        ]);

        $absensi = Absensi::find($id);

        if (!$absensi) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Gagal memperbarui absensi. Id tidak ditemukan',
            ], 404);
        }

        $absensi->update(['status' => $request->status]);

        return response()->json([
            'status' => 'success',
            'message' => 'Absensi berhasil diperbarui',
        ]);
    }

    /**
     * DELETE /absensi/{id}
     */
    public function deleteAbsensiById(string $id): JsonResponse
    {
        $absensi = Absensi::find($id);

        if (!$absensi) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Absensi gagal dihapus. Id tidak ditemukan',
            ], 404);
        }

        $absensi->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Absensi berhasil dihapus',
        ]);
    }
}
