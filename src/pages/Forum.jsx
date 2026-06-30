import React, { useState } from 'react';
import { MessageSquare, Heart, Eye, Filter, Plus, Search, ChevronRight } from 'lucide-react';
import { THREADS_DATA, FELLOWS_DATA } from '../data/mockData';

export default function Forum() {
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'Semua Diskusi' },
        { id: 'kaizen-corner', label: 'Kaizen Corner' },
        { id: 'empathy-circle', label: 'Empathy Circle' },
        { id: 'one-standard-exchange', label: 'One Standard Exchange' },
    ];

    const filteredThreads = activeCategory === 'all' 
        ? THREADS_DATA 
        : THREADS_DATA.filter(t => t.category === activeCategory);

    // Helper to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    };

    return (
        <div className="bg-surface-warm min-h-screen pt-24 pb-20">
            {/* Header Section */}
            <div className="bg-primary pt-16 pb-32 px-4 relative overflow-hidden -mt-24 mb-16 shadow-xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-light/30 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto mt-16 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <span className="inline-block bg-accent/20 border border-accent/30 text-accent font-bold tracking-widest uppercase text-xs px-3 py-1 rounded-full mb-4 shadow-sm">
                            Tukar Gagasan
                        </span>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-md">
                            Forum Diskusi
                        </h1>
                        <p className="font-sans text-gray-300 max-w-xl text-lg font-light leading-relaxed">
                            Ruang kolaboratif para Fellow untuk membedah kasus lapangan, berbagi taktik <i className="text-accent">Kaizen</i>, dan merumuskan standar layanan paripurna.
                        </p>
                    </div>
                    <button className="bg-gradient-to-r from-accent to-accent-light text-primary font-bold px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-1">
                        <Plus className="w-5 h-5" />
                        Buat Diskusi Baru
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8 -mt-24 relative z-20">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Search Bar */}
                    <div className="bg-surface-card rounded-2xl border border-accent/20 p-5 shadow-xl">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Cari topik..." 
                                className="w-full bg-primary/5 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-gray-700 placeholder-gray-400"
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-surface-card rounded-2xl border border-accent/20 p-5 shadow-xl">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                                <Filter className="w-4 h-4 text-accent" />
                            </div>
                            <h3 className="font-serif font-bold text-primary text-lg">Kategori Topik</h3>
                        </div>
                        <div className="space-y-1.5">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 flex items-center justify-between group ${
                                        activeCategory === cat.id 
                                            ? 'bg-primary text-white font-bold shadow-md transform scale-[1.02]' 
                                            : 'text-gray-600 hover:bg-primary/5 hover:text-primary font-medium'
                                    }`}
                                >
                                    <span>{cat.label}</span>
                                    <ChevronRight className={`w-4 h-4 ${activeCategory === cat.id ? 'text-accent' : 'text-gray-300 group-hover:text-accent group-hover:translate-x-1'} transition-all`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {filteredThreads.map(thread => {
                        const author = FELLOWS_DATA.find(f => f.id === thread.authorId);

                        return (
                            <div key={thread.id} className="bg-surface-card rounded-2xl border border-accent/20 p-6 md:p-8 shadow-lg hover:shadow-2xl hover:border-accent/40 transition-all duration-300 group">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className="absolute inset-0 bg-accent rounded-full blur-sm opacity-20 group-hover:opacity-50 transition-opacity"></div>
                                            <img src={author?.avatar} alt={author?.name} className="w-14 h-14 rounded-full border-2 border-accent object-cover relative z-10 shadow-sm" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary text-lg leading-tight hover:text-accent transition-colors cursor-pointer">{author?.name}</h4>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 font-medium">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded">{author?.title}</span>
                                                <span>•</span>
                                                <span>{formatDate(thread.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="shrink-0 bg-accent/10 border border-accent/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
                                        {thread.categoryLabel}
                                    </span>
                                </div>

                                <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-3 group-hover:text-accent transition-colors cursor-pointer leading-tight">
                                    {thread.title}
                                </h2>
                                
                                <p className="font-sans text-sm md:text-base text-gray-600 leading-relaxed mb-6 line-clamp-3">
                                    {thread.content}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {thread.tags.map(tag => (
                                        <span key={tag} className="text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 cursor-pointer px-2.5 py-1 rounded-md transition-colors">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-gray-100 gap-4">
                                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
                                        <div className="flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors cursor-pointer group/icon">
                                            <div className="p-2 rounded-full group-hover/icon:bg-pink-50 transition-colors">
                                                <Heart className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-semibold">{thread.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer group/icon">
                                            <div className="p-2 rounded-full group-hover/icon:bg-blue-50 transition-colors">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-semibold">{thread.repliesCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <div className="p-2">
                                                <Eye className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-semibold">{thread.views}</span>
                                        </div>
                                    </div>
                                    <button className="w-full sm:w-auto bg-primary/5 hover:bg-primary text-primary hover:text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 group/btn">
                                        Ikuti Diskusi
                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {filteredThreads.length === 0 && (
                        <div className="text-center py-24 bg-surface-card rounded-2xl border-2 border-dashed border-gray-200">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-500 mb-2">Belum Ada Diskusi</h3>
                            <p className="text-gray-400 text-sm">Jadilah yang pertama memulai diskusi untuk kategori ini!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
