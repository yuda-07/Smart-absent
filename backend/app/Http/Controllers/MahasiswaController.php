<?php

namespace App\Http\Controllers;

use App\Models\Mahasiswa;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MahasiswaController extends Controller
{
    /**
     * POST /mahasiswa
     */
    public function createMahasiswa(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'nama' => 'required|string',
            'nim' => 'required|string',
            'kelas' => 'required|string',
            'angkatan' => 'required|integer',
            'jurusan' => 'required|string',
            'prodi_id' => 'nullable|integer|exists:prodi,id',
        ]);

        // Check email uniqueness
        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Gagal menambahkan user. Email sudah digunakan.',
            ], 400);
        }

        // Check NIM uniqueness
        if (Mahasiswa::where('nim', $request->nim)->exists()) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Gagal menambahkan mahasiswa. NIM sudah digunakan.',
            ], 400);
        }

        $result = DB::transaction(function () use ($request) {
            $userId = 'user-' . time();
            $user = User::create([
                'id' => $userId,
                'email' => $request->email,
                'password' => $request->password,
                'role' => 'mahasiswa',
            ]);

            $mahasiswaId = 'mhs-' . time();
            $mahasiswa = Mahasiswa::create([
                'id' => $mahasiswaId,
                'user_id' => $userId,
                'nama' => $request->nama,
                'nim' => $request->nim,
                'kelas' => $request->kelas,
                'angkatan' => $request->angkatan,
                'jurusan' => $request->jurusan,
                'prodi_id' => $request->prodi_id,
            ]);

            return $mahasiswaId;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Mahasiswa berhasil ditambahkan',
            'data' => ['mahasiswaId' => $result],
        ], 201);
    }

    /**
     * GET /mahasiswa
     */
    public function getMahasiswas(): JsonResponse
    {
        $mahasiswas = Mahasiswa::select('mahasiswa.*', 'users.email')
            ->join('users', 'mahasiswa.user_id', '=', 'users.id')
            ->with('prodi')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => ['mahasiswas' => $mahasiswas],
        ]);
    }

    /**
     * GET /mahasiswa/{id}
     */
    public function getMahasiswaById(string $id): JsonResponse
    {
        $mahasiswa = Mahasiswa::find($id);

        if (!$mahasiswa) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Mahasiswa tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => ['mahasiswa' => $mahasiswa],
        ]);
    }

    /**
     * PUT /mahasiswa/{id}
     */
    public function editMahasiswaById(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'nama' => 'required|string',
            'nim' => 'required|string',
            'kelas' => 'required|string',
            'angkatan' => 'required|integer',
            'jurusan' => 'required|string',
            'prodi_id' => 'nullable|integer|exists:prodi,id',
        ]);

        $mahasiswa = Mahasiswa::find($id);

        if (!$mahasiswa) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Gagal memperbarui mahasiswa. Id tidak ditemukan',
            ], 404);
        }

        $mahasiswa->update([
            'nama' => $request->nama,
            'nim' => $request->nim,
            'kelas' => $request->kelas,
            'angkatan' => $request->angkatan,
            'jurusan' => $request->jurusan,
            'prodi_id' => $request->prodi_id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mahasiswa berhasil diperbarui',
        ]);
    }

    /**
     * DELETE /mahasiswa/{id}
     */
    public function deleteMahasiswaById(string $id): JsonResponse
    {
        $mahasiswa = Mahasiswa::find($id);

        if (!$mahasiswa) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Mahasiswa gagal dihapus. Id tidak ditemukan',
            ], 404);
        }

        $mahasiswa->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Mahasiswa berhasil dihapus',
        ]);
    }
}
