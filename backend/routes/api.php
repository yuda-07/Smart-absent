<?php

use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DosenController;
use App\Http\Controllers\JurusanController;
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProdiController;
use App\Http\Controllers\StatistikController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ============ Public Routes ============

// Authentication
Route::post('/authentications', [AuthController::class, 'login']);
Route::put('/authentications', [AuthController::class, 'refreshToken']);

// Users
Route::get('/users/{id}', [UserController::class, 'getUserById']);

// Mahasiswa (public)
Route::get('/mahasiswa', [MahasiswaController::class, 'getMahasiswas']);
Route::get('/mahasiswa/{id}', [MahasiswaController::class, 'getMahasiswaById']);

// Jurusan (public)
Route::get('/jurusan', [JurusanController::class, 'getJurusans']);
Route::get('/jurusan/{id}', [JurusanController::class, 'getJurusanById']);

// Prodi (public)
Route::get('/prodi', [ProdiController::class, 'getProdis']);
Route::get('/prodi/{id}', [ProdiController::class, 'getProdiById']);
Route::get('/prodi/jurusan/{jurusanId}', [ProdiController::class, 'getProdisByJurusanId']);

// Dosen (public)
Route::post('/dosen', [DosenController::class, 'registerDosen']);
Route::get('/dosen/{id}', [DosenController::class, 'getDosenById']);

// Absensi (public)
Route::get('/absensi', [AbsensiController::class, 'getAllAbsensi']);
Route::get('/absensi/mahasiswa/{mahasiswaId}', [AbsensiController::class, 'getAbsensiByMahasiswaId']);
Route::get('/absensi/{id}', [AbsensiController::class, 'getAbsensiById']);

// ============ Protected Routes (jwt.auth) ============

Route::middleware('jwt.auth')->group(function () {

    // Authentication
    Route::delete('/authentications', [AuthController::class, 'logout']);

    // Profile
    Route::get('/profile', [UserController::class, 'getMyProfile']);

    // Mahasiswa (protected)
    Route::post('/mahasiswa', [MahasiswaController::class, 'createMahasiswa']);
    Route::put('/mahasiswa/{id}', [MahasiswaController::class, 'editMahasiswaById']);
    Route::delete('/mahasiswa/{id}', [MahasiswaController::class, 'deleteMahasiswaById']);

    // Absensi (protected)
    Route::post('/absensi', [AbsensiController::class, 'createAbsensi']);
    Route::put('/absensi/{id}', [AbsensiController::class, 'editAbsensiById']);
    Route::delete('/absensi/{id}', [AbsensiController::class, 'deleteAbsensiById']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getDashboardStats']);
    Route::get('/dashboard/stats/monthly', [DashboardController::class, 'getMonthlyStats']);
    Route::get('/dashboard/stats/periodic', [DashboardController::class, 'getPeriodicStats']);

    // Statistik (Grafik)
    Route::get('/statistik/hari', [StatistikController::class, 'getStatsByHari']);
    Route::get('/statistik/minggu', [StatistikController::class, 'getStatsByMinggu']);
    Route::get('/statistik/bulan', [StatistikController::class, 'getStatsByBulan']);
    Route::get('/statistik/semester', [StatistikController::class, 'getStatsBySemester']);
    Route::get('/statistik/kelas', [StatistikController::class, 'getStatsByKelas']);
    Route::get('/statistik/angkatan', [StatistikController::class, 'getStatsByAngkatan']);
    Route::get('/statistik/jurusan', [StatistikController::class, 'getStatsByJurusan']);
    Route::get('/statistik/filter-options', [StatistikController::class, 'getFilterOptions']);

    // Jurusan & Prodi (protected)
    Route::post('/jurusan', [JurusanController::class, 'createJurusan']);
    Route::post('/prodi', [ProdiController::class, 'createProdi']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'getNotifications']);
});
