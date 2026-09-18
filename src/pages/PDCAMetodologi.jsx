import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, Target, Wrench, AlertTriangle, Layers, BookOpen } from 'lucide-react';

export default function PDCAMetodologi() {
    const phases = [
        {
            id: 'plan',
            key: 'P',
            title: 'Plan',
            subtitle: 'Perencanaan Mendalam & Hipotesis',
            desc: 'Fase ini menyerap 40–50% dari total waktu siklus. Identifikasi masalah secara ilmiah sebelum eksekusi.',
            points: [
                'Pernyataan Masalah (Gap analisis)',
                'Pengumpulan Data Baseline',
                'Analisis Akar Penyebab (RCA)',
                'Penetapan Sasaran SMART',
                'Rencana Aksi terukur'
            ],
            tools: ['Pareto Chart', 'Fishbone', '5 Whys'],
            color: 'from-blue-50 to-white',
            borderColor: 'border-blue-100',
            textColor: 'text-blue-700'
        },
        {
            id: 'do',
            key: 'D',
            title: 'Do',
            subtitle: 'Eksperimen & Pelaksanaan Pilot',
            desc: 'Pengujian solusi secara terkendali (skala pilot) untuk mengisolasi risiko sistemik.',
            points: [
                'Uji Coba Terkendali (Pilot Project)',
                'Pelatihan Singkat Eksekutor',
                'Eksekusi Sesuai Rencana',
                'Pencatatan Data Empiris (Data Logging)',
                'Dokumentasi Anomali'
            ],
            tools: ['Check Sheet', 'Kanban Board', 'Log Book'],
            color: 'from-amber-50 to-white',
            borderColor: 'border-amber-100',
            textColor: 'text-amber-700'
        },
        {
            id: 'check',
            key: 'C',
            title: 'Check',
            subtitle: 'Evaluasi & Pembelajaran',
            desc: 'Menguji apakah hipotesis yang dirumuskan terbukti benar secara empiris dan statistik.',
            points: [
                'Komparasi Data (Baseline vs Hasil)',
                'Analisis Varians (Control Limit)',
                'Cek Efek Samping Tak Terduga',
                'Analisis Kesenjangan (Gap Analysis)',
                'Deep Learning (Bukan Sekadar Inspeksi)'
            ],
            tools: ['Control Charts', 'Histogram', 'Scatter Diagram'],
            color: 'from-emerald-50 to-white',
            borderColor: 'border-emerald-100',
            textColor: 'text-emerald-700'
        },
        {
            id: 'act',
            key: 'A',
            title: 'Act',
            subtitle: 'Standarisasi & Aksi Lanjutan',
            desc: 'Keputusan strategis: Jadikan standar baru, modifikasi parameter, atau ulangi proses dari awal.',
            points: [
                'Adopsi SOP Resmi (Jika Berhasil)',
                'Pelatihan Skala Penuh (Roll-out)',
                'Modifikasi & Ulangi (Jika Kurang)',
                'Batal & Kaji Ulang (Jika Gagal)',
                'Tentukan Fokus PDCA Berikutnya'
            ],
            tools: ['SOP Baru', 'Training Plan', 'Roll-out Schedule'],
            color: 'from-purple-50 to-white',
            borderColor: 'border-purple-100',
            textColor: 'text-purple-700'
        }
    ];

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
            <section className="pt-28 pb-16 px-4 max-w-5xl mx-auto text-center">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium tracking-wide uppercase mb-6">
                        <BookOpen className="w-3.5 h-3.5" />
                        Framework Perbaikan Berkelanjutan
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 font-serif">
                        Metodologi PDCA
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Pendekatan iteratif empat tahap untuk pemecahan masalah sistematis, manajemen perubahan, dan peningkatan kualitas yang tanpa henti.
                    </p>
                </motion.div>
            </section>

            {/* Bento Grid untuk Fase PDCA */}
            <section className="px-4 max-w-6xl mx-auto mb-20">
                <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    whileInView="show" 
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {phases.map((phase) => (
                        <motion.div 
                            key={phase.id} 
                            variants={itemVariants}
                            className={`relative bg-gradient-to-br ${phase.color} border ${phase.borderColor} p-8 md:p-10 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300`}
                        >
                            {/* Watermark Letter */}
                            <div className="absolute -bottom-10 -right-6 text-[12rem] font-serif font-black leading-none opacity-[0.04] pointer-events-none select-none text-slate-900">
                                {phase.key}
                            </div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="mb-6">
                                    <h2 className="text-3xl font-bold font-serif mb-1 tracking-tight text-slate-900">{phase.title}</h2>
                                    <h3 className={`text-sm font-semibold uppercase tracking-wider ${phase.textColor}`}>{phase.subtitle}</h3>
                                </div>
                                
                                <p className="text-slate-600 mb-8 leading-relaxed">
                                    {phase.desc}
                                </p>

                                <div className="mt-auto space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Fokus Aktivitas</h4>
                                        <ul className="space-y-2">
                                            {phase.points.map((point, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                                    <span className="leading-snug">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <Wrench className="w-3.5 h-3.5" /> Alat Bantu
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {phase.tools.map((tool, idx) => (
                                                <span key={idx} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Hubungan SDCA & Pitfalls (Asymmetric Layout) */}
            <section className="px-4 max-w-6xl mx-auto mb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* SDCA Concept */}
                    <div className="lg:col-span-7 bg-slate-900 text-white p-10 md:p-12 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="relative z-10">
                            <Layers className="w-8 h-8 text-primary mb-6" />
                            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">PDCA membutuhkan SDCA</h2>
                            <p className="text-slate-300 leading-relaxed mb-6">
                                PDCA berfungsi untuk <strong>menaikkan level kinerja</strong> (mematahkan standar lama untuk membuat standar yang lebih baik). Namun, peningkatan tersebut akan percuma tanpa <strong>SDCA (Standardize-Do-Check-Act)</strong>.
                            </p>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                SDCA berfungsi menstabilkan dan mempertahankan kinerja pada standar baru agar tidak terjadi kemunduran (*backsliding*). Setelah PDCA selesai dan sukses, ia secara otomatis menjadi *baseline* baru untuk SDCA.
                            </p>
                        </div>
                    </div>

                    {/* Common Pitfalls */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 p-10 md:p-12 rounded-3xl">
                        <AlertTriangle className="w-8 h-8 text-rose-500 mb-6" />
                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Kesalahan Umum</h2>
                        <ul className="space-y-5">
                            <li className="flex gap-3">
                                <div className="text-rose-500 font-bold">1.</div>
                                <div>
                                    <strong className="block text-sm text-slate-800 mb-1">Do-Check tanpa Plan</strong>
                                    <span className="text-sm text-slate-500">Coba-coba tanpa landasan data atau hipotesis (*trial and error* murni).</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="text-rose-500 font-bold">2.</div>
                                <div>
                                    <strong className="block text-sm text-slate-800 mb-1">Skala Pilot Masif</strong>
                                    <span className="text-sm text-slate-500">Langsung menguji solusi baru ke seluruh divisi, berisiko melumpuhkan operasional jika gagal.</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="text-rose-500 font-bold">3.</div>
                                <div>
                                    <strong className="block text-sm text-slate-800 mb-1">Melewatkan Standarisasi</strong>
                                    <span className="text-sm text-slate-500">Berhasil namun tidak di-SOP-kan, sehingga bulan depan performa kembali turun.</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                </div>
            </section>

            {/* CTAs */}
            <section className="px-4 max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold font-serif text-slate-900 mb-4">Siap untuk memulai?</h2>
                    <p className="text-slate-500">Gunakan perangkat digital kami untuk memudahkan implementasi.</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                    <Link 
                        to="/pdca-generator" 
                        className="group flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl hover:border-accent hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 text-center"
                    >
                        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Lightbulb className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">PDCA Generator</h3>
                        <p className="text-sm text-slate-500 mb-6">Rancang ide dan hipotesis solusi secara terstruktur dengan asisten pintar.</p>
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent group-hover:gap-3 transition-all">
                            Gunakan Generator <ArrowRight className="w-4 h-4" />
                        </span>
                    </Link>

                    <Link 
                        to="/pdca-tracker" 
                        className="group flex flex-col items-center justify-center p-8 bg-slate-900 rounded-2xl hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 text-center"
                    >
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">PDCA Tracker</h3>
                        <p className="text-sm text-slate-400 mb-6">Pantau dan kelola seluruh siklus eksekusi proyek PDCA Anda di dasbor.</p>
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white group-hover:gap-3 transition-all">
                            Buka Tracker <ArrowRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>
            </section>
        </div>
    );
}
