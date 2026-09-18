import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Search, Filter, LayoutGrid, List as ListIcon, 
    MoreVertical, FileText, CheckCircle2, XCircle, 
    Clock, Eye, Heart, MessageSquare, Edit3, Trash2,
    Share2, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

// GET ACTUAL USER DATA
const userStr = localStorage.getItem('csm_user');
const currentUser = userStr ? JSON.parse(userStr) : null;
const userRole = currentUser?.role || 'member';
const userId = currentUser?.id || '';

const STATUS_TABS = [
    { id: 'all', label: 'Semua' },
    { id: 'published', label: 'Terbit' },
    { id: 'request', label: 'Menunggu Review' },
    { id: 'draft', label: 'Draft' },
    { id: 'archived', label: 'Diarsipkan' }
];

const getStatusConfig = (status) => {
    switch(status) {
        case 'published': return { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'Diterbitkan' };
        case 'request': return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pending Review' };
        case 'draft': return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText, label: 'Draft' };
        case 'archived': return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Diarsipkan' };
        default: return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText, label: 'Unknown' };
    }
};

export default function MyArticles() {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [searchQuery, setSearchQuery] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(`https://incsmsociety.site/api/get_articles.php?user_id=${userId}&role=${userRole}`);
                const result = await response.json();
                if (result.success) {
                    setArticles(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch articles", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchArticles();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (id) => {
        if (openDropdownId === id) setOpenDropdownId(null);
        else setOpenDropdownId(id);
    };

    const filteredArticles = articles.filter(article => {
        const matchStatus = activeTab === 'all' || article.status === activeTab;
        const matchSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchSearch;
    });

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {filteredArticles.map(article => {
                    const StatusIcon = getStatusConfig(article.status).icon;
                    return (
                        <motion.div 
                            key={article.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                        >
                            <div className="h-40 bg-gray-100 relative overflow-hidden group">
                                {article.cover_image ? (
                                    <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <FileText size={40} className="mb-2 opacity-50" />
                                        <span className="text-xs font-medium uppercase tracking-widest">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border backdrop-blur-md ${getStatusConfig(article.status).color.replace('bg-', 'bg-white/90 border-')}`}>
                                        <StatusIcon size={12} />
                                        {getStatusConfig(article.status).label}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3" ref={openDropdownId === `grid-${article.id}` ? dropdownRef : null}>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleDropdown(`grid-${article.id}`); }}
                                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-gray-600 hover:text-primary hover:bg-white flex items-center justify-center transition-colors shadow-sm"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    
                                    <AnimatePresence>
                                        {openDropdownId === `grid-${article.id}` && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                                            >
                                                <Link to={`/articles/${article.slug}`} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                                    <ExternalLink size={14} /> Buka Artikel
                                                </Link>
                                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                                    <Share2 size={14} /> Bagikan
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <span className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1.5">
                                    <Clock size={12}/> Terakhir diubah: {article.date}
                                </span>
                                <h3 className="font-bold text-gray-800 text-lg leading-snug mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                                    {article.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                                    {article.excerpt}
                                </p>
                                
                                {article.status === 'archived' && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                                        <p className="text-xs text-red-600"><strong>Catatan Reviewer:</strong> {article.feedback || 'Artikel diarsipkan.'}</p>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-gray-500">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5" title="Views">
                                            <Eye size={14} className={article.views > 0 ? "text-blue-500" : ""} />
                                            <span className="text-xs font-semibold">{article.views}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5" title="Likes">
                                            <Heart size={14} className={article.likes > 0 ? "text-rose-500" : ""} />
                                            <span className="text-xs font-semibold">{article.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5" title="Comments">
                                            <MessageSquare size={14} className={article.comments > 0 ? "text-amber-500" : ""} />
                                            <span className="text-xs font-semibold">{article.comments}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <Link to={`/articles/edit/${article.id}`} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Edit">
                                            <Edit3 size={16} />
                                        </Link>
                                        {article.status !== 'published' && (
                                            <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    );

    const renderListView = () => (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                            <th className="p-4 font-semibold w-1/2">Artikel</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-center">Interaksi</th>
                            <th className="p-4 font-semibold text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredArticles.map(article => {
                                const StatusIcon = getStatusConfig(article.status).icon;
                                return (
                                    <motion.tr 
                                        key={article.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group"
                                    >
                                        <td className="p-4">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-16 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden hidden sm:block">
                                                    {article.cover_image ? (
                                                        <img src={article.cover_image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><FileText size={16}/></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 line-clamp-1 hover:text-primary cursor-pointer transition-colors mb-1">{article.title}</h4>
                                                    <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1"><Clock size={10}/> {article.date}</span>
                                                </div>
                                            </div>
                                            {article.status === 'archived' && (
                                                <div className="mt-2 text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-100 sm:ml-20">
                                                    <strong>Reviewer:</strong> {article.feedback || 'Artikel diarsipkan.'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${getStatusConfig(article.status).color}`}>
                                                <StatusIcon size={12} />
                                                {getStatusConfig(article.status).label}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-3 text-gray-500">
                                                <div className="flex flex-col items-center" title="Views">
                                                    <Eye size={14} className={article.views > 0 ? "text-blue-500 mb-1" : "mb-1"} />
                                                    <span className="text-[10px] font-bold">{article.views}</span>
                                                </div>
                                                <div className="flex flex-col items-center" title="Likes">
                                                    <Heart size={14} className={article.likes > 0 ? "text-rose-500 mb-1" : "mb-1"} />
                                                    <span className="text-[10px] font-bold">{article.likes}</span>
                                                </div>
                                                <div className="flex flex-col items-center" title="Comments">
                                                    <MessageSquare size={14} className={article.comments > 0 ? "text-amber-500 mb-1" : "mb-1"} />
                                                    <span className="text-[10px] font-bold">{article.comments}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link to={`/articles/edit/${article.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-white border border-transparent hover:border-gray-200 transition-all shadow-sm opacity-0 group-hover:opacity-100">
                                                    <Edit3 size={16} />
                                                </Link>
                                                <div className="relative" ref={openDropdownId === `list-${article.id}` ? dropdownRef : null}>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); toggleDropdown(`list-${article.id}`); }}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-white border border-transparent hover:border-gray-200 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {openDropdownId === `list-${article.id}` && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                                className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                                                            >
                                                                <Link to={`/articles/${article.slug}`} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                                                    <ExternalLink size={14} /> Buka Artikel
                                                                </Link>
                                                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                                                    <Share2 size={14} /> Bagikan
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filteredArticles.length === 0 && (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                        <FileText size={32} className="mb-3 text-gray-300" />
                        <p className="mb-4">
                            {articles.length === 0 
                                ? "Anda belum memiliki artikel sama sekali." 
                                : `Tidak ada artikel dengan status "${STATUS_TABS.find(t=>t.id === activeTab)?.label}".`}
                        </p>
                        {articles.length === 0 ? (
                            <Link to="/articles/create" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                                <Plus size={16} /> Buat Publikasi Artikel
                            </Link>
                        ) : (
                            <button onClick={() => setActiveTab('all')} className="text-primary text-sm font-bold hover:underline">
                                Tampilkan Semua Artikel
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-primary mb-1">Artikel Saya</h1>
                    <p className="text-sm text-gray-600">Kelola tulisan Anda dan pantau status persetujuan dari tim editorial.</p>
                </div>
                <Link to="/articles/create" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30">
                    <Plus size={18} />
                    Buat Artikel Baru
                </Link>
            </div>

            {/* Filter & Controls */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Tabs */}
                <div className="flex overflow-x-auto pb-2 lg:pb-0 hide-scrollbar gap-2">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                                activeTab === tab.id 
                                    ? 'bg-primary text-white shadow-md' 
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search & View Toggle */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Cari artikel..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="List View"
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Empty State / Content */}
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredArticles.length === 0 && viewMode === 'grid' ? (
                <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <FileText size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Belum Ada Artikel</h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-6">
                        {articles.length === 0 
                            ? "Anda belum memiliki artikel sama sekali. Mulai bagikan ide brilian Anda hari ini!" 
                            : `Anda belum memiliki artikel dengan status "${STATUS_TABS.find(t=>t.id === activeTab)?.label}".`}
                    </p>
                    {articles.length === 0 ? (
                        <Link to="/articles/create" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30">
                            <Plus size={18} />
                            Buat Publikasi Artikel
                        </Link>
                    ) : (
                        <button onClick={() => setActiveTab('all')} className="text-primary text-sm font-bold hover:underline">
                            Tampilkan Semua Artikel
                        </button>
                    )}
                </div>
            ) : (
                viewMode === 'grid' ? renderGridView() : renderListView()
            )}
            
        </div>
    );
}
