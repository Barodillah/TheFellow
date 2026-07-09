import React, { useRef, useEffect, useState } from 'react';
import { Shield, ArrowRight, Calendar, User, RefreshCcw, HeartHandshake, BookOpen, MessageSquare, Target, Users, Zap, Globe, Award, Briefcase, FileText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DecorativeRule from '../components/shared/DecorativeRule';



export default function Home() {
    const sliderRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [dbFellows, setDbFellows] = useState([]);
    const [recentPublikasi, setRecentPublikasi] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('https://incsmsociety.site/api/get_users.php');
                const data = await res.json();
                if (data.status === 'success') {
                    // Hanya tampilkan role admin dan fellow di Home
                    setDbFellows(data.users.filter(u => u.role === 'admin' || u.role === 'fellow'));
                }
            } catch (err) {
                console.error("Gagal memuat fellows", err);
            }
        };
        fetchUsers();

        const fetchPublikasi = async () => {
            try {
                const res = await fetch(`${import.meta.env.BASE_URL}api/get_publikasi.php`);
                const data = await res.json();
                if (data.status === 'success') {
                    const publicDocs = data.data.filter(p => p.status === 'publish' && p.visibility === 'public');
                    setRecentPublikasi(publicDocs.slice(0, 3));
                }
            } catch (err) {
                console.error("Gagal memuat publikasi", err);
            }
        };
        fetchPublikasi();
    }, []);

    // Create an infinite loop array by duplicating the data
    const infiniteFellows = dbFellows.length > 0 ? [...dbFellows, ...dbFellows, ...dbFellows] : [];

    useEffect(() => {
        const container = sliderRef.current;
        if (!container) return;

        const interval = setInterval(() => {
            if (isHovered) return;
            
            if (container.children.length === 0) return;
            
            const maxScroll = container.scrollWidth - container.clientWidth;
            const scrollStep = container.children[0].clientWidth + 24; // width + gap-6(24px)
            
            // If we are getting close to the end (within 3 cards), append more data!
            if (container.scrollLeft >= maxScroll - (scrollStep * 3)) {
                setInfiniteFellows(prev => [...prev, ...FELLOWS_DATA]);
            }
            
            container.scrollBy({ left: scrollStep, behavior: 'smooth' });
        }, 1500);

        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <>
            {/* HERO SECTION */}
            <section className="relative bg-primary text-surface-warm pt-24 pb-32 px-4 border-b-2 border-accent/50">
                <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                    <div className="w-full h-full" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541163947419-01430618386d')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    {/* Left Column */}
                    <div className="lg:col-span-7 text-left">
                        <div className="inline-flex items-center space-x-2 bg-primary-light border border-accent/40 px-3 py-1.5 rounded-full mb-6">
                            <Shield className="w-3.5 h-3.5 text-accent" />
                            <span className="font-sans text-[10px] tracking-widest text-surface-warm uppercase font-semibold">Excellence Through Kaizen</span>
                        </div>

                        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                            Shaping Today and Tomorrow, <br />
                            <span className="text-accent italic font-serif">Better.</span>
                        </h1>

                        <p className="font-serif italic text-base sm:text-lg text-gray-300 max-w-xl mb-10 leading-relaxed">
                            "Selamat datang di platform eksklusif intelektual para Customer Satisfaction Manager Mitsubishi. Tempat pertukaran gagasan revolusioner, pemantapan standar H.O.M.E, dan perbaikan berkelanjutan tanpa henti."
                        </p>

                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <Link
                                to="/fellows"
                                className="w-full sm:w-auto bg-accent hover:bg-accent-light text-primary font-sans text-sm font-semibold px-8 py-3.5 rounded shadow-lg transition duration-200 flex items-center justify-center gap-2"
                            >
                                <span>Lihat Direktori Fellow</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/home-standard"
                                className="w-full sm:w-auto border border-accent hover:bg-accent/10 text-accent font-sans text-sm font-semibold px-8 py-3.5 rounded transition duration-200 flex items-center justify-center gap-2"
                            >
                                <span>Materi Standard H.O.M.E</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column — Event Card (flush right, straddles hero bottom edge) */}
                    <div className="hidden lg:block absolute right-0 bottom-0 translate-y-1/2 w-[480px] z-[50]">
                        <div className="bg-gradient-to-br from-accent to-accent-light text-primary p-12 shadow-2xl w-full">
                            <h2 className="font-serif text-5xl font-extrabold leading-tight mb-2 uppercase">
                                CS National<br />Meeting <span className="font-sans font-black">2026</span>
                            </h2>

                            <div className="h-[2px] bg-primary/20 my-6"></div>

                            <h3 className="font-sans text-lg font-bold mb-2">Customer Satisfaction Summit</h3>
                            <p className="font-sans text-sm text-primary/80 leading-relaxed">
                                Explore this year's full programme and plan your visit.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2 MAIN PILLARS SECTION */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Fondasi Ekosistem</span>
                    <h2 className="font-serif text-3xl sm:text-5xl font-bold text-primary mb-6">Dua Pilar Utama Kami</h2>
                    <p className="font-sans text-lg text-slate-500 max-w-2xl mx-auto">
                        Kerangka kerja baku pelayanan Mitsubishi untuk menghadirkan ketulusan yang berkesan di setiap langkah perjalanan pelanggan, dikelola secara berkelanjutan.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-stretch">

                    {/* Pilar 1: PDCA */}
                    <div className="bg-primary/95 backdrop-blur-md border border-accent/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group hover:border-accent/50 transition-colors duration-500 flex flex-col">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-accent/20 transition-colors duration-500"></div>
                        <div className="relative z-10 flex-grow">
                            <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center border border-accent/30 mb-8 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                                <RefreshCcw className="w-8 h-8 text-accent group-hover:text-primary transition-colors duration-300" />
                            </div>
                            <h3 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-accent transition-colors duration-300">
                                PDCA
                            </h3>
                            <h4 className="text-accent font-medium mb-6 uppercase tracking-wider text-sm">Dasar Continuous Improvement (Kaizen)</h4>
                            <p className="text-gray-300 leading-relaxed font-light mb-8">
                                Filosofi Plan, Do, Check, Act adalah detak jantung inovasi kami. Pendekatan analitis tanpa henti untuk membongkar akar masalah, menguji solusi, dan membakukan standar baru demi pelayanan tanpa celah.
                            </p>
                        </div>
                        <div className="relative z-10 mt-auto pt-8 border-t border-white/10">
                            <Link
                                to="/pdca"
                                className="inline-flex items-center gap-2 text-accent font-bold hover:text-white transition-colors group/btn"
                            >
                                Pelajari Metodologi PDCA
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Pilar 2: H.O.M.E */}
                    <div className="bg-surface-card border border-accent/20 rounded-3xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-shadow duration-500 relative flex flex-col group">
                        <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
                            <span className="font-serif text-[15rem] font-bold leading-none -mb-10 -mr-10">H</span>
                        </div>
                        <div className="relative z-10 flex-grow">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-8 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                <HeartHandshake className="w-8 h-8 text-primary group-hover:text-surface-warm transition-colors duration-300" />
                            </div>
                            <h3 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4 group-hover:text-accent transition-colors duration-300">
                                H.O.M.E
                            </h3>
                            <h4 className="text-slate-500 font-bold mb-6 uppercase tracking-wider text-sm">Passion to Care</h4>
                            <p className="text-slate-600 leading-relaxed font-light mb-8">
                                Hospitality, One Service Standard, Memorable Experience, dan Empathy. Empat nilai tulus yang memanusiakan setiap titik sentuh, mengubah pelanggan menjadi keluarga.
                            </p>
                        </div>
                        <div className="relative z-10 mt-auto pt-8 border-t border-accent/20">
                            <Link
                                to="/home-standard"
                                className="inline-flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors group/btn"
                            >
                                Lihat Standar H.O.M.E
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>

                </div>
            </section>

            {/* NEWS & ARTICLE SECTION */}
            <section className="py-20 px-4 max-w-7xl mx-auto border-t border-accent/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Pusat Literatur</span>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary">Publikasi Terbaru</h2>
                    </div>
                    <Link to="/publikasi" className="group flex items-center gap-2 text-primary font-bold text-sm hover:text-accent transition-colors mt-4 sm:mt-0">
                        <span>Lihat Semua Publikasi</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {recentPublikasi.map(pub => (
                        <div key={pub.id} className="group bg-surface-card border border-accent/20 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col transform hover:-translate-y-2">
                            <div className="h-64 overflow-hidden relative">
                                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                <img src={`${import.meta.env.BASE_URL}${pub.coverImg.substring(1)}`} alt={pub.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-4 z-20">
                                    <BookOpen className="w-6 h-6 text-accent mb-2" />
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                        {pub.category}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-accent uppercase tracking-wider">
                                        <User className="w-3.5 h-3.5" /> {pub.author}
                                    </span>
                                </div>

                                <h3 className="font-serif text-xl font-bold text-primary leading-tight mb-3 group-hover:text-accent transition-colors duration-200 line-clamp-2">
                                    {pub.title}
                                </h3>

                                <p className="font-sans text-sm text-slate-600 leading-relaxed mb-6 flex-grow line-clamp-3">
                                    {pub.description}
                                </p>

                                <Link to="/publikasi" className="mt-auto pt-4 border-t border-accent/10 flex items-center justify-between group-hover:border-accent/30 transition-colors">
                                    <span className="text-xs font-bold text-primary group-hover:text-accent transition-colors">Lihat Detail</span>
                                    <div className="w-8 h-8 rounded-full bg-primary-light/30 flex items-center justify-center group-hover:bg-accent transition-colors shadow-sm">
                                        <ArrowRight className="w-4 h-4 text-primary" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FELLOWS PREVIEW SECTION */}
            <section className="py-24 px-4 max-w-7xl mx-auto border-t border-accent/20 overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Direktori Intelektual</span>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-2">The Fellows</h2>
                        <p className="font-sans text-sm text-slate-500 max-w-xl">
                            Mengenal lebih dekat para pionir standar emas Customer Experience.
                        </p>
                    </div>
                    <Link to="/fellows" className="hidden md:flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors mt-4 md:mt-0 group">
                        Lihat Semua Fellow
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Horizontal Scroll Container */}
                <div 
                    ref={sliderRef} 
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {infiniteFellows.map((fellow, index) => (
                        <div key={`${fellow.id}-${index}`} className="min-w-[85vw] sm:min-w-[320px] lg:min-w-0 lg:w-1/3 snap-center shrink-0">
                            <Link
                                to={`/fellows/${fellow.id}`}
                                className="group relative bg-primary rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-accent/20 transition-all duration-700 flex flex-col aspect-[3/4] transform hover:-translate-y-2 border border-accent/10 block w-full h-full"
                            >
                                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500 z-10 pointer-events-none"></div>

                                <img
                                    src={fellow.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg'}
                                    alt={fellow.name}
                                    className="w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-700 ease-in-out absolute inset-0"
                                />

                                <div className="absolute top-5 right-5 z-20 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                                    <span className="bg-surface-card/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                                        Sejak {fellow.join_year || new Date().getFullYear()}
                                    </span>
                                </div>

                                <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end h-full pointer-events-none">
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out pointer-events-auto">
                                        <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-1">
                                            {fellow.csm_title || 'CSM Fellow'}
                                        </span>
                                        <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-accent transition-colors duration-300">
                                            {fellow.name}
                                        </h3>
                                        <p className="text-gray-300 text-sm font-semibold mb-0">{fellow.title}</p>

                                        <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out">
                                            <div className="overflow-hidden mt-4 border-t border-white/10 pt-4">
                                                <p className="text-xs text-gray-300 italic mb-5 leading-relaxed line-clamp-2">
                                                    "{fellow.quote || 'Berkomitmen pada kualitas pelayanan terbaik.'}"
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-1">
                                                        Lihat Profil Detail
                                                    </span>
                                                    <div className="w-8 h-8 rounded-full bg-surface-card/30 border border-white/20 text-white flex items-center justify-center transform group-hover:rotate-[-45deg] transition-all duration-500">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link
                        to="/fellows"
                        className="inline-flex bg-accent hover:bg-accent-light text-primary font-sans text-sm font-bold px-8 py-3 rounded shadow-lg transition duration-200 justify-center w-full"
                    >
                        Lihat Semua Fellow
                    </Link>
                </div>
            </section>

            {/* ABOUT / BRIDGING THE GAP SECTION */}
            <section className="py-24 px-4 max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-primary to-primary-light rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden border border-accent/20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                        <div className="lg:w-2/3">
                            <span className="inline-block bg-accent/20 border border-accent/30 text-accent font-bold tracking-widest uppercase text-xs px-4 py-1.5 rounded-full mb-6 shadow-sm">
                                Tentang Kami
                            </span>
                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                Menjembatani Kesenjangan, Membangun <span className="text-accent italic">Keunggulan</span>
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed mb-6 font-light">
                                Kami menyadari bahwa tidak semua Customer Satisfaction Manager memiliki akses yang sama terhadap sumber daya, bimbingan, maupun ekosistem pengembangan yang suportif.
                            </p>
                            <p className="text-gray-300 text-lg leading-relaxed mb-8 font-light">
                                CSM Intellectual Society hadir sebagai <strong className="text-white font-semibold">jembatan pengetahuan</strong>—sebuah ruang inklusif di mana ide-ide inovatif dibagikan secara terbuka. Kami memastikan setiap profesional, terlepas dari keterbatasan dukungan dan investasi di tempatnya berada, dapat mengakses standar emas pelayanan untuk bertumbuh bersama.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link 
                                    to="/about"
                                    className="bg-accent hover:bg-accent-light text-primary font-sans text-sm font-bold px-8 py-4 rounded shadow-lg transition duration-200 text-center inline-flex justify-center items-center gap-2 group"
                                >
                                    Kenali Visi Kami
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                        
                        <div className="lg:w-1/3 hidden lg:flex justify-center items-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse"></div>
                                <div className="w-48 h-48 border border-accent/50 rounded-full flex items-center justify-center relative z-10 backdrop-blur-sm bg-white/5 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                                    <HeartHandshake className="w-20 h-20 text-accent" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
