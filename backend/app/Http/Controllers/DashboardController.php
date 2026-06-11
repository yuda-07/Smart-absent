<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Mahasiswa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /dashboard/stats
     */
    public function getDashboardStats(): JsonResponse
    {
        $totalMahasiswa = Mahasiswa::count();

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

        $recentFeed = Absensi::select('absensi.*', 'mahasiswa.nama', 'mahasiswa.nim')
            ->join('mahasiswa', 'absensi.mahasiswa_id', '=', 'mahasiswa.id')
            ->orderBy('absensi.waktu', 'desc')
            ->limit(5)
            ->get();

        $presentPercentage = $totalMahasiswa > 0
            ? round((($stats['hadir'] + $stats['terlambat']) / $totalMahasiswa) * 100)
            : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'totalMahasiswa' => $totalMahasiswa,
                    ...$stats,
                    'presentPercentage' => $presentPercentage,
                ],
                'recentFeed' => $recentFeed,
            ],
        ]);
    }

    /**
     * GET /dashboard/stats/monthly
     */
    public function getMonthlyStats(Request $request): JsonResponse
    {
        $month = $request->query('month');
        $year = $request->query('year');

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

        $prodiStats = Absensi::select('mahasiswa.kelas as prodi', 'absensi.status', DB::raw('COUNT(*) as count'))
            ->join('mahasiswa', 'absensi.mahasiswa_id', '=', 'mahasiswa.id')
            ->whereMonth('absensi.waktu', $month)
            ->whereYear('absensi.waktu', $year)
            ->groupBy('mahasiswa.kelas', 'absensi.status')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => $stats,
                'prodiStats' => $prodiStats,
            ],
        ]);
    }

    /**
     * GET /dashboard/stats/periodic
     */
    public function getPeriodicStats(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 7);

        $trend = Absensi::select(
                DB::raw('DATE(waktu) as date'),
                'status',
                DB::raw('COUNT(*) as count')
            )
            ->where('waktu', '>=', Carbon::now()->subDays($days))
            ->groupBy(DB::raw('DATE(waktu)'), 'status')
            ->orderBy(DB::raw('DATE(waktu)'), 'asc')
            ->get();

        $prodiDistribution = Absensi::select(
                'mahasiswa.kelas as prodi',
                DB::raw('COUNT(*) as count')
            )
            ->join('mahasiswa', 'absensi.mahasiswa_id', '=', 'mahasiswa.id')
            ->where('absensi.waktu', '>=', Carbon::now()->subDays($days))
            ->groupBy('mahasiswa.kelas')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'trend' => $trend,
                'prodiDistribution' => $prodiDistribution,
            ],
        ]);
    }
}
