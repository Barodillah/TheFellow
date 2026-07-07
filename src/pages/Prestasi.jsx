import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronDown, ChevronUp, Medal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Prestasi() {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const navigate = useNavigate();

    const toggleExpand = (id) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const getMedalColor = (title) => {
        if (title.includes('1st Winner') || title.includes('Gold')) return 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]';
        if (title.includes('2nd Winner') || title.includes('Silver')) return 'text-gray-300 drop-shadow-[0_0_12px_rgba(209,213,219,0.6)]';
        if (title.includes('3rd Winner') || title.includes('Bronze')) return 'text-amber-600 drop-shadow-[0_0_12px_rgba(217,119,6,0.6)]';
        return 'text-accent';
    };

    const isMedalWinner = (title) => {
        return title.includes('1st Winner') || title.includes('Gold') || 
               title.includes('2nd Winner') || title.includes('Silver') || 
               title.includes('3rd Winner') || title.includes('Bronze');
    };

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const res = await fetch('https://incsmsociety.site/api/get_achievements.php');
                const data = await res.json();
                if (data.status === 'success') {
                    // Pastikan diurutkan berdasarkan tahun dari yang terbaru
                    const sortedAch = data.achievements.sort((a, b) => parseInt(b.year) - parseInt(a.year));
                    setAchievements(sortedAch);
                }
            } catch (err) {
                console.error("Gagal mengambil data prestasi:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    return (
        <div className="bg-surface-warm min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                {/* Background Image - Using a premium corporate/achievement placeholder image */}
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop')" }}
                ></div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/80 to-surface-warm z-10"></div>
                
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-10">
                    <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block shadow-sm">
                        Hall of Fame
                    </span>
                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                        Prestasi & Rekam Jejak
                    </h1>
                    <p className="text-gray-200 text-lg md:text-xl font-sans leading-relaxed max-w-3xl mx-auto font-light drop-shadow">
                        Berbagai pencapaian gemilang dan dedikasi nyata dari para Fellow CSM Intellectual Society dalam mengukir standar emas pengalaman pelayanan pelanggan.
                    </p>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 md:-mt-16 relative z-30">
                {loading ? (
                    <div className="flex justify-center items-center py-20 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
                        <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    </div>
                ) : achievements.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
                        <p className="text-gray-300 text-lg">Belum ada data prestasi yang ditambahkan.</p>
                    </div>
                ) : (
                    <div className="relative border-l-4 border-accent/30 md:ml-12 ml-4 space-y-12 pb-12 pt-8">
                        {achievements.map((item) => (
                            <div key={item.id} className="relative pl-6 sm:pl-8 md:pl-16 group">
                                {/* Timeline Node / Dot */}
                                <div className="absolute w-6 h-6 sm:w-8 sm:h-8 bg-surface-card border-4 border-accent rounded-full -left-[14px] sm:-left-[18px] top-6 group-hover:bg-accent group-hover:scale-125 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.6)] flex items-center justify-center z-20">
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full group-hover:bg-white transition-colors duration-300"></div>
                                </div>
                                
                                {/* Connect Line to Card */}
                                <div className="absolute h-1 w-6 sm:w-8 md:w-16 bg-accent/30 top-[34px] left-[10px] sm:left-[14px] z-10 group-hover:bg-accent/80 transition-colors duration-300"></div>

                                {/* Content Card */}
                                <div className="bg-primary/95 backdrop-blur-md border border-accent/20 rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.3)] hover:border-accent/50 transition-all duration-500 transform group-hover:-translate-y-2 relative overflow-hidden z-20">
                                    
                                    {/* Abstract background shape for the card */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-500 pointer-events-none"></div>

                                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative z-10">
                                        <div className="flex-grow w-full cursor-pointer" onClick={() => toggleExpand(item.id)}>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                                                <span className="bg-gradient-to-r from-accent to-accent-light text-primary font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm tracking-wider shadow-md">
                                                    {item.year}
                                                </span>
                                                <span className="bg-surface-card/40 text-gray-300 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md border border-gray-600 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                                                    {item.competition}
                                                </span>
                                            </div>
                                            <h3 className={`font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3 transition-colors duration-300 leading-tight ${isMedalWinner(item.title) ? getMedalColor(item.title) + ' group-hover:text-white' : 'text-white group-hover:text-accent'}`}>
                                                {isMedalWinner(item.title) && <Medal className={`w-6 h-6 sm:w-8 sm:h-8 ${getMedalColor(item.title)}`} />}
                                                {item.title}
                                            </h3>
                                            
                                            <AnimatePresence>
                                                {expandedIds.has(item.id) && item.description && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="pt-2 pb-2 text-gray-300 text-sm md:text-base font-light leading-relaxed border-t border-accent/20 mt-4">
                                                            {item.description}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            
                                            {item.description && (
                                                <div className="text-accent text-xs flex items-center mt-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                    {expandedIds.has(item.id) ? (
                                                        <><ChevronUp className="w-4 h-4 mr-1" /> Tutup detail</>
                                                    ) : (
                                                        <><ChevronDown className="w-4 h-4 mr-1" /> Lihat detail</>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Personal Info Box */}
                                        <div 
                                            className="flex items-center gap-4 bg-surface-card p-4 sm:p-5 rounded-xl border border-accent/20 w-full lg:w-auto lg:min-w-[280px] shrink-0 group-hover:bg-surface-warm group-hover:border-accent/60 transition-all duration-300 shadow-lg relative overflow-hidden cursor-pointer" 
                                            title={`Lihat profil ${item.user_name}`}
                                            onClick={(e) => {
                                                e.stopPropagation(); // prevent toggling the achievement description if they just want to click the profile
                                                navigate(`/fellows/${item.user_id}`);
                                            }}
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 rounded-bl-full -mr-4 -mt-4 z-0 pointer-events-none"></div>
                                            <img 
                                                src={item.user_avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg'} 
                                                alt={item.user_name} 
                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-accent object-cover shadow-[0_0_10px_rgba(212,175,55,0.3)] z-10 relative group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="z-10 relative flex-grow">
                                                <h4 className="font-serif font-bold text-primary text-lg sm:text-xl leading-tight mb-1">{item.user_name}</h4>
                                                <p className="text-accent text-[10px] sm:text-xs font-bold uppercase tracking-widest">{item.user_title || 'Fellow'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
