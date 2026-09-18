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

### 4. Tabel `publikasi`
Tabel untuk menyimpan data publikasi buku saku, jurnal, atau dokumen PDF.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `user_id` (CHAR(36), Foreign Key ke tabel `users`) - Author/Pengunggah dokumen.
- `title` (VARCHAR(255)) - Judul publikasi.
- `description` (TEXT, Nullable) - Deskripsi atau sinopsis singkat publikasi.
- `category` (VARCHAR(100)) - Kategori publikasi.
- `file_name` (VARCHAR(255)) - Nama unik file PDF yang tersimpan di server.
- `cover_name` (VARCHAR(255)) - Nama unik file gambar cover yang tersimpan di server.
- `visibility` (ENUM: 'public', 'private') - Status visibilitas dokumen ('private' khusus fellow).
- `status` (ENUM: 'draft', 'request', 'publish', 'archive') - Status persetujuan dokumen.
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 5. Tabel `publikasi_tags`
Tabel untuk menyimpan tag yang terkait dengan publikasi.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `publikasi_id` (INT, Foreign Key ke tabel `publikasi`) - ID publikasi terkait.
- `tag_name` (VARCHAR(50)) - Nama tag.

### 6. Tabel `forum_threads`
Tabel untuk menyimpan diskusi utama. Menggunakan UUID untuk kemudahan integrasi dan keamanan.
- `id` (CHAR(36), Primary Key) - Menyimpan UUID.
- `author_id` (CHAR(36), Foreign Key ke tabel `users`) - Pembuat thread.
- `category` (VARCHAR(50)) - Kategori topik (contoh: 'Diskusi PDCA', 'General', 'Q&A').
- `title` (VARCHAR(255)) - Judul diskusi.
- `content` (TEXT) - Isi lengkap diskusi.
- `link_metadata` (JSON, Nullable) - Menyimpan meta dari link yang di-share (url, title, description, image, domain).
- `likes_count` (INT) - Counter jumlah like (Denormalisasi).
- `views_count` (INT) - Counter jumlah tayangan (Denormalisasi).
- `replies_count` (INT) - Counter jumlah balasan (Denormalisasi).
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 7. Tabel `forum_thread_tags`
Tabel relasi many-to-many untuk hashtag diskusi.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `thread_id` (CHAR(36), Foreign Key ke tabel `forum_threads`) - Diskusi terkait.
- `tag_name` (VARCHAR(50)) - Tag diskusi.

### 8. Tabel `forum_replies`
Tabel untuk memuat balasan diskusi. Mensuport fitur balasan bersarang (nested replies) secara tidak terbatas melalui relasi `parent_id` (Self-Referencing).
- `id` (CHAR(36), Primary Key) - Menyimpan UUID.
- `thread_id` (CHAR(36), Foreign Key ke tabel `forum_threads`) - Diskusi referensi.
- `author_id` (CHAR(36), Foreign Key ke tabel `users`) - Pembuat balasan.
- `parent_id` (CHAR(36), Nullable, Foreign Key ke tabel `forum_replies`) - ID balasan induk (jika ini membalas sebuah komentar).
- `content` (TEXT) - Isi balasan.
- `likes_count` (INT) - Counter jumlah like pada balasan ini (Denormalisasi).
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 9. Tabel `forum_likes`
Tabel relasional (Pivot) untuk mencegah pengguna melakukan like lebih dari satu kali pada entitas yang sama.
- `user_id` (CHAR(36), Foreign Key ke tabel `users`) - Pengguna yang me-like.
- `entity_id` (CHAR(36)) - ID entitas yang di-like (ID Thread atau ID Reply).
- `entity_type` (ENUM: 'thread', 'reply') - Menandakan apakah yang di-like adalah thread utama atau balasan.
- `created_at` (TIMESTAMP)
- *Primary Key* digabungkan (Composite) dari: `user_id`, `entity_id`, dan `entity_type`.

### 10. Tabel `quizzes`
Tabel untuk menyimpan data kuis wajib.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `title` (VARCHAR(255))
- `description` (TEXT, Nullable)
- `deadline` (DATETIME)
- `status` (ENUM: 'active', 'expired', 'draft')
- `created_at` (TIMESTAMP)

### 11. Tabel `quiz_questions`
Tabel untuk menyimpan daftar pertanyaan per kuis.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `quiz_id` (INT, Foreign Key ke tabel `quizzes`)
- `question_text` (TEXT)
- `options` (JSON)
- `created_at` (TIMESTAMP)
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

### 4. Tabel `publikasi`
Tabel untuk menyimpan data publikasi buku saku, jurnal, atau dokumen PDF.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `user_id` (CHAR(36), Foreign Key ke tabel `users`) - Author/Pengunggah dokumen.
- `title` (VARCHAR(255)) - Judul publikasi.
- `description` (TEXT, Nullable) - Deskripsi atau sinopsis singkat publikasi.
- `category` (VARCHAR(100)) - Kategori publikasi.
- `file_name` (VARCHAR(255)) - Nama unik file PDF yang tersimpan di server.
- `cover_name` (VARCHAR(255)) - Nama unik file gambar cover yang tersimpan di server.
- `visibility` (ENUM: 'public', 'private') - Status visibilitas dokumen ('private' khusus fellow).
- `status` (ENUM: 'draft', 'request', 'publish', 'archive') - Status persetujuan dokumen.
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 5. Tabel `publikasi_tags`
Tabel untuk menyimpan tag yang terkait dengan publikasi.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `publikasi_id` (INT, Foreign Key ke tabel `publikasi`) - ID publikasi terkait.
- `tag_name` (VARCHAR(50)) - Nama tag.

### 6. Tabel `forum_threads`
Tabel untuk menyimpan diskusi utama. Menggunakan UUID untuk kemudahan integrasi dan keamanan.
- `id` (CHAR(36), Primary Key) - Menyimpan UUID.
- `author_id` (CHAR(36), Foreign Key ke tabel `users`) - Pembuat thread.
- `category` (VARCHAR(50)) - Kategori topik (contoh: 'Diskusi PDCA', 'General', 'Q&A').
- `title` (VARCHAR(255)) - Judul diskusi.
- `content` (TEXT) - Isi lengkap diskusi.
- `link_metadata` (JSON, Nullable) - Menyimpan meta dari link yang di-share (url, title, description, image, domain).
- `likes_count` (INT) - Counter jumlah like (Denormalisasi).
- `views_count` (INT) - Counter jumlah tayangan (Denormalisasi).
- `replies_count` (INT) - Counter jumlah balasan (Denormalisasi).
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 7. Tabel `forum_thread_tags`
Tabel relasi many-to-many untuk hashtag diskusi.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `thread_id` (CHAR(36), Foreign Key ke tabel `forum_threads`) - Diskusi terkait.
- `tag_name` (VARCHAR(50)) - Tag diskusi.

### 8. Tabel `forum_replies`
Tabel untuk memuat balasan diskusi. Mensuport fitur balasan bersarang (nested replies) secara tidak terbatas melalui relasi `parent_id` (Self-Referencing).
- `id` (CHAR(36), Primary Key) - Menyimpan UUID.
- `thread_id` (CHAR(36), Foreign Key ke tabel `forum_threads`) - Diskusi referensi.
- `author_id` (CHAR(36), Foreign Key ke tabel `users`) - Pembuat balasan.
- `parent_id` (CHAR(36), Nullable, Foreign Key ke tabel `forum_replies`) - ID balasan induk (jika ini membalas sebuah komentar).
- `content` (TEXT) - Isi balasan.
- `likes_count` (INT) - Counter jumlah like pada balasan ini (Denormalisasi).
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 9. Tabel `forum_likes`
Tabel relasional (Pivot) untuk mencegah pengguna melakukan like lebih dari satu kali pada entitas yang sama.
- `user_id` (CHAR(36), Foreign Key ke tabel `users`) - Pengguna yang me-like.
- `entity_id` (CHAR(36)) - ID entitas yang di-like (ID Thread atau ID Reply).
- `entity_type` (ENUM: 'thread', 'reply') - Menandakan apakah yang di-like adalah thread utama atau balasan.
- `created_at` (TIMESTAMP)
- *Primary Key* digabungkan (Composite) dari: `user_id`, `entity_id`, dan `entity_type`.

### 10. Tabel `quizzes`
Tabel untuk menyimpan data kuis wajib.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `title` (VARCHAR(255))
- `description` (TEXT, Nullable)
- `deadline` (DATETIME)
- `status` (ENUM: 'active', 'expired', 'draft')
- `created_at` (TIMESTAMP)

### 11. Tabel `quiz_questions`
Tabel untuk menyimpan daftar pertanyaan per kuis.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `quiz_id` (INT, Foreign Key ke tabel `quizzes`)
- `question_text` (TEXT)
- `options` (JSON)
- `created_at` (TIMESTAMP)

### 12. Tabel `quiz_submissions`
Tabel untuk menyimpan hasil pekerjaan member.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `quiz_id` (INT, Foreign Key ke tabel `quizzes`)
- `user_id` (CHAR(36), Foreign Key ke tabel `users`)
- `score` (INT)
- `answers` (JSON)
- `submitted_at` (TIMESTAMP)

### 13. Tabel `events`
Tabel untuk menyimpan data dinamis Event Card di halaman Home.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `title` (VARCHAR(255)) - Judul event.
- `event_date` (VARCHAR(100)) - Tanggal/waktu event (misal: "Sept 9, 2026").
- `description` (TEXT, Nullable) - Deskripsi singkat event.
- `is_active` (BOOLEAN) - Status aktif event (TRUE jika ditampilkan).
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 14. Tabel `articles`
Tabel untuk menyimpan data utama artikel (menggunakan format Markdown).
- `id` (CHAR(36), Primary Key)
- `author_id` (CHAR(36), Foreign Key ke tabel `users`)
- `title` (VARCHAR(255))
- `category` (VARCHAR(100))
- `excerpt` (TEXT, Nullable) - Ringkasan singkat artikel
- `content` (TEXT) - Isi artikel dalam format Markdown
- `cover_image` (VARCHAR(255), Nullable) - Gambar sampul artikel
- `status` (ENUM: 'draft', 'request', 'published', 'archived')
- `views_count` (INT)
- `likes_count` (INT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 15. Tabel `article_tags`
Tabel untuk menyimpan hashtag/kategori spesifik per artikel.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `article_id` (CHAR(36), Foreign Key ke tabel `articles`)
- `tag_name` (VARCHAR(50))

### 16. Tabel `article_references`
Tabel untuk menyimpan daftar tautan referensi yang digunakan penulis artikel.
- `id` (INT AUTO_INCREMENT, Primary Key)
- `article_id` (CHAR(36), Foreign Key ke tabel `articles`)
- `url` (TEXT)
- `title` (VARCHAR(255))

### 17. Tabel `article_forum_links`
Tabel relasi (bridge) cerdas untuk mengaitkan Artikel dengan Forum Diskusi tanpa mengganggu arsitektur eksisting forum. 
Thread forum baru dimunculkan (`is_visible_in_forum` = TRUE) saat artikel pertama kali dikomentari.
- `article_id` (CHAR(36), Foreign Key ke tabel `articles`)
- `thread_id` (CHAR(36), Foreign Key ke tabel `forum_threads`)
- `is_visible_in_forum` (BOOLEAN) - Nilai default FALSE
- `created_at` (TIMESTAMP)
- *Primary Key* digabungkan (Composite) dari: `article_id` dan `thread_id`.
