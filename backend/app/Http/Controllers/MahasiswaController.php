<?php

namespace App\Http\Controllers;

use App\Http\Resources\MahasiswaResource;
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
    public function getMahasiswas(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 50), 200);

        $query = Mahasiswa::select(
                'mahasiswa.id',
                'mahasiswa.user_id',
                'mahasiswa.nama',
                'mahasiswa.nim',
                'mahasiswa.kelas',
                'mahasiswa.angkatan',
                'mahasiswa.jurusan',
                'mahasiswa.prodi_id',
                'users.email'
            )
            ->join('users', 'mahasiswa.user_id', '=', 'users.id');

        // Optional filters
        if ($request->filled('jurusan')) {
            $query->where('mahasiswa.jurusan', $request->jurusan);
        }
        if ($request->filled('angkatan')) {
            $query->where('mahasiswa.angkatan', $request->angkatan);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('mahasiswa.nama', 'ilike', "%{$search}%")
                  ->orWhere('mahasiswa.nim', 'ilike', "%{$search}%");
            });
        }

        $mahasiswas = $query->with('prodi:id,jenjang,nama')
            ->orderBy('mahasiswa.nama', 'asc')
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => [
                'mahasiswas' => [
                    'data' => MahasiswaResource::collection($mahasiswas->items()),
                    'current_page' => $mahasiswas->currentPage(),
                    'per_page' => $mahasiswas->perPage(),
                    'total' => $mahasiswas->total(),
                    'last_page' => $mahasiswas->lastPage(),
                ],
            ],
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
            'data' => ['mahasiswa' => new MahasiswaResource($mahasiswa)],
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
