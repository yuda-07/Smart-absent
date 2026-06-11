Sebagai seorang Back-End Developer yang berpengalaman, Anda baru saja bergabung dengan sebuah universitas. Universitas ingin membangun aplikasi internal, sebuah aplikasi untuk mengelola data kehadiran mahasiswa di dalam database. Anda baru saja ditugaskan untuk mengembangkan aplikasi tersebut. 

Dalam fase pengembangan awal, tugas Anda adalah membangun RESTful API dasar yang akan menjadi fondasi awal. RESTful API ini akan menangani segala aspek terkait dengan data absensi, profile mahasiswa, profile dosen dan sebagainya, di dalam database. Fase ini kritikal dalam memastikan fondasi yang kuat untuk pengembangan fitur lebih lanjut.

Berikut adalah beberapa materi yang sudah Anda pelajari untuk mengembangkan RESTful API:

Database

Middleware dan Data Validation

Authentication dan Authorization

Normalisasi Database

Tantangan yang perlu Anda selesaikan adalah mengembangkan RESTful API untuk sebuah internal universitas. Pastikan Anda membaca dengan saksama semua instruksi yang ada di halaman ini agar project yang Anda submit sesuai dengan persyaratan yang ditetapkan.

Setiap kriteria dapat dapat bernilai 0 sampai 4 points (pts). Untuk lulus dari submission ini, setidaknya Anda harus mendapatkan 2 points dari setiap kriteria. Submission akan ditolak jika masih terdapat kriteria dengan nilai 0 points.

Kriteria 1: Menggunakan Database untuk Menyimpan Data
RESTful API yang Anda bangun haruslah menyimpan data di database PostgreSQL.

Berikut adalah ketentuan kriteria 1.

Reject (0 pts): 
Datatidak disimpan di database apa pun, menunjukkan tidak ada implementasi database.
Tidak ada konfigurasi database dalam proyek, atau konfigurasi yang ada tidak lengkap dan tidak berfungsi dengan baik.
Menggunakan database selain PostgreSQL.
Terdapat error dalam pengujian mandatory Postman.
Basic (2 pts):
Data berhasil disimpan di database PostgreSQL.
Pengelolaan database wajib menggunakan teknik migrations dengan library node-pg-migrate untuk mengelola struktur tabel.
Harus terdapat timestamp pada nama file migration yang dibuat otomatis. Contoh: 1769591657553_create-table-users.js.
Kredensial database tidak boleh ditulis langsung di kode (hardcoded). Wajib gunakan file .env dengan variabel berikut:
PGUSER, PGPASSWORD, PGDATABASE, PGHOST, dan PGPORT.
Wajib menyimpan nilai host dan port di file .env dengan variabel berikut:
HOST
PORT.
Penggunaan library untuk Data Validation.
Joi (Direkomendasikan)
Yup
Zod
Pengujian mandatory Postman tidak ada yang error.
Skilled (3 pts):
Memenuhi ketentuan nilai sebelumnya.
Terdapat implementasi middleware untuk validate data dengan Joi.
Terdapat middleware untuk error handling.
Menambahkan satu unique constraint di salah satu atribut di sebuah tabel. Misalnya, untuk atribut email di tabel users.
Advanced (4 pts):
Memenuhi ketentuan nilai sebelumnya.
Normalisasi database telah dilakukan dengan baik, dengan setidaknya terdapat beberapa relasi antar tabel.
Merancang ERD (Entity Relationship Diagram) dan melampirkannya dalam proyek dalam bentuk image jpg/png dengan format nama berkas:  ERD-SmartAbsent-versi-1.
Semua pengujian Postman, baik wajib maupun opsional, tidak ada yang error.

Kriteria 2: Implementasi Autentikasi dan Otorisasi pada RESTful API dengan Express.js
Berikut adalah ketentuan kriteria 2.

Reject (0 pts): 
Tidak ada implementasi autentikasi dan otorisasi dalam RESTful API.
Terdapat error dalam pengujian mandatory Postman.
Basic (2 pts):
Terdapat implementasi authentications dan authorizations seperti berikut ini.

USERS:
GET    /users/:id                  → Get user profile by ID

MAHASISWA:
GET    /mahasiswa/:id              → Get mahasiswa profile by ID

DOSEN:
POST   /dosen                      → Register new dosen
GET    /dosen/:id                  → Get dosen profile by ID

RUANG:
GET    /ruang                      → List all ruang
GET    /ruang/:id                  → Get ruang detail

ABSENSI:
GET    /absensi                       → List all absensi
GET    /absensi/:id                   → Get absensi detail
GET    /absensi/mahasiswa/:mahasiswaId    → Absensi by mahasiswa

AUTHENTICATIONS:
POST   /authentications            → Login
PUT    /authentications            → Refresh access token

PROTECTED ENDPOINTS (Auth Required):

PROFILE:
GET    /profile                    → Get logged-in user profile

MAHASISWA:
POST   /mahasiswa                  → Create mahasiswa
PUT    /mahasiswa/:id              → Update mahasiswa
DELETE /mahasiswa/:id              → Delete mahasiswa

RUANG:
POST   /ruang                      → Create ruang
PUT    /ruang/:id                  → Update ruang
DELETE /ruang/:id                  → Delete ruang

ABSENSI:
POST   /absensi                    → Create absensi
PUT    /absensi/:id                → Update absensi
DELETE /absensi/:id                → Delete absensi

AUTHENTICATIONS:
DELETE /authentications            → Logout

TIPS:
• Semua GET endpoints = PUBLIC (kecuali /profile)
• Semua POST/PUT/DELETE = PROTECTED (kecuali register & login)
• Protected endpoints memerlukan: Authorization: Bearer <access_token>
• Profile routes (/profile/*) khusus untuk user yang sedang login

Refresh token memiliki signature yang benar serta terdaftar di database.

Skilled (3 pts):
Memenuhi ketentuan nilai sebelumnya.
Terdapat implementasi middleware auth.
Terdapat endpoint yang diproteksi (protected route):
GET /profile untuk melihat profile user yang sudah login.

Advanced (4 pts):
Memenuhi ketentuan nilai sebelumnya.
Nilai secret key token JWT baik Access Token ataupun Refresh Token wajib menggunakan environment variable ACCESS_TOKEN_KEY dan REFRESH_TOKEN_KEY
Access Token yang dihasilkan JWT memiliki masa berlaku hingga 3 jam setelah diterbitkan.
Semua pengujian Postman, baik wajib maupun opsional, tidak ada yang error.