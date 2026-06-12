<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CacheControlHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only add cache headers to GET requests
        if (!$request->isMethod('GET')) {
            return $response;
        }

        $path = $request->path();

        // Statistik endpoints — cached server-side, allow client caching too
        if (str_starts_with($path, 'api/statistik')) {
            $response->headers->set('Cache-Control', 'public, max-age=300, s-maxage=600');
            $response->headers->set('Vary', 'Authorization');
        }
        // Dashboard endpoints — short cache
        elseif (str_starts_with($path, 'api/dashboard')) {
            $response->headers->set('Cache-Control', 'private, max-age=120');
            $response->headers->set('Vary', 'Authorization');
        }
        // Jurusan/Prodi — rarely changes, longer cache
        elseif (str_starts_with($path, 'api/jurusan') || str_starts_with($path, 'api/prodi')) {
            $response->headers->set('Cache-Control', 'public, max-age=3600');
        }
        // Other GET endpoints — short private cache
        else {
            $response->headers->set('Cache-Control', 'private, max-age=30');
            $response->headers->set('Vary', 'Authorization');
        }

        return $response;
    }
}
