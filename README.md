# 📋 SiAPEL — Smart Absent Presence & E-Learning

**Sistem Manajemen Kehadiran Apel** untuk lingkungan Politeknik. Aplikasi ini dirancang untuk memantau kehadiran apel mahasiswa secara real-time dengan fitur statistik, filter bertingkat, dan laporan yang komprehensif.

---

## ✨ Fitur Utama

| Modul | Deskripsi |
|---|---|
| **Dashboard** | Ringkasan statistik kehadiran harian — total hadir, terlambat, alpa, izin/sakit |
| **Data Absensi** | CRUD kehadiran mahasiswa dengan deteksi keterlambatan otomatis (menit & jam telat) |
| **Daftar Mahasiswa** | Manajemen data mahasiswa dengan filter jurusan, angkatan, dan pencarian |
| **Statistik Apel** | Grafik kehadiran per Hari (Senin), Bulan, dan Semester dengan filter bertingkat (Jurusan → Prodi → Angkatan → Kelas) |
| **Notifikasi** | Pemberitahuan keterlambatan dan status sinkronisasi |
| **Autentikasi JWT** | Login, refresh token, dan logout dengan JWT + refresh token rotation |

### Statistik & Filter Bertingkat

Halaman statistik menerapkan **dependent filter** yang saling terhubung:

```
Jurusan → Program Studi → Angkatan → Kelas
```

Setiap perubahan filter langsung memperbarui data statistik secara real-time tanpa reload halaman.

---

## 🛠 Tech Stack

### Frontend

| Teknologi | Versi |
|---|---|
| React | 19.x |
| TypeScript | 6.x |
| Vite | 8.x |
| Tailwind CSS | 4.x |
| Recharts | 3.8.x |
| GSAP | 3.15.x |
| React Router DOM | 7.x |
| Axios | 1.16.x |

### Backend

| Teknologi | Versi |
|---|---|
| Laravel | 13.x |
| PHP | 8.3+ |
| PostgreSQL | — |
| JWT Auth (tymon/jwt-auth) | 2.3.x |

---

## 📁 Struktur Proyek

```
smart-absent/
├── frontend/                  # React + Vite SPA
│   ├── src/
│   │   ├── components/        # Komponen UI reusable
│   │   ├── pages/             # Halaman aplikasi
│   │   │   ├── Login.tsx
│   │   │   ├── Dashbord.tsx
│   │   │   ├── Data_absesni.tsx
│   │   │   ├── Daftar_mahasiswa.tsx
│   │   │   ├── Laporan_statistik.tsx
│   │   │   ├── Notifikasi.tsx
│   │   │   └── Setting.tsx
│   │   └── utils/
│   │       ├── api.ts         # Axios instance + interceptors
│   │       └── jurusan.ts     # Data jurusan & prodi politeknik
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                   # Laravel REST API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── UserController.php
│   │   │   ├── MahasiswaController.php
│   │   │   ├── DosenController.php
│   │   │   ├── AbsensiController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── StatistikController.php
│   │   │   ├── JurusanController.php
│   │   │   ├── ProdiController.php
│   │   │   └── NotificationController.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Mahasiswa.php
│   │       ├── Dosen.php
│   │       ├── Absensi.php
│   │       ├── Jurusan.php
│   │       ├── Prodi.php
│   │       └── Authentication.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       ├── JurusanProdiSeeder.php   # 8 jurusan + 30 prodi
│   │       └── DummyDataSeeder.php      # 300 mahasiswa + 2700 absensi
│   ├── routes/api.php
│   └── .env
│
└── README.md
```

---

## 🚀 Instalasi & Menjalankan Aplikasi

### Prasyarat

- **PHP** ≥ 8.3
- **Composer** (PHP dependency manager)
- **Node.js** ≥ 18 + npm
- **PostgreSQL** ≥ 14
- **Git**

### 1. Clone Repository

```bash
git clone <repository-url>
cd smart-absent
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
composer install

# Copy & konfigurasi .env
cp .env.example .env
php artisan key:generate
```

Edit file `.env` sesuai konfigurasi database:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=smart_absent_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

```bash
# Generate JWT secret
php artisan jwt:secret

# Jalankan migration + seeder
php artisan migrate:fresh --seed

# Start server (port 8000)
php artisan serve --port=8000
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend berjalan di `http://localhost:5173` dan backend di `http://localhost:8000/api`.

### 4. Login

Gunakan akun seeder berikut untuk login:

| Email | Password | Role |
|---|---|---|
| `dosen-seed@smartabsent.com` | `password123` | Dosen |

---

## 📊 Database Schema

### Tabel Utama

| Tabel | Deskripsi |
|---|---|
| `users` | Data login (email, password, role: dosen/mahasiswa) |
| `mahasiswa` | Profil mahasiswa (nama, NIM, kelas, angkatan, jurusan, prodi_id) |
| `dosen` | Profil dosen (nama, NIP) |
| `absensi` | Catatan kehadiran (status, waktu, jam_masuk) |
| `jurusan` | Daftar jurusan politeknik (kode, nama) |
| `prodi` | Program studi per jurusan (jenjang D3/D4, nama) |
| `authentications` | Refresh token storage |

### Relasi

```
users ←1:1→ mahasiswa
users ←1:1→ dosen
jurusan ←1:N→ prodi
prodi ←1:N→ mahasiswa
mahasiswa ←1:N→ absensi
dosen ←1:N→ absensi
```

### Status Kehadiran

- `Hadir` — Hadir tepat waktu
- `Terlambat` — Hadir melewati jam wajib (default: 07:30)
- `Izin` — Izin/sakit
- `Alpa` — Tidak hadir tanpa keterangan

---

## 🔌 API Endpoints

Base URL: `http://localhost:8000/api`

### Autentikasi

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/authentications` | — | Login (email + password) |
| PUT | `/authentications` | — | Refresh access token |
| DELETE | `/authentications` | ✅ | Logout |

### Mahasiswa

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/mahasiswa` | — | List semua mahasiswa |
| GET | `/mahasiswa/{id}` | — | Detail mahasiswa |
| POST | `/mahasiswa` | ✅ | Tambah mahasiswa |
| PUT | `/mahasiswa/{id}` | ✅ | Update mahasiswa |
| DELETE | `/mahasiswa/{id}` | ✅ | Hapus mahasiswa |

### Absensi

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/absensi` | — | List semua absensi |
| GET | `/absensi/{id}` | — | Detail absensi |
| GET | `/absensi/mahasiswa/{id}` | — | Absensi per mahasiswa |
| POST | `/absensi` | ✅ | Catat kehadiran |
| PUT | `/absensi/{id}` | ✅ | Update absensi |
| DELETE | `/absensi/{id}` | ✅ | Hapus absensi |

### Statistik

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/statistik/hari` | ✅ | Statistik per hari (Senin/apel) |
| GET | `/statistik/bulan` | ✅ | Statistik per bulan |
| GET | `/statistik/semester` | ✅ | Statistik per semester |
| GET | `/statistik/kelas` | ✅ | Statistik per kelas |
| GET | `/statistik/angkatan` | ✅ | Statistik per angkatan |
| GET | `/statistik/jurusan` | ✅ | Statistik per jurusan |
| GET | `/statistik/filter-options` | ✅ | Opsi filter dinamis |

### Dashboard & Lainnya

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/dashboard/stats` | ✅ | Ringkasan statistik hari ini |
| GET | `/dashboard/stats/monthly` | ✅ | Statistik bulanan |
| GET | `/dashboard/stats/periodic` | ✅ | Statistik periodik (tren) |
| GET | `/profile` | ✅ | Profil user login |
| GET | `/notifications` | ✅ | Daftar notifikasi |

### Query Parameters (Statistik)

| Parameter | Tipe | Deskripsi |
|---|---|---|
| `month` | int | Filter bulan (1-12) |
| `year` | int | Filter tahun |
| `jurusan` | string | Filter nama jurusan |
| `prodi_id` | int | Filter ID program studi |
| `angkatan` | int | Filter tahun angkatan |
| `kelas` | string | Filter nama kelas |
| `apel_only` | bool | Hanya peserta apel (2024, 2025) |
| `senin_only` | bool | Hanya hari Senin (hari apel) |

---

## 🎓 Struktur Akademik

Aplikasi ini mengikuti struktur organisasi Politeknik:

| Kode | Jurusan | Jumlah Prodi |
|---|---|---|
| BTP | Budidaya Tanaman Pangan | 4 |
| BTPk | Budidaya Tanaman Perkebunan | 3 |
| TP | Teknologi Pertanian | 5 |
| PTK | Peternakan | 3 |
| EB | Ekonomi dan Bisnis | 4 |
| TNK | Teknik | 3 |
| PK | Perikanan dan Kelautan | 4 |
| TI | Teknologi Informasi | 4 |

**Total: 8 Jurusan — 30 Program Studi** (D3 & D4)

### Peserta Apel Aktif

Hanya mahasiswa **Angkatan 2024** dan **Angkatan 2025** yang diwajibkan mengikuti apel dan ditampilkan dalam laporan statistik.

---

## ⚡ Optimasi Performa

- **Server-side caching** — Hasil statistik di-cache selama 5 menit
- **Database indexing** — Index pada kolom yang sering di-filter (angkatan, prodi_id, jurusan, kelas, waktu, status)
- **Frontend prefetching** — Semua tipe periode (hari, bulan, semester) di-fetch secara paralel saat halaman dimuat
- **Response caching** — Data yang sudah di-fetch disimpan di cache frontend, tab switching terasa instan
- **Request cancellation** — AbortController membatalkan request sebelumnya jika user mengganti filter dengan cepat
- **Memoized components** — Chart component menggunakan `React.memo` untuk mencegah re-render yang tidak perlu

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan akademik — **Pemrograman Perangkat Keras, Semester 4**.
