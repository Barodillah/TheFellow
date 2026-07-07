import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Target,
    Award,
    User,
    ChevronRight,
    TrendingUp,
    CheckCircle2,
    Clock,
    Plus,
    Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Panel() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('csm_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary mb-1">
                        Selamat datang, {user?.name ? user.name.split(' ')[0] : 'Fellow'}!
                    </h1>
                    <p className="text-gray-500 text-sm">Lihat ringkasan aktivitas dan progres Anda di sini.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Link to="/pdca" className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" />
                        <span>Buat PDCA Baru</span>
                    </Link>
                </div>
            </div>

            {/* Dashboard Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >

                {/* Profile Card */}
                <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-1 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -z-0"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-4 mb-6">
                            <img 
                                src={user?.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg'} 
                                alt={user?.name || 'User'} 
                                className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-accent"
                            />
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg capitalize">{user?.name || 'User Name'}</h3>
                                <div className="flex items-center space-x-1 text-accent bg-accent/10 px-2 py-0.5 rounded text-xs font-semibold w-fit mt-1 uppercase">
                                    <Award className="w-3 h-3" />
                                    <span>{user?.title || (user?.role === 'member' ? 'Member' : 'Fellow')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Join at</span>
                                <span className="font-medium text-gray-800">{user?.joinYear || new Date().getFullYear()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Poin Intelektual</span>
                                <span className="font-medium text-gray-800">1,250 pts</span>
                            </div>
                        </div>
                    </div>
                    <Link to="/profile" className="mt-6 flex items-center justify-center space-x-2 w-full py-2 bg-gray-50 hover:bg-gray-100 text-primary text-sm font-medium rounded-xl transition-colors">
                        <span>Lihat Profil</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                {/* PDCA Summary Card */}
                <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center space-x-2">
                            <Target className="w-5 h-5 text-primary" />
                            <span>Ringkasan PDCA Tracker</span>
                        </h3>
                        <Link to="/pdca" className="text-xs text-accent hover:text-accent-light font-semibold">Lihat Detail</Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                            <div className="text-blue-500 mb-2 font-medium text-sm">Plan</div>
                            <div className="text-2xl font-bold text-gray-800">12</div>
                            <div className="text-xs text-gray-500 mt-1">Ide Inisiatif</div>
                        </div>
                        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                            <div className="text-amber-500 mb-2 font-medium text-sm">Do</div>
                            <div className="text-2xl font-bold text-gray-800">5</div>
                            <div className="text-xs text-gray-500 mt-1">Sedang Berjalan</div>
                        </div>
                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                            <div className="text-indigo-500 mb-2 font-medium text-sm">Check</div>
                            <div className="text-2xl font-bold text-gray-800">3</div>
                            <div className="text-xs text-gray-500 mt-1">Menunggu Evaluasi</div>
                        </div>
                        <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                            <div className="text-green-500 mb-2 font-medium text-sm flex items-center justify-between">
                                Act <TrendingUp className="w-3.5 h-3.5" />
                            </div>
                            <div className="text-2xl font-bold text-gray-800">8</div>
                            <div className="text-xs text-gray-500 mt-1">Selesai & Standar</div>
                        </div>
                    </div>
                </motion.div>

                {/* Standar H.O.M.E Progress */}
                <motion.div variants={itemVariants} className="bg-primary rounded-3xl p-6 shadow-md lg:col-span-1 text-white relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
                    <h3 className="font-bold flex items-center space-x-2 mb-2">
                        <Award className="w-5 h-5 text-accent" />
                        <span>Quiz Intelectual</span>
                    </h3>
                    <p className="text-xs text-gray-300 mb-6">Pemahaman standar layanan</p>

                    <div className="flex items-end space-x-2 mb-2">
                        <span className="text-4xl font-serif font-bold text-accent">92</span>
                        <span className="text-sm text-gray-400 mb-1">/ 100</span>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                        <div className="bg-accent h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>

                    <Link to="/quiz" className="inline-block mt-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/10">
                        Ikuti Quiz Ulang
                    </Link>
                </motion.div>

                {/* Recent Forum Activity */}
                <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center space-x-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            <span>Aktivitas Forum Terbaru</span>
                        </h3>
                        <Link to="/forum" className="text-xs text-accent hover:text-accent-light font-semibold">Ke Forum</Link>
                    </div>

                    <div className="space-y-4">
                        {/* Item 1 */}
                        <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex-shrink-0 flex items-center justify-center text-accent">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 truncate">Implementasi AI dalam Pelayanan</h4>
                                <p className="text-xs text-gray-500 truncate">Apakah ada yang sudah mencoba implementasi chatbot AI untuk pilar H (Helpful)...</p>
                            </div>
                            <div className="flex items-center text-xs text-gray-400 space-x-1 flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>2 jam lalu</span>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 truncate">Strategi Meminimalisir Antrian</h4>
                                <p className="text-xs text-gray-500 truncate">Saya menemukan solusi untuk PDCA tentang antrian panjang di jam sibuk, silakan cek...</p>
                            </div>
                            <div className="flex items-center text-xs text-gray-400 space-x-1 flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>Kemarin</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}
