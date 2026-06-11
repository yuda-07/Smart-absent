<?php

namespace App\Http\Controllers;

use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserController extends Controller
{
    /**
     * Helper: extract user info from JWT token
     */
    private function getJwtUser(Request $request): object
    {
        $token = str_replace('Bearer ', '', $request->header('Authorization'));
        $payload = JWTAuth::setToken($token)->getPayload();
        return (object) [
            'id' => $payload->get('id'),
            'role' => $payload->get('role'),
        ];
    }

    /**
     * GET /users/{id}
     */
    public function getUserById(string $id): JsonResponse
    {
        $user = User::select('id', 'email', 'role')->find($id);

        if (!$user) {
            return response()->json([
                'status' => 'fail',
                'message' => 'User tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => ['user' => $user],
        ]);
    }

    /**
     * GET /profile
     */
    public function getMyProfile(Request $request): JsonResponse
    {
        $jwtUser = $this->getJwtUser($request);
        $userId = $jwtUser->id;
        $role = $jwtUser->role;

        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'status' => 'fail',
                'message' => 'User tidak ditemukan',
            ], 404);
        }

        $data = [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
        ];

        if ($role === 'dosen') {
            $dosen = Dosen::where('user_id', $userId)->first();
            if ($dosen) {
                $data['nama'] = $dosen->nama;
                $data['nip'] = $dosen->nip;
            }
        } elseif ($role === 'mahasiswa') {
            $mahasiswa = Mahasiswa::where('user_id', $userId)->first();
            if ($mahasiswa) {
                $data['nama'] = $mahasiswa->nama;
                $data['nim'] = $mahasiswa->nim;
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => ['user' => $data],
        ]);
    }
}
