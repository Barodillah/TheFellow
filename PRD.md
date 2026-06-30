# Product Requirements Document
## Fellow of the CSM Intellectual Society — Web Platform

**Versi:** 1.0  
**Tanggal:** Juni 2026  
**Dibuat oleh:** Barod Abdillah (Waycrafter)  
**Status:** Draft

---

## 1. Ringkasan Eksekutif

**Fellow of the CSM Intellectual Society** adalah platform digital eksklusif bagi para Customer Satisfaction Manager (CSM) di lingkungan Mitsubishi. Platform ini terinspirasi dari Royal Society — sebuah fellowship bergengsi yang mendorong pertukaran pengetahuan, kolaborasi intelektual, dan peningkatan layanan pelanggan secara berkelanjutan berdasarkan prinsip Kaizen (PDCA) dan standar pelayanan H.O.M.E.

Platform ini bersifat **frontend-only** (React SPA), dengan data bersifat statis atau mock pada fase awal.

---

## 2. Latar Belakang & Konteks

### 2.1 Organisasi Fellow Society

| Jabatan | Nama | Peran |
|---|---|---|
| Arch-Fellow | Adi Ponco P. | Pemimpin tertinggi fellowship |
| Warden of Resources | Meita D. Pertiwi | Pengelola sumber daya |
| Consigliere | Sirojudin Hasan | Penasihat strategis |
| Sergeant At Arms | Feri Oktapiyanto | Penjaga tata tertib & protokol |
| Waycrafter | Barod Abdillah | Perancang jalan & visi |
| Agitation & Propaganda | Eggy MS | Komunikasi & kampanye internal |
| Master of Provision | Gus Huda | Logistik & penyediaan sumber daya |

### 2.2 Pilar Filosofi

**Kaizen dengan PDCA:**
- **Plan** — Rencanakan peningkatan layanan
- **Do** — Implementasikan secara terukur
- **Check** — Evaluasi hasil dengan data
- **Act** — Standardisasi atau perbaiki kembali

**Standar Pelayanan H.O.M.E:**
- **H**ospitality — Keramahan yang tulus
- **O**ne Service Standard — Konsistensi di semua titik layanan
- **M**emorable Experience — Pengalaman yang berkesan
- **E**mpathy — Empati terhadap kebutuhan pelanggan

---

## 3. Tujuan Platform

### 3.1 Tujuan Utama
1. Menjadi ruang intelektual bagi para CSM Mitsubishi untuk bertukar pengetahuan
2. Mendokumentasikan best practice layanan pelanggan
3. Menyebarluaskan budaya Kaizen dan standar H.O.M.E secara konsisten
4. Menghargai kontribusi anggota fellowship

### 3.2 Non-Goals (Fase 1)
- Tidak ada sistem login/autentikasi (publik atau internal, cukup mock data)
- Tidak ada backend nyata — semua data mock/statis
- Tidak ada fitur notifikasi real-time
- Tidak ada integrasi sistem Mitsubishi

---

## 4. Pengguna Target

| Segmen | Deskripsi |
|---|---|
| **Fellow Aktif** | Para CSM anggota fellowship — pengguna utama |
| **Kandidat Fellow** | CSM yang belum bergabung, mengenal platform |
| **Leadership** | Manajemen yang memantau aktivitas & insight |
| **Tamu/Publik Internal** | Karyawan Mitsubishi yang penasaran dengan fellowship |

---

## 5. Arsitektur Teknis (Frontend Only)

### 5.1 Tech Stack
```
Framework       : React 18 + Vite
Routing         : React Router v6
State Management: Zustand
Styling         : Tailwind CSS v3
UI Components   : shadcn/ui
Icons           : Lucide React
Font            : Google Fonts (lihat Seksi 7)
Data            : JSON statis / mock (lokal atau GitHub raw)
Deploy          : Vercel / Netlify (static hosting)
```

### 5.2 Struktur Folder
```
src/
├── assets/
│   ├── images/           # Foto members, logo
│   └── icons/
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── layout/           # Header, Footer, Sidebar
│   ├── fellow/           # Member cards, badges
│   ├── forum/            # Thread, reply, tag
│   └── shared/           # Toast, Modal, Skeleton
├── pages/
│   ├── Home.jsx
│   ├── Fellows.jsx
│   ├── FellowDetail.jsx
│   ├── Forum.jsx
│   ├── ForumDetail.jsx
│   ├── Articles.jsx
│   ├── ArticleDetail.jsx
│   ├── PDCA.jsx
│   ├── HOME.jsx
│   └── About.jsx
├── data/
│   ├── fellows.json
│   ├── threads.json
│   ├── articles.json
│   └── pdca.json
├── hooks/
│   └── useSearch.js
├── store/
│   └── useAppStore.js
└── utils/
    └── helpers.js
```

---

## 6. Fitur & Halaman

### 6.1 Halaman Utama — Hero Landing (`/`)

**Konten:**
- Hero section: Tagline besar, sub-tagline, CTA button
- Section "Tentang Fellowship" — misi & visi singkat
- Section pilar H.O.M.E dengan 4 kartu interaktif (hover reveal)
- Section PDCA cycle — visual interaktif
- Section "Para Fellow" — grid foto + nama + jabatan (6 member)
- Section highlight artikel/diskusi terbaru
- Footer dengan motto dan logo

**Interaksi:**
- Smooth scroll antar section
- Hover animation pada kartu H.O.M.E
- PDCA cycle animation on scroll

---

### 6.2 Direktori Fellow (`/fellows`)

**Terinspirasi dari Royal Society Fellowship Directory.**

**Konten:**
- Grid/list kartu setiap Fellow
- Setiap kartu berisi: foto, nama, jabatan resmi fellowship, jabatan CSM, tahun bergabung, badge spesialisasi
- Filter: berdasarkan jabatan fellowship, spesialisasi, tahun bergabung
- Search: cari berdasarkan nama

**Komponen kartu Fellow:**
```
┌─────────────────────────────┐
│  [Foto]  Adi Ponco P.       │
│          Arch-Fellow        │
│          CSM Senior — Dept X│
│  ── Badge: Kaizen Master ── │
│  Bergabung: 2023            │
│  [Lihat Profil]             │
└─────────────────────────────┘
```

---

### 6.3 Profil Fellow (`/fellows/:id`)

**Konten:**
- Header besar: foto, nama, jabatan, quote pribadi
- Tab: Tentang | Kontribusi | Artikel | PDCA Cases
- Tentang: Bio singkat, filosofi pelayanan, spesialisasi
- Kontribusi: Jumlah thread, artikel, komentar
- Artikel: List artikel yang ditulis
- PDCA Cases: Studi kasus yang pernah disubmit

---

### 6.4 Forum Diskusi (`/forum`)

**Konsep:** Ruang bertukar pikiran, berdiskusi tentang pelayanan, berbagi pengalaman lapangan.

**Konten:**
- Sidebar: Kategori topik (H.O.M.E, Kaizen, Customer Journey, Innovation, General)
- List thread: judul, penulis, tanggal, jumlah reply, tag
- Tombol "Buat Thread Baru" (mock — tidak benar-benar submit)
- Filter: Terpopuler, Terbaru, Belum Terjawab

**Kategori Thread:**
1. Hospitality Lab — Teknik keramahan & pelayanan
2. One Standard Exchange — Standarisasi prosedur
3. Memorable Moments — Share cerita pelanggan berkesan
4. Empathy Circle — Kasus empati di lapangan
5. Kaizen Corner — Ide perbaikan proses
6. General Discussion — Topik bebas

---

### 6.5 Detail Thread (`/forum/:threadId`)

**Konten:**
- Judul thread + tag + tanggal
- Post pertama (full markdown rendering)
- Reply-reply dengan avatar, nama, waktu
- "Like" reaction (local state, tidak persist)
- Related threads di sidebar

---

### 6.6 Artikel & Knowledge Base (`/articles`)

**Konsep:** Repository pengetahuan yang dikurasi — seperti jurnal Royal Society tapi untuk pelayanan CSM.

**Konten:**
- Hero: "Publikasi Fellow" dengan subtitle
- Filter: Kategori, Tag, Fellow Penulis
- Grid artikel: thumbnail, judul, penulis, tanggal, reading time, excerpt
- Kategori: Kaizen Case Study | H.O.M.E Guide | Customer Insight | Tool & Teknik | Leadership

---

### 6.7 Detail Artikel (`/articles/:slug`)

**Konten:**
- Header artikel: judul, penulis (dengan link ke profil), tanggal, tags
- Konten penuh (rendered dari markdown/JSON)
- Sidebar: Table of Contents, artikel related
- Footer artikel: tombol share (copy link), "Artikel lainnya dari Fellow ini"

---

### 6.8 PDCA Tracker (`/pdca`)

**Konsep:** Showcase siklus PDCA yang pernah dijalankan fellows — sebagai inspirasi dan referensi.

**Konten:**
- Visual diagram PDCA interaktif (klik tiap kuadran untuk filter)
- Grid kartu PDCA Case:
  - Judul case
  - Fellow yang menjalankan
  - Phase saat ini (Plan/Do/Check/Act)
  - Status (In Progress / Completed)
  - Impact: sebelum vs sesudah (mock metric)
- Filter: by Phase, by Fellow, by Status

**Kartu PDCA:**
```
┌─────────────────────────────┐
│  [PDCA Badge — Phase: DO]   │
│  Reduksi Waktu Tunggu       │
│  Customer di Showroom       │
│  ─────────────────────────  │
│  By: Feri Oktapiyanto       │
│  Impact: WT -40% (mock)     │
│  [Lihat Detail]             │
└─────────────────────────────┘
```

---

### 6.9 Halaman H.O.M.E (`/home-standard`)

**Konsep:** Panduan lengkap 4 pilar standar pelayanan Mitsubishi CSM.

**Konten:**
- 4 section besar (H, O, M, E) — masing-masing dengan:
  - Penjelasan mendalam
  - Do's & Don'ts
  - Contoh skenario
  - Quote dari Fellow
- Download panduan (mock PDF button)
- Quiz mini interaktif "Seberapa HOME kamu?" (local scoring)

---

### 6.10 Tentang Fellowship (`/about`)

**Konten:**
- Sejarah dan misi fellowship
- Struktur organisasi (org chart visual)
- Nilai-nilai dan kode etik
- Cara menjadi Fellow (roadmap)
- Timeline milestone fellowship

---

## 7. Design System & Visual Identity

### 7.1 Filosofi Desain

> **"Modern tapi Old Soul"** — Tampilan masa kini (clean, minimal, responsive) dengan jiwa klasik (serif, dignified, scholarly). Seperti Royal Society yang berwibawa tapi accessible.

Ini bukan tema corporate generic. Identitasnya unik: **intelektual yang hangat, eksklusif yang membumi**.

---

### 7.2 Palet Warna

```css
/* Primary — Deep Midnight Blue (wibawa, kepercayaan, kedalaman) */
--color-primary:       #1A2744;  /* Navy gelap — warna utama */
--color-primary-light: #2D4070;  /* Navy medium */
--color-primary-muted: #4A6099;  /* Navy terang */

/* Accent — Aged Gold (prestise, pencapaian, kehangatan) */
--color-accent:       #C9A84C;   /* Gold tua — aksen utama */
--color-accent-light: #E8C875;   /* Gold terang */
--color-accent-dark:  #9E7A2C;   /* Gold gelap */

/* Surface */
--color-surface-deep: #0E1726;   /* Background paling gelap */
--color-surface-card: #F8F5EF;   /* Cream — background kartu */
--color-surface-warm: #EDE8DF;   /* Warm off-white */

/* Text */
--color-text-primary:   #1A1A2E; /* Hampir hitam */
--color-text-secondary: #4A4A6A; /* Abu kebiruan */
--color-text-muted:     #8A8AA0; /* Muted */

/* Semantic */
--color-success: #2E7D52;
--color-warning: #B5860D;
--color-danger:  #922B21;
```

---

### 7.3 Tipografi

**Pasangan font yang dipilih:** Deliberate, mencerminkan karakter scholarly + modern.

```
Display / Heading Utama:
  Font: "Cormorant Garamond" (Google Fonts)
  Weight: 600 Semibold / 700 Bold
  Karakter: Serif klasik, elegan, mengingatkan pada jurnal ilmiah bergengsi
  Digunakan: H1, H2, hero tagline, judul artikel

Body / UI Text:
  Font: "DM Sans" (Google Fonts)
  Weight: 400 Regular / 500 Medium
  Karakter: Humanist sans-serif modern, sangat readable
  Digunakan: Paragraf, label, navigasi, form, deskripsi

Accent / Quote:
  Font: "Cormorant Infant" (Google Fonts) — italic variant
  Digunakan: Pull quotes, motto, tagline pendek

Mono (jika perlu):
  Font: "JetBrains Mono" (Google Fonts)
  Digunakan: Code snippet jika ada

Google Fonts Import:
  @import url('https://fonts.googleapis.com/css2?
    family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&
    family=Cormorant+Infant:ital,wght@0,400;1,400;1,600&
    family=DM+Sans:wght@300;400;500;600&
    family=JetBrains+Mono:wght@400&
    display=swap');
```

**Type Scale:**
```
--font-size-display: clamp(3rem, 6vw, 5rem)     /* Hero headline */
--font-size-h1:      clamp(2rem, 4vw, 3rem)      /* Page titles */
--font-size-h2:      clamp(1.5rem, 3vw, 2.25rem) /* Section headers */
--font-size-h3:      clamp(1.25rem, 2vw, 1.75rem)
--font-size-body:    1rem (16px)
--font-size-small:   0.875rem (14px)
--font-size-caption: 0.75rem (12px)
```

---

### 7.4 Elemen Visual Khas (Signature)

**Satu elemen yang membuat platform ini tak terlupakan:**

> **"The Seal & Rule" System** — Setiap section, kartu, dan header menggunakan ornamen horizontal hairline tipis (1px) dengan motif titik-titik atau diamond kecil di tengah (·◆·), mengingatkan pada desain letterpress klassik dan sertifikat resmi. Ini muncul sebagai divider, sebagai "stamp" pada kartu Fellow, dan sebagai border dekoratif pada hero.

**Implementasi:**
```css
.section-rule::before, .section-rule::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-accent);
  opacity: 0.4;
}
/* Diamond ornament: · ◆ · di tengah */
```

---

### 7.5 Komponen UI Utama

#### Navigation Bar
- Background: `--color-primary` (navy gelap)
- Logo: "CSM·IS" dalam Cormorant Garamond Gold
- Nav links: DM Sans, putih, underline gold on hover
- Mode: Sticky, dengan subtle blur backdrop saat scroll

#### Hero Section
- Background: Gradient halus dari `#1A2744` ke `#0E1726`
- Ornamen: Pattern subtle (grid dots atau diagonal lines, opacity 5%)
- Tagline: Cormorant Garamond, putih/gold
- CTA Button: Gold solid dengan text navy

#### Fellow Cards
- Background: `--color-surface-card` (cream)
- Border: 1px `--color-accent` dengan opacity 30%
- Shadow: `0 4px 24px rgba(26, 39, 68, 0.12)`
- Hover: border gold full opacity + slight scale(1.02)
- Badge: Small pill dengan background navy, text gold

#### Forum Threads
- Background: Putih/cream
- Left border accent: 3px solid berdasarkan kategori
- Kategori color coding: masing-masing warna berbeda

#### Tombol
```
Primary:   bg-gold, text-navy, hover darken 10%
Secondary: border-1px-gold, text-gold, bg-transparent
Ghost:     text-navy, no border, hover bg-warm
Danger:    bg-danger, text-white
```

---

### 7.6 Motion & Animasi

Digunakan dengan restraint — elegant, bukan flashy:

```
Page transitions:    Fade in 300ms ease
Cards hover:         scale(1.02) + shadow 200ms ease
Section reveal:      Fade up on scroll (IntersectionObserver)
PDCA cycle:          Slow rotation ambient (4s loop, pauses on hover)
Number counters:     Count-up animation saat masuk viewport
```

---

### 7.7 Responsive Breakpoints

```
Mobile:  < 640px   → Stack semua, nav jadi hamburger
Tablet:  640–1024px → Grid 2 kolom
Desktop: > 1024px  → Grid 3–4 kolom, full sidebar
Wide:    > 1280px  → Max-width 1280px, centered
```

---

## 8. Data Model (Mock JSON)

### 8.1 Fellow
```json
{
  "id": "f-001",
  "name": "Adi Ponco P.",
  "title": "Arch-Fellow",
  "csmTitle": "Senior CSM — Regional Jawa Barat",
  "joinYear": 2022,
  "avatar": "/assets/fellows/adi.jpg",
  "bio": "Pemimpin fellowship dengan visi...",
  "specializations": ["Kaizen", "Leadership", "Customer Journey"],
  "badges": ["Kaizen Master", "PDCA Champion"],
  "quote": "Pelayanan terbaik lahir dari pemahaman terdalam.",
  "stats": { "articles": 12, "threads": 34, "pdcaCases": 5 }
}
```

### 8.2 Thread
```json
{
  "id": "t-001",
  "title": "Strategi Menghadapi Pelanggan yang Emosional",
  "category": "empathy-circle",
  "author": "f-003",
  "createdAt": "2026-05-14T09:30:00Z",
  "tags": ["empathy", "handling", "emotional"],
  "content": "...",
  "replies": 12,
  "likes": 28,
  "views": 340
}
```

### 8.3 Article
```json
{
  "id": "a-001",
  "slug": "kaizen-showroom-waiting-time",
  "title": "Reduksi Waktu Tunggu: Studi Kaizen di Showroom Jakarta Selatan",
  "author": "f-002",
  "publishedAt": "2026-04-20",
  "category": "kaizen-case-study",
  "tags": ["kaizen", "showroom", "efficiency"],
  "readingTime": 7,
  "excerpt": "Dengan pendekatan PDCA yang konsisten...",
  "thumbnail": "/assets/articles/a-001.jpg"
}
```

### 8.4 PDCA Case
```json
{
  "id": "p-001",
  "title": "Reduksi Waktu Tunggu Customer di Showroom",
  "fellow": "f-004",
  "phase": "act",
  "status": "completed",
  "period": "Q1 2026",
  "metrics": {
    "before": "Rata-rata tunggu 45 menit",
    "after": "Rata-rata tunggu 27 menit",
    "improvement": "-40%"
  }
}
```

---

## 9. Roadmap Pengembangan

### Fase 1 — Foundation (Minggu 1–3)
- [ ] Setup project (Vite + React + Tailwind + shadcn)
- [ ] Design system: warna, tipografi, komponen base
- [ ] Layout: Header, Footer, halaman shell
- [ ] Halaman Home (Hero + section statik)
- [ ] Mock data fellows.json lengkap
- [ ] Halaman Fellows (direktori + filter)
- [ ] Halaman Profil Fellow

### Fase 2 — Core Features (Minggu 4–6)
- [ ] Forum — list thread + detail thread
- [ ] Artikel — list + detail + search
- [ ] PDCA Tracker — visual + kartu case
- [ ] Halaman H.O.M.E Standard
- [ ] Quiz H.O.M.E (local scoring)
- [ ] Responsive polish di semua breakpoint

### Fase 3 — Polish & Extras (Minggu 7–8)
- [ ] Animasi & micro-interactions
- [ ] Dark mode (opsional — toggle)
- [ ] Halaman About + org chart
- [ ] SEO meta tags
- [ ] Performance optimization
- [ ] Deploy ke Vercel

---

## 10. Metrik Keberhasilan

| Metrik | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Mobile responsiveness | 100% halaman |
| Load time (LCP) | < 2.5 detik |
| Jumlah halaman terselesaikan | 10 halaman |

---

## 11. Referensi & Inspirasi

- **Royal Society** (royalsociety.org) — struktur fellowship, direktori anggota, jurnal
- **Cormorant Garamond** — tipografi serif untuk nuansa scholarly
- **DM Sans** — sans-serif modern untuk keterbacaan
- **Prinsip Kaizen Mitsubishi** — PDCA cycle
- **Standar H.O.M.E** — framework pelayanan internal

---

*"Shaping today and tomorrow, better."*  
*— Fellow of the CSM Intellectual Society*

---

**Dokumen ini dibuat oleh Waycrafter: Barod Abdillah**  
*Untuk digunakan sebagai panduan pengembangan platform CSM Intellectual Society*