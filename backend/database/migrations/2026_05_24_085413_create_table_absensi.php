<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
         Schema::create('absensi', function (Blueprint $table) {
        $table->string('id', 50)->primary();
        $table->string('mahasiswa_id', 50);
        $table->string('dosen_id', 50);
        $table->string('status', 20); // Hadir, Sakit, Izin, Alpa
        $table->timestamp('waktu')->useCurrent();
        $table->time('jam_masuk')->nullable();
        $table->timestamps();

        $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
        $table->foreign('dosen_id')->references('id')->on('dosen')->onDelete('cascade');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_absensi');
    }
};
