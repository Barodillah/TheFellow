import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, User, BookOpen, MessageSquare, Target, Users, Wrench, Lightbulb, FolderKanban, Calculator, MessageCircle, Library, PenTool, BookMarked, Layers, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Ekosistem() {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen pb-24 text-slate-800">
            {/* Hero Section */}
            <section className="pt-6 md:pt-8 pb-16 px-4 max-w-5xl mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium tracking-wide uppercase mb-6">
                        <Layers className="w-3.5 h-3.5" />
                        Ekosistem TheFellow
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 font-serif">
                        Menjembatani Kesenjangan Kompetensi
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Kumpulan perangkat kerja cerdas, pusat pengetahuan, dan jejaring kolaborasi untuk meningkatkan kualitas layanan Anda setiap hari.
                    </p>
                </motion.div>
            </section>

            {/* Grid Lengkap */}
            <section className="px-4 max-w-7xl mx-auto mb-20">
                <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    
                    {/* Kolom 1: Perangkat Kerja */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Wrench className="w-5 h-5" /></div>
                            <h3 className="font-serif text-xl font-bold text-primary">Perangkat Kerja</h3>
                        </div>
                        
                        <motion.div variants={itemVariants}>
                            <Link to="/pdca-generator" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <Lightbulb className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">PDCA Generator</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Asisten cerdas merumuskan hipotesis & akar masalah.</p>
                            </Link>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                            <Link to="/pdca-tracker" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <FolderKanban className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">PDCA Tracker</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Dasbor manajemen proyek siklus eksekusi Plan-Do-Check-Act.</p>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Link to="/calculator-target" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <Calculator className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">Kalkulator Target</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Hitung target dan proyeksi KPI pencapaian layanan.</p>
                            </Link>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                            <Link to="/whatsapp-blast" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <MessageCircle className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">WA Blast Tool</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Broadcaster pesan untuk menciptakan Memorable Experience.</p>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Kolom 2: Pusat Edukasi */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><BookOpen className="w-5 h-5" /></div>
                            <h3 className="font-serif text-xl font-bold text-primary">Pusat Edukasi</h3>
                        </div>

                        <motion.div variants={itemVariants}>
                            <Link to="/home-standard" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <Shield className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">Standar H.O.M.E</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Panduan interaktif 4 pilar emas standar layanan CSM.</p>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Link to="/pdca-metodologi" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <Target className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">Metodologi PDCA</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Framework perbaikan berkelanjutan berbasis pemecahan masalah.</p>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Link to="/smart-library" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <Library className="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">Smart Library</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Perpustakaan sentral dokumen, literatur, dan arsip operasional.</p>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Link to="/kanal-quiz" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <PenTool className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">Kanal Quiz</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Uji pemahaman prosedur dan skenario melalui tantangan gamifikasi.</p>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Kolom 3: Komunitas & Jejaring */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Users className="w-5 h-5" /></div>
                            <h3 className="font-serif text-xl font-bold text-primary">Jejaring Komunitas</h3>
                        </div>

                        <motion.div variants={itemVariants}>
                            <Link to="/fellows" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <User className="w-8 h-8 text-cyan-500 group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">Fellows Directory</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Temukan dan terhubung dengan sesama profesional pelayanan.</p>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Link to="/forum" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <MessageSquare className="w-8 h-8 text-rose-500 group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">Forum Diskusi</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Ruang kolaborasi dan ruang interaksi berbagi solusi operasional.</p>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Link to="/publikasi" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <BookMarked className="w-8 h-8 text-fuchsia-500 group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">Papan Publikasi</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Akses jurnal, buletin, dan dokumentasi pencapaian terbaik.</p>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Link to="/articles" className="group block bg-white p-6 rounded-2xl border border-slate-200 hover:border-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <FileText className="w-8 h-8 text-sky-500 group-hover:scale-110 transition-transform" />
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">Artikel & Update</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Berita, insight, dan informasi terkini seputar dunia TheFellow.</p>
                            </Link>
                        </motion.div>
                    </div>

                </motion.div>
                
                <div className="mt-16 text-center">
                    <Link to="/panel" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-300">
                        Masuk ke Dasbor Interaktif <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
