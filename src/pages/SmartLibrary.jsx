import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import {
    Sparkles,
    FileText,
    ChevronDown,
    BookOpen,
    PenTool,
    LayoutTemplate,
    Briefcase,
    RefreshCw,
    ArrowLeft,
    ArrowUp,
    Send,
    User as UserIcon,
    Bot,
    Copy,
    Check,
    BrainCircuit,
    Lock,
    LogIn,
    Share2,
    CheckCircle2,
    X
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Toast from '../components/shared/Toast';

const MODELS = [
    { id: 'csm-lite', name: 'CSM Lite', apiModel: 'xiaomi/mimo-v2.6-flash', requiresAuth: false },
    { id: 'csm-pro', name: 'CSM Pro', apiModel: 'google/gemini-3.1-flash-lite', requiresAuth: true }
];

const PLACEHOLDERS = [
    "Cari panduan implementasi PDCA...",
    "Bagaimana strategi retensi pelanggan terbaik?",
    "Temukan jurnal tentang Contact Center...",
    "Apa itu Customer Success Management?",
    "Tanyakan apa saja secara bebas..."
];

const SUGGESTIONS = [
    {
        icon: <BookOpen className="w-4 h-4" />,
        label: "Pelajari CSM",
        type: "csm",
        placeholder: "Tuliskan topik CSM atau pilar H.O.M.E yang ingin didalami (atau tekan kirim langsung)...",
        prompt: "Bagaimana filosofi Customer Success Management (CSM) diterapkan di industri diler otomotif modern (khususnya Mitsubishi Motors) melalui implementasi 4 pilar standar H.O.M.E?"
    },
    {
        icon: <FileText className="w-4 h-4" />,
        label: "Cari Jurnal",
        type: "jurnal",
        placeholder: "Tuliskan topik atau bidang jurnal diler yang ingin direkomendasikan (atau tekan kirim langsung)...",
        prompt: "Rekomendasikan dan ulas intisari jurnal ilmiah serta buku saku esensial tentang Customer Retention, Service Excellence, dan kepuasan pelanggan diler otomotif."
    },
    {
        icon: <Briefcase className="w-4 h-4" />,
        label: "Studi Kasus",
        type: "studi_kasus",
        placeholder: "Tuliskan rincian keluhan atau situasi kasus diler yang ingin dipecahkan (atau tekan kirim langsung)...",
        prompt: "Buatkan studi kasus mendalam penanganan komplain pelanggan diler Mitsubishi (misalnya keluhan penundaan servis berkala Pajero Sport atau Xpander), analisis akar masalahnya, dan resolusi empatik berbasis H.O.M.E."
    },
    {
        icon: <PenTool className="w-4 h-4" />,
        label: "Tulis Artikel",
        type: "tulis_artikel",
        placeholder: "Tuliskan judul, topik inovasi, atau sudut pandang artikel yang ingin dibuat (atau tekan kirim langsung)...",
        prompt: "Buatkan draf artikel pemikiran kritis (thought leadership) yang inspiratif tentang 'Inovasi Customer Experience di Diler Mitsubishi: Menjaga Loyalitas Pelanggan di Era Digital', lengkap dengan judul, latar belakang, dan rekomendasi aksi."
    },
    {
        icon: <LayoutTemplate className="w-4 h-4" />,
        label: "Template PDCA",
        type: "pdca",
        placeholder: "Tuliskan kendala diler (misal: skor NPS turun, delay servis) untuk simulasi PDCA (atau tekan kirim langsung)...",
        prompt: "Rancang simulasi kerangka kerja Kaizen PDCA lengkap untuk menyelesaikan kendala penurunan skor kepuasan pelanggan (NPS / CSI) di bengkel resmi diler Mitsubishi, dari tahap Plan hingga Act."
    }
];

// Rekomendasi dokumen yang dinamis: fleksibel antara 2 sampai 6 buku yang paling relevan
const getRecommendedDocs = (docs, query) => {
    if (!docs || docs.length === 0) return [];

    if (!query || !query.trim()) {
        return docs.slice(0, Math.min(Math.max(docs.length, 2), 4));
    }

    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    const scoredDocs = docs.map(doc => {
        let score = 0;
        const searchString = `${doc.title || ''} ${doc.category || ''} ${doc.description || ''} ${doc.tags_str || ''}`.toLowerCase();

        keywords.forEach(kw => {
            if (searchString.includes(kw)) score += 2;
        });

        // Skor tambahan jika kategori atau topik jurnal/buku dicari langsung
        if (query.toLowerCase().includes('jurnal') && (doc.category || '').toLowerCase().includes('jurnal')) {
            score += 3;
        }
        if (query.toLowerCase().includes('pdca') && (doc.title || doc.description || '').toLowerCase().includes('pdca')) {
            score += 3;
        }

        return { ...doc, score };
    });

    // Urutkan berdasarkan skor terbesar
    scoredDocs.sort((a, b) => b.score - a.score);

    // Ambil dokumen yang memiliki kecocokan (score > 0)
    const matchedDocs = scoredDocs.filter(d => d.score > 0);

    // Tampilkan 2 sampai 6 buku yang paling cocok
    if (matchedDocs.length >= 2) {
        return matchedDocs.slice(0, Math.min(matchedDocs.length, 6));
    }

    // Jika yang cocok kurang dari 2, lengkapi dengan dokumen unggulan agar minimal tampil 2 (maks 4)
    return scoredDocs.slice(0, Math.min(scoredDocs.length, 2));
};

// Menentukan apakah respon tergolong respon matang dan panjang yang layak diteruskan ke Editor Artikel / PDCA
const isMatureLongResponse = (content) => {
    if (!content) return false;
    const trimmed = content.trim();
    const wordCount = trimmed.split(/\s+/).length;
    const charCount = trimmed.length;
    // Respon matang panjang memiliki minimal 450 karakter dan 60 kata
    return charCount >= 450 && wordCount >= 60;
};

export default function SmartLibrary() {
    useDocumentTitle('Smart Library');
    const navigate = useNavigate();

    const [input, setInput] = useState('');
    const [activeTag, setActiveTag] = useState(null);
    const [followUpInput, setFollowUpInput] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [placeholderText, setPlaceholderText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const [selectedModel, setSelectedModel] = useState(MODELS[0]);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

    // Multi-turn chat message list: [ { id, role: 'user' | 'assistant', content, timestamp } ]
    const [messages, setMessages] = useState([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [user, setUser] = useState(null);
    const [publicMembers, setPublicMembers] = useState([]);
    const [publikasiList, setPublikasiList] = useState([]);

    const [copiedIndex, setCopiedIndex] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const messagesEndRef = useRef(null);
    const followUpInputRef = useRef(null);
    const initialInputRef = useRef(null);

    const API_BASE = import.meta.env.VITE_API_URL || 'https://incsmsociety.site/api';

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
    };

    // Auto scroll ke pesan terbawah saat ada pesan baru
    useEffect(() => {
        if (hasSubmitted && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isGenerating, hasSubmitted]);

    // Memuat daftar publikasi terbit
    useEffect(() => {
        const fetchPublikasi = async () => {
            try {
                const res = await fetch(`${import.meta.env.BASE_URL}api/get_publikasi.php`);
                const json = await res.json();
                if (json.status === 'success') {
                    const published = json.data.filter(p => p.status === 'publish');
                    setPublikasiList(published);
                }
            } catch (err) {
                console.error("Gagal memuat data publikasi", err);
            }
        };
        fetchPublikasi();
    }, []);

    // Memuat data member untuk konteks komunitas
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch('https://incsmsociety.site/api/get_users.php');
                const data = await res.json();
                if (data.status === 'success') {
                    const membersInfo = data.users.map(u =>
                        `- ${u.name} (Role: ${u.role === 'admin' ? 'Fellow' : u.role === 'fellow' ? 'Fellow' : 'Member'}, Title: ${u.title || '-'}, CSM Specialization: ${u.csm_title || '-'})\n  - Quote: "${u.quote || '-'}"\n  - Bio: ${u.bio || '-'}`
                    );
                    setPublicMembers(membersInfo);
                }
            } catch (err) {
                console.error("Gagal memuat data member publik", err);
            }
        };
        fetchMembers();
    }, []);

    // Memuat user login
    useEffect(() => {
        const userData = localStorage.getItem('csm_user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setSelectedModel(MODELS.find(m => m.id === 'csm-pro') || MODELS[0]);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Efek mengetik placeholder interaktif
    useEffect(() => {
        if (hasSubmitted) return;

        const currentString = PLACEHOLDERS[placeholderIndex];
        let timeout;

        if (!isDeleting) {
            if (placeholderText.length < currentString.length) {
                timeout = setTimeout(() => {
                    setPlaceholderText(currentString.slice(0, placeholderText.length + 1));
                }, 50);
            } else {
                timeout = setTimeout(() => setIsDeleting(true), 2200);
            }
        } else {
            if (placeholderText.length > 0) {
                timeout = setTimeout(() => {
                    setPlaceholderText(currentString.slice(0, placeholderText.length - 1));
                }, 30);
            } else {
                setIsDeleting(false);
                setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
            }
        }

        return () => clearTimeout(timeout);
    }, [placeholderText, isDeleting, placeholderIndex, hasSubmitted]);

    // System Prompt: Bebas & Variatif (Tidak Monoton) + Fleksibel Panjang-Pendek + Hubungan Natural ke CSM Diler Mitsubishi H.O.M.E & Kaizen
    const getSystemPrompt = () => {
        const membersContext = publicMembers.length > 0
            ? `\n\n6. Data Keanggotaan The Fellow:\n${publicMembers.join('\n')}\n(Gunakan data ini jika pengguna menanyakan seputar rekan/tokoh di komunitas The Fellow).`
            : '';

        return `Anda adalah "The Fellow AI Consultant & Strategic Mentor" - mitra berpikir eksekutif dan pakar Customer Success Management (CSM) untuk komunitas intelektual The Fellow.

PRINSIP WAJIB & GAYA KOMUNIKASI (VARIATIF & TIDAK MONOTON):
1. DILARANG MONOTON & HINDARI POLA FORMULAIC:
   - JANGAN PERNAH menyusun respon dengan template kaku yang seragam di setiap jawaban (hindari pola checklist kaku 1, 2, 3, 4 yang selalu sama).
   - Bentuk gaya tutur yang luwes, hidup, cerdas, dan variatif layaknya berdiskusi dengan mentor senior berkaliber tinggi.

2. ADAPTASI PANJANG RESPON SECARA PROPORSIONAL:
   - JIKA BUTUH PEMIKIRAN PANJANG (Deep Analysis): Untuk permintaan studi kasus, draf artikel, simulasi PDCA lengkap, atau eksplorasi gagasan konseptual/filosofis yang kompleks, susun respon yang matang, komprehensif, kaya perspektif, mendalam, dan terstruktur kuat.
   - JIKA PERLU PENDEK (Concise & Direct): Jika pertanyaan pengguna sederhana, berupa klarifikasi, konfirmasi cepat, definisi singkat, atau percakapan interaktif biasa, jawab secara langsung, padat, ringkas, dan to the point tanpa memaksakan penjabaran panjang yang bertele-tele.
   - JIKA PERLU SEDANG: Berikan jawaban taktis yang proporsional, lugas, dan fokus pada inti solusi.

3. INTERAKTIF: PERTANYAAN BALIK & SARAN PRAKTIS:
   - AJUKAN PERTANYAAN BALIK: Jika relevan untuk mempertajam pemahaman atau memancing pemikiran kritis (critical thinking) pengguna, jangan ragu mengajukan 1-2 pertanyaan pemantik yang reflektif.
   - BERIKAN SARAN TAKTIS: Saat situasi diler atau tantangan operasional dibahas, berikan saran tindakan konkret (actionable advice) yang aplikatif di lapangan.

4. KEBEBASAN BERPIKIR (FREE THINKER):
   - Pengguna berhak bertanya tentang APAPUN secara bebas tanpa batasan sempit (filsafat, sains, teknologi, psikologi, kepemimpinan, peradaban, dsb.).
   - Jangan pernah menolak pertanyaan. Sikapi dengan keterbukaan intelektual dan kedalaman wawasan pemikir bebas.

5. KONEKSI ALAMI KE PROFESI CSM DILER MITSUBISHI MOTORS:
   - Hubungkan topik yang dibahas dengan profesi utama pengguna sebagai Customer Success Management (CSM) / Manajer Layanan di Diler Resmi Mitsubishi Motors secara organik, kontekstual, dan elegan (bukan dipaksakan mekanis).
   - Libatkan dinamika diler: pemilik kendaraan Mitsubishi (Pajero Sport, Xpander, Xforce, Triton, dsb.), sinergi Service Advisor, bengkel resmi (After Sales), tim Sales, hingga kepuasan dan retensi pelanggan diler.

6. INTEGRASI NILAI H.O.M.E & KAIZEN PDCA (SEBAGAI ESENSI, BUKAN TEMPLATE KAKU):
   - Gunakan 4 pilar standar H.O.M.E (Hospitality, One Service Standard, Memorable Experience, Empathy) dan filosofi Kaizen PDCA (Plan, Do, Check, Act) sebagai landasan berpikir solutif ketika relevan, tanpa perlu selalu mengutipnya secara rigid/kaku bila konteksnya tidak membutuhkan.

7. FORMATTING:
   - Gunakan format Markdown yang bersih, dinamis, dan nyaman dibaca (hindari paragraf datar monoton).${membersContext}`;
    };

    // Fungsi memanggil endpoint backend proxy OpenRouter
    const callOpenRouterBackend = async (conversationMessages, apiModel) => {
        try {
            const res = await fetch(`${API_BASE}/openrouter.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: apiModel,
                    messages: [
                        { role: "system", content: getSystemPrompt() },
                        ...conversationMessages
                    ]
                })
            });

            const data = await res.json();
            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else if (data.error) {
                return `Maaf, terjadi kendala dari server AI: ${data.error.message || 'Gagal memproses respons.'}`;
            } else {
                return "Maaf, respon dari AI tidak dapat diproses saat ini.";
            }
        } catch (error) {
            console.error("OpenRouter Backend Error:", error);
            return "Terjadi kesalahan koneksi saat menghubungi jaringan AI. Silakan coba beberapa saat lagi.";
        }
    };

    // Submit pesan pertama / inisial
    const handleSubmitInitial = async (overridePrompt) => {
        let query = '';
        let displayPrompt = '';

        if (overridePrompt) {
            query = overridePrompt;
            displayPrompt = overridePrompt;
        } else if (activeTag) {
            const userContext = input.trim();
            if (userContext) {
                displayPrompt = `[${activeTag.label}] ${userContext}`;
                if (activeTag.type === 'studi_kasus') {
                    query = `Buatkan studi kasus mendalam penanganan komplain atau masalah diler Mitsubishi dengan konteks: "${userContext}". Lakukan analisis akar masalah (5 Whys / Ishikawa) dan buatkan resolusi empatik berbasis 4 standar H.O.M.E.`;
                } else if (activeTag.type === 'tulis_artikel') {
                    query = `Buatkan draf artikel pemikiran kritis (thought leadership) inspiratif dengan judul/topik: "${userContext}", dikaitkan dengan Customer Experience diler Mitsubishi, latar belakang masalah, dan rekomendasi aksi nyata.`;
                } else if (activeTag.type === 'pdca') {
                    query = `Rancang simulasi kerangka kerja Kaizen PDCA lengkap (Plan, Do, Check, Act) untuk menyelesaikan kendala diler Mitsubishi: "${userContext}".`;
                } else if (activeTag.type === 'jurnal') {
                    query = `Rekomendasikan dan ulas intisari jurnal ilmiah serta referensi buku saku esensial seputar topik: "${userContext}" untuk peningkatan kepuasan pelanggan dan standar operasional diler otomotif.`;
                } else if (activeTag.type === 'csm') {
                    query = `Jelaskan implementasi filosofi Customer Success Management (CSM) dan 4 pilar standar H.O.M.E diler Mitsubishi dengan fokus konteks: "${userContext}".`;
                } else {
                    query = `[${activeTag.label}] ${userContext}. Hubungkan secara mendalam dengan standar CSM diler Mitsubishi, standar H.O.M.E, dan Kaizen PDCA.`;
                }
            } else {
                displayPrompt = `[${activeTag.label}] ${activeTag.prompt}`;
                query = activeTag.prompt;
            }
        } else {
            query = (input || PLACEHOLDERS[placeholderIndex]).trim();
            displayPrompt = query;
        }

        if (!query) return;

        setInput('');
        setActiveTag(null);
        setHasSubmitted(true);
        setIsGenerating(true);

        const initialUserMsg = {
            id: Date.now(),
            role: 'user',
            content: displayPrompt,
            timestamp: new Date()
        };

        setMessages([initialUserMsg]);

        const responseText = await callOpenRouterBackend([{ role: 'user', content: query }], selectedModel.apiModel);

        const initialAssistantMsg = {
            id: Date.now() + 1,
            role: 'assistant',
            content: responseText,
            timestamp: new Date()
        };

        setMessages([initialUserMsg, initialAssistantMsg]);
        setIsGenerating(false);
    };

    // Submit pesan lanjutan (Follow-Up / Multi-turn chat)
    const handleSendFollowUp = async (e) => {
        if (e) e.preventDefault();
        if (!followUpInput.trim() || isGenerating) return;

        // Syarat lanjutan: Harus login
        if (!user) {
            showToast("Anda harus Login terlebih dahulu untuk melanjutkan percakapan interaktif ini.", "error");
            return;
        }

        const newQuery = followUpInput.trim();
        setFollowUpInput('');

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: newQuery,
            timestamp: new Date()
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setIsGenerating(true);

        // Format history untuk dikirim ke API
        const payloadHistory = updatedMessages.map(m => ({
            role: m.role,
            content: m.content
        }));

        const responseText = await callOpenRouterBackend(payloadHistory, selectedModel.apiModel);

        const assistantMsg = {
            id: Date.now() + 1,
            role: 'assistant',
            content: responseText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMsg]);
        setIsGenerating(false);
    };

    const handleKeyDownInitial = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitInitial();
        }
    };

    const handleKeyDownFollowUp = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendFollowUp(e);
        }
    };

    // Aksi: Teruskan ke Editor Artikel
    const handleForwardToArticle = (content, defaultCategory = "Pemikiran Kritis") => {
        // Deteksi judul artikel dari heading markdown pertama jika ada
        const headingMatch = content.match(/^#+\s+(.+)$/m);
        const extractedTitle = headingMatch ? headingMatch[1].replace(/[*_#]/g, '').trim() : '';

        // Tentukan kategori yang tepat
        const isStudiKasus = defaultCategory === "Studi Kasus" || content.toLowerCase().includes('studi kasus');
        const category = isStudiKasus ? "Studi Kasus" : "Pemikiran Kritis";

        navigate('/articles/create', {
            state: {
                title: extractedTitle || `Artikel: Solusi Layanan & Inovasi CSM`,
                category: category,
                content: content,
                excerpt: `Draf artikel hasil eksplorasi ide dari Smart Library The Fellow.`,
                tags: ['CSM', 'Mitsubishi', isStudiKasus ? 'Studi Kasus' : 'Pemikiran Kritis']
            }
        });
    };

    // Aksi: Teruskan ke PDCA Generator
    const handleForwardToPdca = (content) => {
        // Ekstrak masalah dari prompt awal atau baris pertama
        const initialQuestion = messages.find(m => m.role === 'user')?.content || 'Optimalisasi Pelayanan & Kepuasan Pelanggan Diler';

        navigate('/pdca-generator', {
            state: {
                problem: initialQuestion,
                context: content,
                newCycle: true
            }
        });
    };

    // Aksi: Salin teks respon AI
    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        showToast('Teks respon berhasil disalin ke clipboard!', 'success');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Reset ke mode pencarian awal
    const handleReset = () => {
        setHasSubmitted(false);
        setInput('');
        setActiveTag(null);
        setFollowUpInput('');
        setMessages([]);
        setIsGenerating(false);
    };

    // Mengambil query pencarian awal untuk rekomendasi buku
    const initialQuery = messages.length > 0 ? messages[0].content : input;
    const recommendedBooks = getRecommendedDocs(publikasiList, initialQuery);

    return (
        <div className="bg-[#f9f9f9] min-h-screen pt-24 pb-16 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto px-4 h-full flex flex-col justify-center min-h-[calc(100vh-12rem)]">

                <AnimatePresence mode="wait">
                    {!hasSubmitted ? (
                        // ================= STATE 1: IDLE / HERO SEARCH =================
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
                            transition={{ duration: 0.4 }}
                            className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center"
                        >
                            {/* Greeting */}
                            <div className="flex items-center gap-3 mb-8">
                                <Sparkles className="w-8 h-8 text-accent" />
                                <h1 className="font-serif text-4xl sm:text-5xl text-[#3d3d3d] tracking-tight">
                                    Halo, {user ? user.name.split(' ')[0] : 'Fellow'}!
                                </h1>
                            </div>

                            {/* Main Input Box */}
                            <div className="w-full bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 p-2 relative transition-all duration-300 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">

                                {/* Tag Badge jika ada topik/kategori yang dipilih */}
                                {activeTag && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 m-2 mb-0 bg-surface-card border border-accent/40 text-primary rounded-xl text-xs font-medium shadow-xs w-fit animate-in fade-in zoom-in-95 transition-all">
                                        <span className="flex items-center text-accent">{activeTag.icon}</span>
                                        <span className="font-semibold text-primary">{activeTag.label}</span>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTag(null)}
                                            className="ml-1 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                            title="Hapus tag konteks"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                <textarea
                                    ref={initialInputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDownInitial}
                                    placeholder={activeTag ? activeTag.placeholder : placeholderText}
                                    className="w-full bg-transparent border-none outline-none resize-none px-4 py-3 text-gray-700 min-h-[110px] text-base sm:text-lg placeholder-gray-400"
                                />

                                {/* Bottom Action Bar inside Input */}
                                <div className="flex justify-between items-center px-4 pb-2 pt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                                            <Sparkles className="w-3.5 h-3.5 text-accent" />
                                            <span>
                                                {activeTag
                                                    ? `Konteks aktif: ${activeTag.label} • Masukkan rincian spesifik atau langsung kirim`
                                                    : 'Bebas bertanya • Berbasis H.O.M.E & Kaizen'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Model Selector */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                                            >
                                                {selectedModel.name}
                                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isModelDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 5 }}
                                                        className="absolute bottom-full right-0 mb-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden"
                                                    >
                                                        {MODELS.map(m => (
                                                            <div
                                                                key={m.id}
                                                                onClick={() => {
                                                                    if (m.requiresAuth && !user) {
                                                                        showToast("Model CSM Pro memerlukan Login akun anggota.", "error");
                                                                        return;
                                                                    }
                                                                    setSelectedModel(m);
                                                                    setIsModelDropdownOpen(false);
                                                                }}
                                                                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors flex justify-between items-center ${selectedModel.id === m.id ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'} ${m.requiresAuth && !user ? 'opacity-50' : ''}`}
                                                            >
                                                                <span>{m.name}</span>
                                                                {m.requiresAuth && !user && (
                                                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Pro</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="w-px h-4 bg-gray-200"></div>

                                        <button
                                            type="button"
                                            onClick={() => handleSubmitInitial()}
                                            disabled={!activeTag && !input.trim() && !placeholderText}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-black transition-colors disabled:opacity-30 disabled:hover:bg-primary shadow-sm cursor-pointer"
                                            title="Kirim Pertanyaan"
                                        >
                                            <ArrowUp className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Suggestions (Tombol rekomendasi tematik mengaktifkan tag konteks) */}
                            <div className="flex flex-wrap justify-center gap-2.5 mt-6">
                                {SUGGESTIONS.map((item, idx) => {
                                    const isSelected = activeTag?.type === item.type;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    setActiveTag(null);
                                                } else {
                                                    setActiveTag(item);
                                                    if (initialInputRef.current) {
                                                        initialInputRef.current.focus();
                                                    }
                                                }
                                            }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-xs cursor-pointer ${isSelected
                                                ? 'bg-accent/15 border-2 border-accent text-primary shadow-sm font-semibold'
                                                : 'bg-white border border-gray-200 hover:border-accent/40 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow'
                                                }`}
                                        >
                                            <span className={`transition-colors ${isSelected ? 'text-accent' : 'text-gray-400 group-hover:text-accent'}`}>
                                                {item.icon}
                                            </span>
                                            <span>{item.label}</span>
                                            {isSelected && (
                                                <span
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveTag(null);
                                                    }}
                                                    className="p-0.5 rounded-full hover:bg-accent/20 text-gray-500 hover:text-gray-900 ml-0.5"
                                                    title="Batal pilih tag"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        // ================= STATE 2: MULTI-TURN CONVERSATION =================
                        <motion.div
                            key="submitted"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="w-full max-w-4xl mx-auto space-y-8"
                        >
                            {/* Top Navigation Bar */}
                            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Kembali ke Pencarian</span>
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                                        <span>Model: <strong>{selectedModel.name}</strong></span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary transition-colors bg-white px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>Diskusi Baru</span>
                                    </button>
                                </div>
                            </div>

                            {/* Conversation Messages Thread */}
                            <div className="space-y-8">
                                {messages.map((msg, index) => (
                                    <div key={msg.id} className="space-y-4">
                                        {msg.role === 'user' ? (
                                            // USER MESSAGE BUBBLE
                                            <div className="flex items-start justify-end gap-3">
                                                <div className="bg-primary text-white rounded-3xl rounded-tr-md px-6 py-4 max-w-2xl shadow-md">
                                                    <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">
                                                        {msg.content}
                                                    </p>
                                                </div>
                                                {user ? (
                                                    <img
                                                        src={user.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg'}
                                                        alt={user.name || 'User'}
                                                        className="w-9 h-9 rounded-full object-cover border border-accent/40 shadow-xs shrink-0 mt-1"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = 'https://incsmsociety.site/uploads/avatar/default.jpg';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center shrink-0 mt-1">
                                                        <UserIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // ASSISTANT MESSAGE BUBBLE
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary text-accent flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                                    <Bot className="w-5 h-5" />
                                                </div>

                                                <div className="flex-1 bg-white rounded-3xl rounded-tl-md p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
                                                    {/* Markdown Render */}
                                                    <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed prose-headings:font-serif prose-headings:text-primary prose-a:text-accent prose-strong:text-primary prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-accent">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>

                                                    {/* Action Toolbar per Response */}
                                                    <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {/* Action Teruskan ke Artikel & PDCA hanya muncul pada respon matang yang panjang */}
                                                            {isMatureLongResponse(msg.content) && (
                                                                <>
                                                                    {/* Tombol Teruskan ke Editor Artikel */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleForwardToArticle(msg.content, msg.content.toLowerCase().includes('studi kasus') ? 'Studi Kasus' : 'Pemikiran Kritis')}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold border border-indigo-200/50 transition-colors cursor-pointer animate-in fade-in"
                                                                        title="Bawa draf matang ini langsung ke Editor Artikel The Fellow"
                                                                    >
                                                                        <PenTool className="w-3.5 h-3.5" />
                                                                        <span>Teruskan ke Editor Artikel</span>
                                                                    </button>

                                                                    {/* Tombol Teruskan ke PDCA Generator */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleForwardToPdca(msg.content)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold border border-emerald-200/50 transition-colors cursor-pointer animate-in fade-in"
                                                                        title="Bawa analisis mendalam ini ke PDCA Generator untuk simulasi Kaizen"
                                                                    >
                                                                        <BrainCircuit className="w-3.5 h-3.5" />
                                                                        <span>Teruskan ke PDCA Generator</span>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 ml-auto">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(msg.content, index)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                                                            >
                                                                {copiedIndex === index ? (
                                                                    <>
                                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                        <span className="text-emerald-600 font-semibold">Tersalin</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                        <span>Salin</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Loading Indicator Saat Menjawab */}
                                {isGenerating && (
                                    <div className="flex items-start gap-3 animate-pulse">
                                        <div className="w-9 h-9 rounded-full bg-primary text-accent flex items-center justify-center shrink-0 mt-1">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 bg-white rounded-3xl rounded-tl-md p-6 border border-gray-100 space-y-3">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-2">
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                <span>Sedang meramu jawaban dan menghubungkan dengan standar H.O.M.E & Kaizen...</span>
                                            </div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Rekomendasi Dokumen / Buku Saku (Menampilkan 2 sampai 6 buku yang cocok) */}
                            {recommendedBooks.length > 0 && !isGenerating && (
                                <div className="mt-12 pt-8 border-t border-gray-200 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-serif text-xl font-bold text-gray-800 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-accent" />
                                            <span>Rekomendasi Publikasi ({recommendedBooks.length} Buku)</span>
                                        </h3>
                                        <span className="text-xs text-gray-500">Pustaka Referensi Resmi</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {recommendedBooks.map((pub) => (
                                            <div
                                                key={pub.id}
                                                onClick={() => navigate('/publikasi')}
                                                className="flex items-center gap-4 p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-accent/40 hover:shadow-md transition-all group cursor-pointer"
                                            >
                                                <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden relative shadow-sm border border-gray-100 bg-gray-50">
                                                    {pub.coverImg ? (
                                                        <img
                                                            src={`${import.meta.env.BASE_URL}${pub.coverImg.substring(1)}`}
                                                            alt={pub.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="bg-red-50 text-red-500 w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                            <FileText className="w-7 h-7" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-grow min-w-0 flex flex-col justify-center">
                                                    <p className="text-sm font-bold text-gray-800 line-clamp-2 mb-1.5 group-hover:text-primary transition-colors leading-snug" title={pub.title}>
                                                        {pub.title}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold truncate">
                                                        {pub.category} &bull; {pub.author}
                                                    </p>
                                                </div>
                                                <div className="text-gray-300 group-hover:text-accent shrink-0 pl-1 transition-colors">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ================= FOLLOW-UP CHAT INPUT BAR ================= */}
                            <div className="sticky bottom-4 pt-4">
                                {user ? (
                                    // JIKA SUDAH LOGIN: Tampilkan kotak input percakapan lanjutan
                                    <form onSubmit={handleSendFollowUp} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-2 flex items-center gap-2 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                                        <textarea
                                            ref={followUpInputRef}
                                            rows={1}
                                            value={followUpInput}
                                            onChange={(e) => setFollowUpInput(e.target.value)}
                                            onKeyDown={handleKeyDownFollowUp}
                                            placeholder="Tanggapi atau lanjutkan percakapan ini (tekan Enter untuk kirim)..."
                                            disabled={isGenerating}
                                            className="flex-1 bg-transparent border-none outline-none resize-none px-4 py-2 text-sm text-gray-700 placeholder-gray-400 max-h-32"
                                        />

                                        <button
                                            type="submit"
                                            disabled={!followUpInput.trim() || isGenerating}
                                            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow shrink-0 cursor-pointer"
                                            title="Kirim Respon Lanjutan"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                ) : (
                                    // JIKA BELUM LOGIN: Tampilkan banner pengingat syarat login untuk multi-turn chat
                                    <div className="bg-gradient-to-r from-slate-900 to-primary text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 text-center sm:text-left">
                                            <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">Lanjutkan Percakapan Interaktif</h4>
                                                <p className="text-xs text-slate-300">
                                                    Masuk (Login) ke akun The Fellow Anda untuk merespons dan melanjutkan diskusi ini tanpa batas.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => navigate('/login')}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
                                        >
                                            <LogIn className="w-4 h-4" />
                                            <span>Login Sekarang</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Toast Alerts */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
