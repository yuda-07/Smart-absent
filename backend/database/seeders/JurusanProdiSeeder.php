<?php

namespace Database\Seeders;

use App\Models\Jurusan;
use App\Models\Prodi;
use Illuminate\Database\Seeder;

class JurusanProdiSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'kode' => 'BTP',
                'nama' => 'Budidaya Tanaman Pangan',
                'prodi' => [
                    ['jenjang' => 'D3', 'nama' => 'Hortikultura'],
                    ['jenjang' => 'D4', 'nama' => 'Produksi dan Manajemen Industri Perkebunan'],
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Produksi Tanaman Pangan'],
                    ['jenjang' => 'D4', 'nama' => 'Pengelolaan Perkebunan Kopi'],
                ],
            ],
            [
                'kode' => 'BTPk',
                'nama' => 'Budidaya Tanaman Perkebunan',
                'prodi' => [
                    ['jenjang' => 'D3', 'nama' => 'Produksi Tanaman Perkebunan'],
                    ['jenjang' => 'D4', 'nama' => 'Produksi dan Manajemen Industri Perkebunan'],
                    ['jenjang' => 'D4', 'nama' => 'Pengelolaan Perkebunan Kopi'],
                ],
            ],
            [
                'kode' => 'TP',
                'nama' => 'Teknologi Pertanian',
                'prodi' => [
                    ['jenjang' => 'D3', 'nama' => 'Teknologi Pangan'],
                    ['jenjang' => 'D3', 'nama' => 'Mekanisasi Pertanian'],
                    ['jenjang' => 'D3', 'nama' => 'Teknik Sumber Daya Lahan dan Lingkungan'],
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Rekayasa Pangan'],
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Rekayasa Pertanian'],
                ],
            ],
            [
                'kode' => 'PTK',
                'nama' => 'Peternakan',
                'prodi' => [
                    ['jenjang' => 'D3', 'nama' => 'Produksi Ternak'],
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Produksi Ternak'],
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Pakan Ternak'],
                ],
            ],
            [
                'kode' => 'EB',
                'nama' => 'Ekonomi dan Bisnis',
                'prodi' => [
                    ['jenjang' => 'D3', 'nama' => 'Akuntansi'],
                    ['jenjang' => 'D4', 'nama' => 'Akuntansi Perpajakan'],
                    ['jenjang' => 'D4', 'nama' => 'Agribisnis Pangan'],
                    ['jenjang' => 'D4', 'nama' => 'Pengelolaan Agribisnis'],
                ],
            ],
            [
                'kode' => 'TNK',
                'nama' => 'Teknik',
                'prodi' => [
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Rekayasa Konstruksi Jalan dan Jembatan'],
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Rekayasa Otomotif'],
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Rekayasa Mekatronika'],
                ],
            ],
            [
                'kode' => 'PK',
                'nama' => 'Perikanan dan Kelautan',
                'prodi' => [
                    ['jenjang' => 'D3', 'nama' => 'Budidaya Perikanan'],
                    ['jenjang' => 'D3', 'nama' => 'Perikanan Tangkap'],
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Akuakultur'],
                    ['jenjang' => 'D4', 'nama' => 'Pengelolaan Perikanan Tangkap'],
                ],
            ],
            [
                'kode' => 'TI',
                'nama' => 'Teknologi Informasi',
                'prodi' => [
                    ['jenjang' => 'D3', 'nama' => 'Manajemen Informatika'],
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Rekayasa Perangkat Lunak'],
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Rekayasa Internet'],
                    ['jenjang' => 'D4', 'nama' => 'Teknologi Rekayasa Elektronika'],
                ],
            ],
        ];

        foreach ($data as $item) {
            $jurusan = Jurusan::create([
                'kode' => $item['kode'],
                'nama' => $item['nama'],
            ]);

            foreach ($item['prodi'] as $p) {
                Prodi::create([
                    'jurusan_id' => $jurusan->id,
                    'jenjang' => $p['jenjang'],
                    'nama' => $p['nama'],
                ]);
            }
        }
    }
}
