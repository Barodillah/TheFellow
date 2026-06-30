import React from 'react';
import { Target, Activity, CheckCircle, RefreshCcw, ArrowRight, Settings, TrendingUp, ShieldCheck } from 'lucide-react';

export default function PDCA() {
    return (
        <div className="bg-surface-warm min-h-screen pb-20 overflow-hidden">
            
            {/* Hero Section */}
            <div className="relative w-full pt-32 pb-24 flex items-center justify-center overflow-hidden bg-primary text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary-light z-10"></div>
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/10 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none"></div>
                </div>
                
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <span className="inline-block bg-accent/20 border border-accent/40 text-accent font-bold tracking-widest uppercase text-xs px-4 py-1.5 rounded-full mb-6 shadow-sm">
                        Kaizen Methodology
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
                        Filosofi <span className="text-accent">P.D.C.A</span>
                    </h1>
                    <p className="font-sans text-gray-300 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-light">
                        Plan, Do, Check, Act. Empat pilar esensial yang menjadi detak jantung perbaikan berkelanjutan (<i>Continuous Improvement</i>) di setiap standar pelayanan garda terdepan.
                    </p>
                </div>
            </div>

            {/* Introduction Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30 mb-24">
                <div className="bg-surface-card border border-accent/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-10 items-center">
                    <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                        <RefreshCcw className="w-96 h-96" />
                    </div>
                    <div className="md:w-1/2 relative z-10">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-6">Siklus Tak Berujung Menuju Kesempurnaan</h2>
                        <p className="text-slate-600 leading-relaxed mb-6">
                            PDCA bukanlah sekadar alat ukur, melainkan pola pikir. Dalam ekosistem Customer Satisfaction Manager, setiap keluhan pelanggan bukanlah kegagalan, melainkan titik awal dari siklus <span className="font-bold text-primary">Plan</span>.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Melalui siklus iteratif ini, kita membongkar akar masalah (<i>root cause</i>), melakukan intervensi bedah skala kecil, dan menciptakan standar operasional baru yang tahan banting (<i>bulletproof</i>).
                        </p>
                    </div>
                    <div className="md:w-1/2 relative z-10 grid grid-cols-2 gap-4 w-full">
                        {[
                            { label: "Sistematis", value: "Terstruktur" },
                            { label: "Keputusan", value: "Berbasis Data" },
                            { label: "Risiko", value: "Terkalkulasi" },
                            { label: "Hasil Akhir", value: "Standardisasi" }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-primary/5 border border-primary/10 rounded-xl p-5 text-center">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                                <p className="font-serif text-lg font-bold text-primary">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* The 4 Phases Details */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="text-center mb-16">
                    <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Tahapan Implementasi</span>
                    <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary">Anatomi 4 Fase PDCA</h2>
                </div>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-accent before:via-accent/40 before:to-transparent">
                    
                    {/* PLAN */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-warm bg-accent shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">
                            <Target className="w-4 h-4 text-primary" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface-card p-6 md:p-8 rounded-2xl border border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="font-serif text-5xl font-bold text-primary/10 absolute top-4 right-6 pointer-events-none">01</span>
                                <h3 className="font-serif text-2xl font-bold text-primary">PLAN <span className="text-accent italic font-light text-lg ml-2">Perencanaan</span></h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed mb-4 text-sm md:text-base">
                                Mengidentifikasi akar permasalahan pelayanan menggunakan metode <i>5 Why</i> atau <i>Fishbone Diagram</i>. Di tahap ini, CSM menetapkan baseline data saat ini (CSI Score, Wait Time) dan menentukan target perbaikan yang spesifik, terukur, dan realistis.
                            </p>
                            <div className="bg-primary/5 rounded-lg p-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Output Teknis:</h4>
                                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Dokumen A3 Problem Solving</li>
                                    <li>Definisi Root Cause</li>
                                    <li>Action Plan Detail</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* DO */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-warm bg-accent shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">
                            <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface-card p-6 md:p-8 rounded-2xl border border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="font-serif text-5xl font-bold text-primary/10 absolute top-4 right-6 pointer-events-none">02</span>
                                <h3 className="font-serif text-2xl font-bold text-primary">DO <span className="text-accent italic font-light text-lg ml-2">Pelaksanaan</span></h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed mb-4 text-sm md:text-base">
                                Melaksanakan rencana tindakan secara terkendali dan dalam skala kecil (<i>pilot project</i>). Sangat penting untuk mendokumentasikan setiap deviasi atau tantangan tak terduga yang terjadi selama implementasi di lapangan.
                            </p>
                            <div className="bg-primary/5 rounded-lg p-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Fokus Utama:</h4>
                                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Eksekusi sistematis sesuai timeline</li>
                                    <li>Pelatihan staf terkait perubahan</li>
                                    <li>Pencatatan data <i>real-time</i></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* CHECK */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-warm bg-accent shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">
                            <CheckCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface-card p-6 md:p-8 rounded-2xl border border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="font-serif text-5xl font-bold text-primary/10 absolute top-4 right-6 pointer-events-none">03</span>
                                <h3 className="font-serif text-2xl font-bold text-primary">CHECK <span className="text-accent italic font-light text-lg ml-2">Pemeriksaan</span></h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed mb-4 text-sm md:text-base">
                                Menganalisis data dari tahap DO dan membandingkannya dengan baseline serta target di tahap PLAN. CSM harus secara objektif menilai apakah uji coba membawa dampak positif (<i>improvement</i>) atau justru tidak efektif.
                            </p>
                            <div className="bg-primary/5 rounded-lg p-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Indikator Sukses:</h4>
                                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Analisis Gap Data Terukur</li>
                                    <li>Validasi Umpan Balik Pelanggan</li>
                                    <li>Evaluasi Hambatan Teknis</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* ACT */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-warm bg-accent shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">
                            <Settings className="w-4 h-4 text-primary" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface-card p-6 md:p-8 rounded-2xl border border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="font-serif text-5xl font-bold text-primary/10 absolute top-4 right-6 pointer-events-none">04</span>
                                <h3 className="font-serif text-2xl font-bold text-primary">ACT <span className="text-accent italic font-light text-lg ml-2">Tindak Lanjut</span></h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed mb-4 text-sm md:text-base">
                                Keputusan krusial: Jika CHECK menunjukkan hasil positif, SOP baru dibakukan dan disosialisasikan secara nasional. Jika gagal, temuan menjadi pembelajaran untuk siklus PLAN berikutnya yang lebih tajam.
                            </p>
                            <div className="bg-primary/5 rounded-lg p-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Resolusi:</h4>
                                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Pembaruan Buku Manual SOP</li>
                                    <li>Standardisasi Skala Besar</li>
                                    <li>Perayaan & Apresiasi Tim</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Implementation Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-primary text-surface-warm rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-2xl border border-accent/20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                        <div className="lg:w-1/3">
                            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">Manifestasi Nyata di Lapangan</h2>
                            <p className="text-gray-300 leading-relaxed mb-8">
                                CSM Intellectual Society tidak berteori, kami mengimplementasi. Berikut adalah fokus pengaplikasian PDCA dalam mengawal standar H.O.M.E.
                            </p>
                            <button className="bg-accent hover:bg-accent-light text-primary font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-accent/20 transition-all duration-300 flex items-center gap-2">
                                Baca Studi Kasus PDCA <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                                <TrendingUp className="w-8 h-8 text-accent mb-4" />
                                <h4 className="font-serif text-xl font-bold text-white mb-2">Reduksi Wait Time</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">Optimalisasi alur pendaftaran servis hingga penyerahan kunci ke teknisi untuk memangkas antrean secara signifikan.</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                                <ShieldCheck className="w-8 h-8 text-accent mb-4" />
                                <h4 className="font-serif text-xl font-bold text-white mb-2">Konsistensi H.O.M.E</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">Penguncian standar senyum, sapa, dan keramahan frontliner agar homogen di seluruh jaringan diler nasional.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
