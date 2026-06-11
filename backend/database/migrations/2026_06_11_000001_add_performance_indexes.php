<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->index('angkatan', 'idx_mahasiswa_angkatan');
            $table->index('prodi_id', 'idx_mahasiswa_prodi_id');
            $table->index('jurusan', 'idx_mahasiswa_jurusan');
            $table->index('kelas', 'idx_mahasiswa_kelas');
            // Composite index for filter-options query
            $table->index(['angkatan', 'prodi_id', 'jurusan', 'kelas'], 'idx_mahasiswa_filter_composite');
        });

        Schema::table('absensi', function (Blueprint $table) {
            $table->index('waktu', 'idx_absensi_waktu');
            $table->index('mahasiswa_id', 'idx_absensi_mahasiswa_id');
            $table->index('status', 'idx_absensi_status');
            // Composite for the main statistik join
            $table->index(['mahasiswa_id', 'waktu', 'status'], 'idx_absensi_statistik_composite');
        });
    }

    public function down(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->dropIndex('idx_mahasiswa_angkatan');
            $table->dropIndex('idx_mahasiswa_prodi_id');
            $table->dropIndex('idx_mahasiswa_jurusan');
            $table->dropIndex('idx_mahasiswa_kelas');
            $table->dropIndex('idx_mahasiswa_filter_composite');
        });

        Schema::table('absensi', function (Blueprint $table) {
            $table->dropIndex('idx_absensi_waktu');
            $table->dropIndex('idx_absensi_mahasiswa_id');
            $table->dropIndex('idx_absensi_status');
            $table->dropIndex('idx_absensi_statistik_composite');
        });
    }
};
