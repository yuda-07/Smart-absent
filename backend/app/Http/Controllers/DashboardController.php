<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Mahasiswa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /dashboard/stats
     */
    public function getDashboardStats(): JsonResponse
    {
        $cacheKey = 'dashboard.stats.' . Carbon::now()->toDateString();

        $data = Cache::remember($cacheKey, 120, function () {
            $totalMahasiswa = Mahasiswa::whereIn('angkatan', [2024, 2025])->count();

            $today = Carbon::now()->toDateString();
            $attendanceStats = Absensi::select('status', DB::raw('COUNT(*) as count'))
                ->whereDate('waktu', $today)
                ->groupBy('status')
                ->get();

            $stats = [
                'hadir' => 0,
                'tidakHadir' => 0,
                'izin' => 0,
                'terlambat' => 0,
            ];

            foreach ($attendanceStats as $row) {
                $status = strtolower($row->status);
                if ($status === 'hadir') {
                    $stats['hadir'] = (int) $row->count;
                } elseif ($status === 'alpa') {
                    $stats['tidakHadir'] = (int) $row->count;
                } elseif (in_array($status, ['izin', 'sakit'])) {
                    $stats['izin'] += (int) $row->count;
                } elseif ($status === 'terlambat') {
                    $stats['terlambat'] = (int) $row->count;
                }
            }

            $recentFeed = Absensi::select('absensi.id', 'absensi.status', 'absensi.waktu', 'absensi.jam_masuk', 'mahasiswa.nama', 'mahasiswa.nim')
                ->join('mahasiswa', 'absensi.mahasiswa_id', '=', 'mahasiswa.id')
                ->orderBy('absensi.waktu', 'desc')
                ->limit(5)
                ->get();

            $presentPercentage = $totalMahasiswa > 0
                ? round((($stats['hadir'] + $stats['terlambat']) / $totalMahasiswa) * 100)
                : 0;

            return [
                'summary' => [
                    'totalMahasiswa' => $totalMahasiswa,
                    ...$stats,
                    'presentPercentage' => $presentPercentage,
                ],
                'recentFeed' => $recentFeed,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * GET /dashboard/stats/monthly
     */
    public function getMonthlyStats(Request $request): JsonResponse
    {
        $month = $request->query('month');
        $year = $request->query('year');
        $cacheKey = "dashboard.monthly.{$month}.{$year}";

        $data = Cache::remember($cacheKey, 300, function () use ($month, $year) {
            $attendanceStats = Absensi::select('status', DB::raw('COUNT(*) as count'))
                ->whereMonth('waktu', $month)
                ->whereYear('waktu', $year)
                ->groupBy('status')
                ->get();

            $stats = ['hadir' => 0, 'alpa' => 0, 'izin' => 0, 'terlambat' => 0];

            foreach ($attendanceStats as $row) {
                $status = strtolower($row->status);
                if ($status === 'hadir') {
                    $stats['hadir'] = (int) $row->count;
                } elseif ($status === 'alpa') {
                    $stats['alpa'] = (int) $row->count;
                } elseif (in_array($status, ['izin', 'sakit'])) {
                    $stats['izin'] += (int) $row->count;
                } elseif ($status === 'terlambat') {
                    $stats['terlambat'] = (int) $row->count;
                }
            }

            return ['stats' => $stats];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * GET /dashboard/stats/periodic
     */
    public function getPeriodicStats(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 7);
        $cacheKey = "dashboard.periodic.{$days}";

        $data = Cache::remember($cacheKey, 120, function () use ($days) {
            $trend = Absensi::select(
                    DB::raw('DATE(waktu) as date'),
                    'status',
                    DB::raw('COUNT(*) as count')
                )
                ->where('waktu', '>=', Carbon::now()->subDays($days))
                ->groupBy(DB::raw('DATE(waktu)'), 'status')
                ->orderBy(DB::raw('DATE(waktu)'), 'asc')
                ->get()
                ->toArray();

            $prodiDistribution = Absensi::select(
                    'mahasiswa.kelas as prodi',
                    DB::raw('COUNT(*) as count')
                )
                ->join('mahasiswa', 'absensi.mahasiswa_id', '=', 'mahasiswa.id')
                ->where('absensi.waktu', '>=', Carbon::now()->subDays($days))
                ->groupBy('mahasiswa.kelas')
                ->get()
                ->toArray();

            return [
                'trend' => $trend,
                'prodiDistribution' => $prodiDistribution,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }
}
