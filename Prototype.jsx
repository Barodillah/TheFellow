import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Filter, MessageSquare, BookOpen, Award, ArrowRight, ChevronRight,
    RefreshCw, Heart, Send, Info, Calendar, User, CheckCircle2, Activity,
    Shield, Compass, HelpCircle, Trophy, Menu, X, FileText, Check, ExternalLink, Share2, ThumbsUp
} from 'lucide-react';

// ==========================================
// MOCK DATA
// ==========================================

const FELLOWS_DATA = [
    {
        id: "f-001",
        name: "Adi Ponco P.",
        title: "Arch-Fellow",
        csmTitle: "Senior CSM — Regional Jawa Barat",
        joinYear: 2022,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
        bio: "Pemimpin tertinggi fellowship dengan visi jangka panjang dalam mengintegrasikan standar global ke dalam pelayanan lokal. Percaya bahwa setiap interaksi adalah sebuah peluang belajar.",
        specializations: ["Kaizen", "Leadership", "Customer Journey"],
        badges: ["Kaizen Master", "PDCA Champion", "Founding Father"],
        quote: "Pelayanan terbaik lahir dari pemahaman terdalam akan denyut kebutuhan pelanggan.",
        stats: { articles: 12, threads: 34, pdcaCases: 5 }
    },
    {
        id: "f-002",
        name: "Meita D. Pertiwi",
        title: "Warden of Resources",
        csmTitle: "CSM Specialist — Dept Customer Experience",
        joinYear: 2022,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
        bio: "Pengelola sumber daya dan kurator pengetahuan fellowship. Fokus pada optimalisasi touchpoint layanan dan standarisasi operasional nasional.",
        specializations: ["Resource Optimization", "Standardization", "Hospitality"],
        badges: ["Gold Standard", "Resource Guardian"],
        quote: "Kualitas pelayanan bukan sebuah kebetulan, melainkan hasil dari perencanaan sumber daya yang matang.",
        stats: { articles: 8, threads: 21, pdcaCases: 3 }
    },
    {
        id: "f-003",
        name: "Sirojudin Hasan",
        title: "Consigliere",
        csmTitle: "Strategy Advisor — Regional Head Office",
        joinYear: 2023,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
        bio: "Penasihat strategis utama fellowship yang mengawasi penyelarasan visi Kaizen dengan dinamika pasar. Ahli dalam meredam krisis kepuasan pelanggan.",
        specializations: ["Crisis Resolution", "Strategic Alignment", "Metrics Analytics"],
        badges: ["Strategic Mind", "Problem Solver"],
        quote: "Menghadapi komplain bukanlah hambatan, melainkan pintu gerbang menuju loyalitas tanpa batas.",
        stats: { articles: 9, threads: 27, pdcaCases: 4 }
    },
    {
        id: "f-004",
        name: "Feri Oktapiyanto",
        title: "Sergeant At Arms",
        csmTitle: "CSM — Showroom Jakarta Timur",
        joinYear: 2023,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
        bio: "Penjaga tata tertib, integritas, dan disiplin pelaksanaan standar H.O.M.E di garda terdepan. Praktisi andal dalam mereduksi waktu tunggu diler.",
        specializations: ["On-Field Execution", "Discipline Standards", "Time Reduction"],
        badges: ["Standard Enforcer", "Field Champion"],
        quote: "Disiplin dalam standar kecil adalah pondasi dari pengalaman luar biasa yang tak terlupakan.",
        stats: { articles: 7, threads: 19, pdcaCases: 6 }
    },
    {
        id: "f-005",
        name: "Barod Abdillah",
        title: "Waycrafter",
        csmTitle: "Service Experience Architect — Dept Digital Transformation",
        joinYear: 2024,
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200",
        bio: "Perancang jalan, visi digital, dan platform kolaborasi para Fellow. Berkomitmen menjembatani empati manusia dengan efisiensi sistem digital modern.",
        specializations: ["Digital Innovation", "Experience Design", "Kaizen Tech"],
        badges: ["Digital Pioneer", "Vision Crafter"],
        quote: "Teknologi hanyalah alat; empati tulus dari CSM adalah jiwa utama dari setiap solusi digital.",
        stats: { articles: 15, threads: 42, pdcaCases: 4 }
    },
    {
        id: "f-006",
        name: "Eggy MS",
        title: "Agitation & Propaganda",
        csmTitle: "Internal Communications Lead — Dept PR & Relations",
        joinYear: 2024,
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200",
        bio: "Suara internal fellowship yang bertugas menyebarluaskan semangat Kaizen dan kisah inspiratif standar H.O.M.E ke seluruh penjuru organisasi.",
        specializations: ["Campaigns", "Storytelling", "Internal Branding"],
        badges: ["Word Weaver", "Cultural Champion"],
        quote: "Setiap keberhasilan Kaizen layak dirayakan dan diceritakan untuk menginspirasi perubahan berikutnya.",
        stats: { articles: 11, threads: 31, pdcaCases: 2 }
    },
    {
        id: "f-007",
        name: "Gus Huda",
        title: "Master of Provision",
        csmTitle: "Service Logistics Lead — Dept Operational Support",
        joinYear: 2025,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
        bio: "Penyedia logistik, alat kerja, dan ekosistem pendukung aksi nyata CSM di lapangan. Memastikan para Fellow tidak pernah kekurangan amunisi untuk melakukan Kaizen.",
        specializations: ["Logistics Support", "Work Environment", "Operational Flow"],
        badges: ["Provider Supreme", "Backstage Hero"],
        quote: "Dukungan operasional yang lancar adalah pahlawan tanpa tanda jasa di balik senyuman kepuasan customer.",
        stats: { articles: 5, threads: 15, pdcaCases: 3 }
    }
];

const THREADS_DATA = [
    {
        id: "t-001",
        title: "Strategi Menghadapi Pelanggan yang Emosional pada Peak Season",
        category: "empathy-circle",
        categoryLabel: "Empathy Circle",
        authorId: "f-003",
        createdAt: "2026-06-25T09:30:00Z",
        tags: ["empathy", "handling", "emotional-customer"],
        content: "Rekan-rekan Fellow, belakangan ini kami mendapati kenaikan arus kunjungan servis yang berdampak pada antrean. Beberapa customer menunjukkan tanda-tanda frustrasi. Bagaimana taktik konkret Anda untuk mengembalikan ketenangan mereka sebelum memulai proses dialog standardisasi? Saya pribadi menyarankan teknik '3-Detik Jeda Hening' untuk menyelaraskan napas dengan customer.",
        repliesCount: 4,
        likes: 28,
        views: 340,
        comments: [
            {
                id: "c-1",
                authorId: "f-001",
                createdAt: "2026-06-25T11:00:00Z",
                content: "Sangat setuju, Consigliere Sirojudin. Di Jawa Barat, kami menerapkan 'Welcome Drink Aromaterapi' hangat begitu customer mulai menunjukkan nada bicara tinggi. Kehangatan fisik terbukti menurunkan hormon stres secara instan."
            },
            {
                id: "c-2",
                authorId: "f-004",
                createdAt: "2026-06-25T14:15:00Z",
                content: "Menambahkan dari lapangan, kami melatih tim frontliner untuk langsung menurunkan posisi berdiri agar sejajar atau sedikit di bawah tinggi mata customer yang sedang duduk. Gestur ini meredakan dominasi konfrontasional."
            }
        ]
    },
    {
        id: "t-002",
        title: "Implementasi Standarisasi Layanan Serah Terima Unit Baru (One Service Standard)",
        category: "one-standard-exchange",
        categoryLabel: "One Standard Exchange",
        authorId: "f-002",
        createdAt: "2026-06-18T14:20:00Z",
        tags: ["standardization", "delivery", "home-standard"],
        content: "Pilar 'One Service Standard' menuntut keselarasan kualitas baik di diler kecil maupun flagship. Mari kita diskusikan checklist krusial saat serah terima unit (Delivery Handover) agar customer mendapatkan memorabilia yang persis sama mewahnya di mana pun mereka berada.",
        repliesCount: 3,
        likes: 19,
        views: 215,
        comments: [
            {
                id: "c-3",
                authorId: "f-005",
                createdAt: "2026-06-18T16:30:00Z",
                content: "Sebagai Waycrafter, saya sedang merumuskan e-Handover Toolkit. Setiap detail ritual pengiriman direkam digital agar konsisten di diler cabang mana pun."
            }
        ]
    },
    {
        id: "t-003",
        title: "Mengurangi Waiting Time Showroom hingga 15 Menit dengan Papan Kontrol Visual Kaizen",
        category: "kaizen-corner",
        categoryLabel: "Kaizen Corner",
        authorId: "f-004",
        createdAt: "2026-06-10T08:00:00Z",
        tags: ["kaizen", "waiting-time", "efficiency"],
        content: "Kami telah menguji coba papan kontrol visual di area workshop untuk mempercepat penugasan mekanik saat unit masuk. Hasil awal menunjukkan reduksi waktu tunggu dari pendaftaran ke estimasi perbaikan secara signifikan.",
        repliesCount: 6,
        likes: 35,
        views: 412,
        comments: []
    }
];

const ARTICLES_DATA = [
    {
        id: "a-001",
        slug: "kaizen-showroom-waiting-time",
        title: "Reduksi Waktu Tunggu: Studi Kaizen Terpadu di Showroom Jakarta Selatan",
        authorId: "f-004",
        publishedAt: "2026-05-20",
        category: "kaizen-case-study",
        categoryLabel: "Kaizen Case Study",
        tags: ["kaizen", "showroom", "efficiency"],
        readingTime: 7,
        excerpt: "Dengan menggunakan pendekatan PDCA secara konsisten, tim berhasil memotong waktu tunggu rata-rata administrasi dari 45 menit menjadi hanya 27 menit. Temukan diagram alur perubahan dan eliminasi waste di sini.",
        content: `
      <h3>Latar Belakang Masalah</h3>
      <p>Showroom Jakarta Selatan menghadapi tantangan serius berupa keluhan antrean customer pada hari Sabtu. Rata-rata waktu tunggu customer dari pendaftaran hingga penyerahan kunci ke mekanik mencapai 45 menit. Hal ini melanggar standar kenyamanan dari pilar H.O.M.E.</p>
      
      <h3>Fase 1: PLAN (Perencanaan Perubahan)</h3>
      <p>Tim melakukan observasi langsung menggunakan metode <i>Gemba Walk</i>. Kami memetakan proses pelayanan dan menemukan bottleneck pada verifikasi data garansi digital yang memakan waktu hingga 12 menit sendiri. Rencana kami adalah membuat jalur pra-registrasi via aplikasi h-1 kunjungan.</p>
      
      <h3>Fase 2: DO (Implementasi Eksperimen)</h3>
      <p>Sistem registrasi digital h-1 diuji coba pada 50 customer terpilih. Formulir keluhan dan data garansi sudah tervalidasi oleh tim malam sebelum diler beroperasi pagi harinya.</p>
      
      <h3>Fase 3: CHECK (Evaluasi Hasil)</h3>
      <p>Setelah 2 minggu uji coba, rata-rata waktu proses pada hari Sabtu terpangkas dari 45 menit menjadi 27 menit—sebuah reduksi yang luar biasa sekitar 40%. Kepuasan customer (CSI Score) melesat naik dari 4.2 ke 4.9.</p>
      
      <h3>Fase 4: ACT (Standardisasi)</h3>
      <p>Metode pra-registrasi ini resmi disahkan sebagai prosedur operasi baru nasional di bawah panduan 'One Service Standard'.</p>
    `
    },
    {
        id: "a-002",
        slug: "memorable-experience-guide",
        title: "The Art of Memorable Experience: Mengubah Transaksi Menjadi Relasi Emosional",
        authorId: "f-001",
        publishedAt: "2026-06-02",
        category: "home-guide",
        categoryLabel: "H.O.M.E Guide",
        tags: ["memorable-experience", "hospitality", "customer-bonding"],
        readingTime: 5,
        excerpt: "Bagaimana sentuhan kecil seperti mengingat nama hewan peliharaan customer atau mengirimkan ucapan selamat ulang tahun tulisan tangan dapat meningkatkan retensi diler hingga 150%. Jurnal eksklusif Arch-Fellow.",
        content: `
      <h3>Mengapa Transaksi Saja Tidak Cukup?</h3>
      <p>Di era kompetisi otomotif yang sangat ketat, fitur kendaraan dapat ditiru, namun memori emosional pelayanan tidak akan pernah bisa dijiplak. Kita harus beralih dari 'Transaction Center' menuju 'Emotional Hub'.</p>
      
      <h3>Konsep Golden Moment</h3>
      <p>Golden Moment adalah titik kritis di mana kita bisa melebihi ekspektasi customer tanpa mereka minta. Contohnya, mendapati customer sedang kehausan lalu membawakannya minuman dingin favoritnya yang sempat ia sebutkan secara implisit pada kunjungan bulan lalu.</p>
      
      <h3>Langkah Tiga Pilar Pengalaman Berkesan</h3>
      <p>1. <b>Aktif Mendengarkan (Active Listening):</b> Tangkap detail personal (ulang tahun anak, destinasi liburan impian, nama peliharaan).<br/>
      2. <b>Personalisasi Kejutan (Surprise Personalization):</b> Berikan sentuhan personal gratis yang tidak tertulis di brosur resmi.<br/>
      3. <b>Penutupan Hangat (Warm Closure):</b> Kontak kembali dalam 3 hari bukan hanya menanyakan kondisi mobil, melainkan kepuasan hatinya.</p>
    `
    }
];

const PDCA_CASES_DATA = [
    {
        id: "p-001",
        title: "Reduksi Waktu Tunggu Customer di Showroom",
        fellowId: "f-004",
        phase: "act",
        status: "completed",
        period: "Q1 2026",
        description: "Inisiatif strategis untuk memangkas hambatan administrasi pendaftaran servis menggunakan pra-registrasi online.",
        metrics: {
            before: "Rata-rata tunggu 45 menit",
            after: "Rata-rata tunggu 27 menit",
            improvement: "-40% Durasi Antrean"
        }
    },
    {
        id: "p-002",
        title: "Penyempurnaan Ruang Tunggu Berbasis Kenyamanan H.O.M.E",
        fellowId: "f-001",
        phase: "check",
        status: "in-progress",
        period: "Q2 2026",
        description: "Evaluasi tata letak kursi diler, penyediaan ruang tenang (silent room) untuk customer yang bekerja jarak jauh (WFH).",
        metrics: {
            before: "CSI kenyamanan ruang tunggu 4.1/5",
            after: "CSI sementara uji coba 4.7/5",
            improvement: "+14.6% Kepuasan Ruang"
        }
    },
    {
        id: "p-003",
        title: "Automasi Notifikasi Status Servis via Whatsapp Terintegrasi",
        fellowId: "f-005",
        phase: "do",
        status: "in-progress",
        period: "Q2 2026",
        description: "Pembuatan bot otomatisasi update pengerjaan mobil untuk menghindari customer terus-menerus bertanya kepada service advisor.",
        metrics: {
            before: "Rasio panggilan tanya status: 78%",
            after: "Rasio proyeksi pasca-automasi: <10%",
            improvement: "Efisiensi Waktu Tim Frontline"
        }
    },
    {
        id: "p-004",
        title: "Standarisasi Protokol Sambutan Hangat (Hospitality Greeting)",
        fellowId: "f-002",
        phase: "plan",
        status: "in-progress",
        period: "Q3 2026",
        description: "Menyusun skrip sapaan baru yang melambangkan kehangatan tulus, melatih petugas keamanan hingga resepsionis diler cabang.",
        metrics: {
            before: "Keramahan diler dinilai beragam",
            after: "Konsistensi pelayanan 100% tersertifikasi",
            improvement: "Keseragaman Standar Nasional"
        }
    }
];

// ==========================================
// DECORATIVE & THE SEAL & RULE SYSTEM
// ==========================================

const DecorativeRule = () => (
    <div className="flex items-center justify-center my-8 select-none">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent flex-grow max-w-[200px]" />
        <span className="mx-4 text-[#C9A84C] font-serif text-xs tracking-widest flex items-center gap-1.5">
            <span>·</span>
            <span className="text-[8px] transform rotate-45">◆</span>
            <span>·</span>
        </span>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent flex-grow max-w-[200px]" />
    </div>
);

// ==========================================
// COMPONENT MAIN - APP
// ==========================================

export default function App() {
    // Navigation State
    const [currentPage, setCurrentPage] = useState('home');
    const [currentParams, setCurrentParams] = useState({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [fellowFilter, setFellowFilter] = useState('all');
    const [forumFilter, setForumFilter] = useState('all');
    const [articlesFilter, setArticlesFilter] = useState('all');
    const [pdcaFilter, setPdcaFilter] = useState('all');

    // Dynamic States for Forum (Mock saving thread/reply, and liking)
    const [threads, setThreads] = useState(THREADS_DATA);
    const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadCategory, setNewThreadCategory] = useState('general-discussion');
    const [newThreadContent, setNewThreadContent] = useState('');
    const [newThreadTags, setNewThreadTags] = useState('');

    // Custom alerts/toasts
    const [toastMessage, setToastMessage] = useState('');

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Helper function for page navigation & scroll
    const navigateTo = (page, params = {}) => {
        setCurrentPage(page);
        setCurrentParams(params);
        setMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Import Google Fonts once on mount
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cormorant+Infant:ital,wght@0,400;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }, []);

    // Handle Thread Submission (Mock)
    const handleCreateThread = (e) => {
        e.preventDefault();
        if (!newThreadTitle || !newThreadContent) {
            triggerToast("Mohon isi semua bidang yang diperlukan!");
            return;
        }
        const newId = `t-${Date.now()}`;
        const newObj = {
            id: newId,
            title: newThreadTitle,
            category: newThreadCategory,
            categoryLabel: newThreadCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            authorId: "f-005", // Default: Barod Abdillah as logged-in mock user
            createdAt: new Date().toISOString(),
            tags: newThreadTags ? newThreadTags.split(',').map(t => t.trim()) : ['diskusibaru'],
            content: newThreadContent,
            repliesCount: 0,
            likes: 0,
            views: 12,
            comments: []
        };

        setThreads([newObj, ...threads]);
        setIsNewThreadModalOpen(false);
        setNewThreadTitle('');
        setNewThreadContent('');
        setNewThreadTags('');
        triggerToast("Diskusi baru berhasil ditambahkan ke Forum!");
        navigateTo('forum');
    };

    // Handle Likes
    const handleLikeThread = (threadId) => {
        setThreads(threads.map(t => t.id === threadId ? { ...t, likes: t.likes + 1 } : t));
        triggerToast("Terima kasih atas apresiasi Anda!");
    };

    // Handle comment submit
    const [commentText, setCommentText] = useState('');
    const handleAddComment = (threadId) => {
        if (!commentText.trim()) return;
        const updatedThreads = threads.map(t => {
            if (t.id === threadId) {
                return {
                    ...t,
                    repliesCount: t.repliesCount + 1,
                    comments: [
                        ...t.comments,
                        {
                            id: `c-${Date.now()}`,
                            authorId: "f-005", // Mock user: Barod Abdillah
                            createdAt: new Date().toISOString(),
                            content: commentText
                        }
                    ]
                };
            }
            return t;
        });
        setThreads(updatedThreads);
        setCommentText('');
        triggerToast("Komentar berhasil ditambahkan!");
    };

    // ==========================================
    // HOME PILAR & QUIZ DATA
    // ==========================================

    const [activeHomeTab, setActiveHomeTab] = useState('hospitality');
    const [pdcaHoverPhase, setPdcaHoverPhase] = useState('plan');

    // Mini Quiz States
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [quizScore, setQuizScore] = useState(null);

    const QUIZ_QUESTIONS = [
        {
            q: "Ada customer datang dalam keadaan marah besar di showroom diler Anda karena keterlambatan asuransi. Langkah pertama Anda?",
            options: [
                { text: "Langsung meminta maaf secara tulus dan mendengarkan keluhannya tanpa memotong (Empati)", score: 4, label: "E" },
                { text: "Memanggil tim asuransi terkait untuk segera menjelaskan status klaim (One Standard)", score: 3, label: "O" },
                { text: "Menyuguhkan minuman dingin kesukaan customer agar emosinya mereda terlebih dahulu (Hospitality)", score: 2, label: "H" },
                { text: "Mencatat komplain tersebut pada form kendala untuk ditinjau esok hari (Kaizen)", score: 1, label: "P" }
            ]
        },
        {
            q: "Bagaimana cara Anda memastikan pelayanan yang konsisten di semua area cabang diler?",
            options: [
                { text: "Menerapkan Checklist Standar Operasional yang diaudit berkala di seluruh area (One Standard)", score: 4, label: "O" },
                { text: "Melatih garda depan agar menyapa customer dengan senyum 3-jari yang tulus (Hospitality)", score: 3, label: "H" },
                { text: "Melakukan analisis PDCA bulanan untuk memangkas hambatan pelayanan (Kaizen)", score: 2, label: "P" },
                { text: "Mengadakan sesi curhat mingguan bersama staff untuk mendalami curhatan customer (Empati)", score: 1, label: "E" }
            ]
        },
        {
            q: "Seberapa penting kenangan yang membekas (Memorable Experience) dalam proses serah terima unit baru?",
            options: [
                { text: "Sangat vital, kita wajib menambahkan sentuhan personal tak terlupakan bagi keluarga customer (Memorable)", score: 4, label: "M" },
                { text: "Penting untuk memastikan semua kelengkapan surat kendaraan telah divalidasi tepat waktu (One Standard)", score: 3, label: "O" },
                { text: "Cukup penting untuk memberi sambutan ramah dan dokumentasi foto standar (Hospitality)", score: 2, label: "H" },
                { text: "Penting sebagai bahan perbaikan proses serah terima diler berikutnya (Kaizen)", score: 1, label: "P" }
            ]
        },
        {
            q: "Ketika mendapati antrean diler bertambah panjang pada libur akhir pekan, tindakan darurat Anda?",
            options: [
                { text: "Melakukan penyesuaian proses seketika (Kaizen) dengan membuka loket pra-pendaftaran darurat", score: 4, label: "P" },
                { text: "Menghampiri antrean untuk membagikan cemilan hangat dan meminta maaf atas ketidaknyamanan (Hospitality)", score: 3, label: "H" },
                { text: "Memprioritaskan customer yang memiliki kebutuhan mendesak terlebih dahulu (Empati)", score: 2, label: "E" },
                { text: "Tetap konsisten mengikuti antrean sesuai nomor urutan demi keadilan pelayanan (One Standard)", score: 1, label: "O" }
            ]
        },
        {
            q: "Bagi Anda, apa arti utama pilar 'Empati' dalam keseharian operasional diler?",
            options: [
                { text: "Mampu memposisikan diri sebagai customer untuk memahami motif di balik kegusarannya", score: 4, label: "E" },
                { text: "Menciptakan hubungan emosional jangka panjang yang membuat customer merasa seperti keluarga", score: 3, label: "M" },
                { text: "Memastikan hak-hak layanan customer terpenuhi secara adil tanpa diskriminasi", score: 2, label: "O" },
                { text: "Menjadikan kritik pedas customer sebagai data utama perbaikan sistemik diler", score: 1, label: "P" }
            ]
        }
    ];

    const handleSelectQuizAnswer = (score) => {
        const updatedAnswers = [...quizAnswers, score];
        setQuizAnswers(updatedAnswers);

        if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Calculate total score
            const total = updatedAnswers.reduce((sum, val) => sum + val, 0);
            setQuizScore(total);
        }
    };

    const resetQuiz = () => {
        setQuizStarted(false);
        setCurrentQuestionIndex(0);
        setQuizAnswers([]);
        setQuizScore(null);
    };

    const getQuizResultDescription = (score) => {
        if (score >= 17) {
            return {
                title: "Master of Customer Experience",
                desc: "Luar biasa! Nilai kepemimpinan dan rasa empati Anda telah sejalan dengan standar tertinggi Fellow Society. Anda adalah motor penggerak Kaizen sejati di Mitsubishi.",
                badge: "Grandmaster Award"
            };
        } else if (score >= 12) {
            return {
                title: "Guardian of Standard",
                desc: "Kerja bagus! Anda memiliki pemahaman pelayanan H.O.M.E yang solid dan konsisten menjalankan standarisasi. Teruskan perbaikan Kaizen kecil setiap hari.",
                badge: "H.O.M.E Guard"
            };
        } else {
            return {
                title: "Kaizen Apprentice",
                desc: "Anda memiliki pondasi yang baik, namun masih ada ruang yang luas untuk meningkatkan ketajaman empati dan kreativitas layanan dalam menciptakan Memorable Experience.",
                badge: "Rising Kaizen"
            };
        }
    };

    // ==========================================
    // MEMORIES OF THE FELLOWSHIP LOGS (Filtering)
    // ==========================================

    const filteredFellows = useMemo(() => {
        return FELLOWS_DATA.filter(f => {
            const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
            if (fellowFilter === 'all') return matchSearch;
            return matchSearch && f.title.toLowerCase().replace(/\s+/g, '-') === fellowFilter;
        });
    }, [searchQuery, fellowFilter]);

    const filteredThreads = useMemo(() => {
        return threads.filter(t => {
            const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            if (forumFilter === 'all') return matchSearch;
            return matchSearch && t.category === forumFilter;
        });
    }, [threads, searchQuery, forumFilter]);

    const filteredArticles = useMemo(() => {
        return ARTICLES_DATA.filter(a => {
            const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            if (articlesFilter === 'all') return matchSearch;
            return matchSearch && a.category === articlesFilter;
        });
    }, [searchQuery, articlesFilter]);

    const filteredPdca = useMemo(() => {
        return PDCA_CASES_DATA.filter(p => {
            if (pdcaFilter === 'all') return true;
            return p.phase === pdcaFilter;
        });
    }, [pdcaFilter]);

    return (
        <div className="min-h-screen flex flex-col bg-[#EDE8DF] text-[#1A1A2E] font-sans antialiased">
            {/* Toast Alert System */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center bg-[#1A2744] text-[#EDE8DF] px-5 py-3 rounded-md shadow-2xl border border-[#C9A84C] animate-bounce">
                    <span className="font-serif italic text-sm text-[#C9A84C] mr-2">Society Notice:</span>
                    <span className="text-sm font-medium">{toastMessage}</span>
                </div>
            )}

            {/* HEADER / NAVIGATION BAR */}
            <header className="sticky top-0 z-40 bg-[#1A2744] text-[#EDE8DF] border-b border-[#C9A84C]/30 shadow-lg backdrop-blur-md bg-opacity-95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('home')}>
                            <div className="w-10 h-10 rounded-full border-2 border-[#C9A84C] flex items-center justify-center bg-gradient-to-br from-[#1A2744] to-[#2D4070]">
                                <span className="font-serif font-bold text-[#C9A84C] text-lg">M</span>
                            </div>
                            <div>
                                <span className="font-serif font-bold text-lg tracking-wider text-white">CSM <span className="text-[#C9A84C]">· Intellectual Society</span></span>
                                <p className="text-[9px] font-sans tracking-widest text-[#C9A84C]/80 uppercase">Fellowship Platform</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-6 items-center">
                            <button onClick={() => navigateTo('home')} className={`text-sm font-medium hover:text-[#C9A84C] transition duration-200 ${currentPage === 'home' ? 'text-[#C9A84C]' : 'text-gray-300'}`}>Beranda</button>
                            <button onClick={() => navigateTo('fellows')} className={`text-sm font-medium hover:text-[#C9A84C] transition duration-200 ${currentPage === 'fellows' || currentPage === 'profile' ? 'text-[#C9A84C]' : 'text-gray-300'}`}>Direktori Fellow</button>
                            <button onClick={() => navigateTo('forum')} className={`text-sm font-medium hover:text-[#C9A84C] transition duration-200 ${currentPage === 'forum' ? 'text-[#C9A84C]' : 'text-gray-300'}`}>Forum Diskusi</button>
                            <button onClick={() => navigateTo('articles')} className={`text-sm font-medium hover:text-[#C9A84C] transition duration-200 ${currentPage === 'articles' ? 'text-[#C9A84C]' : 'text-gray-300'}`}>Artikel & Publikasi</button>
                            <button onClick={() => navigateTo('pdca')} className={`text-sm font-medium hover:text-[#C9A84C] transition duration-200 ${currentPage === 'pdca' ? 'text-[#C9A84C]' : 'text-gray-300'}`}>PDCA Tracker</button>
                            <button onClick={() => navigateTo('home-standard')} className={`text-sm font-medium hover:text-[#C9A84C] transition duration-200 ${currentPage === 'home-standard' ? 'text-[#C9A84C]' : 'text-gray-300'}`}>Standar H.O.M.E</button>
                            <button onClick={() => navigateTo('about')} className={`text-sm font-medium hover:text-[#C9A84C] transition duration-200 ${currentPage === 'about' ? 'text-[#C9A84C]' : 'text-gray-300'}`}>Tentang Kami</button>
                        </nav>

                        {/* Quick CTAs / Hamburger */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => {
                                    navigateTo('home-standard');
                                    setTimeout(() => {
                                        const el = document.getElementById('quiz-section');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }, 500);
                                }}
                                className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-[#C9A84C] to-[#E8C875] text-[#1A2744] hover:opacity-90 px-4 py-2 rounded font-sans text-xs font-semibold tracking-wide transition duration-300 shadow"
                            >
                                <Trophy className="w-3.5 h-3.5" />
                                <span>IKUTI QUIZ</span>
                            </button>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden text-gray-300 hover:text-white"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-[#1A2744] border-t border-[#C9A84C]/20 px-4 py-4 space-y-3">
                        <button onClick={() => navigateTo('home')} className="block w-full text-left py-2 px-3 rounded hover:bg-[#2D4070] text-gray-200 text-sm">Beranda</button>
                        <button onClick={() => navigateTo('fellows')} className="block w-full text-left py-2 px-3 rounded hover:bg-[#2D4070] text-gray-200 text-sm">Direktori Fellow</button>
                        <button onClick={() => navigateTo('forum')} className="block w-full text-left py-2 px-3 rounded hover:bg-[#2D4070] text-gray-200 text-sm">Forum Diskusi</button>
                        <button onClick={() => navigateTo('articles')} className="block w-full text-left py-2 px-3 rounded hover:bg-[#2D4070] text-gray-200 text-sm">Artikel & Publikasi</button>
                        <button onClick={() => navigateTo('pdca')} className="block w-full text-left py-2 px-3 rounded hover:bg-[#2D4070] text-gray-200 text-sm">PDCA Tracker</button>
                        <button onClick={() => navigateTo('home-standard')} className="block w-full text-left py-2 px-3 rounded hover:bg-[#2D4070] text-gray-200 text-sm">Standar H.O.M.E</button>
                        <button onClick={() => navigateTo('about')} className="block w-full text-left py-2 px-3 rounded hover:bg-[#2D4070] text-gray-200 text-sm">Tentang Kami</button>
                        <button
                            onClick={() => {
                                navigateTo('home-standard');
                                setMobileMenuOpen(false);
                            }}
                            className="block w-full text-center bg-[#C9A84C] text-[#1A2744] py-2.5 rounded font-sans text-xs font-semibold"
                        >
                            IKUTI QUIZ HOME
                        </button>
                    </div>
                )}
            </header>

            {/* ==========================================
          PAGE: HOME / HERO LANDING
         ========================================== */}
            {currentPage === 'home' && (
                <main className="flex-grow">
                    {/* HERO SECTION */}
                    <section className="relative bg-[#1A2744] text-[#EDE8DF] py-24 px-4 overflow-hidden border-b-2 border-[#C9A84C]/50">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                            {/* Subtle background lines */}
                            <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(#EDE8DF 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
                        </div>

                        <div className="max-w-4xl mx-auto text-center relative z-10">
                            <div className="inline-flex items-center space-x-2 bg-[#2D4070] border border-[#C9A84C]/40 px-3 py-1.5 rounded-full mb-6">
                                <Shield className="w-3.5 h-3.5 text-[#C9A84C]" />
                                <span className="font-sans text-[10px] tracking-widest text-[#EDE8DF] uppercase font-semibold">Excellence Through Kaizen</span>
                            </div>

                            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                                Shaping Today and Tomorrow, <br />
                                <span className="text-[#C9A84C] italic font-serif">Better.</span>
                            </h1>

                            <p className="font-serif italic text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                                "Selamat datang di platform eksklusif intelektual para Customer Satisfaction Manager Mitsubishi. Tempat pertukaran gagasan revolusioner, pemantapan standar H.O.M.E, dan perbaikan berkelanjutan tanpa henti."
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <button
                                    onClick={() => navigateTo('fellows')}
                                    className="w-full sm:w-auto bg-[#C9A84C] hover:bg-[#E8C875] text-[#1A2744] font-sans text-sm font-semibold px-8 py-3.5 rounded shadow-lg transition duration-200 flex items-center justify-center gap-2"
                                >
                                    <span>Lihat Direktori Fellow</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => navigateTo('home-standard')}
                                    className="w-full sm:w-auto border border-[#C9A84C] hover:bg-[#C9A84C]/10 text-[#C9A84C] font-sans text-sm font-semibold px-8 py-3.5 rounded transition duration-200 flex items-center justify-center gap-2"
                                >
                                    <span>Materi Standard H.O.M.E</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-16 max-w-5xl mx-auto">
                            <DecorativeRule />
                        </div>
                    </section>

                    {/* PILAR H.O.M.E PREVIEW SECTION */}
                    <section className="py-20 px-4 max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A2744] mb-4">Pilar Pelayanan H.O.M.E</h2>
                            <p className="font-sans text-sm text-[#4A4A6A] max-w-xl mx-auto">
                                Kerangka kerja baku pelayanan Mitsubishi untuk menghadirkan ketulusan yang berkesan di setiap langkah perjalanan pelanggan.
                            </p>
                        </div>

                        {/* Interactive Grid & Hover Feature */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                {
                                    id: 'hospitality',
                                    key: 'H',
                                    title: 'Hospitality',
                                    desc: 'Keramahan yang melampaui batas formalitas, lahir dari ketulusan hati yang murni.',
                                    point: 'Sapaan hangat 3-detik pertama, intonasi bersahabat, dan kesiapan melayani.'
                                },
                                {
                                    id: 'one',
                                    key: 'O',
                                    title: 'One Service Standard',
                                    desc: 'Konsistensi keunggulan pelayanan di semua titik sentuh diler tanpa diskriminasi.',
                                    point: 'Keseragaman kualitas serah terima unit di seluruh Indonesia tanpa kompromi.'
                                },
                                {
                                    id: 'memorable',
                                    key: 'M',
                                    title: 'Memorable Experience',
                                    desc: 'Menciptakan momen emosional tak terlupakan pada titik kritis interaksi.',
                                    point: 'Sentuhan personal kecil gratis yang disesuaikan dengan profil spesifik keluarga customer.'
                                },
                                {
                                    id: 'empathy',
                                    key: 'E',
                                    title: 'Empathy',
                                    desc: 'Menyelami dan memahami kekhawatiran serta ekspektasi terdalam customer.',
                                    point: 'Kemampuan mendengar aktif saat menghadapi keluhan dengan emosi tinggi.'
                                }
                            ].map((pilar) => (
                                <div
                                    key={pilar.id}
                                    onClick={() => navigateTo('home-standard')}
                                    className="bg-[#F8F5EF] p-8 rounded-lg border border-[#C9A84C]/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
                                >
                                    <div>
                                        <span className="font-serif text-4xl font-extrabold text-[#C9A84C] group-hover:text-[#1A2744] transition-colors duration-200">{pilar.key}</span>
                                        <h3 className="font-serif text-xl font-bold text-[#1A2744] mt-2 mb-3">{pilar.title}</h3>
                                        <p className="font-sans text-sm text-[#4A4A6A] leading-relaxed mb-4">{pilar.desc}</p>
                                    </div>
                                    <div className="border-t border-[#C9A84C]/20 pt-4 mt-auto">
                                        <p className="text-[11px] font-sans text-[#8A8AA0] italic">{pilar.point}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* INTERACTIVE PDCA SIKLUS SECTION */}
                    <section className="bg-[#1A2744] text-[#EDE8DF] py-20 px-4 border-t border-b border-[#C9A84C]/30">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            {/* Text column */}
                            <div className="lg:col-span-5 text-left space-y-6">
                                <div className="inline-block bg-[#2D4070] border border-[#C9A84C]/40 px-3 py-1 rounded">
                                    <span className="font-sans text-[10px] tracking-wider text-[#C9A84C] uppercase font-bold">Budaya Kaizen</span>
                                </div>
                                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">Siklus Perbaikan Abadi (PDCA)</h2>
                                <p className="font-sans text-sm text-gray-300 leading-relaxed">
                                    Bagi seorang CSM, kesempurnaan pelayanan adalah target yang dinamis. Melalui pendekatan ilmiah PDCA, kami menguji ide-ide peningkatan kecil setiap hari demi transformasi besar esok hari.
                                </p>

                                {/* Visual state guide */}
                                <div className="bg-[#0E1726]/60 p-5 rounded border border-[#C9A84C]/20">
                                    <h4 className="font-serif text-base text-[#C9A84C] capitalize font-semibold mb-2">Fase: {pdcaHoverPhase}</h4>
                                    <p className="font-sans text-xs text-gray-300">
                                        {pdcaHoverPhase === 'plan' && 'PLAN: Petakan masalah langsung di diler, rumuskan inisiatif perbaikan berbasis data, tentukan metrik target keberhasilan.'}
                                        {pdcaHoverPhase === 'do' && 'DO: Uji coba gagasan dalam skala kecil pada diler terpilih. Amati dan rekam proses implementasinya.'}
                                        {pdcaHoverPhase === 'check' && 'CHECK: Bandingkan data sebelum dan sesudah uji coba. Cari tahu apakah target kepuasan atau efisiensi tercapai.'}
                                        {pdcaHoverPhase === 'act' && 'ACT: Standardisasikan inovasi yang berhasil menjadi SOP resmi nasional, atau perbaiki kembali rencana awal.'}
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigateTo('pdca')}
                                    className="inline-flex items-center space-x-2 text-[#C9A84C] hover:text-[#E8C875] font-semibold text-xs tracking-wider uppercase transition duration-200 pt-2"
                                >
                                    <span>Eksplor Kasus PDCA Aktif</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* PDCA Interactive wheel column */}
                            <div className="lg:col-span-7 flex justify-center items-center">
                                <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border-4 border-dashed border-[#C9A84C]/25 flex items-center justify-center p-8">
                                    {/* Central Core */}
                                    <div className="z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#1A2744] to-[#2D4070] border-2 border-[#C9A84C] shadow-2xl flex flex-col items-center justify-center text-center">
                                        <span className="font-serif text-xl sm:text-2xl font-bold text-[#C9A84C]">KAIZEN</span>
                                        <RefreshCw className="w-5 h-5 text-[#C9A84C] animate-spin mt-1" style={{ animationDuration: '8s' }} />
                                    </div>

                                    {/* Top-Left: PLAN */}
                                    <button
                                        onMouseEnter={() => setPdcaHoverPhase('plan')}
                                        onClick={() => setPdcaHoverPhase('plan')}
                                        className={`absolute top-2 left-2 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 border ${pdcaHoverPhase === 'plan' ? 'bg-[#C9A84C] text-[#1A2744] scale-105 border-[#E8C875]' : 'bg-[#2D4070] text-[#EDE8DF] border-[#C9A84C]/40 hover:bg-[#2D4070]/80'}`}
                                    >
                                        <span className="font-serif text-lg font-bold">PLAN</span>
                                        <span className="text-[9px] font-sans font-medium tracking-widest mt-1">1. Rencanakan</span>
                                    </button>

                                    {/* Top-Right: DO */}
                                    <button
                                        onMouseEnter={() => setPdcaHoverPhase('do')}
                                        onClick={() => setPdcaHoverPhase('do')}
                                        className={`absolute top-2 right-2 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 border ${pdcaHoverPhase === 'do' ? 'bg-[#C9A84C] text-[#1A2744] scale-105 border-[#E8C875]' : 'bg-[#2D4070] text-[#EDE8DF] border-[#C9A84C]/40 hover:bg-[#2D4070]/80'}`}
                                    >
                                        <span className="font-serif text-lg font-bold">DO</span>
                                        <span className="text-[9px] font-sans font-medium tracking-widest mt-1">2. Kerjakan</span>
                                    </button>

                                    {/* Bottom-Right: CHECK */}
                                    <button
                                        onMouseEnter={() => setPdcaHoverPhase('check')}
                                        onClick={() => setPdcaHoverPhase('check')}
                                        className={`absolute bottom-2 right-2 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 border ${pdcaHoverPhase === 'check' ? 'bg-[#C9A84C] text-[#1A2744] scale-105 border-[#E8C875]' : 'bg-[#2D4070] text-[#EDE8DF] border-[#C9A84C]/40 hover:bg-[#2D4070]/80'}`}
                                    >
                                        <span className="font-serif text-lg font-bold">CHECK</span>
                                        <span className="text-[9px] font-sans font-medium tracking-widest mt-1">3. Evaluasi</span>
                                    </button>

                                    {/* Bottom-Left: ACT */}
                                    <button
                                        onMouseEnter={() => setPdcaHoverPhase('act')}
                                        onClick={() => setPdcaHoverPhase('act')}
                                        className={`absolute bottom-2 left-2 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 border ${pdcaHoverPhase === 'act' ? 'bg-[#C9A84C] text-[#1A2744] scale-105 border-[#E8C875]' : 'bg-[#2D4070] text-[#EDE8DF] border-[#C9A84C]/40 hover:bg-[#2D4070]/80'}`}
                                    >
                                        <span className="font-serif text-lg font-bold">ACT</span>
                                        <span className="text-[9px] font-sans font-medium tracking-widest mt-1">4. Tindaklanjuti</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* HIGHLIGHTED FELLOWS */}
                    <section className="py-20 px-4 max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
                            <div>
                                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A2744] mb-2">Para Penjaga Keunggulan</h2>
                                <p className="font-sans text-sm text-[#4A4A6A]">Anggota kehormatan CSM Intellectual Society yang merancang standar pelayanan esok hari.</p>
                            </div>
                            <button
                                onClick={() => navigateTo('fellows')}
                                className="mt-4 sm:mt-0 inline-flex items-center space-x-2 text-[#C9A84C] hover:text-[#E8C875] font-bold text-xs tracking-wider uppercase transition duration-200"
                            >
                                <span>Lihat Semua Anggota</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Grid of 3 Prominent Fellows */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {FELLOWS_DATA.slice(0, 3).map((f) => (
                                <div key={f.id} className="bg-[#F8F5EF] rounded-lg border border-[#C9A84C]/30 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
                                    <div className="p-6 flex items-start space-x-4">
                                        <img src={f.avatar} alt={f.name} className="w-16 h-16 rounded-full border-2 border-[#C9A84C] object-cover" />
                                        <div>
                                            <span className="font-serif text-xs font-semibold text-[#C9A84C]">{f.title}</span>
                                            <h3 className="font-serif text-lg font-bold text-[#1A2744] leading-tight group-hover:text-[#C9A84C] transition-colors duration-200">{f.name}</h3>
                                            <p className="font-sans text-[11px] text-[#8A8AA0]">{f.csmTitle}</p>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-[#EDE8DF]/50 border-t border-b border-[#C9A84C]/10 flex-grow">
                                        <p className="font-serif italic text-xs text-[#4A4A6A] leading-relaxed">
                                            "{f.quote}"
                                        </p>
                                    </div>

                                    <div className="p-4 bg-[#F8F5EF] flex justify-between items-center mt-auto border-t border-[#C9A84C]/20">
                                        <div className="flex flex-wrap gap-1">
                                            {f.badges.map((b, i) => (
                                                <span key={i} className="text-[9px] bg-[#1A2744] text-[#C9A84C] px-2 py-0.5 rounded-full font-semibold">{b}</span>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => navigateTo('profile', { id: f.id })}
                                            className="text-[#1A2744] hover:text-[#C9A84C] font-semibold text-xs flex items-center gap-1 transition-all duration-200"
                                        >
                                            <span>Profil</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* LATEST DISCUSSIONS & KNOWLEDGE HIGHLIGHT */}
                    <section className="bg-[#EDE8DF] py-16 px-4 border-t border-[#C9A84C]/20">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                            {/* Left Column: Latest Thread */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-[#C9A84C]/30 pb-4">
                                    <h3 className="font-serif text-2xl font-bold text-[#1A2744] flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-[#C9A84C]" />
                                        <span>Diskusi Forum Hangat</span>
                                    </h3>
                                    <button onClick={() => navigateTo('forum')} className="text-xs text-[#C9A84C] font-semibold hover:underline">Ke Forum</button>
                                </div>

                                {threads.slice(0, 2).map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => navigateTo('thread', { id: t.id })}
                                        className="bg-[#F8F5EF] p-5 rounded border-l-4 border-[#C9A84C] border-y border-r border-[#C9A84C]/20 cursor-pointer hover:shadow-lg transition-all duration-200"
                                    >
                                        <span className="text-[10px] uppercase font-sans tracking-widest text-[#C9A84C] font-bold">{t.categoryLabel}</span>
                                        <h4 className="font-serif text-lg font-bold text-[#1A2744] mt-1 mb-2 hover:text-[#C9A84C] transition duration-200">{t.title}</h4>
                                        <p className="font-sans text-xs text-[#4A4A6A] line-clamp-2 leading-relaxed mb-3">{t.content}</p>
                                        <div className="flex items-center justify-between text-[11px] text-[#8A8AA0]">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                <span>Oleh {FELLOWS_DATA.find(f => f.id === t.authorId)?.name}</span>
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-[#922B21] fill-current" /> {t.likes}</span>
                                                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {t.comments.length} Balasan</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Column: Featured Journal Article */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-[#C9A84C]/30 pb-4">
                                    <h3 className="font-serif text-2xl font-bold text-[#1A2744] flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-[#C9A84C]" />
                                        <span>Publikasi & Riset</span>
                                    </h3>
                                    <button onClick={() => navigateTo('articles')} className="text-xs text-[#C9A84C] font-semibold hover:underline">Semua Jurnal</button>
                                </div>

                                <div className="bg-[#1A2744] text-[#EDE8DF] p-6 rounded border border-[#C9A84C]/30 shadow-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Award className="w-24 h-24 text-[#C9A84C]" />
                                    </div>
                                    <span className="text-[9px] uppercase font-sans tracking-widest text-[#C9A84C] font-bold">Riset Pilihan Terakreditasi</span>
                                    <h4 className="font-serif text-xl font-bold text-white mt-2 mb-3 leading-snug">{ARTICLES_DATA[0].title}</h4>
                                    <p className="font-sans text-xs text-gray-300 leading-relaxed mb-6 line-clamp-3">
                                        {ARTICLES_DATA[0].excerpt}
                                    </p>
                                    <div className="flex items-center justify-between border-t border-[#C9A84C]/20 pt-4">
                                        <div className="flex items-center gap-2">
                                            <img src={FELLOWS_DATA.find(f => f.id === ARTICLES_DATA[0].authorId)?.avatar} className="w-8 h-8 rounded-full border border-[#C9A84C]" alt="" />
                                            <span className="text-xs text-gray-300 font-medium">{FELLOWS_DATA.find(f => f.id === ARTICLES_DATA[0].authorId)?.name}</span>
                                        </div>
                                        <button
                                            onClick={() => navigateTo('article-detail', { slug: ARTICLES_DATA[0].slug })}
                                            className="bg-[#C9A84C] text-[#1A2744] px-4 py-2 rounded text-xs font-semibold hover:bg-[#E8C875] transition-all duration-200"
                                        >
                                            Baca Studi Lengkap
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>
                </main>
            )}

            {/* ==========================================
          PAGE: FELLOWS DIRECTORY
         ========================================== */}
            {currentPage === 'fellows' && (
                <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl font-bold text-[#1A2744] mb-3">Direktori Anggota Fellowship</h1>
                        <p className="font-serif italic text-sm text-[#4A4A6A] max-w-xl mx-auto">
                            "Terinspirasi dari Royal Society, Direktori ini menghimpun profil dan sumbangsih intelektual tepercaya para CSM di lingkungan Mitsubishi."
                        </p>
                        <DecorativeRule />
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-[#F8F5EF] p-6 rounded-lg border border-[#C9A84C]/30 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Box */}
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau spesialisasi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C]"
                            />
                        </div>

                        {/* Filter by Role */}
                        <div className="relative">
                            <select
                                value={fellowFilter}
                                onChange={(e) => setFellowFilter(e.target.value)}
                                className="w-full px-4 py-2.5 rounded border border-gray-300 bg-white text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                            >
                                <option value="all">Semua Jabatan Fellowship</option>
                                <option value="arch-fellow">Arch-Fellow</option>
                                <option value="warden-of-resources">Warden of Resources</option>
                                <option value="consigliere">Consigliere</option>
                                <option value="sergeant-at-arms">Sergeant At Arms</option>
                                <option value="waycrafter">Waycrafter</option>
                                <option value="agitation-&-propaganda">Agitation & Propaganda</option>
                                <option value="master-of-provision">Master of Provision</option>
                            </select>
                        </div>

                        {/* Total Results Counter */}
                        <div className="flex items-center justify-end">
                            <span className="text-xs text-[#8A8AA0] font-medium uppercase tracking-wider">
                                Menampilkan: <span className="text-[#1A2744] font-bold text-sm">{filteredFellows.length}</span> Fellows
                            </span>
                        </div>
                    </div>

                    {/* Fellows Grid */}
                    {filteredFellows.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredFellows.map((f) => (
                                <div
                                    key={f.id}
                                    className="bg-[#F8F5EF] rounded-lg border border-[#C9A84C]/30 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <img src={f.avatar} alt={f.name} className="w-16 h-16 rounded-full border-2 border-[#C9A84C] object-cover shadow-sm" />
                                            <div>
                                                <span className="text-[10px] bg-[#1A2744] text-[#C9A84C] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{f.title}</span>
                                                <h2 className="font-serif text-xl font-bold text-[#1A2744] leading-tight mt-1 group-hover:text-[#C9A84C] transition duration-200">{f.name}</h2>
                                                <p className="text-[11px] text-[#4A4A6A] font-sans">{f.csmTitle}</p>
                                            </div>
                                        </div>

                                        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent my-3" />

                                        <p className="font-sans text-xs text-[#4A4A6A] leading-relaxed line-clamp-3 mb-4">
                                            {f.bio}
                                        </p>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-sans font-bold text-[#1A2744] uppercase tracking-wider">Spesialisasi:</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {f.specializations.map((spec, i) => (
                                                    <span key={i} className="text-[10px] bg-[#EDE8DF] text-[#1A2744] px-2 py-1 rounded font-medium border border-[#C9A84C]/25">{spec}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[#EDE8DF]/40 border-t border-[#C9A84C]/20 flex items-center justify-between text-xs mt-auto">
                                        <span className="text-[#8A8AA0] font-medium text-[11px]">Sejak {f.joinYear}</span>
                                        <button
                                            onClick={() => navigateTo('profile', { id: f.id })}
                                            className="bg-gradient-to-r from-[#1A2744] to-[#2D4070] text-white hover:opacity-90 px-4 py-1.5 rounded font-semibold transition-all duration-200 text-xs shadow-sm"
                                        >
                                            Buka Profil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-[#F8F5EF] rounded-lg border border-dashed border-[#C9A84C]/50">
                            <Info className="w-12 h-12 text-[#C9A84C] mx-auto mb-4" />
                            <h3 className="font-serif text-lg font-bold text-[#1A2744]">Tidak ada Fellow yang cocok</h3>
                            <p className="text-xs text-[#8A8AA0] mt-1">Coba sesuaikan kata kunci pencarian atau bersihkan filter Anda.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setFellowFilter('all'); }}
                                className="mt-4 bg-[#C9A84C] text-[#1A2744] text-xs font-semibold px-4 py-2 rounded"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}
                </main>
            )}

            {/* ==========================================
          PAGE: FELLOW DETAIL PROFILE
         ========================================== */}
            {currentPage === 'profile' && (() => {
                const fellow = FELLOWS_DATA.find(f => f.id === currentParams.id) || FELLOWS_DATA[0];
                const [activeTab, setActiveTab] = useState('about'); // 'about' | 'contrib' | 'articles' | 'pdca'

                const fellowArticles = ARTICLES_DATA.filter(a => a.authorId === fellow.id);
                const fellowPdca = PDCA_CASES_DATA.filter(p => p.fellowId === fellow.id);

                return (
                    <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
                        {/* Header Profil */}
                        <div className="bg-[#1A2744] text-white rounded-lg border-2 border-[#C9A84C] shadow-2xl p-6 sm:p-10 mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Trophy className="w-48 h-48 text-[#C9A84C]" />
                            </div>

                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 relative z-10">
                                <img src={fellow.avatar} alt={fellow.name} className="w-32 h-32 rounded-full border-4 border-[#C9A84C] object-cover shadow-xl" />

                                <div className="text-center md:text-left flex-grow">
                                    <div className="inline-block bg-[#C9A84C] text-[#1A2744] px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-2">
                                        {fellow.title}
                                    </div>
                                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">{fellow.name}</h1>
                                    <p className="font-sans text-sm text-gray-300 mb-4">{fellow.csmTitle}</p>

                                    <div className="bg-[#0E1726]/60 p-4 rounded border border-[#C9A84C]/30 max-w-2xl">
                                        <p className="font-serif italic text-xs text-[#C9A84C] leading-relaxed">
                                            "{fellow.quote}"
                                        </p>
                                    </div>
                                </div>

                                {/* Stat block */}
                                <div className="grid grid-cols-3 gap-4 border-l-0 md:border-l border-[#C9A84C]/30 pl-0 md:pl-8 text-center min-w-[200px]">
                                    <div>
                                        <span className="block font-serif text-2xl font-bold text-[#C9A84C]">{fellow.stats.articles}</span>
                                        <span className="text-[9px] uppercase tracking-wider text-gray-300">Artikel</span>
                                    </div>
                                    <div>
                                        <span className="block font-serif text-2xl font-bold text-[#C9A84C]">{fellow.stats.threads}</span>
                                        <span className="text-[9px] uppercase tracking-wider text-gray-300">Thread</span>
                                    </div>
                                    <div>
                                        <span className="block font-serif text-2xl font-bold text-[#C9A84C]">{fellow.stats.pdcaCases}</span>
                                        <span className="text-[9px] uppercase tracking-wider text-gray-300">PDCA</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Tab Navigation */}
                        <div className="flex border-b border-[#C9A84C]/30 mb-6 gap-2">
                            <button
                                onClick={() => setActiveTab('about')}
                                className={`pb-3 px-4 font-serif text-sm font-bold transition-all duration-200 border-b-2 ${activeTab === 'about' ? 'border-[#C9A84C] text-[#1A2744]' : 'border-transparent text-[#4A4A6A] hover:text-[#1A2744]'}`}
                            >
                                Tentang
                            </button>
                            <button
                                onClick={() => setActiveTab('contrib')}
                                className={`pb-3 px-4 font-serif text-sm font-bold transition-all duration-200 border-b-2 ${activeTab === 'contrib' ? 'border-[#C9A84C] text-[#1A2744]' : 'border-transparent text-[#4A4A6A] hover:text-[#1A2744]'}`}
                            >
                                Kontribusi Diskusi
                            </button>
                            <button
                                onClick={() => setActiveTab('articles')}
                                className={`pb-3 px-4 font-serif text-sm font-bold transition-all duration-200 border-b-2 ${activeTab === 'articles' ? 'border-[#C9A84C] text-[#1A2744]' : 'border-transparent text-[#4A4A6A] hover:text-[#1A2744]'}`}
                            >
                                Artikel Terbit ({fellowArticles.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('pdca')}
                                className={`pb-3 px-4 font-serif text-sm font-bold transition-all duration-200 border-b-2 ${activeTab === 'pdca' ? 'border-[#C9A84C] text-[#1A2744]' : 'border-transparent text-[#4A4A6A] hover:text-[#1A2744]'}`}
                            >
                                Kasus PDCA ({fellowPdca.length})
                            </button>
                        </div>

                        {/* Tab Contents */}
                        <div className="bg-[#F8F5EF] p-6 rounded-lg border border-[#C9A84C]/30 shadow-md">
                            {activeTab === 'about' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-[#1A2744] mb-3">Biografi & Filosofi Pelayanan</h3>
                                        <p className="font-sans text-sm text-[#4A4A6A] leading-relaxed">{fellow.bio}</p>
                                    </div>

                                    <div className="h-[1px] bg-gray-200" />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-serif text-base font-bold text-[#1A2744] mb-3">Spesialisasi Keahlian</h4>
                                            <ul className="space-y-1.5">
                                                {fellow.specializations.map((s, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-xs text-[#4A4A6A]">
                                                        <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-serif text-base font-bold text-[#1A2744] mb-3">Lencana Kehormatan</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {fellow.badges.map((badge, i) => (
                                                    <span key={i} className="text-xs bg-[#1A2744] text-[#C9A84C] px-3 py-1 rounded-full font-semibold border border-[#C9A84C]/30 shadow-sm flex items-center gap-1.5">
                                                        <Award className="w-3.5 h-3.5" />
                                                        <span>{badge}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contrib' && (
                                <div>
                                    <h3 className="font-serif text-xl font-bold text-[#1A2744] mb-4">Aktivitas Terakhir Forum</h3>
                                    <p className="text-xs text-[#4A4A6A] mb-4">Menampilkan postingan diler dan feedback yang disubmit oleh {fellow.name}:</p>

                                    {/* Mock Activity List */}
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white rounded border border-[#C9A84C]/20">
                                            <span className="text-[10px] text-gray-400 font-medium block mb-1">Disubmit pada Juni 2026</span>
                                            <h4 className="font-serif text-sm font-bold text-[#1A2744] hover:underline cursor-pointer">Saran taktik peredam ketegangan showroom</h4>
                                            <p className="text-xs text-[#4A4A6A] mt-1">"Kita perlu melatih petugas frontline untuk memprioritaskan air dingin hangat begitu customer diler mulai meninggikan nada bicara..."</p>
                                        </div>
                                        <div className="p-4 bg-white rounded border border-[#C9A84C]/20">
                                            <span className="text-[10px] text-gray-400 font-medium block mb-1">Disubmit pada Mei 2026</span>
                                            <h4 className="font-serif text-sm font-bold text-[#1A2744] hover:underline cursor-pointer">Tanggapan tentang standarisasi ritel</h4>
                                            <p className="text-xs text-[#4A4A6A] mt-1">"Konsep checklist seragam sangat membantu memastikan diler kecil memiliki keunggulan yang setara dengan diler flagship."</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'articles' && (
                                <div className="space-y-4">
                                    <h3 className="font-serif text-xl font-bold text-[#1A2744] mb-4">Jurnal & Karya Tulis Terbit</h3>
                                    {fellowArticles.length > 0 ? (
                                        fellowArticles.map((a) => (
                                            <div key={a.id} className="p-4 bg-white rounded border border-[#C9A84C]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div>
                                                    <span className="text-[9px] bg-[#EDE8DF] text-[#C9A84C] border border-[#C9A84C]/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{a.categoryLabel}</span>
                                                    <h4 className="font-serif text-lg font-bold text-[#1A2744] mt-1.5">{a.title}</h4>
                                                    <p className="text-xs text-[#8A8AA0]">{a.publishedAt} · {a.readingTime} Menit Baca</p>
                                                </div>
                                                <button
                                                    onClick={() => navigateTo('article-detail', { slug: a.slug })}
                                                    className="bg-[#1A2744] text-white hover:bg-[#C9A84C] hover:text-[#1A2744] text-xs font-semibold px-4 py-2 rounded transition-colors duration-200"
                                                >
                                                    Baca Artikel
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-[#8A8AA0] italic">Belum menerbitkan artikel ilmiah pada platform.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'pdca' && (
                                <div className="space-y-4">
                                    <h3 className="font-serif text-xl font-bold text-[#1A2744] mb-4">Studi Kasus PDCA Terapan</h3>
                                    {fellowPdca.length > 0 ? (
                                        fellowPdca.map((p) => (
                                            <div key={p.id} className="p-4 bg-white rounded border border-[#C9A84C]/20">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-serif text-lg font-bold text-[#1A2744]">{p.title}</h4>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest bg-[#C9A84C] text-[#1A2744] px-2 py-0.5 rounded">Fase {p.phase}</span>
                                                </div>
                                                <p className="text-xs text-[#4A4A6A] leading-relaxed mb-3">{p.description}</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#EDE8DF]/30 p-3 rounded text-xs border border-gray-100">
                                                    <div><span className="text-gray-400">Sebelum:</span> <strong className="text-gray-700 block">{p.metrics.before}</strong></div>
                                                    <div><span className="text-gray-400">Sesudah:</span> <strong className="text-[#2E7D52] block">{p.metrics.after}</strong></div>
                                                    <div><span className="text-gray-400">Dampak:</span> <strong className="text-[#C9A84C] block">{p.metrics.improvement}</strong></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-[#8A8AA0] italic">Belum ada kasus PDCA terekam untuk diler terkait.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigateTo('fellows')}
                            className="mt-6 inline-flex items-center space-x-2 text-[#C9A84C] hover:text-[#E8C875] text-xs font-bold uppercase"
                        >
                            <ChevronRight className="w-4 h-4 transform rotate-180" />
                            <span>Kembali ke Direktori</span>
                        </button>
                    </main>
                );
            })()}

            {/* ==========================================
          PAGE: FORUM DISCUSSION
         ========================================== */}
            {currentPage === 'forum' && (
                <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-[#C9A84C]/30">
                        <div>
                            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A2744]">Forum Intelektual CSM</h1>
                            <p className="text-xs sm:text-sm text-[#4A4A6A] mt-1">Berbagi best practice pelayanan, studi kasus di diler, dan pertukaran ide Kaizen.</p>
                        </div>

                        <button
                            onClick={() => setIsNewThreadModalOpen(true)}
                            className="mt-4 sm:mt-0 bg-[#C9A84C] hover:bg-[#E8C875] text-[#1A2744] px-5 py-2.5 rounded font-sans text-xs font-bold tracking-wide shadow transition duration-200"
                        >
                            + BUAT TANGGAPAN BARU
                        </button>
                    </div>

                    {/* New Thread Mock Modal Modal */}
                    {isNewThreadModalOpen && (
                        <div className="fixed inset-0 z-50 bg-[#000]/60 backdrop-blur-sm flex justify-center items-center p-4">
                            <div className="bg-[#F8F5EF] border-2 border-[#C9A84C] rounded-lg shadow-2xl p-6 max-w-xl w-full animate-in fade-in zoom-in duration-200">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#C9A84C]/20">
                                    <h3 className="font-serif text-xl font-bold text-[#1A2744]">Buat Topik Diskusi Baru</h3>
                                    <button onClick={() => setIsNewThreadModalOpen(false)} className="text-[#8A8AA0] hover:text-[#1A2744]"><X className="w-5 h-5" /></button>
                                </div>

                                <form onSubmit={handleCreateThread} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#1A2744] uppercase mb-1">Judul Diskusi *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newThreadTitle}
                                            onChange={(e) => setNewThreadTitle(e.target.value)}
                                            placeholder="Contoh: Optimasi Alur Cuci Kendaraan Pasca Servis"
                                            className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A84C] bg-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[#1A2744] uppercase mb-1">Kategori *</label>
                                            <select
                                                value={newThreadCategory}
                                                onChange={(e) => setNewThreadCategory(e.target.value)}
                                                className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none bg-white"
                                            >
                                                <option value="hospitality-lab">Hospitality Lab</option>
                                                <option value="one-standard-exchange">One Standard Exchange</option>
                                                <option value="memorable-moments">Memorable Moments</option>
                                                <option value="empathy-circle">Empathy Circle</option>
                                                <option value="kaizen-corner">Kaizen Corner</option>
                                                <option value="general-discussion">General Discussion</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-[#1A2744] uppercase mb-1">Tag (Pisahkan dengan koma)</label>
                                            <input
                                                type="text"
                                                value={newThreadTags}
                                                onChange={(e) => setNewThreadTags(e.target.value)}
                                                placeholder="kaizen, showroom, waiting-time"
                                                className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#1A2744] uppercase mb-1">Isi Diskusi / Pendahuluan Masalah *</label>
                                        <textarea
                                            rows={5}
                                            required
                                            value={newThreadContent}
                                            onChange={(e) => setNewThreadContent(e.target.value)}
                                            placeholder="Jelaskan secara detail permasalahan dan taktik Kaizen yang diusulkan diler Anda..."
                                            className="w-full px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none bg-white"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-3 border-t border-[#C9A84C]/20">
                                        <button
                                            type="button"
                                            onClick={() => setIsNewThreadModalOpen(false)}
                                            className="px-4 py-2 text-xs font-semibold text-[#4A4A6A] hover:bg-[#EDE8DF]"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2 bg-[#1A2744] text-[#EDE8DF] border border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#1A2744] text-xs font-bold rounded"
                                        >
                                            Terbitkan Diskusi
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Sidebar Category Filter */}
                        <div className="lg:col-span-3 space-y-3">
                            <span className="text-[10px] font-sans font-bold text-[#8A8AA0] uppercase tracking-wider block mb-2">Kategori Forum</span>
                            {[
                                { id: 'all', label: 'Semua Topik', desc: 'Seluruh diskusi Society' },
                                { id: 'hospitality-lab', label: 'Hospitality Lab', desc: 'Teknik keramahan & greeting' },
                                { id: 'one-standard-exchange', label: 'One Standard Exchange', desc: 'Standarisasi prosedur diler' },
                                { id: 'memorable-moments', label: 'Memorable Moments', desc: 'Kisah kejutan tak terlupakan' },
                                { id: 'empathy-circle', label: 'Empathy Circle', desc: 'Penanganan kasus emosi tinggi' },
                                { id: 'kaizen-corner', label: 'Kaizen Corner', desc: 'Eksperimen perbaikan alur' },
                                { id: 'general-discussion', label: 'General Discussion', desc: 'Topik bebas diler' }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setForumFilter(cat.id)}
                                    className={`w-full text-left p-3 rounded transition-all duration-150 flex flex-col border ${forumFilter === cat.id ? 'bg-[#1A2744] text-[#EDE8DF] border-[#C9A84C]' : 'bg-[#F8F5EF] hover:bg-[#EDE8DF] text-[#1A2744] border-[#C9A84C]/20'}`}
                                >
                                    <span className="font-serif text-sm font-bold">{cat.label}</span>
                                    <span className="text-[10px] opacity-75">{cat.desc}</span>
                                </button>
                            ))}
                        </div>

                        {/* Middle Main Content: Thread list */}
                        <div className="lg:col-span-9 space-y-5">
                            {/* Search Forum */}
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari topik diskusi berdasarkan tag atau judul..."
                                    className="w-full pl-10 pr-4 py-3 rounded border border-gray-300 text-xs bg-[#F8F5EF] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                                />
                            </div>

                            {filteredThreads.length > 0 ? (
                                filteredThreads.map((thread) => {
                                    const author = FELLOWS_DATA.find(f => f.id === thread.authorId) || FELLOWS_DATA[0];
                                    return (
                                        <div
                                            key={thread.id}
                                            className="bg-[#F8F5EF] rounded-lg border border-[#C9A84C]/30 hover:border-[#C9A84C] transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between group"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#C9A84C]">
                                                        {thread.categoryLabel}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(thread.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>

                                                <h3
                                                    onClick={() => navigateTo('thread', { id: thread.id })}
                                                    className="font-serif text-lg sm:text-xl font-bold text-[#1A2744] group-hover:text-[#C9A84C] cursor-pointer transition duration-150 leading-tight mb-2"
                                                >
                                                    {thread.title}
                                                </h3>

                                                <p className="font-sans text-xs text-[#4A4A6A] leading-relaxed line-clamp-3 mb-4">
                                                    {thread.content}
                                                </p>

                                                {/* Thread tags */}
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {thread.tags.map((tag, i) => (
                                                        <span key={i} className="text-[9px] bg-[#EDE8DF] text-gray-600 px-2 py-0.5 rounded border border-gray-200">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="p-4 bg-[#EDE8DF]/30 border-t border-[#C9A84C]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <img src={author.avatar} alt="" className="w-7 h-7 rounded-full border border-[#C9A84C]" />
                                                    <span className="text-xs text-[#1A2744] font-semibold">{author.name} <span className="text-gray-400 font-normal">({author.title})</span></span>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs font-semibold text-[#1A2744]">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleLikeThread(thread.id); }}
                                                        className="flex items-center gap-1.5 hover:text-[#922B21] transition duration-200"
                                                    >
                                                        <ThumbsUp className="w-3.5 h-3.5 text-[#C9A84C]" />
                                                        <span>{thread.likes} Suka</span>
                                                    </button>

                                                    <button
                                                        onClick={() => navigateTo('thread', { id: thread.id })}
                                                        className="flex items-center gap-1.5 text-gray-500 hover:text-[#1A2744]"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        <span>{thread.comments.length} Tanggapan</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 bg-[#F8F5EF] rounded border border-dashed border-[#C9A84C]/30">
                                    <MessageSquare className="w-12 h-12 text-[#C9A84C] mx-auto mb-4" />
                                    <h3 className="font-serif text-lg font-bold">Forum Masih Kosong</h3>
                                    <p className="text-xs text-[#8A8AA0] mt-1">Coba sesuaikan filter atau jadilah yang pertama membuat diskusi!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            )}

            {/* ==========================================
          PAGE: THREAD DETAIL
         ========================================== */}
            {currentPage === 'thread' && (() => {
                const thread = threads.find(t => t.id === currentParams.id) || threads[0];
                const author = FELLOWS_DATA.find(f => f.id === thread.authorId) || FELLOWS_DATA[0];

                return (
                    <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
                        <button
                            onClick={() => navigateTo('forum')}
                            className="inline-flex items-center space-x-2 text-[#C9A84C] hover:text-[#E8C875] text-xs font-bold uppercase mb-6"
                        >
                            <ChevronRight className="w-4 h-4 transform rotate-180" />
                            <span>Kembali ke Forum</span>
                        </button>

                        {/* Original Thread Box */}
                        <article className="bg-[#F8F5EF] rounded-lg border-2 border-[#C9A84C] shadow-lg p-6 sm:p-8 mb-8">
                            <div className="flex justify-between items-start mb-4 border-b border-[#C9A84C]/20 pb-4">
                                <div>
                                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C9A84C]">{thread.categoryLabel}</span>
                                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A2744] mt-1">{thread.title}</h1>
                                </div>
                                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                    {new Date(thread.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>

                            {/* Author Bio Card inside thread */}
                            <div className="flex items-center gap-3 bg-[#EDE8DF]/40 p-3 rounded mb-6 border border-gray-200">
                                <img src={author.avatar} alt="" className="w-10 h-10 rounded-full border border-[#C9A84C] object-cover" />
                                <div>
                                    <span className="text-xs font-bold text-[#1A2744] block leading-none">{author.name}</span>
                                    <span className="text-[10px] text-[#C9A84C] uppercase font-bold tracking-wider">{author.title}</span>
                                </div>
                            </div>

                            {/* Main Content Body */}
                            <div className="font-sans text-sm text-[#4A4A6A] leading-relaxed mb-6 space-y-4">
                                <p>{thread.content}</p>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-6">
                                {thread.tags.map((tag, i) => (
                                    <span key={i} className="text-[10px] bg-white text-gray-600 px-2 py-1 rounded border border-gray-300">#{tag}</span>
                                ))}
                            </div>

                            <div className="flex justify-between items-center border-t border-[#C9A84C]/20 pt-4">
                                <button
                                    onClick={() => handleLikeThread(thread.id)}
                                    className="inline-flex items-center gap-2 bg-[#1A2744] text-[#EDE8DF] hover:bg-[#C9A84C] hover:text-[#1A2744] px-4 py-2 rounded text-xs font-bold transition-all duration-200"
                                >
                                    <ThumbsUp className="w-4 h-4 text-[#C9A84C]" />
                                    <span>{thread.likes} Suka Topik Ini</span>
                                </button>

                                <span className="text-xs text-[#8A8AA0]">{thread.views} Kunjungan</span>
                            </div>
                        </article>

                        {/* Replies List */}
                        <div className="space-y-6 mb-8">
                            <h3 className="font-serif text-xl font-bold text-[#1A2744] border-b border-[#C9A84C]/30 pb-2">
                                Sumbangsih Tanggapan ({thread.comments.length})
                            </h3>

                            {thread.comments.length > 0 ? (
                                thread.comments.map((comment) => {
                                    const replyAuthor = FELLOWS_DATA.find(f => f.id === comment.authorId) || FELLOWS_DATA[0];
                                    return (
                                        <div key={comment.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm ml-0 sm:ml-8">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <img src={replyAuthor.avatar} alt="" className="w-8 h-8 rounded-full border border-[#C9A84C]" />
                                                    <div>
                                                        <span className="text-xs font-bold text-[#1A2744] block leading-none">{replyAuthor.name}</span>
                                                        <span className="text-[9px] text-gray-400 font-semibold uppercase">{replyAuthor.title}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(comment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="font-sans text-xs sm:text-sm text-[#4A4A6A] leading-relaxed">
                                                {comment.content}
                                            </p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-[#8A8AA0] italic text-center py-6">Belum ada tanggapan resmi. Jadilah yang pertama memberikan sumbangan gagasan!</p>
                            )}
                        </div>

                        {/* Post Reply Area */}
                        <div className="bg-[#F8F5EF] p-5 rounded-lg border border-[#C9A84C]/30 shadow">
                            <h4 className="font-serif text-sm font-bold text-[#1A2744] uppercase mb-2">Sumbang Gagasan Intelektual Anda</h4>
                            <textarea
                                rows={4}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Tuliskan masukan solutif berdasarkan prinsip Kaizen atau standar H.O.M.E..."
                                className="w-full p-3 rounded border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
                            />
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-[10px] text-gray-400">Menyalin sebagai: <strong>Barod Abdillah (Waycrafter)</strong></span>
                                <button
                                    onClick={() => handleAddComment(thread.id)}
                                    className="bg-[#1A2744] text-white hover:bg-[#C9A84C] hover:text-[#1A2744] px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition-all duration-200"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Kirim Balasan</span>
                                </button>
                            </div>
                        </div>
                    </main>
                );
            })()}

            {/* ==========================================
          PAGE: ARTICLES / KNOWLEDGE BASE
         ========================================== */}
            {currentPage === 'articles' && (
                <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl font-bold text-[#1A2744] mb-3">Jurnal Publikasi CSM</h1>
                        <p className="font-serif italic text-sm text-[#4A4A6A] max-w-xl mx-auto">
                            "Kumpulan tulisan ilmiah, studi kasus nyata diler, serta panduan layanan H.O.M.E yang dikurasi langsung oleh para Anggota Kehormatan."
                        </p>
                        <DecorativeRule />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Filter Sidebar */}
                        <div className="lg:col-span-3 space-y-3">
                            <span className="text-[10px] font-sans font-bold text-[#8A8AA0] uppercase tracking-wider block mb-1">Kategori Jurnal</span>
                            {[
                                { id: 'all', label: 'Semua Jurnal' },
                                { id: 'kaizen-case-study', label: 'Kaizen Case Study' },
                                { id: 'home-guide', label: 'H.O.M.E Guide' }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setArticlesFilter(cat.id)}
                                    className={`w-full text-left p-3 rounded text-xs font-semibold transition-all duration-150 border ${articlesFilter === cat.id ? 'bg-[#1A2744] text-white border-[#C9A84C]' : 'bg-[#F8F5EF] hover:bg-[#EDE8DF] text-[#1A2744] border-[#C9A84C]/25'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Articles Grid Column */}
                        <div className="lg:col-span-9 space-y-6">
                            {/* Search publications */}
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari kata kunci studi kasus, antrean diler, dsb..."
                                    className="w-full pl-10 pr-4 py-3 rounded border border-gray-300 text-xs bg-[#F8F5EF] focus:outline-none"
                                />
                            </div>

                            {filteredArticles.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {filteredArticles.map((a) => {
                                        const author = FELLOWS_DATA.find(f => f.id === a.authorId) || FELLOWS_DATA[0];
                                        return (
                                            <div
                                                key={a.id}
                                                className="bg-[#F8F5EF] border border-[#C9A84C]/30 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                                            >
                                                <div className="p-5">
                                                    <span className="text-[9px] uppercase font-sans tracking-widest text-[#C9A84C] font-extrabold">{a.categoryLabel}</span>
                                                    <h3
                                                        onClick={() => navigateTo('article-detail', { slug: a.slug })}
                                                        className="font-serif text-lg font-bold text-[#1A2744] hover:text-[#C9A84C] transition duration-150 mt-1 mb-2 leading-tight cursor-pointer"
                                                    >
                                                        {a.title}
                                                    </h3>
                                                    <p className="font-sans text-xs text-[#4A4A6A] leading-relaxed line-clamp-3 mb-4">
                                                        {a.excerpt}
                                                    </p>
                                                </div>

                                                {/* Author Info block */}
                                                <div className="p-4 bg-[#EDE8DF]/30 border-t border-[#C9A84C]/10 flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <img src={author.avatar} alt="" className="w-7 h-7 rounded-full border border-[#C9A84C]" />
                                                        <span className="text-xs text-[#1A2744] font-medium">{author.name}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => navigateTo('article-detail', { slug: a.slug })}
                                                        className="text-[#C9A84C] font-bold text-xs hover:underline flex items-center gap-1"
                                                    >
                                                        <span>Baca</span>
                                                        <ChevronRight className="w-4.5 h-4.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-[#8A8AA0] italic">Tidak ada publikasi yang cocok dengan pencarian Anda.</p>
                            )}
                        </div>
                    </div>
                </main>
            )}

            {/* ==========================================
          PAGE: DETAIL ARTICLE READER
         ========================================== */}
            {currentPage === 'article-detail' && (() => {
                const article = ARTICLES_DATA.find(a => a.slug === currentParams.slug) || ARTICLES_DATA[0];
                const author = FELLOWS_DATA.find(f => f.id === article.authorId) || FELLOWS_DATA[0];

                return (
                    <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
                        <button
                            onClick={() => navigateTo('articles')}
                            className="inline-flex items-center space-x-2 text-[#C9A84C] hover:text-[#E8C875] text-xs font-bold uppercase mb-6"
                        >
                            <ChevronRight className="w-4 h-4 transform rotate-180" />
                            <span>Kembali ke Jurnal</span>
                        </button>

                        <article className="bg-[#F8F5EF] rounded-lg border-2 border-[#C9A84C] shadow-lg p-6 sm:p-10">
                            <header className="mb-6 border-b border-[#C9A84C]/30 pb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">{article.categoryLabel}</span>
                                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A2744] leading-tight mt-1 mb-3">{article.title}</h1>

                                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                                    <div className="flex items-center gap-3">
                                        <img src={author.avatar} alt="" className="w-10 h-10 rounded-full border border-[#C9A84C] object-cover" />
                                        <div>
                                            <span className="text-xs font-bold text-[#1A2744] block">{author.name}</span>
                                            <span className="text-[9px] uppercase tracking-wider text-[#C9A84C] font-bold">{author.title}</span>
                                        </div>
                                    </div>

                                    <div className="text-[11px] text-[#8A8AA0] font-sans">
                                        <span>Terbit: {article.publishedAt}</span>
                                        <span className="mx-2">·</span>
                                        <span>{article.readingTime} Menit Baca</span>
                                    </div>
                                </div>
                            </header>

                            {/* Main Content Rendered */}
                            <div
                                className="font-sans text-sm sm:text-base text-[#4A4A6A] leading-relaxed space-y-6 article-body"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />

                            <div className="mt-8 pt-6 border-t border-[#C9A84C]/20 flex flex-wrap gap-2">
                                {article.tags.map((t, i) => (
                                    <span key={i} className="text-xs bg-[#EDE8DF] text-gray-600 border border-gray-200 px-3 py-1 rounded">#{t}</span>
                                ))}
                            </div>

                            {/* Share box mock */}
                            <div className="bg-[#EDE8DF]/40 rounded p-4 mt-8 flex justify-between items-center text-xs border border-gray-200">
                                <span className="font-medium text-gray-500">Artikel bermanfaat? Bagikan kisah sukses Kaizen ini:</span>
                                <button
                                    onClick={() => triggerToast("Tautan artikel berhasil disalin ke clipboard diler!")}
                                    className="bg-white text-[#1A2744] hover:bg-[#C9A84C] hover:text-[#1A2744] font-semibold border border-gray-300 px-3 py-1.5 rounded flex items-center gap-1.5"
                                >
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>Salin Tautan</span>
                                </button>
                            </div>
                        </article>
                    </main>
                );
            })()}

            {/* ==========================================
          PAGE: PDCA TRACKER
         ========================================== */}
            {currentPage === 'pdca' && (
                <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl font-bold text-[#1A2744] mb-3">PDCA Kaizen Tracker</h1>
                        <p className="font-serif italic text-sm text-[#4A4A6A] max-w-xl mx-auto">
                            "Showcase inisiatif perbaikan berkelanjutan (Kaizen) yang sedang diuji atau telah terstandardisasi secara nasional di diler Mitsubishi."
                        </p>
                        <DecorativeRule />
                    </div>

                    {/* Interactive Phase Select Buttons */}
                    <div className="bg-[#F8F5EF] p-4 rounded-lg border border-[#C9A84C]/20 shadow-sm flex flex-wrap justify-center gap-2 mb-8">
                        <span className="text-xs text-[#8A8AA0] font-bold uppercase tracking-wider self-center mr-4">Filter Tahap:</span>
                        {[
                            { id: 'all', label: 'Semua Proyek' },
                            { id: 'plan', label: '1. PLAN' },
                            { id: 'do', label: '2. DO' },
                            { id: 'check', label: '3. CHECK' },
                            { id: 'act', label: '4. ACT (Standardisasi)' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPdcaFilter(p.id)}
                                className={`px-4 py-2 rounded text-xs font-bold uppercase transition duration-150 ${pdcaFilter === p.id ? 'bg-[#C9A84C] text-[#1A2744]' : 'bg-white text-[#1A2744] hover:bg-[#EDE8DF] border border-gray-200'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* PDCA Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredPdca.map((item) => {
                            const fellow = FELLOWS_DATA.find(f => f.id === item.fellowId) || FELLOWS_DATA[0];
                            return (
                                <div key={item.id} className="bg-[#F8F5EF] border-l-8 border-[#C9A84C] border-y border-r border-[#C9A84C]/20 rounded-r-lg p-6 shadow hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="text-[10px] bg-[#1A2744] text-[#C9A84C] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">Tahap {item.phase}</span>
                                                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider ml-2">{item.period}</span>
                                            </div>
                                            <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded ${item.status === 'completed' ? 'bg-[#2E7D52]/10 text-[#2E7D52]' : 'bg-[#B5860D]/10 text-[#B5860D]'}`}>
                                                {item.status === 'completed' ? 'Selesai (Standardisasi)' : 'Tahap Eksperimen'}
                                            </span>
                                        </div>

                                        <h3 className="font-serif text-xl font-bold text-[#1A2744] mb-2 leading-snug">{item.title}</h3>
                                        <p className="font-sans text-xs text-[#4A4A6A] leading-relaxed mb-4">{item.description}</p>

                                        {/* Metrics Compare block */}
                                        <div className="bg-[#EDE8DF]/50 p-4 rounded border border-[#C9A84C]/10 space-y-2 mb-4">
                                            <p className="text-[10px] uppercase font-bold text-[#1A2744] tracking-wider mb-2">Metrik Dampak (Impact Metrics):</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <span className="text-gray-400 block text-[10px] uppercase">Sebelum:</span>
                                                    <span className="font-medium text-gray-600">{item.metrics.before}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400 block text-[10px] uppercase">Sesudah:</span>
                                                    <span className="font-medium text-gray-800">{item.metrics.after}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[#C9A84C] block text-[10px] uppercase font-bold">Imbal Hasil:</span>
                                                    <span className="font-bold text-[#2E7D52]">{item.metrics.improvement}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Creator Fellow block */}
                                    <div className="border-t border-[#C9A84C]/10 pt-4 flex justify-between items-center mt-auto">
                                        <div className="flex items-center gap-2">
                                            <img src={fellow.avatar} alt="" className="w-8 h-8 rounded-full border border-[#C9A84C]" />
                                            <div>
                                                <span className="text-xs text-[#1A2744] font-semibold block leading-none">{fellow.name}</span>
                                                <span className="text-[9px] text-[#8A8AA0]">{fellow.title}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigateTo('profile', { id: fellow.id })}
                                            className="text-xs text-[#C9A84C] font-bold hover:underline"
                                        >
                                            Buka Profil Pencetus
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            )}

            {/* ==========================================
          PAGE: H.O.M.E STANDARD & QUIZ MINI
         ========================================== */}
            {currentPage === 'home-standard' && (
                <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl font-bold text-[#1A2744] mb-3">Panduan Standar H.O.M.E</h1>
                        <p className="font-serif italic text-sm text-[#4A4A6A] max-w-xl mx-auto">
                            "Petunjuk terperinci empat pilar pelayanan kepuasan pelanggan murni untuk seluruh diler Mitsubishi di Indonesia."
                        </p>
                        <DecorativeRule />
                    </div>

                    {/* Quick Pillar Tabs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                        {[
                            { id: 'hospitality', label: 'Hospitality', quote: '"Keramahan yang tulus adalah jabat tangan jiwa."', author: 'Meita D. Pertiwi' },
                            { id: 'one', label: 'One Service Standard', quote: '"Keseragaman menjamin keadilan rasa pelayanan."', author: 'Feri Oktapiyanto' },
                            { id: 'memorable', label: 'Memorable Experience', quote: '"Satu memori manis melampaui seribu iklan diler."', author: 'Adi Ponco P.' },
                            { id: 'empathy', label: 'Empathy', quote: '"Mendengar tanpa menyela adalah bentuk empati tertinggi."', author: 'Sirojudin Hasan' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setActiveHomeTab(p.id)}
                                className={`p-4 rounded-lg border text-left transition-all duration-200 ${activeHomeTab === p.id ? 'bg-[#1A2744] text-[#EDE8DF] border-[#C9A84C] shadow-md' : 'bg-[#F8F5EF] hover:bg-[#EDE8DF] text-[#1A2744] border-[#C9A84C]/25'}`}
                            >
                                <h3 className="font-serif text-base font-bold">{p.label}</h3>
                                <p className="font-serif italic text-[10px] mt-1.5 opacity-85">{p.quote}</p>
                                <span className="text-[8px] uppercase tracking-wider block mt-1 text-[#C9A84C]">Oleh: {p.author}</span>
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Content Pilar Card */}
                    <div className="bg-[#F8F5EF] rounded-lg border-2 border-[#C9A84C] p-6 sm:p-8 mb-16 shadow">
                        {activeHomeTab === 'hospitality' && (
                            <div className="space-y-6">
                                <h2 className="font-serif text-2xl font-bold text-[#1A2744]">Hospitality — Keramahan yang Tulus</h2>
                                <p className="font-sans text-sm text-[#4A4A6A] leading-relaxed">
                                    Hospitality bukan sekadar senyum formalitas saat customer diler datang. Ini adalah kemampuan menghadirkan ketulusan hati yang membuat customer langsung merasa diterima di lingkungan diler sejak 3 detik pertama.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-emerald-50 border-l-4 border-[#2E7D52] p-4 rounded">
                                        <h4 className="font-serif font-bold text-[#2E7D52] text-sm mb-2">DO's (Lakukan)</h4>
                                        <ul className="space-y-2 text-xs text-gray-700">
                                            <li>· Mengucapkan salam khas dengan membungkuk sopan hormat.</li>
                                            <li>· Memberikan kontak mata hangat langsung tanpa terkesan mengintimidasi.</li>
                                            <li>· Menawarkan minuman hangat dingin saat pendaftaran dimulai.</li>
                                        </ul>
                                    </div>

                                    <div className="bg-rose-50 border-l-4 border-[#922B21] p-4 rounded">
                                        <h4 className="font-serif font-bold text-[#922B21] text-sm mb-2">DONT's (Hindari)</h4>
                                        <ul className="space-y-2 text-xs text-gray-700">
                                            <li>· Menyapa sambil melihat layar monitor handphone atau komputer.</li>
                                            <li>· Melipat kedua tangan di dada (gestur defensif / tertutup).</li>
                                            <li>· Berbisik sesama petugas di hadapan customer yang mengantre.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeHomeTab === 'one' && (
                            <div className="space-y-6">
                                <h2 className="font-serif text-2xl font-bold text-[#1A2744]">One Service Standard — Keseragaman Kualitas</h2>
                                <p className="font-sans text-sm text-[#4A4A6A] leading-relaxed">
                                    Customer harus merasakan kenyamanan, ketepatan estimasi waktu, dan keramahan yang sama mewahnya baik saat mengunjungi diler flagship pusat kota maupun diler sub-cabang pelosok daerah.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-emerald-50 border-l-4 border-[#2E7D52] p-4 rounded">
                                        <h4 className="font-serif font-bold text-[#2E7D52] text-sm mb-2">DO's (Lakukan)</h4>
                                        <ul className="space-y-2 text-xs text-gray-700">
                                            <li>· Memakai Checklist Serah Terima digital yang seragam tanpa terkecuali.</li>
                                            <li>· Memberikan rincian estimasi biaya tertulis transparan sebelum mekanik bekerja.</li>
                                            <li>· Memastikan diler cabang memiliki kalibrasi rasa kopi ruang tunggu yang setara.</li>
                                        </ul>
                                    </div>

                                    <div className="bg-rose-50 border-l-4 border-[#922B21] p-4 rounded">
                                        <h4 className="font-serif font-bold text-[#922B21] text-sm mb-2">DONT's (Hindari)</h4>
                                        <ul className="space-y-2 text-xs text-gray-700">
                                            <li>· Memberikan kemudahan diskon informal tanpa tercatat sistem resmi.</li>
                                            <li>· Membedakan kualitas keramahan berdasarkan penampilan atau jenis mobil customer.</li>
                                            <li>· Mengabaikan checklist kelengkapan unit hanya karena diler sedang padat kunjungan.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeHomeTab === 'memorable' && (
                            <div className="space-y-6">
                                <h2 className="font-serif text-2xl font-bold text-[#1A2744]">Memorable Experience — Momen Berkesan</h2>
                                <p className="font-sans text-sm text-[#4A4A6A] leading-relaxed">
                                    Pelayanan transaksional mudah dilupakan. Namun, kejutan personal yang disesuaikan dengan kebutuhan emosional customer akan melekat kuat di hati mereka seumur hidup dan menjamin retensi diler.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-emerald-50 border-l-4 border-[#2E7D52] p-4 rounded">
                                        <h4 className="font-serif font-bold text-[#2E7D52] text-sm mb-2">DO's (Lakukan)</h4>
                                        <ul className="space-y-2 text-xs text-gray-700">
                                            <li>· Mencatat ulang tahun customer dan melampirkan surat kartu ucapan tangan khusus di mobil.</li>
                                            <li>· Mempersiapkan setup diler penyambutan balon khusus jika tahu ada keluarga bawa balita.</li>
                                            <li>· Memberi suvenir kecil gratis buatan lokal yang khas daerah diler.</li>
                                        </ul>
                                    </div>

                                    <div className="bg-rose-50 border-l-4 border-[#922B21] p-4 rounded">
                                        <h4 className="font-serif font-bold text-[#922B21] text-sm mb-2">DONT's (Hindari)</h4>
                                        <ul className="space-y-2 text-xs text-gray-700">
                                            <li>· Memberikan suvenir standar generik massal diler tanpa arti personal.</li>
                                            <li>· Lupa mencatat detail percakapan kunjungan diler sebelumnya.</li>
                                            <li>· Mengabaikan momen 'Delivery Handover' dengan melepas kunci begitu saja.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeHomeTab === 'empathy' && (
                            <div className="space-y-6">
                                <h2 className="font-serif text-2xl font-bold text-[#1A2744]">Empathy — Empati yang Mendalam</h2>
                                <p className="font-sans text-sm text-[#4A4A6A] leading-relaxed">
                                    Saat customer komplain, mereka tidak hanya mencari solusi logis teknis, melainkan validasi rasa kecewa mereka. Empati menuntut kita mendengarkan dengan penuh rasa hormat sebelum berbicara taktik solusi.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-emerald-50 border-l-4 border-[#2E7D52] p-4 rounded">
                                        <h4 className="font-serif font-bold text-[#2E7D52] text-sm mb-2">DO's (Lakukan)</h4>
                                        <ul className="space-y-2 text-xs text-gray-700">
                                            <li>· Mengangguk tulus tanda paham emosi kecewa customer sedang divalidasi.</li>
                                            <li>· Menggunakan nada suara tenang pelan yang mendinginkan suasana perdebatan.</li>
                                            <li>· Menanyakan kembali kenyamanan mereka sebelum menawarkan opsi jalan keluar.</li>
                                        </ul>
                                    </div>

                                    <div className="bg-rose-50 border-l-4 border-[#922B21] p-4 rounded">
                                        <h4 className="font-serif font-bold text-[#922B21] text-sm mb-2">DONT's (Hindari)</h4>
                                        <ul className="space-y-2 text-xs text-gray-700">
                                            <li>· Menjawab keluhan dengan pembelaan klausa pasal hukum diler kaku.</li>
                                            <li>· Memotong kalimat curhat kekecewaan customer saat mereka belum lega.</li>
                                            <li>· Menunjuk-nunjuk kesalahan kelalaian penggunaan customer secara kasar.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MINI QUIZ SECTION "SEBERAPA HOME KAMU" */}
                    <section id="quiz-section" className="bg-[#1A2744] text-[#EDE8DF] rounded-lg border-2 border-[#C9A84C] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <HelpCircle className="w-48 h-48 text-[#C9A84C]" />
                        </div>

                        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] bg-[#2D4070] px-3 py-1 rounded">Evaluasi Mandiri Intelektual</span>
                            <h2 className="font-serif text-3xl font-bold text-white">Quiz Evaluasi: Seberapa H.O.M.E Kamu?</h2>
                            <p className="font-sans text-xs sm:text-sm text-gray-300">
                                Uji ketajaman naluri pelayanan pelanggan Anda dengan menjawab skenario nyata yang dihadapi para CSM Mitsubishi di lapangan sehari-hari.
                            </p>

                            <div className="h-[1px] bg-[#C9A84C]/30 my-4" />

                            {!quizStarted && !quizScore && (
                                <div className="py-8">
                                    <button
                                        onClick={() => setQuizStarted(true)}
                                        className="bg-gradient-to-r from-[#C9A84C] to-[#E8C875] text-[#1A2744] hover:opacity-95 px-8 py-4 rounded font-bold text-sm tracking-wide shadow"
                                    >
                                        MULAI QUIZ MANDIRI
                                    </button>
                                    <p className="text-[10px] text-gray-400 mt-3">Durasi pengerjaan kurang dari 3 menit · Total 5 Pertanyaan</p>
                                </div>
                            )}

                            {quizStarted && (
                                <div className="text-left bg-[#0E1726]/60 p-6 rounded-lg border border-[#C9A84C]/20 space-y-6">
                                    {/* Progress bar */}
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-300 mb-2">
                                            <span>Pertanyaan {currentQuestionIndex + 1} dari 5</span>
                                            <span>Progress: {Math.round(((currentQuestionIndex) / 5) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-[#1A2744] h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-[#C9A84C] h-full" style={{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }} />
                                        </div>
                                    </div>

                                    {/* Question */}
                                    <h3 className="font-serif text-lg font-bold text-white leading-snug">
                                        {QUIZ_QUESTIONS[currentQuestionIndex].q}
                                    </h3>

                                    {/* Options */}
                                    <div className="space-y-3">
                                        {QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSelectQuizAnswer(option.score)}
                                                className="w-full text-left p-4 rounded bg-[#1A2744]/60 hover:bg-[#2D4070] text-xs sm:text-sm text-gray-200 border border-[#C9A84C]/20 hover:border-[#C9A84C] transition duration-200"
                                            >
                                                {option.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {quizScore !== null && (
                                <div className="bg-[#0E1726]/60 p-8 rounded-lg border border-[#C9A84C] text-center space-y-6 animate-in fade-in zoom-in">
                                    <span className="text-[10px] bg-[#2E7D52] text-white px-3 py-1 rounded font-bold uppercase tracking-wider">Hasil Evaluasi</span>

                                    <div className="py-2">
                                        <span className="block text-[11px] text-gray-400 uppercase font-medium">Skor Total Naluri Anda:</span>
                                        <span className="font-serif text-5xl font-extrabold text-[#C9A84C]">{quizScore} / 20</span>
                                    </div>

                                    <div className="max-w-md mx-auto space-y-2">
                                        <h3 className="font-serif text-xl font-bold text-white text-[#C9A84C]">
                                            {getQuizResultDescription(quizScore).title}
                                        </h3>
                                        <p className="font-sans text-xs text-gray-300 leading-relaxed">
                                            {getQuizResultDescription(quizScore).desc}
                                        </p>
                                    </div>

                                    <div className="bg-[#1A2744] py-3 px-6 rounded-full inline-flex items-center gap-2 border border-[#C9A84C]/30 text-xs text-[#C9A84C] font-semibold">
                                        <Award className="w-4 h-4" />
                                        <span>Lencana Virtual Diperoleh: {getQuizResultDescription(quizScore).badge}</span>
                                    </div>

                                    <div className="pt-4 flex justify-center gap-4">
                                        <button
                                            onClick={resetQuiz}
                                            className="border border-[#C9A84C]/50 hover:bg-[#C9A84C]/10 text-[#C9A84C] text-xs font-semibold px-6 py-2.5 rounded transition duration-200"
                                        >
                                            Ulangi Tes
                                        </button>
                                        <button
                                            onClick={() => navigateTo('fellows')}
                                            className="bg-[#C9A84C] text-[#1A2744] hover:opacity-95 text-xs font-semibold px-6 py-2.5 rounded transition duration-200"
                                        >
                                            Bandingkan dengan Para Fellow
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </section>
                </main>
            )}

            {/* ==========================================
          PAGE: ABOUT US & HISTORY & ORG CHART
         ========================================== */}
            {currentPage === 'about' && (
                <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl font-bold text-[#1A2744] mb-3">Tentang Fellowship</h1>
                        <p className="font-serif italic text-sm text-[#4A4A6A] max-w-xl mx-auto">
                            "Sebuah ikatan kehormatan intelektual pengembang standar pelayanan tulus Mitsubishi dengan landasan perbaikan Kaizen."
                        </p>
                        <DecorativeRule />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
                        <div className="lg:col-span-6 space-y-6">
                            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A2744]">Sejarah & Asal Mula Society</h2>
                            <p className="font-sans text-sm text-[#4A4A6A] leading-relaxed">
                                Didirikan pada Juni 2026 oleh <strong>Barod Abdillah (Waycrafter)</strong>, platform digital Fellow of the CSM Intellectual Society terinspirasi dari struktur kepemimpinan dan komitmen ketat <strong>Royal Society</strong> di London.
                            </p>
                            <p className="font-sans text-sm text-[#4A4A6A] leading-relaxed">
                                Kami percaya bahwa kepuasan pelanggan murni (Customer Satisfaction) tidak terjadi secara acak. Ia menuntut ketajaman analisis, dedikasi riset, penyusunan standar baku yang logis (H.O.M.E), serta keinginan kuat menguji perbaikan berkelanjutan (Kaizen PDCA) setiap harinya di diler Mitsubishi seluruh Indonesia.
                            </p>
                            <div className="border-l-4 border-[#C9A84C] pl-4 font-serif italic text-sm text-[#1A2744]">
                                "Kami ada untuk menuntut diri kami sendiri terlebih dahulu sebelum melayani kebahagiaan customer."
                            </div>
                        </div>

                        <div className="lg:col-span-6 bg-[#F8F5EF] p-6 rounded-lg border-2 border-[#C9A84C] shadow">
                            <h3 className="font-serif text-xl font-bold text-[#1A2744] mb-4 text-center">Roadmap & Nilai Luhur</h3>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#1A2744] border border-[#C9A84C] text-[#C9A84C] flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                    <div>
                                        <h4 className="font-serif font-bold text-sm text-[#1A2744]">Intelektual & Berbasis Data</h4>
                                        <p className="text-xs text-[#4A4A6A]">Setiap usulan diler wajib diuji ilmiah dengan metrik dampak PDCA kuantitatif.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#1A2744] border border-[#C9A84C] text-[#C9A84C] flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                    <div>
                                        <h4 className="font-serif font-bold text-sm text-[#1A2744]">Kerendahan Hati (Humility)</h4>
                                        <p className="text-xs text-[#4A4A6A]">Pelayan sejati bersedia mendengarkan kritik tertajam demi perbaikan kualitas.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#1A2744] border border-[#C9A84C] text-[#C9A84C] flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                    <div>
                                        <h4 className="font-serif font-bold text-sm text-[#1A2744]">Komunitas Tanpa Batas</h4>
                                        <p className="text-xs text-[#4A4A6A]">Saling menginspirasi dan membagikan hasil jurnal best practice antardiler se-Indonesia.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INTERACTIVE ORGANIZATIONAL STRUCTURE (Org Chart) */}
                    <section className="bg-[#1A2744] text-[#EDE8DF] p-6 sm:p-10 rounded-lg border-2 border-[#C9A84C] shadow-xl">
                        <div className="text-center mb-10 max-w-xl mx-auto">
                            <span className="text-xs text-[#C9A84C] font-bold uppercase tracking-widest block mb-2">Struktur Kepemimpinan Kehormatan</span>
                            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Bagan Organisasi Intellectual Society</h2>
                            <p className="font-sans text-xs text-gray-300 mt-2">Daftar pemegang sumpah kepemimpinan fellowship berdasarkan spesialisasi tugas luhur.</p>
                        </div>

                        {/* Hierarchical Flowchart Block */}
                        <div className="space-y-8 max-w-4xl mx-auto">
                            {/* Level 1: Leader (Arch-Fellow) */}
                            <div className="flex justify-center">
                                <div className="bg-[#0E1726] border-2 border-[#C9A84C] p-4 rounded shadow-lg text-center max-w-[240px] w-full">
                                    <span className="text-[9px] bg-[#C9A84C] text-[#1A2744] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider block mb-2">Arch-Fellow</span>
                                    <strong className="text-white block font-serif text-base">Adi Ponco P.</strong>
                                    <span className="text-[10px] text-gray-400 block mt-1">Pemimpin Tertinggi Fellowship</span>
                                </div>
                            </div>

                            {/* Connecting line */}
                            <div className="h-6 w-[2px] bg-[#C9A84C]/40 mx-auto" />

                            {/* Level 2: Advisory & Warden */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                                <div className="bg-[#0E1726]/80 border border-[#C9A84C]/50 p-3.5 rounded text-center">
                                    <span className="text-[8px] uppercase tracking-wider font-bold text-[#C9A84C] block mb-1">Consigliere</span>
                                    <strong className="text-white block font-serif text-sm">Sirojudin Hasan</strong>
                                    <span className="text-[9px] text-gray-400 block">Penasihat Strategis</span>
                                </div>

                                <div className="bg-[#0E1726]/80 border border-[#C9A84C]/50 p-3.5 rounded text-center">
                                    <span className="text-[8px] uppercase tracking-wider font-bold text-[#C9A84C] block mb-1">Warden of Resources</span>
                                    <strong className="text-white block font-serif text-sm">Meita D. Pertiwi</strong>
                                    <span className="text-[9px] text-gray-400 block">Pengelola Sumber Daya</span>
                                </div>
                            </div>

                            {/* Connecting line */}
                            <div className="h-6 w-[2px] bg-[#C9A84C]/40 mx-auto" />

                            {/* Level 3: Execution Officers */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { title: "Waycrafter", name: "Barod Abdillah", role: "Arsitek Visi Platform" },
                                    { title: "Sergeant At Arms", name: "Feri Oktapiyanto", role: "Penjaga Protokol & Tata Tertib" },
                                    { title: "Agitation & Propaganda", name: "Eggy MS", role: "Komunikasi Internal & Kampanye" },
                                    { title: "Master of Provision", name: "Gus Huda", role: "Logistik & Dukungan Operasional" }
                                ].map((officer, idx) => (
                                    <div key={idx} className="bg-[#0E1726]/60 border border-[#C9A84C]/30 p-3 rounded text-center">
                                        <span className="text-[8px] uppercase tracking-wider font-bold text-[#C9A84C] block mb-1">{officer.title}</span>
                                        <strong className="text-white block font-serif text-xs">{officer.name}</strong>
                                        <span className="text-[9px] text-gray-400 block mt-0.5 leading-tight">{officer.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>
            )}

            {/* ==========================================
          FOOTER COMPONENT
         ========================================== */}
            <footer className="bg-[#1A2744] text-[#EDE8DF] border-t-2 border-[#C9A84C] py-12 px-4 mt-auto">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Col 1: About Platform */}
                    <div className="space-y-3">
                        <h4 className="font-serif font-bold text-lg text-white">CSM <span className="text-[#C9A84C]">· Intellectual Society</span></h4>
                        <p className="font-sans text-xs text-gray-400 leading-relaxed max-w-sm">
                            Sebuah platform digital kehormatan inovasi mandiri CSM Mitsubishi untuk mengintegrasikan standar luhur H.O.M.E dengan disiplin Kaizen PDCA.
                        </p>
                    </div>

                    {/* Col 2: Quick Links */}
                    <div className="space-y-3">
                        <h4 className="font-serif font-bold text-sm text-[#C9A84C] uppercase tracking-wider">Navigasi Cepat</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <button onClick={() => navigateTo('home')} className="text-left text-gray-400 hover:text-white">Beranda</button>
                            <button onClick={() => navigateTo('fellows')} className="text-left text-gray-400 hover:text-white">Direktori Fellow</button>
                            <button onClick={() => navigateTo('forum')} className="text-left text-gray-400 hover:text-white">Forum Diskusi</button>
                            <button onClick={() => navigateTo('articles')} className="text-left text-gray-400 hover:text-white">Publikasi Jurnal</button>
                            <button onClick={() => navigateTo('pdca')} className="text-left text-gray-400 hover:text-white">PDCA Tracker</button>
                            <button onClick={() => navigateTo('home-standard')} className="text-left text-gray-400 hover:text-white">Standar H.O.M.E</button>
                        </div>
                    </div>

                    {/* Col 3: Copyright Info */}
                    <div className="space-y-3">
                        <h4 className="font-serif font-bold text-sm text-[#C9A84C] uppercase tracking-wider">Identitas Draft</h4>
                        <p className="text-xs text-gray-400">
                            Versi: 1.0 (Juni 2026)<br />
                            Dibuat oleh: <strong>Barod Abdillah (Waycrafter)</strong><br />
                            Status: Prototype Interactive Draft
                        </p>
                        <div className="text-[10px] text-gray-500 italic">
                            "Shaping today and tomorrow, better."
                        </div>
                    </div>

                </div>

                <div className="h-[1px] bg-[#C9A84C]/20 my-8 max-w-7xl mx-auto" />

                <div className="text-center text-[10px] text-gray-500">
                    © {new Date().getFullYear()} Fellow of the CSM Intellectual Society Mitsubishi. Hak Cipta Dilindungi Undang-Undang.
                </div>
            </footer>
        </div>
    );
}