<?php

namespace App\Http\Controllers;

use App\Models\Authentication;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * POST /authentications
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Kredensial yang Anda berikan salah',
            ], 401);
        }

        $accessToken = JWTAuth::fromUser($user);
        $refreshToken = bin2hex(random_bytes(64));

        Authentication::create([
            'token' => $refreshToken,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'data' => [
                'accessToken' => $accessToken,
                'refreshToken' => $refreshToken,
            ],
        ], 201);
    }

    /**
     * PUT /authentications
     */
    public function refreshToken(Request $request): JsonResponse
    {
        $request->validate([
            'refreshToken' => 'required|string',
        ]);

        $auth = Authentication::where('token', $request->refreshToken)->first();

        if (!$auth) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Refresh token tidak valid di database',
            ], 400);
        }

        $user = User::find($auth->user_id);

        if (!$user) {
            return response()->json([
                'status' => 'fail',
                'message' => 'User tidak ditemukan',
            ], 404);
        }

        $accessToken = JWTAuth::fromUser($user);

        return response()->json([
            'status' => 'success',
            'message' => 'Access token berhasil diperbarui',
            'data' => [
                'accessToken' => $accessToken,
            ],
        ]);
    }

    /**
     * DELETE /authentications
     */
    public function logout(Request $request): JsonResponse
    {
        $request->validate([
            'refreshToken' => 'required|string',
        ]);

        $auth = Authentication::where('token', $request->refreshToken)->first();

        if (!$auth) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Refresh token tidak valid di database',
            ], 400);
        }

        $auth->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil',
        ]);
    }
}
