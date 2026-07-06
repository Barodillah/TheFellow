import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, ArrowRight, Shield, Sparkles } from 'lucide-react';

export default function Auth() {
    const location = useLocation();
    const navigate = useNavigate();
    const defaultIsLogin = location.state?.isLogin !== undefined ? location.state.isLogin : true;
    const [isLogin, setIsLogin] = useState(defaultIsLogin);

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/panel');
    };

    return (
        <div className="min-h-screen bg-surface-warm flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-5xl w-full flex flex-col lg:flex-row bg-surface-card rounded-3xl shadow-2xl overflow-hidden z-10 border border-primary/10 backdrop-blur-xl">

                {/* Information Panel (Left on Desktop) */}
                <div className="lg:w-5/12 bg-primary p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-12 cursor-pointer">
                            <img src="/logo-white.png" alt="Logo" className="h-12 w-auto" />
                            <div>
                                <span className="font-serif font-bold text-xl tracking-wider text-white">CSM</span>
                                <p className="text-[10px] font-sans tracking-widest text-accent uppercase">Fellowship</p>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login-info' : 'register-info'}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-4 leading-tight">
                                    {isLogin ? 'Selamat Datang Kembali.' : 'Mulai Perjalanan Anda.'}
                                </h1>
                                <p className="text-gray-300 font-sans text-sm lg:text-base leading-relaxed mb-8 opacity-90">
                                    {isLogin
                                        ? 'Masuk ke portal Fellowship untuk mengakses materi premium, forum diskusi, dan melanjutkan progres PDCA Anda bersama komunitas Intellectual Society.'
                                        : 'Ajukan keanggotaan untuk bergabung dengan jaringan pemikir dan pemimpin masa depan. Dapatkan akses ke kurikulum H.O.M.E dan mentoring eksklusif.'}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="relative z-10 mt-10">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/40 backdrop-blur-sm">
                                <Shield className="w-5 h-5 text-accent" />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-white">Lingkungan Terkurasi</p>
                                <p className="text-gray-400 text-xs">Jejaring berkualitas tinggi</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/40 backdrop-blur-sm">
                                <Sparkles className="w-5 h-5 text-accent" />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-white">Materi Eksklusif</p>
                                <p className="text-gray-400 text-xs">Akses standar pengembangan H.O.M.E</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Panel (Right on Desktop) */}
                <div className="lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
                    {/* Toggle Switch */}
                    <div className="flex justify-center mb-10">
                        <div className="bg-gray-100 p-1 rounded-full flex shadow-inner relative">
                            <motion.div
                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-md z-0"
                                animate={{
                                    left: isLogin ? '4px' : '50%'
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`relative z-10 flex-1 px-6 py-2.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-300 ${isLogin ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <LogIn className="w-4 h-4" />
                                    <span>Login</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`relative z-10 flex-1 px-6 py-2.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-300 ${!isLogin ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <UserPlus className="w-4 h-4" />
                                    <span>Join</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div
                                key="login-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full max-w-md mx-auto"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Login ke Akun Anda</h2>
                                    <p className="text-gray-500 text-sm">Masukkan kredensial Anda untuk melanjutkan</p>
                                </div>

                                <form className="space-y-5" onSubmit={handleLogin}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent bg-gray-50/50 focus:bg-white transition-all duration-200 outline-none"
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-sm font-medium text-gray-700">Password</label>
                                            <a href="#" className="text-xs text-primary font-medium hover:text-accent transition-colors">Lupa password?</a>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent bg-gray-50/50 focus:bg-white transition-all duration-200 outline-none"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary/20 transform hover:-translate-y-0.5"
                                    >
                                        <span>Masuk Sekarang</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full max-w-md mx-auto"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Join Member</h2>
                                    <p className="text-gray-500 text-sm">Isi formulir untuk pengajuan keanggotaan</p>
                                </div>

                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Depan</label>
                                            <input
                                                type="text"
                                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent bg-gray-50/50 focus:bg-white transition-all duration-200 outline-none"
                                                placeholder="Budi"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Belakang</label>
                                            <input
                                                type="text"
                                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent bg-gray-50/50 focus:bg-white transition-all duration-200 outline-none"
                                                placeholder="Santoso"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent bg-gray-50/50 focus:bg-white transition-all duration-200 outline-none"
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Alasan Bergabung</label>
                                        <textarea
                                            rows="3"
                                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent bg-gray-50/50 focus:bg-white transition-all duration-200 outline-none resize-none"
                                            placeholder="Ceritakan motivasi Anda..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center space-x-2 bg-accent hover:bg-accent-light text-primary py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-accent/30 transform hover:-translate-y-0.5 mt-2"
                                    >
                                        <span>Kirim Pengajuan</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400">
                            Dengan {isLogin ? 'masuk' : 'mengajukan keanggotaan'}, Anda menyetujui <br />
                            <a href="#" className="text-primary hover:underline">Syarat & Ketentuan</a> serta <a href="#" className="text-primary hover:underline">Kebijakan Privasi</a> kami.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
