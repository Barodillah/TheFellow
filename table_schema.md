# Rancangan Tabel Database (MySQL)

Berdasarkan struktur data profil Fellow, berikut adalah rancangan tabel database.

### 1. Tabel `users`
Tabel utama untuk menyimpan kredensial login dan informasi profil dasar.
- `id` (CHAR(36), Primary Key) - Menyimpan UUID.
- `registration_number` (VARCHAR(50), Unique) - Nomor registrasi pengguna.
- `phone` (VARCHAR(20), Nullable) - Nomor telepon / WhatsApp.
- `email` (VARCHAR(100), Unique) - Untuk keperluan login.
- `password` (VARCHAR(255), Nullable) - Hash password untuk login.
- `role` (ENUM) - Hak akses pengguna ('admin', 'fellow', 'member').
- `name` (VARCHAR(100)) - Nama lengkap.
- `title` (VARCHAR(100)) - Gelar/Jabatan (misal: "Arch-Fellow").
- `csm_title` (VARCHAR(100)) - Spesialisasi CSM (misal: "The Initiator").
- `join_year` (INT) - Tahun bergabung.
- `avatar` (VARCHAR(255)) - Path/URL foto profil.
- `bio` (TEXT) - Biografi intelektual.
- `quote` (TEXT) - Kutipan favorit.
- `specializations` (JSON) - Menyimpan array spesialisasi.
- `badges` (JSON) - Menyimpan array lencana.
- `stats_articles` (INT) - Statistik jumlah artikel.
- `stats_threads` (INT) - Statistik jumlah diskusi forum.
- `stats_pdca_cases` (INT) - Statistik jumlah kasus PDCA.
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. Tabel `otps` (Fitur Aktivasi & Lupa Password)

Tabel ini digunakan untuk menyimpan kode One-Time Password (OTP) sementara yang dikirimkan melalui email.

| Nama Kolom     | Tipe Data      | Default/Keterangan              | Deskripsi                                   |
|----------------|----------------|---------------------------------|---------------------------------------------|
| `id`           | INT            | `AUTO_INCREMENT`, Primary Key   | ID unik untuk setiap record OTP             |
| `email`        | VARCHAR(255)   | `NOT NULL`                      | Email pengguna yang me-request OTP          |
| `otp`          | VARCHAR(6)     | `NOT NULL`                      | 6-digit kode OTP                            |
| `expires_at`   | DATETIME       | `NOT NULL`                      | Waktu kedaluwarsa kode OTP (biasanya 10 mnt)|
| `created_at`   | TIMESTAMP      | `CURRENT_TIMESTAMP`             | Waktu *record* dibuat                       |

### 3. Tabel `user_achievements`
Tabel untuk menyimpan daftar pencapaian (Achievement Timeline).
- `id` (INT AUTO_INCREMENT, Primary Key)
- `user_id` (CHAR(36), Foreign Key ke tabel `users`)
- `year` (VARCHAR(20)) - Tahun pencapaian (misal: "2022" atau "2022-2025").
- `title` (VARCHAR(255)) - Judul pencapaian.
- `competition` (VARCHAR(255)) - Nama kompetisi/kegiatan.
- `description` (TEXT, Nullable) - Penjelasan detail pencapaian.
- `created_at` (TIMESTAMP)
