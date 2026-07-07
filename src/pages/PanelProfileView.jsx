import React, { useState, useEffect } from 'react';
import { Award, Activity, BookOpen, MessageSquare, ArrowLeft, Trophy, Medal } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export default function PanelProfileView() {
    const { id } = useParams();
    const navigate = useNavigate();
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

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat profil...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!user) return <div className="p-8 text-center text-gray-500">Pengguna tidak ditemukan.</div>;

    const fixedData = {
        avatar: user.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg',
        badges: Array.isArray(user.badges) ? user.badges : [],
        joinYear: user.join_year || new Date().getFullYear(),
        stats: { 
            articles: user.stats_articles || 0, 
            threads: user.stats_threads || 0, 
            pdcaCases: user.stats_pdca_cases || 0 
        },
        achievements: [], // Implement achievements endpoint later if needed
        specializations: Array.isArray(user.specializations) ? user.specializations : []
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <button 
                        onClick={() => navigate('/directory')}
                        className="flex items-center text-gray-500 hover:text-primary transition-colors text-sm font-medium mb-3"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Direktori
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-primary">Profil Pengguna</h1>
                    <p className="text-gray-500 text-sm mt-1">Detail informasi publik dan biografi intelektual rekan Anda.</p>
                </div>
            </div>

            <div className="bg-surface-card rounded-xl border-2 border-accent/30 shadow-xl overflow-hidden">
                <div className="bg-primary p-8 sm:p-12 text-surface-warm relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Award className="w-40 h-40 text-accent" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                        <div className="relative">
                            <img 
                                src={fixedData.avatar} 
                                alt={user.name} 
                                className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-accent shadow-lg bg-white"
                            />
                        </div>
                        <div className="text-center sm:text-left w-full max-w-lg mt-4 sm:mt-0">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-accent px-3 py-1 rounded inline-block mb-3">
                                {user.title || (user.role === 'member' ? 'Member' : 'Fellow')}
                            </span>
                            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-2">{user.name}</h1>
                            {user.csm_title && (
                                <p className="text-accent-light font-semibold mb-4">{user.csm_title}</p>
                            )}
                            
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6 mt-4">
                                {fixedData.badges.map((badge, idx) => (
                                    <span key={idx} className="bg-primary-light border border-accent/40 text-xs px-2.5 py-1 rounded-full text-gray-300">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                            
                            <p className="font-sans text-sm text-gray-400 italic">Bergabung sejak {fixedData.joinYear}</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-8 sm:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-8">
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-primary mb-4">Biografi Intelektual</h3>
                                <p className="font-sans text-slate-600 leading-relaxed text-sm sm:text-base mb-6">
                                    {user.bio || <span className="italic text-gray-400">Pengguna belum menambahkan biografi.</span>}
                                </p>
                            </div>
                            
                            {user.quote && (
                                <div className="bg-primary-light/10 border-l-4 border-accent p-6 rounded-r-lg relative">
                                    <p className="font-serif text-xl sm:text-2xl italic text-primary leading-snug">
                                        "{user.quote}"
                                    </p>
                                </div>
                            )}
                            
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-primary mb-4">Spesialisasi Kaizen</h3>
                                <div className="flex flex-wrap gap-3">
                                    {fixedData.specializations.length > 0 ? (
                                        fixedData.specializations.map((spec, idx) => (
                                            <div key={idx} className="bg-surface-warm border border-accent/30 text-primary px-4 py-2 rounded shadow-sm text-sm font-semibold">
                                                {spec}
                                            </div>
                                        ))
                                    ) : (
                                        <span className="italic text-gray-400 text-sm">Belum ada spesialisasi.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Kolom Kanan: Stats / Kontribusi */}
                        <div className="space-y-6">
                            <div className="bg-surface-warm p-6 rounded-lg border border-accent/20">
                                <h3 className="font-serif text-lg font-bold text-primary mb-4 border-b border-accent/20 pb-2">Kontribusi Society</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <BookOpen className="w-5 h-5 text-accent" />
                                            <span className="text-sm font-semibold">Artikel Jurnal</span>
                                        </div>
                                        <span className="font-bold text-primary">{fixedData.stats.articles}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <MessageSquare className="w-5 h-5 text-accent" />
                                            <span className="text-sm font-semibold">Diskusi Forum</span>
                                        </div>
                                        <span className="font-bold text-primary">{fixedData.stats.threads}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Activity className="w-5 h-5 text-accent" />
                                            <span className="text-sm font-semibold">Kasus PDCA</span>
                                        </div>
                                        <span className="font-bold text-primary">{fixedData.stats.pdcaCases}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Card Prestasi */}
                            <div className="bg-surface-warm p-6 rounded-lg border border-accent/20">
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
        </div>
    );
}
