import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Sparkles, FileText, Download, ChevronDown, BookOpen, PenTool, LayoutTemplate, Briefcase, RefreshCw, ArrowLeft, ArrowUp } from 'lucide-react';

const MODELS = [
    { id: 'csm-lite', name: 'CSM Lite', apiModel: 'google/gemma-3-27b-it', requiresAuth: false },
    { id: 'csm-pro', name: 'CSM Pro', apiModel: 'google/gemini-2.5-flash-lite', requiresAuth: true }
];

const PLACEHOLDERS = [
    "Cari panduan implementasi PDCA...",
    "Bagaimana strategi retensi pelanggan terbaik?",
    "Temukan jurnal tentang Contact Center...",
    "Apa itu Customer Success Management?"
];

const SUGGESTIONS = [
    { icon: <BookOpen className="w-4 h-4" />, label: "Pelajari CSM" },
    { icon: <FileText className="w-4 h-4" />, label: "Cari Jurnal" },
    { icon: <Briefcase className="w-4 h-4" />, label: "Studi Kasus" },
    { icon: <PenTool className="w-4 h-4" />, label: "Tulis Artikel" },
    { icon: <LayoutTemplate className="w-4 h-4" />, label: "Template PDCA" }
];

export default function SmartLibrary() {
    const [input, setInput] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [placeholderText, setPlaceholderText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const [selectedModel, setSelectedModel] = useState(MODELS[0]); // Default Lite
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResponseText, setAiResponseText] = useState('');

    const [user, setUser] = useState(null);
    const [publicMembers, setPublicMembers] = useState([]);

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

    useEffect(() => {
        const userData = localStorage.getItem('csm_user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            // Optionally auto-select Pro if logged in
            setSelectedModel(MODELS.find(m => m.id === 'csm-pro'));
        }
    }, []);

    // Typing effect for placeholders
    useEffect(() => {
        if (hasSubmitted) return;

        const currentString = PLACEHOLDERS[placeholderIndex];
        let timeout;

        if (!isDeleting) {
            // Typing
            if (placeholderText.length < currentString.length) {
                timeout = setTimeout(() => {
                    setPlaceholderText(currentString.slice(0, placeholderText.length + 1));
                }, 50);
            } else {
                // Wait before deleting
                timeout = setTimeout(() => setIsDeleting(true), 2000);
            }
        } else {
            // Deleting
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

    const fetchOpenRouter = async (query, apiModel) => {
        const membersContext = publicMembers.length > 0
            ? `\n\n4. Data Keanggotaan (Members & Fellows) Publik:\n${publicMembers.join('\n')}\n(Gunakan data ini HANYA jika ditanya tentang anggota atau tokoh di komunitas).`
            : '';

        try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: apiModel,
                    messages: [
                        {
                            role: "system",
                            content: `Anda adalah AI Asisten Expert Managerial Pelayanan & Customer Experience (CSM) untuk "The Fellow (CSM Intellectual Society)".
Tugas Anda HANYA menjawab pertanyaan seputar pelayanan pelanggan, retensi, operasional contact center/diler, kepuasan pelanggan, strategi manajemen layanan, resolusi masalah, dan keanggotaan "The Fellow". JIKA PENGGUNA BERTANYA HAL LAIN DI LUAR KONTEKS INI, TOLAK SECARA HALUS DAN JANGAN MENJAWABNYA.

Jawablah dengan sangat profesional, analitis, dan solutif. Jika memungkinkan dan relevan, selipkan landasan pedoman "The Fellow" berikut dalam analisis/jawaban Anda:

1. Standar Pelayanan H.O.M.E:
- Hospitality: Keramahan murni, sapaan hangat 3 detik, ketulusan melayani.
- One Service Standard: Konsistensi kualitas (serah terima unit, penanganan keluhan) tanpa diskriminasi.
- Memorable Experience: Menciptakan momen emosional, sentuhan personal, mengingat detail pelanggan.
- Empathy: Menyelami kekhawatiran, mendengar aktif tanpa memotong, solusi penuh kepedulian.

2. Metodologi Resolusi Masalah (PDCA - Continuous Improvement):
- PLAN: Identifikasi akar masalah (5 Why/Fishbone), tentukan target.
- DO: Implementasi skala kecil (pilot project), catat deviasi.
- CHECK: Evaluasi gap data dari baseline, validasi umpan balik.
- ACT: Jadikan SOP standar nasional jika sukses, atau ulangi Plan jika gagal.

3. Nilai Dasar Organisasi (Concordia per Scientiam - Disatukan oleh Pengetahuan):
Mengedepankan Knowledge, Integrity, Collaboration, Innovation, dan Service.${membersContext}

Susun jawaban secara rapi dan sangat terstruktur menggunakan Markdown. PENTING: Gunakan Unordered List (-) atau Ordered List (1., 2.) secara hierarkis (bersarang/nested) untuk setiap poin dan sub-poin penjelasan agar teks menjorok ke kanan (indented) dan mudah dibaca. Jangan gunakan paragraf datar (flat) untuk rincian atau langkah-langkah.`
                        },
                        {
                            role: "user",
                            content: query
                        }
                    ]
                })
            });
            const data = await res.json();
            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else {
                return "Maaf, respon dari AI tidak dapat diproses saat ini.";
            }
        } catch (error) {
            console.error("OpenRouter Error:", error);
            return "Terjadi kesalahan sistem saat menghubungi jaringan AI. Silakan coba beberapa saat lagi.";
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() && !placeholderText) return;

        // Use placeholder text if input is empty
        const query = input.trim() || PLACEHOLDERS[placeholderIndex];
        setInput(query);

        setHasSubmitted(true);
        setIsGenerating(true);
        setAiResponseText('');

        const responseText = await fetchOpenRouter(query, selectedModel.apiModel);
        setAiResponseText(responseText);
        setIsGenerating(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleReset = () => {
        setHasSubmitted(false);
        setInput('');
        setIsGenerating(false);
        setAiResponseText('');
    };

    return (
        <div className="bg-[#f9f9f9] min-h-screen pt-24 pb-12 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto px-4 h-full flex flex-col justify-center min-h-[calc(100vh-12rem)]">

                <AnimatePresence mode="wait">
                    {!hasSubmitted ? (
                        // IDLE STATE
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
                                <Sparkles className="w-8 h-8 text-[#C9A84C]" />
                                <h1 className="font-serif text-4xl sm:text-5xl text-[#3d3d3d] tracking-tight">
                                    Halo, {user ? user.name.split(' ')[0] : 'Fellow'}!
                                </h1>
                            </div>

                            {/* Main Input Box */}
                            <div className="w-full bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 p-2 relative transition-all duration-300 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={placeholderText}
                                    className="w-full bg-transparent border-none outline-none resize-none px-4 py-4 text-gray-700 min-h-[120px] text-lg placeholder-gray-400"
                                />

                                {/* Bottom Action Bar inside Input */}
                                <div className="flex justify-between items-center px-4 pb-2 pt-2">
                                    <div className="flex items-center gap-2">
                                        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                                            <span className="text-xl leading-none">+</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Model Selector */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
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
                                                        className="absolute bottom-full right-0 mb-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden"
                                                    >
                                                        {MODELS.map(m => (
                                                            <div
                                                                key={m.id}
                                                                onClick={() => {
                                                                    if (m.requiresAuth && !user) {
                                                                        alert("Anda harus Login terlebih dahulu untuk menggunakan model CSM Pro.");
                                                                        return;
                                                                    }
                                                                    setSelectedModel(m);
                                                                    setIsModelDropdownOpen(false);
                                                                }}
                                                                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors flex justify-between items-center ${selectedModel.id === m.id ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'} ${m.requiresAuth && !user ? 'opacity-50' : ''}`}
                                                                title={m.requiresAuth && !user ? 'Login Required' : ''}
                                                            >
                                                                <span>{m.name}</span>
                                                                {m.requiresAuth && !user && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Pro</span>}
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="w-px h-4 bg-gray-200"></div>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={(!input.trim() && !placeholderText)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] text-white hover:bg-black transition-colors disabled:opacity-30 disabled:hover:bg-[#1a1a1a] shadow-sm"
                                        >
                                            <ArrowUp className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="flex flex-wrap justify-center gap-3 mt-6">
                                {SUGGESTIONS.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setInput(item.label);
                                            // Optional: automatically submit when clicking a suggestion
                                            // setTimeout(() => handleSubmit({ preventDefault: () => {} }), 100);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                                    >
                                        <span className="text-gray-400">{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        // SUBMITTED / ANSWER STATE
                        <motion.div
                            key="submitted"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="w-full max-w-4xl mx-auto"
                        >
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-8"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Kembali ke Pencarian
                            </button>

                            <div className="mb-10">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{input}</h2>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Sparkles className="w-4 h-4 text-accent" />
                                    <span>Dijawab oleh {selectedModel.name}</span>
                                </div>
                            </div>

                            {isGenerating ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in duration-700">
                                    <div className="prose prose-lg prose-slate prose-headings:text-primary prose-a:text-accent prose-strong:text-primary prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-accent/70 max-w-none text-gray-700 leading-relaxed">
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{aiResponseText}</ReactMarkdown>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <h3 className="font-serif text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-accent" />
                                            Rekomendasi Dokumen (Dummy Data)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { title: 'Panduan Evaluasi KPI Contact Center 2026.pdf', size: '2.4 MB', type: 'PDF' },
                                                { title: 'Studi Kasus PDCA: Penurunan AHT di Industri Finansial.pdf', size: '1.8 MB', type: 'PDF' },
                                                { title: 'Customer Success Management Handbook Vol 3.pdf', size: '5.1 MB', type: 'PDF' },
                                                { title: 'Template Strategi Retensi Pelanggan B2B.docx', size: '840 KB', type: 'DOCX' }
                                            ].map((file, idx) => (
                                                <a
                                                    key={idx}
                                                    href="#"
                                                    onClick={(e) => e.preventDefault()}
                                                    className="flex items-start gap-4 p-4 rounded-2xl border border-gray-200 bg-white hover:border-accent/40 hover:shadow-md transition-all group cursor-pointer"
                                                >
                                                    <div className="bg-red-50 text-red-500 p-3 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                                                        <FileText className="w-7 h-7" />
                                                    </div>
                                                    <div className="flex-grow min-w-0 flex flex-col justify-center h-full">
                                                        <p className="text-sm font-bold text-gray-800 truncate mb-1 group-hover:text-primary transition-colors">{file.title}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {file.type} • {file.size}
                                                        </p>
                                                    </div>
                                                    <div className="text-gray-300 group-hover:text-accent shrink-0 pt-2 transition-colors">
                                                        <Download className="w-5 h-5" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-gray-200 flex justify-center">
                                        <button
                                            onClick={handleReset}
                                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all shadow-sm"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Mulai Pencarian Baru
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
