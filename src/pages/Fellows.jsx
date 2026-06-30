import React from 'react';
import { Link } from 'react-router-dom';
import { FELLOWS_DATA } from '../data/mockData';
import { ChevronRight, Award, MessageSquare, Briefcase } from 'lucide-react';

export default function Fellows() {
    return (
        <div className="bg-surface-warm min-h-screen pt-24 pb-24">
            
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 mb-20 text-center relative z-10">
                <span className="inline-block bg-accent/20 border border-accent/30 text-accent font-bold tracking-widest uppercase text-xs px-4 py-1.5 rounded-full mb-4 shadow-sm">
                    CSM Intellectual Society
                </span>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 drop-shadow-md">
                    Direktori Fellow
                </h1>
                <p className="font-sans text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                    Mengenal lebih dekat para pionir dan pakar pelopor standar emas <i>Customer Experience</i> di jaringan diler Mitsubishi Motors.
                </p>
            </div>

            {/* Fellows Grid */}
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {FELLOWS_DATA.map((fellow, index) => (
                    <Link 
                        key={fellow.id} 
                        to={`/fellows/${fellow.id}`} 
                        className="group relative bg-primary rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-accent/20 transition-all duration-700 flex flex-col h-full transform hover:-translate-y-2 border border-accent/10"
                    >
                        {/* Full Image Container */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-primary-light flex-grow">
                            
                            {/* Decorative Top Gradient */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Main Gradient Overlay for Bottom Text */}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500 z-10"></div>
                            
                            {/* Image */}
                            <img 
                                src={fellow.avatar} 
                                alt={fellow.name} 
                                className="w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                            />

                            {/* Floating Badge (Join Year) */}
                            <div className="absolute top-5 right-5 z-20 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                <span className="bg-surface-card/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                                    Sejak {fellow.joinYear}
                                </span>
                            </div>

                            {/* Content Overlaid on Image Bottom */}
                            <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end h-full">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                    <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-1">
                                        {fellow.csmTitle}
                                    </span>
                                    <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-accent transition-colors duration-300">
                                        {fellow.name}
                                    </h3>
                                    <p className="text-gray-300 text-sm font-semibold mb-0">{fellow.title}</p>
                                    
                                    {/* Expandable Info on Hover */}
                                    <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out">
                                        <div className="overflow-hidden mt-4 border-t border-white/10 pt-4">
                                            <p className="text-xs text-gray-300 italic mb-5 leading-relaxed">
                                                "{fellow.quote}"
                                            </p>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-primary bg-accent/90 px-2 py-1 rounded" title="Artikel Ditulis">
                                                        <Award className="w-3 h-3" />
                                                        {fellow.stats?.articles || 0}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 border border-white/20 px-2 py-1 rounded" title="Diskusi Forum">
                                                        <MessageSquare className="w-3 h-3 text-gray-300" />
                                                        {fellow.stats?.threads || 0}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 border border-white/20 px-2 py-1 rounded" title="Kasus PDCA">
                                                        <Briefcase className="w-3 h-3 text-gray-300" />
                                                        {fellow.stats?.pdcaCases || 0}
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-surface-card/30 border border-white/20 text-white flex items-center justify-center transform group-hover:rotate-[-45deg] transition-all duration-500">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
