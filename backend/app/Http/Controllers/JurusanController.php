<?php

namespace App\Http\Controllers;

use App\Models\Jurusan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JurusanController extends Controller
{
    /**
     * GET /jurusan
     */
    public function getJurusans(): JsonResponse
    {
        $jurusans = Jurusan::with('prodi')->get();

        return response()->json([
            'status' => 'success',
            'data' => ['jurusans' => $jurusans],
        ]);
    }

    /**
     * GET /jurusan/{id}
     */
    public function getJurusanById(string $id): JsonResponse
    {
        $jurusan = Jurusan::with('prodi')->find($id);

        if (!$jurusan) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Jurusan tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => ['jurusan' => $jurusan],
        ]);
    }

    /**
     * POST /jurusan
     */
    public function createJurusan(Request $request): JsonResponse
    {
        $request->validate([
            'kode' => 'required|string|max:10|unique:jurusan,kode',
            'nama' => 'required|string|max:100',
        ]);

        $jurusan = Jurusan::create([
            'kode' => $request->kode,
            'nama' => $request->nama,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Jurusan berhasil ditambahkan',
            'data' => ['jurusanId' => $jurusan->id],
        ], 201);
    }
}
