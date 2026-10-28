import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Send,
    Copy,
    Check,
    ClipboardPaste,
    RotateCcw,
    Sparkles,
    User,
    Briefcase,
    FileText,
    CheckCircle2,
    Trash2,
    Edit3,
    Eye,
    Settings2,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    AlertCircle,
    Info,
    ArrowRight
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Toast from '../components/shared/Toast';

const QUICK_CONTEXT_PRESETS = [
    {
        label: "Komplain Penundaan Servis",
        text: "Sampaikan permohonan maaf mendalam atas penundaan pengerjaan servis berkala. Jelaskan bahwa kendala ada pada pengecekan sistem kelistrikan agar kendaraan benar-benar aman. Estimasi selesai hari ini pukul 16.30 WIB dan kami berikan voucher diskon jasa 15% serta gratis car wash."
    },
    {
        label: "Update Spare Part Ready",
        text: "Informasikan bahwa suku cadang resmi (genuine parts) yang dipesan sudah tiba di bengkel diler hari ini. Undang pelanggan untuk memilih jadwal pemasangan besok pagi atau lusa, dan kami siapkan jalur prioritas tanpa antre panjang."
    },
    {
        label: "Follow-up Kepuasan Pelanggan",
        text: "Ucapkan terima kasih atas kunjungan servis berkala kemarin. Tanyakan apakah performa kendaraan sudah kembali optimal dan tanyakan apakah ada kendala atau masukan yang perlu kami bantu tindak lanjuti secara langsung."
    },
    {
        label: "Penjelasan Klaim Garansi",
        text: "Sampaikan dengan santun dan transparan mengenai hasil inspeksi teknis terkait pengajuan klaim garansi. Jelaskan poin-poin yang dapat dicover sesuai buku manual servis resmi dan tawarkan opsi solusi alternatif yang paling efisien bagi pelanggan."
    }
];

const TONE_OPTIONS = [
    { id: 'home', label: 'Empatik & Solutif (Standar H.O.M.E)', desc: 'Hangat, mendengarkan aktif, mengutamakan ketenangan pelanggan' },
    { id: 'formal', label: 'Formal & Eksekutif', desc: 'Resmi, lugas, cocok untuk korespondensi manajemen & principal' },
    { id: 'tegas', label: 'Santun & Lugas', desc: 'Jelas dalam batas regulasi/kebijakan tanpa mengurangi kesantunan' },
    { id: 'apresiatif', label: 'Hangat & Apresiatif', desc: 'Akrab, bersahabat, mempererat hubungan loyalitas pelanggan' }
];

export default function EmailReply() {
    useDocumentTitle('Email Reply Assistant');

    // Ambil data user dari PanelLayout context atau localStorage
    const outletContext = useOutletContext();
    const [user, setUser] = useState(outletContext?.user || null);

    // Form states
    const [incomingEmail, setIncomingEmail] = useState('');
    const [replyIntent, setReplyIntent] = useState('');
    const [selectedTone, setSelectedTone] = useState('home');
    const [language, setLanguage] = useState('id'); // 'id' | 'en'

    // Penandatangan / Signature settings
    const [senderName, setSenderName] = useState('');
    const [senderTitle, setSenderTitle] = useState('Customer Satisfaction Manager');
    const [isSignatureCustom, setIsSignatureCustom] = useState(false);
    const [showSignatureSettings, setShowSignatureSettings] = useState(false);

    // Result states
    const [generatedSubject, setGeneratedSubject] = useState('');
    const [generatedBody, setGeneratedBody] = useState('');
    const [isEditingBody, setIsEditingBody] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Copy states & Toast
    const [copiedType, setCopiedType] = useState(null); // 'all' | 'subject' | 'body'
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const API_BASE = import.meta.env.VITE_API_URL || 'https://incsmsociety.site/api';

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
    };

    // Sinkronisasi data user yang login
    useEffect(() => {
        if (!user) {
            const stored = localStorage.getItem('csm_user');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setUser(parsed);
                } catch (e) {
                    console.error("Gagal memuat csm_user", e);
                }
            }
        }
    }, [user]);

    useEffect(() => {
        if (user && !isSignatureCustom) {
            setSenderName(user.name || 'CSM Fellow');
            setSenderTitle(user.csm_title || user.title || 'Customer Satisfaction Manager');
        }
    }, [user, isSignatureCustom]);

    // Handler Paste dari Clipboard
    const handlePasteIncoming = async () => {
        try {
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                showToast("Browser tidak mengizinkan akses clipboard otomatis. Silakan tekan Ctrl+V di textarea.", "error");
                return;
            }
            const text = await navigator.clipboard.readText();
            if (text && text.trim()) {
                setIncomingEmail(text.trim());
                showToast("Email berhasil ditempel dari clipboard!", "success");
            } else {
                showToast("Clipboard kosong atau tidak berisi teks.", "error");
            }
        } catch (err) {
            showToast("Gagal membaca clipboard. Silakan gunakan shortcut Ctrl+V.", "error");
        }
    };

    // Handler Generate Email Balasan
    const handleGenerateEmail = async () => {
        if (!incomingEmail.trim()) {
            showToast("Silakan masukkan email yang Anda terima terlebih dahulu.", "error");
            return;
        }
        if (!replyIntent.trim()) {
            showToast("Silakan tuliskan niat/poin balasan yang ingin Anda berikan.", "error");
            return;
        }

        setIsLoading(true);

        const currentName = senderName.trim() || (user?.name || 'Customer Success Manager');
        const currentTitle = senderTitle.trim() || 'Customer Satisfaction Manager';

        const systemPrompt = `Anda adalah "The Fellow AI Email Reply Specialist" - asisten eksekutif komunikasi bisnis dan pakar Customer Success Management (CSM) di industri diler otomotif modern (khususnya Mitsubishi Motors).

TUGAS UTAMA:
Menyusun draf balasan email profesional yang sempurna, berstruktur resmi, empatik, dan langsung siap dikirim.

PEDOMAN STRUKTUR EMAIL:
1. SUBJECT:
   - Buat subject email yang relevan, solutif, dan profesional (misal berawalan "Re: ...").
2. SALUTASI:
   - Sapaan hormat yang santun (ekstrak nama pengirim dari email masuk jika ada, misal: "Yth. Bapak/Ibu [Nama Pengirim]", atau gunakan "Yth. Bapak/Ibu Pelanggan Setia").
3. PEMBUKA & EMPATI (STANDAR H.O.M.E):
   - Ucapkan terima kasih atas email yang dikirimkan. Tunjukkan empati, apresiasi, atau pengakuan atas waktu/kendala pelanggan dengan tulus.
4. INTI BALASAN & SOLUSI:
   - Akodomasikan SELURUH poin niat balasan dan konteks yang diinputkan pengguna. Jabarkan dengan bahasa yang elegan, transparan, dan solutif.
5. LANGKAH TINDAK LANJUT (NEXT STEPS):
   - Sebutkan kejelasan waktu, estimasi, nomor kontak narahubung, atau janji temu bila relevan.
6. PENUTUP & TANDA TANGAN (SIGN-OFF):
   - Tanda tangan penutup HARUS menggunakan format PERSIS di bawah ini (tanpa modifikasi):

Hormat Kami
-
${currentName}
${currentTitle}

PILIHAN NADA/TONE: ${selectedTone.toUpperCase()}
BAHASA: ${language === 'en' ? 'Bahasa Inggris' : 'Bahasa Indonesia'}

FORMAT KELUARAN (WAJIB JSON MURNI):
{
  "subject": "Judul Subjek Email di sini",
  "body": "Isi lengkap email mulai dari salutasi hingga tanda tangan Hormat Kami di sini"
}`;

        const userPrompt = `EMAIL YANG DITERIMA:
"""
${incomingEmail.trim()}
"""

NIAT/POIN BALASAN DARI SAYA:
"""
${replyIntent.trim()}
"""

Harap buatkan draf balasan email lengkap sesuai struktur di atas dalam format JSON dengan kunci "subject" dan "body".`;

        try {
            const res = await fetch(`${API_BASE}/openrouter.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: 'google/gemini-3.1-flash-lite',
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ]
                })
            });

            const data = await res.json();

            if (data.choices && data.choices.length > 0) {
                let rawContent = data.choices[0].message.content;

                // Parsing JSON dari AI response
                try {
                    if (rawContent.includes('```json')) {
                        rawContent = rawContent.split('```json')[1].split('```')[0].trim();
                    } else if (rawContent.includes('```')) {
                        rawContent = rawContent.split('```')[1].split('```')[0].trim();
                    }
                    const parsed = JSON.parse(rawContent);

                    setGeneratedSubject(parsed.subject || 'Re: Tindak Lanjut Layanan & Kepuasan Pelanggan');
                    
                    // Pastikan sign-off tetap sesuai struktur yang diminta
                    let finalBody = parsed.body || '';
                    if (!finalBody.includes(currentName)) {
                        finalBody += `\n\nHormat Kami\n-\n${currentName}\n${currentTitle}`;
                    }
                    setGeneratedBody(finalBody);
                } catch (jsonErr) {
                    // Fallback jika respon bukan JSON murni
                    const lines = rawContent.split('\n');
                    const subjectLine = lines.find(l => l.toLowerCase().startsWith('subject:') || l.toLowerCase().startsWith('subjek:'));
                    if (subjectLine) {
                        setGeneratedSubject(subjectLine.replace(/^(subject|subjek):\s*/i, '').trim());
                        setGeneratedBody(lines.filter(l => l !== subjectLine).join('\n').trim());
                    } else {
                        setGeneratedSubject('Re: Tanggapan dan Tindak Lanjut Layanan');
                        setGeneratedBody(rawContent);
                    }
                }

                showToast("Draf balasan email berhasil digenerate!", "success");
            } else if (data.error) {
                showToast(`Gagal: ${data.error.message || 'Server AI tidak merespons'}`, "error");
            } else {
                showToast("Respon dari AI tidak dapat diproses saat ini.", "error");
            }
        } catch (error) {
            console.error("Email Reply Gen Error:", error);
            showToast("Terjadi kesalahan koneksi saat menghubungi server AI.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Salin ke Clipboard dengan Feedback
    const handleCopy = (text, type = 'all') => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedType(type);
        const label = type === 'all' ? 'Seluruh draft email (Subjek & Isi)' : type === 'subject' ? 'Subjek email' : 'Isi email';
        showToast(`${label} berhasil disalin ke clipboard!`, 'success');
        setTimeout(() => setCopiedType(null), 2500);
    };

    // Buka aplikasi email default perangkat dengan mailto:
    const handleOpenMailClient = () => {
        if (!generatedBody) {
            showToast("Draf email belum dibuat.", "error");
            return;
        }

        // Coba deteksi email pengirim jika ada di teks email yang diterima
        const emailMatch = incomingEmail.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        const recipient = emailMatch ? emailMatch[1] : '';

        const subjectParam = encodeURIComponent(generatedSubject || '');
        const bodyParam = encodeURIComponent(generatedBody || '');

        const mailtoUrl = `mailto:${recipient}?subject=${subjectParam}&body=${bodyParam}`;

        // Salin seluruh email ke clipboard sebagai backup
        navigator.clipboard.writeText(`Subject: ${generatedSubject}\n\n${generatedBody}`);

        // Buka client email perangkat
        window.location.href = mailtoUrl;

        showToast(
            recipient 
                ? `Membuka aplikasi email untuk ${recipient}...` 
                : "Membuka aplikasi email di perangkat Anda...", 
            "success"
        );
    };

    // Gabungan seluruh email untuk tombol Salin Seluruh Email
    const fullEmailText = `Subject: ${generatedSubject}\n\n${generatedBody}`;

    const handleResetAll = () => {
        setIncomingEmail('');
        setReplyIntent('');
        setGeneratedSubject('');
        setGeneratedBody('');
        setIsEditingBody(false);
    };

    return (
        <div className="min-h-screen bg-surface-warm pb-20 font-sans text-gray-800">
            {/* Header Page */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/15 text-accent-dark border border-accent/25">
                                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                                    AI Tools CSM
                                </span>
                                <span className="text-xs text-gray-400">&bull; Standar H.O.M.E</span>
                            </div>
                            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                                Generator Balasan Email
                            </h1>
                            <p className="text-gray-500 text-sm mt-1 max-w-2xl">
                                Buat draf balasan email profesional, empatik, dan berstruktur resmi dalam hitungan detik. Cukup tempel email yang diterima dan tentukan niat balasan Anda.
                            </p>
                        </div>

                        {/* Sign-off info chip */}
                        <div className="bg-surface-card border border-accent/30 rounded-2xl p-3.5 sm:min-w-[260px] shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                    <User className="w-3.5 h-3.5 text-accent" />
                                    <span>Tanda Tangan Pengirim</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowSignatureSettings(!showSignatureSettings)}
                                    className="text-[11px] font-medium text-accent hover:text-accent-dark transition-colors cursor-pointer flex items-center gap-1"
                                    title="Ubah identitas pengirim"
                                >
                                    <Settings2 className="w-3 h-3" />
                                    <span>{showSignatureSettings ? 'Tutup' : 'Ubah'}</span>
                                </button>
                            </div>
                            <p className="text-sm font-bold text-gray-800 truncate">{senderName || 'Barod Manggala'}</p>
                            <p className="text-xs text-gray-500 truncate">{senderTitle || 'Customer Satisfaction Manager'}</p>
                        </div>
                    </div>

                    {/* Expandable Signature Settings */}
                    <AnimatePresence>
                        {showSignatureSettings && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-4 pt-4 border-t border-gray-100"
                            >
                                <div className="bg-surface-card/60 p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Nama Penandatangan (Hormat Kami)</label>
                                        <input
                                            type="text"
                                            value={senderName}
                                            onChange={(e) => {
                                                setSenderName(e.target.value);
                                                setIsSignatureCustom(true);
                                            }}
                                            placeholder="Contoh: Barod Manggala"
                                            className="w-full text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Jabatan CSM / Gelar Profesi</label>
                                        <input
                                            type="text"
                                            value={senderTitle}
                                            onChange={(e) => {
                                                setSenderTitle(e.target.value);
                                                setIsSignatureCustom(true);
                                            }}
                                            placeholder="Contoh: Customer Satisfaction Manager"
                                            className="w-full text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-accent"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* 2-Column Grid Input */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* FIELD 1: Email yang Diterima */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between transition-all focus-within:shadow-md focus-within:border-accent/40">
                        <div>
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-primary">1. Email yang Diterima</h2>
                                        <p className="text-xs text-gray-400">Salin & tempel email dari pelanggan / rekan</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePasteIncoming}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/15 text-primary hover:bg-accent hover:text-slate-950 text-xs font-semibold border border-accent/30 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                                        title="Tempel teks langsung dari clipboard"
                                    >
                                        <ClipboardPaste className="w-3.5 h-3.5 text-accent-dark" />
                                        <span>Paste Clipboard</span>
                                    </button>

                                    {incomingEmail && (
                                        <button
                                            type="button"
                                            onClick={() => setIncomingEmail('')}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            title="Kosongkan"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <textarea
                                value={incomingEmail}
                                onChange={(e) => setIncomingEmail(e.target.value)}
                                rows={8}
                                placeholder="Tempelkan isi email yang Anda terima di sini...&#10;&#10;Contoh:&#10;Yth. Tim CSM Mitsubishi,&#10;Saya ingin menanyakan status servis Xpander saya dengan nopol B 1234 ABC yang dijanjikan selesai siang ini, namun belum ada kabar dari Service Advisor..."
                                className="w-full bg-surface-warm/40 border border-gray-200 rounded-2xl p-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all resize-y min-h-[180px]"
                            />
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-100 mt-3">
                            <span>Mendukung teks email bahasa Indonesia & Inggris</span>
                            <span>{incomingEmail.length} Karakter</span>
                        </div>
                    </div>

                    {/* FIELD 2: Balasan Apa yang Mau Diberikan */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between transition-all focus-within:shadow-md focus-within:border-accent/40">
                        <div>
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-accent/20 text-accent-dark flex items-center justify-center font-bold">
                                        <Send className="w-4 h-4 text-accent" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-primary">2. Poin & Niat Balasan</h2>
                                        <p className="text-xs text-gray-400">Isikan semua instruksi, solusi, dan niat balasan</p>
                                    </div>
                                </div>

                                {replyIntent && (
                                    <button
                                        type="button"
                                        onClick={() => setReplyIntent('')}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        title="Kosongkan"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <textarea
                                value={replyIntent}
                                onChange={(e) => setReplyIntent(e.target.value)}
                                rows={8}
                                placeholder="Tuliskan poin penting yang ingin Anda sampaikan secara bebas...&#10;&#10;Contoh:&#10;- Minta maaf atas keterlambatan konfirmasi&#10;- Jelaskan mobil sedang proses final inspection & uji jalan kelistrikan&#10;- Estimasi mobil siap diserahterimakan jam 16.00 WIB&#10;- Berikan gratis voucher car wash untuk kedatangan berikutnya"
                                className="w-full bg-surface-warm/40 border border-gray-200 rounded-2xl p-4 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all resize-y min-h-[180px]"
                            />
                        </div>

                        {/* Quick Presets */}
                        <div className="pt-3 border-t border-gray-100 mt-3">
                            <p className="text-[11px] font-semibold text-gray-400 mb-2">Inspirasi Cepat / Template Konteks:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_CONTEXT_PRESETS.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setReplyIntent(preset.text)}
                                        className="text-[11px] font-medium px-2.5 py-1 bg-surface-warm hover:bg-accent/15 text-gray-600 hover:text-primary rounded-lg border border-gray-200 transition-colors cursor-pointer truncate max-w-full"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tone & Options Bar + Submit */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
                        {/* Nada Bicara */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-600">Gaya Bahasa / Nada:</label>
                            <select
                                value={selectedTone}
                                onChange={(e) => setSelectedTone(e.target.value)}
                                className="text-sm font-medium bg-surface-warm border border-gray-200 rounded-xl px-3.5 py-2 text-gray-800 outline-none focus:border-accent cursor-pointer"
                            >
                                {TONE_OPTIONS.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Pilihan Bahasa */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-600">Bahasa Output:</label>
                            <div className="flex rounded-xl bg-surface-warm p-1 border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setLanguage('id')}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${language === 'id' ? 'bg-primary text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Indonesia
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLanguage('en')}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${language === 'en' ? 'bg-primary text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    English
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Eksekusi Generator */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        {(incomingEmail || replyIntent || generatedBody) && (
                            <button
                                type="button"
                                onClick={handleResetAll}
                                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                Reset Form
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleGenerateEmail}
                            disabled={isLoading || !incomingEmail.trim() || !replyIntent.trim()}
                            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-primary text-accent hover:bg-slate-900 font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                                    <span>Menyusun Email Profesional...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 text-accent" />
                                    <span>Buat Draf Balasan Email</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* OUTPUT DRAFT EMAIL SECTION */}
                <AnimatePresence>
                    {generatedBody && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-3xl border-2 border-accent/30 shadow-lg p-6 sm:p-8 space-y-6"
                        >
                            {/* Output Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/50 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-primary">Draf Balasan Email Siap Kirim</h3>
                                        <p className="text-xs text-gray-500">Struktur email telah disesuaikan dengan standar H.O.M.E diler</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingBody(!isEditingBody)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${isEditingBody ? 'bg-primary text-white border-primary' : 'bg-surface-warm hover:bg-gray-200 text-gray-700 border-gray-200'}`}
                                    >
                                        {isEditingBody ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                                        <span>{isEditingBody ? 'Mode Pratinjau' : 'Edit Draf'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleCopy(fullEmailText, 'all')}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-warm hover:bg-gray-200 text-gray-700 font-semibold text-xs border border-gray-200 transition-all cursor-pointer"
                                        title="Salin subjek dan seluruh isi pesan ke clipboard"
                                    >
                                        {copiedType === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedType === 'all' ? 'Tersalin!' : 'Salin Semua'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleOpenMailClient}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-primary font-bold text-xs hover:bg-accent-light transition-all shadow-sm cursor-pointer active:scale-95"
                                        title="Buka langsung draf ini di aplikasi email bawaan perangkat (Outlook, Apple Mail, Thunderbird, dll)"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>Kirim Email</span>
                                    </button>
                                </div>
                            </div>

                            {/* Subjek Email */}
                            <div className="bg-surface-warm/40 p-4 rounded-2xl border border-gray-200 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Subjek Email:</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(generatedSubject, 'subject')}
                                        className="text-xs font-semibold text-accent hover:text-accent-dark flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                        {copiedType === 'subject' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                        <span>{copiedType === 'subject' ? 'Subjek Tersalin' : 'Salin Subjek'}</span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={generatedSubject}
                                    onChange={(e) => setGeneratedSubject(e.target.value)}
                                    className="w-full text-base font-bold text-primary bg-transparent border-none outline-none focus:ring-1 focus:ring-accent rounded px-1"
                                />
                            </div>

                            {/* Isi Email */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Isi Email:</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(generatedBody, 'body')}
                                        className="text-xs font-semibold text-accent hover:text-accent-dark flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                        {copiedType === 'body' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                        <span>{copiedType === 'body' ? 'Isi Pesan Tersalin' : 'Salin Isi Saja'}</span>
                                    </button>
                                </div>

                                {isEditingBody ? (
                                    <textarea
                                        value={generatedBody}
                                        onChange={(e) => setGeneratedBody(e.target.value)}
                                        rows={14}
                                        className="w-full p-5 bg-white border border-gray-300 rounded-2xl text-sm leading-relaxed text-gray-800 outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 font-mono"
                                    />
                                ) : (
                                    <div className="p-6 bg-surface-card/60 rounded-2xl border border-gray-200 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap font-sans space-y-4">
                                        {generatedBody}
                                    </div>
                                )}
                            </div>

                            {/* Sign-off Structure Preview Card */}
                            <div className="p-4 bg-primary/5 rounded-2xl border border-accent/20 flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 text-accent" />
                                    <span>Penutup resmi terverifikasi: <strong>Hormat Kami</strong> &bull; <strong>{senderName}</strong> ({senderTitle})</span>
                                </div>
                                <span className="text-[11px] text-gray-400">Siap langsung dipaste ke Outlook / Gmail diler</span>
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
