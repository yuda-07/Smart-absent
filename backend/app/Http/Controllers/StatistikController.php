<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatistikController extends Controller
{
    /**
     * Build a cache key from request params
     */
    private function cacheKey(string $prefix, Request $request): string
    {
        $params = $request->only(['month', 'year', 'jurusan', 'prodi_id', 'angkatan', 'kelas', 'apel_only', 'senin_only']);
        ksort($params);
        $suffix = http_build_query($params);
        return "statistik.{$prefix}.{$suffix}";
    }

    /**
     * Helper: apply common filters to absensi query
     */
    private function applyFilters($query, Request $request)
    {
        $query->join('mahasiswa', 'absensi.mahasiswa_id', '=', 'mahasiswa.id');

        if ($request->filled('jurusan')) {
            $query->where('mahasiswa.jurusan', $request->jurusan);
        }
        if ($request->filled('prodi_id')) {
            $query->where('mahasiswa.prodi_id', $request->prodi_id);
        }
        if ($request->filled('angkatan')) {
            $query->where('mahasiswa.angkatan', $request->angkatan);
        }
        if ($request->filled('kelas')) {
            $query->where('mahasiswa.kelas', $request->kelas);
        }
        if ($request->filled('month')) {
            $query->whereMonth('absensi.waktu', $request->month);
        }
        if ($request->filled('year')) {
            $query->whereYear('absensi.waktu', $request->year);
        }

        // Only include apel participants (angkatan 2024 and 2025)
        if ($request->boolean('apel_only')) {
            $query->whereIn('mahasiswa.angkatan', [2024, 2025]);
        }

        return $query;
    }

    /**
     * GET /statistik/hari
     */
    public function getStatsByHari(Request $request): JsonResponse
    {
        $key = $this->cacheKey('hari', $request);

        $stats = Cache::remember($key, 300, function () use ($request) {
            $query = Absensi::select(
                    DB::raw('DATE(absensi.waktu) as tanggal'),
                    'absensi.status',
                    DB::raw('COUNT(*) as count')
                );

            $this->applyFilters($query, $request);

            // Filter for Mondays only (apel day)
            if ($request->boolean('senin_only', true)) {
                $query->whereRaw("EXTRACT(DOW FROM absensi.waktu) = 1");
            }

            return $query
                ->groupBy(DB::raw('DATE(absensi.waktu)'), 'absensi.status')
                ->orderBy(DB::raw('DATE(absensi.waktu)'), 'asc')
                ->get()
                ->toArray();
        });

        return response()->json([
            'status' => 'success',
            'data' => ['stats' => $stats],
        ]);
    }

    /**
     * GET /statistik/minggu
     */
    public function getStatsByMinggu(Request $request): JsonResponse
    {
        $key = $this->cacheKey('minggu', $request);

        $stats = Cache::remember($key, 300, function () use ($request) {
            $query = Absensi::select(
                    DB::raw("TO_CHAR(absensi.waktu, 'IYYY') as tahun_iso"),
                    DB::raw("TO_CHAR(absensi.waktu, 'IW') as minggu"),
                    DB::raw("MIN(DATE(absensi.waktu)) as tanggal_awal"),
                    DB::raw("MAX(DATE(absensi.waktu)) as tanggal_akhir"),
                    'absensi.status',
                    DB::raw('COUNT(*) as count')
                );

            $this->applyFilters($query, $request);

            return $query
                ->groupBy(DB::raw("TO_CHAR(absensi.waktu, 'IYYY')"), DB::raw("TO_CHAR(absensi.waktu, 'IW')"), 'absensi.status')
                ->orderBy(DB::raw("TO_CHAR(absensi.waktu, 'IW')"), 'asc')
                ->get()
                ->toArray();
        });

        return response()->json([
            'status' => 'success',
            'data' => ['stats' => $stats],
        ]);
    }

    /**
     * GET /statistik/bulan
     */
    public function getStatsByBulan(Request $request): JsonResponse
    {
        $key = $this->cacheKey('bulan', $request);

        $stats = Cache::remember($key, 300, function () use ($request) {
            $query = Absensi::select(
                    DB::raw('EXTRACT(MONTH FROM absensi.waktu) as bulan'),
                    DB::raw('EXTRACT(YEAR FROM absensi.waktu) as tahun'),
                    'absensi.status',
                    DB::raw('COUNT(*) as count')
                );

            $this->applyFilters($query, $request);

            return $query
                ->groupBy(DB::raw('EXTRACT(MONTH FROM absensi.waktu)'), DB::raw('EXTRACT(YEAR FROM absensi.waktu)'), 'absensi.status')
                ->orderBy(DB::raw('EXTRACT(MONTH FROM absensi.waktu)'), 'asc')
                ->get()
                ->toArray();
        });

        return response()->json([
            'status' => 'success',
            'data' => ['stats' => $stats],
        ]);
    }

    /**
     * GET /statistik/semester
     */
    public function getStatsBySemester(Request $request): JsonResponse
    {
        $key = $this->cacheKey('semester', $request);

        $stats = Cache::remember($key, 300, function () use ($request) {
            $query = Absensi::select(
                    DB::raw("CASE WHEN EXTRACT(MONTH FROM absensi.waktu) BETWEEN 1 AND 6 THEN 'Genap' ELSE 'Ganjil' END as semester"),
                    DB::raw('EXTRACT(YEAR FROM absensi.waktu) as tahun'),
                    'absensi.status',
                    DB::raw('COUNT(*) as count')
                );

            $this->applyFilters($query, $request);

            return $query
                ->groupBy(
                    DB::raw("CASE WHEN EXTRACT(MONTH FROM absensi.waktu) BETWEEN 1 AND 6 THEN 'Genap' ELSE 'Ganjil' END"),
                    DB::raw('EXTRACT(YEAR FROM absensi.waktu)'),
                    'absensi.status'
                )
                ->orderBy(DB::raw('EXTRACT(YEAR FROM absensi.waktu)'), 'asc')
                ->get()
                ->toArray();
        });

        return response()->json([
            'status' => 'success',
            'data' => ['stats' => $stats],
        ]);
    }

    /**
     * GET /statistik/kelas
     */
    public function getStatsByKelas(Request $request): JsonResponse
    {
        $key = $this->cacheKey('kelas', $request);

        $stats = Cache::remember($key, 300, function () use ($request) {
            $query = Absensi::select(
                    'mahasiswa.kelas',
                    'absensi.status',
                    DB::raw('COUNT(*) as count')
                );

            $this->applyFilters($query, $request);

            return $query
                ->groupBy('mahasiswa.kelas', 'absensi.status')
                ->orderBy('mahasiswa.kelas', 'asc')
                ->get()
                ->toArray();
        });

        return response()->json([
            'status' => 'success',
            'data' => ['stats' => $stats],
        ]);
    }

    /**
     * GET /statistik/angkatan
     */
    public function getStatsByAngkatan(Request $request): JsonResponse
    {
        $key = $this->cacheKey('angkatan', $request);

        $stats = Cache::remember($key, 300, function () use ($request) {
            $query = Absensi::select(
                    'mahasiswa.angkatan',
                    'absensi.status',
                    DB::raw('COUNT(*) as count')
                );

            $this->applyFilters($query, $request);

            return $query
                ->groupBy('mahasiswa.angkatan', 'absensi.status')
                ->orderBy('mahasiswa.angkatan', 'asc')
                ->get()
                ->toArray();
        });

        return response()->json([
            'status' => 'success',
            'data' => ['stats' => $stats],
        ]);
    }

    /**
     * GET /statistik/jurusan
     */
    public function getStatsByJurusan(Request $request): JsonResponse
    {
        $key = $this->cacheKey('jurusan', $request);

        $stats = Cache::remember($key, 300, function () use ($request) {
            $query = Absensi::select(
                    'mahasiswa.jurusan',
                    'absensi.status',
                    DB::raw('COUNT(*) as count')
                );

            $this->applyFilters($query, $request);

            return $query
                ->groupBy('mahasiswa.jurusan', 'absensi.status')
                ->orderBy('mahasiswa.jurusan', 'asc')
                ->get()
                ->toArray();
        });

        return response()->json([
            'status' => 'success',
            'data' => ['stats' => $stats],
        ]);
    }

    /**
     * GET /statistik/filter-options
     * Optimized: single query for both angkatan and kelas
     */
    public function getFilterOptions(Request $request): JsonResponse
    {
        $key = $this->cacheKey('filter_options', $request);

        $data = Cache::remember($key, 300, function () use ($request) {
            $baseQuery = DB::table('mahasiswa')->whereIn('angkatan', [2024, 2025]);

            if ($request->filled('jurusan')) {
                $baseQuery->where('jurusan', $request->jurusan);
            }
            if ($request->filled('prodi_id')) {
                $baseQuery->where('prodi_id', $request->prodi_id);
            }

            // Single query: get distinct angkatan
            $angkatans = (clone $baseQuery)
                ->select('angkatan')
                ->distinct()
                ->orderBy('angkatan', 'desc')
                ->pluck('angkatan')
                ->toArray();

            // For kelas: additionally filter by angkatan if provided
            $kelasQuery = clone $baseQuery;
            if ($request->filled('angkatan')) {
                $kelasQuery->where('angkatan', $request->angkatan);
            }

            $kelases = $kelasQuery
                ->select('kelas')
                ->distinct()
                ->orderBy('kelas', 'asc')
                ->pluck('kelas')
                ->toArray();

            return ['angkatans' => $angkatans, 'kelases' => $kelases];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }
}
