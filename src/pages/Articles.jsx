import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { BLOG_ARTICLES_DATA } from '../data/mockData';
import { Link } from 'react-router-dom';

export default function Articles() {
    // Separate featured article and the rest
    const featuredArticle = BLOG_ARTICLES_DATA.find(article => article.isFeatured) || BLOG_ARTICLES_DATA[0];
    const regularArticles = BLOG_ARTICLES_DATA.filter(article => article.id !== featuredArticle.id);

    return (
        <div className="bg-surface-warm min-h-screen pt-24 pb-20">
            
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
                <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Wawasan Intelektual</span>
                <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-6">Jurnal & Publikasi</h1>
                <p className="font-sans text-gray-500 max-w-2xl mx-auto text-lg">
                    Eksplorasi mendalam, analisis strategis, dan studi kasus pelayanan terbaik dari para Fellow CSM Intellectual Society.
                </p>
            </div>

            {/* Featured Article (Highlight) */}
            <div className="max-w-7xl mx-auto px-4 mb-20">
                <div className="bg-surface-card rounded-2xl border border-accent/20 shadow-2xl overflow-hidden group cursor-pointer flex flex-col md:flex-row hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.2)] hover:border-accent/50 transition-all duration-500">
                    
                    {/* Image side */}
                    <div className="md:w-3/5 relative h-72 md:h-auto overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                        <img 
                            src={featuredArticle.image} 
                            alt={featuredArticle.title} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                        />
                        <div className="absolute top-6 left-6 z-20">
                            <span className="bg-accent text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded shadow-lg">
                                Sorotan Utama
                            </span>
                        </div>
                    </div>

                    {/* Content side */}
                    <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-primary text-white relative overflow-hidden">
                        {/* Decorative Shape */}
                        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 font-semibold uppercase tracking-wider z-10">
                            <span className="bg-surface-card/30 border border-gray-600 px-3 py-1 rounded text-gray-300">
                                {featuredArticle.category}
                            </span>
                        </div>

                        <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white leading-tight mb-4 group-hover:text-accent transition-colors duration-300 z-10">
                            {featuredArticle.title}
                        </h2>

                        <p className="font-sans text-gray-300 leading-relaxed mb-8 z-10 text-sm lg:text-base">
                            {featuredArticle.excerpt}
                        </p>

                        <div className="flex items-center justify-between z-10 border-t border-accent/20 pt-6 mt-auto">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                    <User className="w-4 h-4 text-accent" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{featuredArticle.author}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                        <Calendar className="w-3 h-3" /> {featuredArticle.date}
                                    </p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-surface-card/20 border border-accent/30 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-300 transform group-hover:translate-x-1">
                                <ArrowRight className="w-5 h-5 text-accent group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rest of the articles grid */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
                    <h3 className="font-serif text-2xl font-bold text-primary">Artikel Terbaru</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularArticles.map(article => (
                        <div key={article.id} className="bg-surface-card rounded-xl border border-accent/20 shadow-lg overflow-hidden group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                            <div className="relative h-56 overflow-hidden">
                                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                <img src={article.image} alt={article.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="bg-accent text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-md">
                                        {article.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-3 font-semibold uppercase tracking-wide">
                                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent" /> {article.date}</span>
                                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-accent" /> {article.author}</span>
                                </div>

                                <h3 className="font-serif text-lg font-bold text-primary leading-tight mb-3 group-hover:text-accent transition-colors duration-200 line-clamp-2">
                                    {article.title}
                                </h3>

                                <p className="font-sans text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3">
                                    {article.excerpt}
                                </p>

                                <div className="mt-auto pt-4 border-t border-accent/10 flex items-center justify-between">
                                    <span className="text-xs font-bold text-primary group-hover:text-accent transition-colors">Baca Selengkapnya</span>
                                    <div className="w-8 h-8 rounded-full bg-primary-light/50 flex items-center justify-center group-hover:bg-accent transition-colors">
                                        <ArrowRight className="w-4 h-4 text-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
