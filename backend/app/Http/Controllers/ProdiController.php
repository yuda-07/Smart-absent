<?php

namespace App\Http\Controllers;

use App\Models\Prodi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProdiController extends Controller
{
    /**
     * GET /prodi
     */
    public function getProdis(): JsonResponse
    {
        $prodis = Prodi::with('jurusan')->get();

        return response()->json([
            'status' => 'success',
            'data' => ['prodis' => $prodis],
        ]);
    }

    /**
     * GET /prodi/{id}
     */
    public function getProdiById(string $id): JsonResponse
    {
        $prodi = Prodi::with('jurusan')->find($id);

        if (!$prodi) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Prodi tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => ['prodi' => $prodi],
        ]);
    }

    /**
     * GET /prodi/jurusan/{jurusanId}
     */
    public function getProdisByJurusanId(string $jurusanId): JsonResponse
    {
        $prodis = Prodi::where('jurusan_id', $jurusanId)
            ->orderBy('jenjang')
            ->orderBy('nama')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => ['prodis' => $prodis],
        ]);
    }

    /**
     * POST /prodi
     */
    public function createProdi(Request $request): JsonResponse
    {
        $request->validate([
            'jurusan_id' => 'required|integer|exists:jurusan,id',
            'jenjang' => 'required|string|in:D3,D4',
            'nama' => 'required|string|max:150',
        ]);

        $prodi = Prodi::create([
            'jurusan_id' => $request->jurusan_id,
            'jenjang' => $request->jenjang,
            'nama' => $request->nama,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Prodi berhasil ditambahkan',
            'data' => ['prodiId' => $prodi->id],
        ], 201);
    }
}
