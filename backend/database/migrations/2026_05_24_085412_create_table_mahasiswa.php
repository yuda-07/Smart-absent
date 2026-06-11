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
        Schema::create('mahasiswa', function (Blueprint $table) {
        $table->string('id', 50)->primary();
        $table->string('user_id', 50);
        $table->string('nama', 100);
        $table->string('nim', 50)->unique();
        $table->string('kelas', 50);
        $table->integer('angkatan');
        $table->string('jurusan', 100);
        $table->timestamps();

        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_mahasiswa');
    }
};
