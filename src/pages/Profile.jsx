import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FELLOWS_DATA } from '../data/mockData';
import { ArrowLeft, Award, Activity, BookOpen, MessageSquare } from 'lucide-react';

export default function Profile() {
    const { id } = useParams();
    const fellow = FELLOWS_DATA.find(f => f.id === id);

    if (!fellow) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-2xl text-primary font-serif font-bold">Fellow tidak ditemukan</h2>
                <Link to="/fellows" className="text-accent underline mt-4 inline-block">Kembali ke Direktori</Link>
            </div>
        );
    }

    return (
        <div className="py-12 px-4 max-w-5xl mx-auto">
            <Link to="/fellows" className="inline-flex items-center space-x-2 text-accent hover:text-accent-light text-sm font-bold uppercase mb-8">
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Direktori</span>
            </Link>

            <div className="bg-surface-card rounded-xl border-2 border-accent/30 shadow-xl overflow-hidden">
                <div className="bg-primary p-8 sm:p-12 text-surface-warm relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Award className="w-40 h-40 text-accent" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                        <img 
                            src={fellow.avatar} 
                            alt={fellow.name} 
                            className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-accent shadow-lg"
                        />
                        <div className="text-center sm:text-left">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-accent px-3 py-1 rounded inline-block mb-3">{fellow.title}</span>
                            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-2">{fellow.name}</h1>
                            <p className="text-accent-light font-semibold mb-4">{fellow.csmTitle}</p>
                            
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
                                {fellow.badges.map((badge, idx) => (
                                    <span key={idx} className="bg-primary-light border border-accent/40 text-xs px-2.5 py-1 rounded-full text-gray-300">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                            
                            <p className="font-sans text-sm text-gray-400 italic">Bergabung sejak {fellow.joinYear}</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-8 sm:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-8">
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-primary mb-4">Biografi Intelektual</h3>
                                <p className="font-sans text-slate-600 leading-relaxed text-sm sm:text-base mb-6">
                                    {fellow.bio}
                                </p>
                                
                                {fellow.achievements && fellow.achievements.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-serif text-xl font-bold text-primary mb-3">Pencapaian & Dedikasi</h4>
                                        <div className="font-sans text-slate-600 leading-relaxed text-sm sm:text-base space-y-2">
                                            {fellow.achievements.map((ach, idx) => (
                                                <p key={idx}>{ach}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-primary-light/10 border-l-4 border-accent p-6 rounded-r-lg">
                                <p className="font-serif text-xl sm:text-2xl italic text-primary leading-snug">
                                    "{fellow.quote}"
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-primary mb-4">Spesialisasi Kaizen</h3>
                                <div className="flex flex-wrap gap-3">
                                    {fellow.specializations.map((spec, idx) => (
                                        <div key={idx} className="bg-surface-warm border border-accent/30 text-primary px-4 py-2 rounded shadow-sm text-sm font-semibold">
                                            {spec}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="bg-surface-warm p-6 rounded-lg border border-accent/20">
                                <h3 className="font-serif text-lg font-bold text-primary mb-4 border-b border-accent/20 pb-2">Kontribusi Society</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <BookOpen className="w-5 h-5 text-accent" />
                                            <span className="text-sm font-semibold">Artikel Jurnal</span>
                                        </div>
                                        <span className="font-bold text-primary">{fellow.stats.articles}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <MessageSquare className="w-5 h-5 text-accent" />
                                            <span className="text-sm font-semibold">Diskusi Forum</span>
                                        </div>
                                        <span className="font-bold text-primary">{fellow.stats.threads}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Activity className="w-5 h-5 text-accent" />
                                            <span className="text-sm font-semibold">Kasus PDCA</span>
                                        </div>
                                        <span className="font-bold text-primary">{fellow.stats.pdcaCases}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
