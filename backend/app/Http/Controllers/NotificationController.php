<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * GET /notifications
     */
    public function getNotifications(): JsonResponse
    {
        $notifications = [
            [
                'id' => '1',
                'type' => 'warning',
                'title' => 'Keterlambatan Mahasiswa',
                'message' => 'Beberapa mahasiswa terdeteksi terlambat pada apel pagi hari ini.',
                'time' => 'Baru saja',
                'isRead' => false,
            ],
            [
                'id' => '2',
                'type' => 'error',
                'title' => 'Sinkronisasi IoT',
                'message' => 'Sinkronisasi terakhir dengan perangkat RFID gagal. Mencoba kembali...',
                'time' => '5 menit yang lalu',
                'isRead' => false,
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data' => ['notifications' => $notifications],
        ]);
    }
}
