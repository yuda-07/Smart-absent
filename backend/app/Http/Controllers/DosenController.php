<?php

namespace App\Http\Controllers;

use App\Models\Dosen;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DosenController extends Controller
{
    /**
     * POST /dosen
     */
    public function registerDosen(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'nama' => 'required|string',
            'nip' => 'required|string',
        ]);

        // Check email uniqueness
        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Gagal menambahkan user. Email sudah digunakan.',
            ], 400);
        }

        // Check NIP uniqueness
        if (Dosen::where('nip', $request->nip)->exists()) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Gagal menambahkan dosen. NIP sudah digunakan.',
            ], 400);
        }

        $result = DB::transaction(function () use ($request) {
            $userId = 'user-' . time();
            User::create([
                'id' => $userId,
                'email' => $request->email,
                'password' => $request->password,
                'role' => 'dosen',
            ]);

            $dosenId = 'dsn-' . time();
            Dosen::create([
                'id' => $dosenId,
                'user_id' => $userId,
                'nama' => $request->nama,
                'nip' => $request->nip,
            ]);

            return $dosenId;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Dosen berhasil didaftarkan',
            'data' => ['dosenId' => $result],
        ], 201);
    }

    /**
     * GET /dosen/{id}
     */
    public function getDosenById(string $id): JsonResponse
    {
        $dosen = Dosen::find($id);

        if (!$dosen) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Dosen tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => ['dosen' => $dosen],
        ]);
    }
}
