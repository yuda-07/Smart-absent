<?php

namespace Database\Seeders;

use App\Models\Absensi;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create a dosen for absensi records
        $dosen = Dosen::first();
        if (!$dosen) {
            $userId = 'user-dosen-seed-' . time();
            User::create([
                'id' => $userId,
                'email' => 'dosen-seed@smartabsent.com',
                'password' => 'password123',
                'role' => 'dosen',
            ]);
            $dosen = Dosen::create([
                'id' => 'dsn-seed-' . time(),
                'user_id' => $userId,
                'nama' => 'Dr. Admin Seeder',
                'nip' => '199001012020011999',
            ]);
        }

        $allProdi = Prodi::with('jurusan')->get();

        if ($allProdi->isEmpty()) {
            $this->command->warn('No prodi found. Run JurusanProdiSeeder first.');
            return;
        }

        $this->command->info("Found {$allProdi->count()} prodi. Creating dummy data...");

        // Monday dates in June 2026
        $mondays = [
            '2026-06-01',
            '2026-06-08',
            '2026-06-15',
            '2026-06-22',
            '2026-06-29',
        ];

        // Also add some Mondays in May 2026 for more data
        $mondaysMay = [
            '2026-05-04',
            '2026-05-11',
            '2026-05-18',
            '2026-05-25',
        ];

        $allMondays = array_merge($mondaysMay, $mondays);

        // Status distribution weights
        $statuses = ['Hadir', 'Hadir', 'Hadir', 'Hadir', 'Hadir', 'Hadir', 'Terlambat', 'Terlambat', 'Izin', 'Alpa'];

        // Nama dummy
        $firstNames = ['Ahmad', 'Budi', 'Citra', 'Dian', 'Eka', 'Fajar', 'Gita', 'Hadi', 'Indra', 'Joko',
            'Kartika', 'Lina', 'Maya', 'Nanda', 'Okta', 'Putri', 'Rian', 'Sari', 'Toni', 'Umar'];
        $lastNames = ['Pratama', 'Saputra', 'Wulandari', 'Lestari', 'Ramadhan', 'Nugroho', 'Kusuma', 'Wijaya', 'Susanto', 'Hidayat'];

        $counter = 0;

        foreach ($allProdi as $prodi) {
            // Create class code from prodi kode + angkatan
            $kodeShort = strtoupper($prodi->jurusan->kode);

            foreach ([2024, 2025] as $angkatan) {
                $kelasName = $kodeShort . '-' . substr($angkatan, 2) . 'A';

                for ($i = 0; $i < 5; $i++) {
                    $counter++;
                    $firstName = $firstNames[array_rand($firstNames)];
                    $lastName = $lastNames[array_rand($lastNames)];
                    $nama = "$firstName $lastName";

                    // Create unique email
                    $emailSlug = strtolower(str_replace(' ', '', $nama)) . $counter;
                    $email = "mhs{$counter}@campus.id";

                    // Create user
                    $userId = "user-dummy-{$counter}-" . time();
                    $user = User::create([
                        'id' => $userId,
                        'email' => $email,
                        'password' => 'password123',
                        'role' => 'mahasiswa',
                    ]);

                    // Create mahasiswa
                    $nim = sprintf('%d%03d', $angkatan, $counter);
                    $mahasiswaId = "mhs-dummy-{$counter}-" . time();
                    $mahasiswa = Mahasiswa::create([
                        'id' => $mahasiswaId,
                        'user_id' => $userId,
                        'nama' => $nama,
                        'nim' => $nim,
                        'kelas' => $kelasName,
                        'angkatan' => $angkatan,
                        'jurusan' => $prodi->jurusan->nama,
                        'prodi_id' => $prodi->id,
                    ]);

                    // Create absensi for each Monday
                    foreach ($allMondays as $monday) {
                        $status = $statuses[array_rand($statuses)];
                        $absensiId = "abs-{$counter}-{$monday}-" . time();

                        $waktu = $monday . ' 07:30:00';
                        $jamMasuk = null;

                        if ($status === 'Hadir') {
                            $menit = rand(0, 25);
                            $jamMasuk = sprintf('07:%02d:00', $menit);
                        } elseif ($status === 'Terlambat') {
                            $menit = rand(35, 90);
                            $jam = 7 + intdiv($menit, 60);
                            $sisaMenit = $menit % 60;
                            $jamMasuk = sprintf('%02d:%02d:00', $jam, $sisaMenit);
                        } elseif ($status === 'Izin') {
                            $jamMasuk = null;
                        } elseif ($status === 'Alpa') {
                            $jamMasuk = null;
                        }

                        Absensi::create([
                            'id' => $absensiId,
                            'mahasiswa_id' => $mahasiswaId,
                            'dosen_id' => $dosen->id,
                            'status' => $status,
                            'waktu' => $waktu,
                            'jam_masuk' => $jamMasuk,
                        ]);
                    }
                }
            }
        }

        $this->command->info("Created {$counter} mahasiswa with absensi records on " . count($allMondays) . " Mondays.");
        $this->command->info("Total absensi records: " . ($counter * count($allMondays)));
    }
}
