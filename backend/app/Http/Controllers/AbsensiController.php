<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Dosen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Tymon\JWTAuth\Facades\JWTAuth;

class AbsensiController extends Controller
{
    /**
     * Helper: hitung keterlambatan
     */
    private function hitungKeterlambatan(Absensi $absensi): array
    {
        $data = $absensi->toArray();

        if ($absensi->jam_masuk) {
            $jamWajib = config('attendance.jam_wajib', '07:30');
            $jamMasuk = Carbon::createFromFormat('H:i:s', $absensi->jam_masuk);
            $jamWajibCarbon = Carbon::createFromFormat('H:i', $jamWajib);

            if ($jamMasuk->greaterThan($jamWajibCarbon)) {
                $selisih = $jamWajibCarbon->diffInMinutes($jamMasuk);
                $jam = intdiv($selisih, 60);
                $menit = $selisih % 60;

                $data['terlambat_menit'] = $selisih;
                $data['terlambat_jam'] = $jam > 0
                    ? "{$jam} jam {$menit} menit"
                    : "{$menit} menit";
            } else {
                $data['terlambat_menit'] = 0;
                $data['terlambat_jam'] = '0 menit';
            }
        } else {
            $data['terlambat_menit'] = null;
            $data['terlambat_jam'] = null;
        }

        return $data;
    }

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
    public function getAllAbsensi(): JsonResponse
    {
        $absensi = Absensi::select('absensi.*', 'mahasiswa.nama', 'mahasiswa.nim')
            ->join('mahasiswa', 'absensi.mahasiswa_id', '=', 'mahasiswa.id')
            ->get()
            ->map(fn($a) => $this->hitungKeterlambatan($a));

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
            'data' => ['absensi' => $this->hitungKeterlambatan($absensi)],
        ]);
    }

    /**
     * GET /absensi/mahasiswa/{mahasiswaId}
     */
    public function getAbsensiByMahasiswaId(string $mahasiswaId): JsonResponse
    {
        $absensi = Absensi::where('mahasiswa_id', $mahasiswaId)
            ->get()
            ->map(fn($a) => $this->hitungKeterlambatan($a));

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
