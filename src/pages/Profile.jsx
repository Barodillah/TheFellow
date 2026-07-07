import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, Activity, BookOpen, MessageSquare, ArrowLeft, Trophy, Medal } from 'lucide-react';
import DecorativeRule from '../components/shared/DecorativeRule';

export default function Profile() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserAndAchievements = async () => {
            try {
                const res = await fetch(`https://incsmsociety.site/api/get_profile.php?id=${id}`);
                const data = await res.json();
                if (data.status === 'success') {
                    setUser(data.user);
                } else {
                    setError(data.message || 'Gagal memuat profil pengguna.');
                    return;
                }

                const achRes = await fetch(`https://incsmsociety.site/api/get_achievements.php?user_id=${id}`);
                const achData = await achRes.json();
                if (achData.status === 'success') {
                    const sortedAch = achData.achievements.sort((a, b) => parseInt(b.year) - parseInt(a.year));
                    setAchievements(sortedAch);
                }
            } catch (err) {
                setError('Terjadi kesalahan saat memuat profil.');
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchUserAndAchievements();
        }
    }, [id]);

    const getMedalColor = (title) => {
        if (title.includes('1st Winner') || title.includes('Gold')) return 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]';
        if (title.includes('2nd Winner') || title.includes('Silver')) return 'text-gray-400 drop-shadow-[0_0_8px_rgba(156,163,175,0.5)]';
        if (title.includes('3rd Winner') || title.includes('Bronze')) return 'text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]';
        return 'text-accent';
    };

    const isMedalWinner = (title) => {
        return title.includes('1st Winner') || title.includes('Gold') || 
               title.includes('2nd Winner') || title.includes('Silver') || 
               title.includes('3rd Winner') || title.includes('Bronze');
    };

    if (loading) return <div className="bg-surface-warm min-h-screen pt-24 pb-12 flex items-center justify-center text-gray-500">Memuat profil...</div>;
    if (error || !user) return <div className="bg-surface-warm min-h-screen pt-24 pb-12 flex items-center justify-center text-gray-500">Pengguna tidak ditemukan.</div>;

    const fixedData = {
        avatar: user.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg',
        badges: Array.isArray(user.badges) ? user.badges : [],
        joinYear: user.join_year || new Date().getFullYear(),
        stats: { 
            articles: user.stats_articles || 0, 
            threads: user.stats_threads || 0, 
            pdcaCases: user.stats_pdca_cases || 0 
        },
        achievements: [],
        specializations: Array.isArray(user.specializations) ? user.specializations : []
    };

    return (
        <div className="bg-surface-warm min-h-screen pt-24 pb-12">
            <div className="max-w-5xl mx-auto px-4">
                
                <Link to="/fellows" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors text-sm font-medium mb-6">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Direktori
                </Link>

                <div className="bg-surface-card rounded-xl border-2 border-accent/30 shadow-xl overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-primary p-8 sm:p-12 text-surface-warm relative overflow-hidden">
                        
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                            <Award className="w-48 h-48 text-accent" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary-light/50 to-transparent"></div>
                        
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                            {/* Avatar */}
                            <div className="relative group">
                                <img 
                                    src={fixedData.avatar} 
                                    alt={user.name} 
                                    className="w-40 h-40 sm:w-56 sm:h-56 rounded-full object-cover border-4 border-accent shadow-2xl relative z-10 bg-white"
                                />
                                {/* Halo Effect */}
                                <div className="absolute inset-0 rounded-full bg-accent blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                            </div>
                            
                            {/* Header Info */}
                            <div className="text-center sm:text-left pt-2 sm:pt-6">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-accent px-3 py-1.5 rounded inline-block mb-4 shadow-sm">
                                    {user.title || (user.role === 'member' ? 'Member' : 'Fellow')}
                                </span>
                                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight drop-shadow-md">
                                    {user.name}
                                </h1>
                                <p className="text-accent-light text-lg sm:text-xl font-semibold mb-6 flex items-center justify-center sm:justify-start gap-2">
                                    <Award className="w-5 h-5" />
                                    {user.csm_title || 'CSM Enthusiast'}
                                </p>
                                
                                {/* Badges */}
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
                                    {fixedData.badges.length > 0 ? (
                                        fixedData.badges.map((badge, index) => (
                                            <span key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 text-xs px-3 py-1.5 rounded-full text-white shadow-sm flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                                                {badge}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-xs px-3 py-1.5 rounded-full text-white shadow-sm">Terverifikasi</span>
                                    )}
                                </div>
                                
                                <p className="font-sans text-sm text-gray-400 italic">Bergabung dengan jaringan CSM sejak {fixedData.joinYear}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Main Content Area */}
                    <div className="p-8 sm:p-12 relative">
                        <div className="absolute top-0 right-12 transform -translate-y-1/2 bg-surface-card border-2 border-accent/20 px-6 py-3 rounded-full shadow-lg z-20">
                            <p className="font-bold text-primary text-sm uppercase tracking-widest m-0 flex items-center gap-2">
                                Profil Terverifikasi <Award className="w-4 h-4 text-accent" />
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-4">
                            
                            {/* Kolom Kiri: Bio & Quote */}
                            <div className="md:col-span-2 space-y-12">
                                {/* Quote Section */}
                                {user.quote && (
                                    <div className="relative">
                                        <div className="absolute -left-4 -top-4 text-accent/20">
                                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                                        </div>
                                        <div className="pl-6 pt-6">
                                            <p className="font-serif text-2xl sm:text-3xl italic text-primary leading-snug">
                                                {user.quote}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-serif text-2xl font-bold text-primary mb-6 flex items-center gap-3 border-b border-gray-200 pb-3">
                                        <BookOpen className="w-6 h-6 text-accent" />
                                        Biografi Intelektual
                                    </h3>
                                    <div className="font-sans text-slate-600 leading-relaxed space-y-4">
                                        {user.bio ? (
                                            user.bio.split('\n').map((paragraph, idx) => (
                                                paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
                                            ))
                                        ) : (
                                            <p className="italic text-gray-400">Pengguna belum melengkapi biografi.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Kolom Kanan: Spesialisasi & Stats */}
                            <div className="space-y-8">
                                {/* Spesialisasi Kaizen */}
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="font-serif text-lg font-bold text-primary mb-4 border-b border-gray-100 pb-2">Area Ekspertis</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {fixedData.specializations.length > 0 ? (
                                            fixedData.specializations.map((spec, index) => (
                                                <span key={index} className="bg-primary/5 text-primary border border-primary/10 px-3 py-1.5 rounded shadow-sm text-xs font-bold uppercase tracking-wider">
                                                    {spec}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="italic text-gray-400 text-sm">Belum ada data.</span>
                                        )}
                                    </div>
                                </div>

                                {/* Kontribusi Society */}
                                <div className="bg-primary p-6 rounded-xl shadow-lg text-white">
                                    <h3 className="font-serif text-lg font-bold text-white mb-6 border-b border-white/20 pb-2 flex items-center justify-between">
                                        <span>Kontribusi CSM</span>
                                        <Activity className="w-5 h-5 text-accent" />
                                    </h3>
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                                                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center border border-white/5">
                                                    <BookOpen className="w-4 h-4 text-accent" />
                                                </div>
                                                <span className="text-sm font-semibold">Artikel Jurnal</span>
                                            </div>
                                            <span className="font-bold text-xl">{fixedData.stats.articles}</span>
                                        </div>
                                        <div className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                                                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center border border-white/5">
                                                    <MessageSquare className="w-4 h-4 text-accent" />
                                                </div>
                                                <span className="text-sm font-semibold">Diskusi Forum</span>
                                            </div>
                                            <span className="font-bold text-xl">{fixedData.stats.threads}</span>
                                        </div>
                                        <div className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                                                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center border border-white/5">
                                                    <Activity className="w-4 h-4 text-accent" />
                                                </div>
                                                <span className="text-sm font-semibold">Kasus PDCA</span>
                                            </div>
                                            <span className="font-bold text-primary">{fixedData.stats.pdcaCases}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Prestasi */}
                            <div className="bg-surface-warm p-6 rounded-lg border border-accent/20 shadow-sm">
                                <h3 className="font-serif text-lg font-bold text-primary mb-4 border-b border-accent/20 pb-2 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-accent" />
                                    Prestasi & Pencapaian
                                </h3>
                                <div className="space-y-4">
                                    {achievements.length > 0 ? (
                                        achievements.map((ach) => (
                                            <div key={ach.id} className="bg-white p-3 rounded shadow-sm border border-gray-100 relative group overflow-hidden">
                                                <div className="absolute top-0 right-0 w-8 h-8 bg-accent/5 rounded-bl-full z-0"></div>
                                                <div className="relative z-10 flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded self-start">
                                                        {ach.year} {ach.competition && `- ${ach.competition}`}
                                                    </span>
                                                    <h4 className={`text-sm font-bold flex items-center gap-1.5 leading-tight ${isMedalWinner(ach.title) ? getMedalColor(ach.title) : 'text-gray-800'}`}>
                                                        {isMedalWinner(ach.title) && <Medal className={`w-3.5 h-3.5 ${getMedalColor(ach.title)}`} />}
                                                        {ach.title}
                                                    </h4>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 bg-white/50 rounded border border-gray-100">
                                            <span className="italic text-gray-400 text-sm">Belum ada catatan prestasi.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pb-8">
                    <DecorativeRule />
                </div>
            </div>
        </div>
    );
}
