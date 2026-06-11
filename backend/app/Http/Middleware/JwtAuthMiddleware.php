<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class JwtAuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = $request->header('Authorization');
        $token = null;

        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
        }

        if (!$token) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Missing authentication token',
            ], 401);
        }

        try {
            $payload = JWTAuth::setToken($token)->getPayload();
            $request->merge([
                '_user_id' => $payload->get('id'),
                '_user_role' => $payload->get('role'),
            ]);
        } catch (TokenExpiredException $e) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Token sudah kadaluarsa',
            ], 401);
        } catch (TokenInvalidException $e) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Token tidak valid',
            ], 401);
        } catch (JWTException $e) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Token tidak valid atau sudah kadaluarsa',
            ], 401);
        }

        return $next($request);
    }
}
