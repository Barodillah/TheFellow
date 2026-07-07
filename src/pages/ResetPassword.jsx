import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Key, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify & Reset
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('https://incsmsociety.site/api/send_otp.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                setStep(2);
                setMessage({ text: 'Kode OTP telah dikirim ke email Anda.', type: 'success' });
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Terjadi kesalahan koneksi.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('https://incsmsociety.site/api/reset_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password: newPassword })
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                setMessage({ text: 'Password berhasil diubah! Anda akan dialihkan ke halaman login...', type: 'success' });
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Terjadi kesalahan koneksi.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-warm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
                
                <div className="text-center mb-8 pt-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <Key className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Aktivasi / Reset Password</h2>
                    <p className="text-gray-500 text-sm">Verifikasi identitas Anda dengan kode OTP</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {message.text}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendOTP}
                            className="space-y-5"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Terdaftar</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        readOnly={!!location.state?.email}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent bg-gray-50 outline-none"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span>{loading ? 'Mengirim OTP...' : 'Kirim Kode OTP'}</span>
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                            <button 
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full text-center text-sm text-gray-500 hover:text-primary transition-colors mt-4"
                            >
                                Kembali ke Login
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleReset}
                            className="space-y-5"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode OTP (6 Digit)</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent bg-white outline-none text-center text-2xl tracking-[0.5em] font-mono"
                                    placeholder="••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength="6"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent bg-white outline-none"
                                        placeholder="Min. 6 karakter"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6 || newPassword.length < 6}
                                className="w-full flex items-center justify-center space-x-2 bg-accent hover:bg-accent-light text-primary py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-accent/30 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span>{loading ? 'Memproses...' : 'Simpan Password Baru'}</span>
                                {!loading && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
