import React, { useState, useEffect, useRef } from 'react';
import {
    Bot,
    Key,
    Mail,
    ShieldCheck,
    ExternalLink,
    Copy,
    Check,
    Eye,
    EyeOff,
    RefreshCw,
    ArrowRight,
    Sparkles,
    Lock,
    AlertCircle,
    Info,
    CheckCircle2
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Toast from '../components/shared/Toast';

export default function AiRoleplay() {
    useDocumentTitle('AI Roleplay & API Key');

    // Mengambil user login dari localStorage
    const [currentUser, setCurrentUser] = useState(null);
    const [email, setEmail] = useState('');

    // States untuk tahapan flow: 'idle' | 'otp_sent' | 'verified'
    const [step, setStep] = useState('idle');
    const [otp, setOtp] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Loading & Timer states
    const [isRequesting, setIsRequesting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [otpExpiresIn, setOtpExpiresIn] = useState(600); // 10 menit

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const otpInputRef = useRef(null);

    const API_BASE = import.meta.env.VITE_API_URL || 'https://incsmsociety.site/api';

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
    };

    useEffect(() => {
        const stored = localStorage.getItem('csm_user');
        if (stored) {
            try {
                const u = JSON.parse(stored);
                setCurrentUser(u);
                if (u.email) setEmail(u.email);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Timer cooldown kirim ulang OTP
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Timer expiry OTP (10 menit)
    useEffect(() => {
        let timer;
        if (step === 'otp_sent' && otpExpiresIn > 0) {
            timer = setInterval(() => {
                setOtpExpiresIn(prev => {
                    if (prev <= 1) {
                        showToast('Kode OTP telah kedaluwarsa. Silakan minta kode baru.', 'error');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, otpExpiresIn]);

    // Auto-focus input OTP saat beralih ke step 'otp_sent'
    useEffect(() => {
        if (step === 'otp_sent' && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [step]);

    // Format timer menit:detik
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // 1. Request OTP ke Backend
    const handleRequestOtp = async (e) => {
        if (e) e.preventDefault();

        if (!email || !email.includes('@')) {
            showToast('Alamat email tidak valid.', 'error');
            return;
        }

        setIsRequesting(true);
        try {
            const res = await fetch(`${API_BASE}/request_ai_key_otp.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await res.json();

            if (res.ok && data.status === 'success') {
                setStep('otp_sent');
                setOtp('');
                setResendCooldown(60); // 60 detik cooldown
                setOtpExpiresIn(600);  // 10 menit expiry
                showToast(data.message || 'Kode OTP berhasil dikirim ke email Anda!', 'success');
            } else {
                showToast(data.message || 'Gagal mengirim kode OTP.', 'error');
            }
        } catch (error) {
            console.error('Request OTP Error:', error);
            showToast('Terjadi kesalahan koneksi saat mengirim OTP.', 'error');
        } finally {
            setIsRequesting(false);
        }
    };

    // 2. Verifikasi OTP & Ambil API Key
    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        const cleanOtp = otp.replace(/\D/g, '');
        if (cleanOtp.length !== 6) {
            showToast('Harap masukkan 6 digit kode OTP lengkap.', 'error');
            return;
        }

        setIsVerifying(true);
        try {
            const res = await fetch(`${API_BASE}/verify_ai_key_otp.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    otp: cleanOtp
                })
            });

            const data = await res.json();

            if (res.ok && data.status === 'success' && data.apiKey) {
                setApiKey(data.apiKey);
                setStep('verified');
                setShowKey(false);
                showToast(data.message || 'Verifikasi berhasil! API Key siap digunakan.', 'success');
            } else {
                showToast(data.message || 'Kode OTP tidak valid atau kedaluwarsa.', 'error');
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);
            showToast('Terjadi kesalahan koneksi saat memverifikasi OTP.', 'error');
        } finally {
            setIsVerifying(false);
        }
    };

    // 3. Salin API Key ke Clipboard
    const handleCopyKey = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey);
        setIsCopied(true);
        showToast('API Key berhasil disalin ke clipboard!', 'success');
        setTimeout(() => setIsCopied(false), 2500);
    };

    // Reset flow kembali ke awal
    const handleReset = () => {
        setStep('idle');
        setOtp('');
        setApiKey('');
        setShowKey(false);
        setIsCopied(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Tools CSM &bull; Akses Eksklusif Anggota</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-primary">AI Roleplay & API Key</h1>
                    <p className="text-gray-500 mt-2 max-w-2xl text-sm sm:text-base leading-relaxed">
                        Simulator interaktif penanganan skenario pelanggan dan komplain berbasis standar layanan H.O.M.E. Dapatkan API Key melalui verifikasi OTP email Anda untuk mengakses aplikasi utama.
                    </p>
                </div>

                {/* Direct Link to wai.bewhy.id */}
                <a
                    href="https://wai.bewhy.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-primary bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow transition-all group shrink-0"
                >
                    <Bot className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                    <span>Buka AI Roleplay</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                </a>
            </div>

            {/* Application Overview Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-slate-900 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2 space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md text-xs font-medium text-accent">
                            <Bot className="w-4 h-4" />
                            <span>Simulator Percakapan CSM Cerdas</span>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
                            WAI - AI Roleplay Pelayanan & Komplain
                        </h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Aplikasi eksternal yang dirancang khusus untuk menguji kemampuan komunikasi, empati, dan resolusi masalah personel pelayanan pelanggan (CSM) dalam menghadapi berbagai persona nasabah.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
                        <div className="space-y-1 mb-4">
                            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Persyaratan Akses</span>
                            <div className="flex items-center gap-2 text-white font-medium text-sm">
                                <Key className="w-4 h-4 text-accent" />
                                <span>Memerlukan API Key Aktif</span>
                            </div>
                        </div>
                        <div className="text-xs text-slate-300 border-t border-white/10 pt-3">
                            Verifikasi email anggota untuk mendapatkan kunci akses resmi The Fellow.
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Interactive Flow Box */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
                {/* Flow Stepper Indicator */}
                <div className="flex items-center justify-center max-w-xl mx-auto mb-10">
                    <div className="flex items-center w-full">
                        {/* Step 1 Indicator */}
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === 'idle'
                                    ? 'bg-primary text-white shadow-md shadow-primary/20 ring-4 ring-primary/10'
                                    : 'bg-emerald-500 text-white'
                                }`}>
                                {step !== 'idle' ? <Check className="w-5 h-5" /> : '1'}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${step === 'idle' ? 'text-primary font-bold' : 'text-gray-500'}`}>
                                Permintaan
                            </span>
                        </div>

                        {/* Divider 1-2 */}
                        <div className={`h-1 flex-1 transition-colors duration-300 ${step !== 'idle' ? 'bg-emerald-500' : 'bg-gray-200'}`} />

                        {/* Step 2 Indicator */}
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === 'otp_sent'
                                    ? 'bg-primary text-white shadow-md shadow-primary/20 ring-4 ring-primary/10'
                                    : step === 'verified'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-100 text-gray-400'
                                }`}>
                                {step === 'verified' ? <Check className="w-5 h-5" /> : '2'}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${step === 'otp_sent' ? 'text-primary font-bold' : 'text-gray-500'}`}>
                                Verifikasi OTP
                            </span>
                        </div>

                        {/* Divider 2-3 */}
                        <div className={`h-1 flex-1 transition-colors duration-300 ${step === 'verified' ? 'bg-emerald-500' : 'bg-gray-200'}`} />

                        {/* Step 3 Indicator */}
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === 'verified'
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-500/10'
                                    : 'bg-gray-100 text-gray-400'
                                }`}>
                                <Key className="w-5 h-5" />
                            </div>
                            <span className={`text-xs mt-2 font-medium ${step === 'verified' ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}>
                                Dapatkan Key
                            </span>
                        </div>
                    </div>
                </div>

                {/* ================= STEP 1: IDLE / REQUEST OTP ================= */}
                {step === 'idle' && (
                    <div className="max-w-xl mx-auto space-y-6 text-center animate-in fade-in duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 text-accent mx-auto flex items-center justify-center shadow-inner">
                            <Mail className="w-8 h-8" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-serif font-bold text-gray-800">Request Kunci Akses (API Key)</h3>
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                                Untuk menjaga keamanan organisasi dan alokasi kuota AI, kode One-Time Password (OTP) 6 digit akan dikirimkan ke alamat email terdaftar Anda.
                            </p>
                        </div>

                        {/* Current User Info Box */}
                        <div className="bg-surface-warm/80 rounded-2xl p-5 border border-gray-100 text-left space-y-2">
                            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400 block">Identitas Anggota</span>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-semibold text-gray-800">{currentUser?.name || 'Anggota The Fellow'}</div>
                                    <div className="text-sm text-gray-500 font-mono">{email || 'email@incsmsociety.site'}</div>
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase">
                                    {currentUser?.role || 'Member'}
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleRequestOtp}
                                disabled={isRequesting}
                                className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-60 cursor-pointer"
                            >
                                {isRequesting ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        <span>Mengirim Kode OTP...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-5 h-5" />
                                        <span>Kirim Kode OTP ke Email Saya</span>
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-4">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span>Verifikasi aman terenkripsi &bull; Berlaku 10 menit</span>
                        </div>
                    </div>
                )}

                {/* ================= STEP 2: ENTER OTP ================= */}
                {step === 'otp_sent' && (
                    <form onSubmit={handleVerifyOtp} className="max-w-md mx-auto space-y-6 text-center animate-in fade-in duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center shadow-inner">
                            <Lock className="w-8 h-8" />
                        </div>

                        <div>
                            <h3 className="text-2xl font-serif font-bold text-gray-800">Masukkan 6 Digit OTP</h3>
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                                Kode verifikasi telah dikirimkan ke <br />
                                <strong className="text-gray-800">{email}</strong>
                            </p>
                        </div>

                        {/* OTP Input Field */}
                        <div className="space-y-2">
                            <input
                                ref={otpInputRef}
                                type="text"
                                maxLength={6}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                required
                                className="w-full text-center text-3xl sm:text-4xl font-mono font-bold tracking-[12px] sm:tracking-[16px] py-4 px-4 bg-gray-50 border-2 border-gray-200 focus:border-primary focus:bg-white rounded-2xl outline-none transition-all text-gray-800 placeholder-gray-300 shadow-inner"
                            />
                            <div className="flex justify-between items-center text-xs text-gray-500 px-1 pt-1">
                                <span>Masa berlaku kode:</span>
                                <span className={`font-mono font-bold ${otpExpiresIn < 60 ? 'text-red-500' : 'text-primary'}`}>
                                    {formatTime(otpExpiresIn)}
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="space-y-3 pt-2">
                            <button
                                type="submit"
                                disabled={isVerifying || otp.length !== 6}
                                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isVerifying ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        <span>Memverifikasi OTP...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Verifikasi & Tampilkan API Key</span>
                                    </>
                                )}
                            </button>

                            {/* Resend & Cancel Options */}
                            <div className="flex items-center justify-between text-xs pt-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Batal / Ganti Akun
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRequestOtp}
                                    disabled={resendCooldown > 0 || isRequesting}
                                    className="font-semibold text-primary hover:underline disabled:text-gray-400 disabled:no-underline flex items-center gap-1"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isRequesting ? 'animate-spin' : ''}`} />
                                    <span>
                                        {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : 'Kirim Ulang Kode'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left flex gap-2.5 items-start">
                            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                Tidak menerima email? Periksa folder <strong>Spam / Junk</strong> Anda atau pastikan alamat email yang terdaftar sudah tepat.
                            </p>
                        </div>
                    </form>
                )}

                {/* ================= STEP 3: VERIFIED / API KEY REVEALED ================= */}
                {step === 'verified' && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
                        {/* Success Header */}
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
                                <CheckCircle2 className="w-9 h-9" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                Verifikasi Berhasil
                            </span>
                            <h3 className="text-2xl font-serif font-bold text-gray-800 pt-1">
                                Kunci Akses (API Key) Siap Digunakan
                            </h3>
                            <p className="text-gray-500 text-sm max-w-md mx-auto">
                                Salin API Key di bawah dan gunakan saat membuka aplikasi <strong>AI Roleplay</strong>.
                            </p>
                        </div>

                        {/* API Key Box */}
                        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
                            <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-2.5">
                                <div className="flex items-center gap-2 font-medium">
                                    <Key className="w-4 h-4 text-accent" />
                                    <span>OPENROUTER_API_KEY</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        {showKey ? (
                                            <>
                                                <EyeOff className="w-3.5 h-3.5" />
                                                <span>Sembunyikan</span>
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Tampilkan</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* The Key String */}
                            <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                                <div className="flex-1 font-mono text-sm sm:text-base text-accent font-semibold tracking-wide overflow-x-auto select-all">
                                    {showKey ? apiKey : apiKey.replace(/./g, '•').slice(0, 38) + '...'}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCopyKey}
                                    className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer ${isCopied
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-accent hover:bg-accent-dark text-slate-950 hover:text-white'
                                        }`}
                                >
                                    {isCopied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Tersalin!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span>Salin Key</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Guide Steps to Run AI Roleplay */}
                        <div className="bg-surface-warm/70 rounded-2xl p-6 border border-gray-100 space-y-4">
                            <h4 className="font-serif font-bold text-gray-800 text-base flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-accent" />
                                <span>Langkah Penggunaan di AI Roleplay</span>
                            </h4>

                            <ol className="text-sm text-gray-600 space-y-2.5 list-decimal list-inside leading-relaxed">
                                <li>
                                    Klik tombol <strong className="text-gray-800">"Salin Key"</strong> di atas.
                                </li>
                                <li>
                                    Buka aplikasi <strong className="text-primary">wai.bewhy.id</strong> dengan menekan tombol utama di bawah.
                                </li>
                                <li>
                                    Pada jendela pengaturan / prompt kunci API di aplikasi AI Roleplay, tempelkan (paste) API Key tersebut.
                                </li>
                                <li>
                                    Pilih skenario simulasi roleplay dan mulai latihan percakapan interaktif Anda!
                                </li>
                            </ol>
                        </div>

                        {/* Main CTA: Open wai.bewhy.id */}
                        <div className="pt-2 text-center space-y-4">
                            <a
                                href="https://wai.bewhy.id"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary to-slate-900 hover:from-slate-900 hover:to-primary text-white font-bold text-base rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 group"
                            >
                                <Bot className="w-5 h-5 text-accent group-hover:rotate-12 transition-transform" />
                                <span>Buka Aplikasi AI Roleplay Sekarang (wai.bewhy.id)</span>
                                <ExternalLink className="w-5 h-5 text-accent" />
                            </a>

                            <div>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
                                >
                                    Minta Kunci / Verifikasi Ulang
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Notification Toast */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
}
