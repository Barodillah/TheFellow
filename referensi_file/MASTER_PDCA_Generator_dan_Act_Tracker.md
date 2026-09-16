# Master PRD: PDCA Generator & Act Tracker

## 1. Ringkasan Eksekutif
PDCA Generator & Act Tracker adalah platform kolaboratif berbasis AI yang memandu pengguna dari identifikasi kendala hingga eksekusi dan evaluasi siklus PDCA (Plan–Do–Check–Act). Aplikasi ini membantu individu, tim kecil, perusahaan menengah, dan konsultan untuk membongkar akar masalah secara terstruktur, mengekstrak parameter kunci, menyusun rencana aksi yang terukur, melacak pelaksanaan, mencatat hasil, serta memberikan rekomendasi otomatis apa yang harus diubah atau dipertahankan untuk siklus berikutnya.

## 2. Tujuan Produk
- Mempercepat proses problem solving dari kendala menjadi rencana aksi yang actionable.
- Menstandarisasi metodologi PDCA dengan bantuan AI namun tetap memberi kendali penuh kepada manusia.
- Menyediakan pelacakan dan analisis performa lintas proyek untuk perbaikan berkelanjutan.
- Menjadi alat kolaborasi yang aman dan fleksibel bagi konsultan dan organisasi.

## 3. Target Pengguna
- **Individu / Personal Productivity**: untuk manajemen perbaikan diri atau proyek pribadi.
- **Tim kecil (startup/UKM)**: untuk memecahkan masalah operasional dengan cepat.
- **Perusahaan menengah ke atas**: untuk standardisasi problem solving antar departemen.
- **Konsultan / Trainer**: untuk mengelola banyak klien dengan workspace terpisah dan pelaporan profesional.

## 4. Struktur Aplikasi
**Workspace > Project > Siklus PDCA**

- **Workspace**: mewakili perusahaan/klien/departemen. Konsultan dapat memiliki banyak workspace.
- **Project**: satu kendala spesifik yang sedang diselesaikan.
- **Siklus PDCA**: iterasi PDCA dalam satu project. Satu kendala dapat memiliki beberapa akar masalah; setiap akar masalah dapat memiliki parameter sendiri.

## 5. Alur Kerja Inti (End-to-End)

### 5.1 Input Kendala Terstruktur
- Form awal untuk menuliskan:
  - Kendala utama
  - Konteks / latar belakang
  - Data mentah (angka, kronologi, observasi)
- Mendukung impor data dari file **CSV/Excel** untuk memperkaya analisis.

### 5.2 Root Cause Analyzer (5 Whys + Fishbone)
- Modul bertahap untuk menggali akar masalah sampai level parameter/variabel yang dapat diukur.
- Metodologi utama: **5 Whys** dan **Fishbone (Ishikawa)**.
- **AI-Assisted Suggestion**: AI memberikan saran akar masalah potensial berdasarkan kendala dan data yang dimasukkan.
- Jika AI mendeteksi kebutuhan metode lain (misal FTA atau Pareto), AI dapat menyarankannya sebagai opsi tambahan.
- Diagram fishbone interaktif yang dapat diklik per cabang.

### 5.3 Parameter Extractor
- Mengubah temuan akar masalah menjadi daftar **parameter kunci** (misal: defect rate, cycle time, suhu, dll).
- Setiap parameter dilengkapi:
  - Nama parameter
  - Satuan pengukuran
  - Nilai baseline (kondisi awal)
  - Target yang ingin dicapai
- Satu project dapat memiliki beberapa akar masalah, masing-masing dengan parameter sendiri.

### 5.4 Priority Scoring Matrix
- Skala prioritas berbasis **effort vs impact**.
- **Mode campuran**: sistem menyarankan skor effort dan impact berdasarkan analisis AI + data historis, namun user dapat meng-override skor tersebut.
- Output: daftar parameter/aksi yang diurutkan otomatis dari prioritas tertinggi ke terendah.
- Matriks prioritas interaktif (scatter plot effort vs impact).

### 5.5 Plan Generator (Goal + Timeline)
- Generate rencana aksi PDCA otomatis dari prioritas yang telah ditetapkan.
- Setiap rencana berisi:
  - **Goal SMART** (Specific, Measurable, Achievable, Relevant, Time-bound)
  - Milestone / tahapan eksekusi
  - PIC (Person in Charge)
  - Time base (jadwal dan deadline)
- Visualisasi **Gantt/timeline** untuk melihat keseluruhan rencana.

### 5.6 Act Tracker & Result Log
- Checklist eksekusi untuk setiap tindakan dalam rencana.
- Pencatatan hasil aktual per tindakan dan per siklus.
- Riwayat perubahan lengkap (siapa mengubah apa, kapan).
- **Mode offline/async**: user dapat memperbarui tracker tanpa koneksi internet, tersinkron otomatis saat online.

### 5.7 Check: Evaluasi Hasil
- Input hasil aktual vs target, gabungan **angka dan catatan kualitatif**.
- Sistem otomatis menampilkan persentase deviasi antara aktual dan target.
- User dapat menambahkan narasi hasil untuk konteks lebih dalam.

### 5.8 Adjust/Keep Recommendation
- **AI-Assisted Decision Engine**: AI menganalisis tren, deviasi, dan konteks historis untuk memberikan rekomendasi apakah suatu parameter/aksi harus **diubah (adjust)** atau **dipertahankan (keep)**.
- User dapat menyetujui atau menolak rekomendasi tersebut.
- Jika keputusan adalah **Adjust**, sistem otomatis membuat **siklus PDCA berikutnya** dengan parameter yang sudah diperbarui (copy + modifikasi).

## 6. Fitur Kolaborasi & Keamanan

### 6.1 Multi-Workspace & Project
- Struktur folder fleksibel: Workspace > Project > Siklus.
- Cocok untuk konsultan yang mengelola banyak klien, atau perusahaan dengan banyak departemen.

### 6.2 Role-Based Access Control
- Tiga peran utama per workspace:
  - **Owner**: kontrol penuh, bisa kelola anggota dan role.
  - **Editor**: dapat mengubah plan, parameter, dan tracker.
  - **Viewer**: hanya melihat (read-only).

### 6.3 Notifikasi & Reminder
- Notifikasi ketika:
  - Task deadline mendekat
  - Plan disetujui
  - Fase Check selesai dan rekomendasi muncul
  - Siklus PDCA berganti fase

### 6.4 Autentikasi
- Login menggunakan **OAuth Google** (SSO sederhana via Google).
- Tidak ada support SAML/Microsoft pada versi ini.

### 6.5 Audit Log & Data Retention
- Setiap perubahan data tercatat: siapa, kapan, apa yang diubah.
- Kebijakan retensi data dapat diatur oleh pemilik workspace.
- Enkripsi standar untuk data in transit dan at rest.

## 7. AI & Data Intelligence

### 7.1 Pattern Recognition Lintas Proyek
- AI menganalisis semua project/workspace untuk menemukan pola akar masalah atau parameter yang sering menjadi biang kerok.
- Insight global ditampilkan di dashboard.

### 7.2 Executive Summary Generator
- AI otomatis membuat ringkasan eksekutif setiap kali satu siklus selesai.
- Format: narasi singkat + poin kunci.
- Dapat diekspor sebagai PDF atau dibagikan ke stakeholder.

### 7.3 Natural Language Query
- User dapat bertanya ke AI dengan bahasa natural seputar data, contoh:
  - “Parameter apa yang paling sering gagal minggu ini?”
  - “Bandingkan siklus 2 dan 3.”
- AI menjawab dengan data dan visualisasi yang relevan.

### 7.4 Visualisasi Data
- **Grafik tren parameter per siklus** (line chart).
- **Matriks prioritas interaktif** (effort vs impact).
- **Diagram fishbone interaktif**.
- **Gantt/timeline plan PDCA**.

### 7.5 Learning Model
- AI menggunakan **best practice umum PDCA/Lean Six Sigma** sebagai baseline, kemudian dipersonalisasi dengan data user.
- **Mode incognito/private**: user dapat menandai project tertentu agar tidak digunakan untuk pembelajaran model lintas pengguna, demi privasi data sensitif.

## 8. Benchmarking, Template, dan Pengalaman Pengguna

### 8.1 Benchmarking Anonim
- User dapat membandingkan parameter atau cycle time mereka dengan rata-rata anonim dari user lain di industri sejenis.
- Contoh: “Defect rate Anda 2.1%, median industri 3.4%.”

### 8.2 Template PDCA dari Komunitas
- Perpustakaan template PDCA siap pakai berdasarkan industri/masalah umum (manufacturing, software, F&B, dll).
- Template dapat langsung digunakan sebagai starting point.

### 8.3 Progress Bar & Milestone Celebration
- Setiap siklus PDCA memiliki progress bar besar.
- Saat milestone penting tercapai (akar masalah ditemukan, plan disetujui, siklus selesai), muncul animasi/confetti halus untuk memberi apresiasi.

### 8.4 Daily Digest & Reminder Cerdas
- Ringkasan harian via email/notifikasi yang berisi:
  - Task yang hampir deadline
  - Siklus yang stagnan
  - Satu insight AI terbaik hari ini

### 8.5 Kolaborasi Async
- Kolaborasi dilakukan secara asynchronous dengan riwayat perubahan yang lengkap.
- Tidak ada real-time collaboration pada versi ini.

## 9. Integrasi & Platform

### 9.1 Integrasi Eksternal
- Impor data dari **CSV/Excel** saja pada versi awal.
- Tidak ada integrasi native dengan Jira, Asana, Google Sheets, atau API publik untuk saat ini (dapat dipertimbangkan untuk roadmap).

### 9.2 Platform Target
- **Web browser (desktop)**.
- **Web + PWA (mobile-friendly)**: dapat diakses dari perangkat mobile untuk tim lapangan/pabrik. Tidak ada native mobile app pada versi ini.

## 10. Non-Functional Requirements
- **Kepatuhan**: Tidak ada compliance khusus (GDPR, ISO, SOC 2) pada versi awal, yang penting enkripsi standar.
- **Deployment**: Cloud SaaS (tidak ada opsi self-hosting/on-premise).
- **Keamanan**: Enkripsi data, audit log, role-based access control.
- **Ketersediaan**:Target uptime 99.5% (SLA dasar).
- **Performa**: Respon API < 500ms untuk query umum; analisis AI dapat berjalan async jika berat.

## 11. Roadmap Singkat
1. **MVP (Fase 1)**: Input kendala, 5 Whys/Fishbone, parameter extractor, prioritas manual, plan generator, tracker, check, adjust/keep rekomendasi sederhana.
2. **Fase 2**: AI-assisted root cause & rekomendasi, benchmark anonim, template komunitas, visualisasi interaktif.
3. **Fase 3**: Pattern recognition lintas proyek, NLQ, executive summary, mode offline/PWA, cycle chaining otomatis.
4. **Fase 4**: Integrasi API publik, mode real-time opsional, compliance tambahan.

## 12. Metrik Keberhasilan
- % penyelesaian siklus PDCA penuh (dari input hingga Act).
- Jumlah parameter yang berhasil mencapai target.
- Waktu rata-rata dari input kendala hingga Plan disetujui.
- Tingkat retensi pengguna mingguan.
- Jumlah siklus chaining (siklus berulang) per project.
- Kepuasan pengguna (NPS).

--- 
**Status**: Draft PRD v1.0 — siap untuk validasi lanjutan.