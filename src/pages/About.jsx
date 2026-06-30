import React from 'react';
import { BookOpen, ShieldCheck, Users, Lightbulb, HeartHandshake, ChevronRight, Target, Flag } from 'lucide-react';

export default function About() {
    return (
        <div className="bg-surface-warm min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative w-full pt-24 pb-8 flex items-center justify-center overflow-hidden">
                <div className="relative z-20 text-center px-2 max-w-4xl mx-auto">
                    <img src="/logo-dark.png" alt="Logo" className="w-24 md:w-36 h-auto mx-auto mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary mb-6 drop-shadow-lg tracking-tight">
                        CSM Intellectual Society
                    </h1>
                    <div className="inline-block bg-accent/20 border border-accent/40 backdrop-blur-sm rounded-full px-8 py-3 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                        <h2 className="font-serif italic text-2xl md:text-3xl text-accent font-bold">
                            "Concordia per Scientiam"
                        </h2>
                        <p className="text-primary text-sm tracking-widest uppercase mt-1">
                            (Disatukan oleh Pengetahuan)
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 lg:mt-8 relative z-30 space-y-16 lg:space-y-24">

                {/* Visi & Misi Section */}
                <div className="grid grid-cols-1 gap-8 md:gap-12 items-stretch max-w-5xl mx-auto">

                    {/* Visi */}
                    <div className="bg-primary/95 backdrop-blur-md border border-accent/20 rounded-2xl p-10 md:p-12 shadow-2xl relative overflow-hidden group hover:border-accent/50 transition-colors duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-accent/20 transition-colors duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                                    <EyeIcon className="w-6 h-6 text-accent" />
                                </div>
                                <h3 className="font-serif text-3xl font-bold text-white">Visi</h3>
                            </div>
                            <p className="font-serif text-2xl md:text-3xl text-gray-300 leading-relaxed font-light">
                                "Membangun komunitas yang menjadikan pengetahuan sebagai landasan <span className="text-accent font-bold italic">pelayanan</span>, <span className="text-accent font-bold italic">inovasi</span>, dan <span className="text-accent font-bold italic">profesionalisme</span>."
                            </p>
                        </div>
                    </div>

                    {/* Misi */}
                    <div className="bg-surface-card border border-accent/20 rounded-2xl p-10 md:p-12 shadow-xl hover:shadow-2xl transition-shadow duration-500 relative">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Target className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-serif text-3xl font-bold text-primary">Misi</h3>
                        </div>

                        <div className="space-y-6">
                            {[
                                "Mendorong pertukaran pengetahuan, pengalaman, dan praktik terbaik di antara para profesional Customer Satisfaction Manager.",
                                "Mengembangkan budaya penelitian, inovasi, dan pendekatan berbasis bukti dalam customer experience dan service excellence.",
                                "Mendukung pengembangan kepemimpinan dan kompetensi para Fellow melalui kolaborasi serta pembelajaran berkelanjutan.",
                                "Menghimpun, mengembangkan, dan menyebarluaskan pengetahuan yang bermanfaat bagi kemajuan Customer Satisfaction Manager.",
                                "Menjunjung tinggi integritas, profesionalisme, dan rasa ingin tahu sebagai fondasi organisasi."
                            ].map((mission, idx) => (
                                <div key={idx} className="flex gap-4 items-start group">
                                    <div className="w-8 h-8 rounded-full bg-primary text-surface-warm font-bold flex items-center justify-center shrink-0 text-sm shadow-md group-hover:bg-accent group-hover:text-primary transition-colors duration-300">
                                        {idx + 1}
                                    </div>
                                    <p className="text-slate-600 leading-relaxed text-sm md:text-base pt-1 group-hover:text-primary transition-colors duration-300">
                                        {mission}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Core Values Section */}
                <div className="text-center pt-8">
                    <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Nilai-Nilai Dasar</span>
                    <h3 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-12">Core Values</h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {[
                            { icon: BookOpen, title: "Knowledge", desc: "Pengetahuan" },
                            { icon: ShieldCheck, title: "Integrity", desc: "Integritas" },
                            { icon: Users, title: "Collaboration", desc: "Kolaborasi" },
                            { icon: Lightbulb, title: "Innovation", desc: "Inovasi" },
                            { icon: HeartHandshake, title: "Service", desc: "Pelayanan" }
                        ].map((val, idx) => (
                            <div key={idx} className="bg-surface-card border border-accent/10 rounded-xl p-8 shadow-lg hover:shadow-2xl hover:border-accent/40 hover:-translate-y-2 transition-all duration-300 group flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                                    <val.icon className="w-8 h-8 text-primary group-hover:text-accent transition-colors duration-300" />
                                </div>
                                <h4 className="font-bold text-primary text-xl mb-1">{val.title}</h4>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Prinsip Organisasi */}
                <div className="bg-primary text-white rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-2xl border border-accent/20">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>

                    <div className="relative z-10 text-center mb-16">
                        <h3 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">Prinsip Organisasi</h3>
                        <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                        {[
                            { title: "Belajar Tanpa Henti", desc: "Pengetahuan adalah fondasi keunggulan." },
                            { title: "Berpikir Kritis", desc: "Kemajuan berawal dari rasa ingin tahu." },
                            { title: "Berbagi Pengetahuan", desc: "Pengetahuan berkembang ketika dibagikan." },
                            { title: "Terus Berkembang", desc: "Setiap pencapaian adalah awal dari perbaikan berikutnya." },
                            { title: "Melayani dengan Tujuan", desc: "Keunggulan memperoleh maknanya ketika memberikan manfaat bagi orang lain." }
                        ].map((principle, idx) => (
                            <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors duration-300 group">
                                <h4 className="font-serif text-xl font-bold text-accent mb-3 flex items-center gap-2">
                                    <ChevronRight className="w-5 h-5 text-accent/50 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                    {principle.title}
                                </h4>
                                <p className="text-gray-300 font-light leading-relaxed pl-7">
                                    "{principle.desc}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

// Temporary icon component since lucide-react might not export 'Eye' directly as 'EyeIcon' without proper naming
function EyeIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
