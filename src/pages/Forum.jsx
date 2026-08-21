import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, Eye, Filter, Plus, Search, ChevronRight, Link as LinkIcon, Image as ImageIcon, Bold, Italic, Underline, Hash, Smile, X } from 'lucide-react';
import { THREADS_DATA, FELLOWS_DATA } from '../data/mockData';

export default function Forum() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewThreadForm, setShowNewThreadForm] = useState(false);
    const [newThreadData, setNewThreadData] = useState({ title: '', category: 'kaizen-corner', content: '', link: '', link_metadata: null });
    const [isLinkLoading, setIsLinkLoading] = useState(false);
    const [linkError, setLinkError] = useState('');
    const [activeStyles, setActiveStyles] = useState({ bold: false, italic: false, underline: false });

    const userStr = localStorage.getItem('csm_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserAvatar = currentUser ? currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}` : "https://ui-avatars.com/api/?name=User";

    const updateStyles = () => {
        setActiveStyles({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline')
        });
    };

    const fetchLinkPreview = async (url) => {
        setIsLinkLoading(true);
        setLinkError('');
        try {
            const res = await fetch(`https://incsmsociety.site/api/forum/fetch_link_preview.php?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (data.success) {
                setNewThreadData(prev => ({ ...prev, link_metadata: data.data }));
            } else {
                setLinkError(data.message);
            }
        } catch (e) {
            setLinkError("Terjadi kesalahan jaringan saat memuat pratinjau tautan.");
        } finally {
            setIsLinkLoading(false);
        }
    };

    const handleEditorKeyUp = (e) => {
        updateStyles();
        if (e.key === ' ' || e.key === 'Enter') {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const node = selection.getRangeAt(0).startContainer;
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                // Deteksi URL di akhir teks (memperhitungkan spasi biasa dan non-breaking space)
                const match = text.match(/(https?:\/\/[^\s\u00A0]+)[\s\u00A0]?$/);
                if (match) {
                    const url = match[1];

                    // Seleksi teks URL yang pasti presisi
                    const startOffset = text.lastIndexOf(url);

                    if (startOffset >= 0) {
                        const range = document.createRange();
                        range.setStart(node, startOffset);
                        range.setEnd(node, startOffset + url.length);
                        selection.removeAllRanges();
                        selection.addRange(range);

                        // Ubah jadi link
                        document.execCommand('createLink', false, url);

                        const editor = document.getElementById('thread-content-editor');
                        if (editor) {
                            const links = editor.getElementsByTagName('a');
                            for (let a of links) {
                                if (!a.classList.contains('text-blue-600')) {
                                    a.classList.add('text-blue-600', 'hover:underline', 'font-medium');
                                    a.target = '_blank';
                                }
                            }

                            // Update content dan link metadata secara bersamaan dalam satu state update
                            setNewThreadData(prev => {
                                const newData = { ...prev, content: editor.innerHTML };
                                if (!prev.link) {
                                    newData.link = url; // Hanya pasang metadata jika belum ada
                                    fetchLinkPreview(url);
                                }
                                return newData;
                            });
                        }

                        // Kembalikan kursor ke posisi akhir
                        selection.collapseToEnd();
                    }
                }
            }
        }
    };

    const categories = [
        { id: 'all', label: 'Semua Diskusi' },
        { id: 'kaizen-corner', label: 'Kaizen Corner' },
        { id: 'empathy-circle', label: 'Empathy Circle' },
        { id: 'one-standard-exchange', label: 'One Standard Exchange' },
        { id: 'memoriable-service', label: 'Memoriable Service' },
        { id: 'obligation-of-hospitality', label: 'Obligation of Hospitality' },
    ];

    const [threads, setThreads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchThreads = async () => {
        setIsLoading(true);
        try {
            const url = `https://incsmsociety.site/api/forum/get_threads.php?category=${activeCategory}${currentUser ? `&user_id=${currentUser.id}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setThreads(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch threads:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchThreads();
    }, [activeCategory]);

    const filteredThreads = threads.filter(thread => 
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    };

    const handleLike = async (threadId) => {
        if (!currentUser) return navigate('/login');
        try {
            await fetch('https://incsmsociety.site/api/forum/toggle_like.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    entity_id: threadId,
                    entity_type: 'thread'
                })
            });
            const url = `https://incsmsociety.site/api/forum/get_threads.php?category=${activeCategory}${currentUser ? `&user_id=${currentUser.id}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setThreads(data.data);
            }
        } catch(e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-surface-warm min-h-screen pt-10 pb-10">
            {/* Header Section */}
            <div className="bg-primary pt-6 pb-16 px-4 relative overflow-hidden -mt-20 mb-8 shadow-xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-light/30 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto mt-16 mb-4 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">

                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-md">
                            Forum Diskusi
                        </h1>
                        <p className="font-sans text-gray-300 max-w-xl text-lg font-light leading-relaxed">
                            Ruang kolaboratif para Fellow untuk membedah kasus lapangan, berbagi taktik <i className="text-accent">Kaizen</i>, dan merumuskan standar layanan paripurna.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (!currentUser) {
                                navigate('/login');
                            } else {
                                setShowNewThreadForm(!showNewThreadForm);
                            }
                        }}
                        className="bg-gradient-to-r from-accent to-accent-light text-primary font-bold px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-1"
                    >
                        <Plus className="w-5 h-5" />
                        Buat Diskusi Baru
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8 -mt-16 relative z-20">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Search Bar */}
                    <div className="bg-surface-card rounded-2xl border border-accent/20 p-5 shadow-xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari diskusi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 flex items-center justify-between group ${activeCategory === cat.id
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
                    {/* Form Buat Diskusi Baru (Pro Max UI) */}
                    {showNewThreadForm && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 md:p-8 animate-fade-in-up mb-8 relative overflow-hidden">
                            {/* Decorative Top Accent */}


                            <div className="flex gap-4">
                                {/* Avatar Current User */}
                                <div className="shrink-0 hidden sm:block">
                                    <div className="w-12 h-12 rounded-full bg-accent p-0.5 shadow-md">
                                        <div className="w-full h-full bg-white rounded-full p-0.5">
                                            <img src={currentUserAvatar} alt={currentUser?.name || "Current User"} className="w-full h-full rounded-full object-cover" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    {/* Judul Input */}
                                    <input
                                        type="text"
                                        placeholder="Apa yang ingin Anda diskusikan?"
                                        className="w-full bg-transparent border-none text-2xl md:text-3xl font-serif font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-0 px-0"
                                        value={newThreadData.title}
                                        onChange={(e) => setNewThreadData({ ...newThreadData, title: e.target.value })}
                                    />

                                    {/* Kategori Chips */}
                                    <div className="flex flex-wrap gap-2 pb-2">
                                        {categories.filter(c => c.id !== 'all').map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setNewThreadData({ ...newThreadData, category: cat.id })}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${newThreadData.category === cat.id
                                                        ? 'bg-primary text-white shadow-md transform scale-105'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Isi Diskusi */}
                                    <div
                                        id="thread-content-editor"
                                        contentEditable
                                        data-placeholder="Tulis detail diskusi, masalah, tautan, atau hashtag Anda di sini..."
                                        className="w-full bg-transparent border-none text-base md:text-lg text-gray-700 focus:outline-none focus:ring-0 px-0 min-h-[120px] leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
                                        onInput={(e) => setNewThreadData({ ...newThreadData, content: e.currentTarget.innerHTML })}
                                        onKeyUp={handleEditorKeyUp}
                                        onMouseUp={updateStyles}
                                        suppressContentEditableWarning={true}
                                    ></div>

                                    {/* Lampiran Link Metadata (Maks 1) */}
                                    {newThreadData.link && (
                                        <div className="relative bg-gray-50 rounded-xl border border-gray-200 p-4 mb-2 group">
                                            {isLinkLoading ? (
                                                <div className="flex items-center gap-4 animate-pulse">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0"></div>
                                                    <div className="flex-1">
                                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            ) : linkError ? (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-500 shrink-0">
                                                        <X className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <h4 className="text-sm font-bold text-red-600 truncate">Gagal Memuat Pratinjau</h4>
                                                        <p className="text-xs text-gray-500 truncate mt-0.5 block">{linkError}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setNewThreadData({ ...newThreadData, link: '', link_metadata: null })}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Hapus Lampiran Tautan"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : newThreadData.link_metadata ? (
                                                <div className="flex items-center gap-4">
                                                    {newThreadData.link_metadata.image ? (
                                                        <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden border border-gray-200">
                                                            <img src={newThreadData.link_metadata.image} alt={newThreadData.link_metadata.title} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                                            <LinkIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 overflow-hidden">
                                                        <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{newThreadData.link_metadata.title || newThreadData.link}</h4>
                                                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{newThreadData.link_metadata.description || newThreadData.link_metadata.domain}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setNewThreadData({ ...newThreadData, link: '', link_metadata: null })}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors tooltip opacity-0 group-hover:opacity-100 absolute right-4 top-1/2 -translate-y-1/2 bg-white/80"
                                                        title="Hapus Lampiran Tautan"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}

                                    {/* Toolbar & Actions */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-4">
                                        <div className="flex items-center gap-1 w-full sm:w-auto">
                                            <button
                                                onClick={() => {
                                                    document.execCommand('bold', false, null);
                                                    updateStyles();
                                                    document.getElementById('thread-content-editor')?.focus();
                                                }}
                                                className={`p-2 rounded-full transition-colors tooltip ${activeStyles.bold ? 'text-accent bg-accent/10' : 'text-gray-400 hover:text-accent hover:bg-accent/10'}`} title="Bold">
                                                <Bold className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    document.execCommand('italic', false, null);
                                                    updateStyles();
                                                    document.getElementById('thread-content-editor')?.focus();
                                                }}
                                                className={`p-2 rounded-full transition-colors tooltip ${activeStyles.italic ? 'text-accent bg-accent/10' : 'text-gray-400 hover:text-accent hover:bg-accent/10'}`} title="Italic">
                                                <Italic className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    document.execCommand('underline', false, null);
                                                    updateStyles();
                                                    document.getElementById('thread-content-editor')?.focus();
                                                }}
                                                className={`p-2 rounded-full transition-colors tooltip ${activeStyles.underline ? 'text-accent bg-accent/10' : 'text-gray-400 hover:text-accent hover:bg-accent/10'}`} title="Underline">
                                                <Underline className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex justify-end gap-3 w-full sm:w-auto">
                                            <button
                                                onClick={() => setShowNewThreadForm(false)}
                                                className="text-gray-500 hover:text-gray-900 font-bold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const cleanContent = newThreadData.content.replace(/<[^>]*>?/gm, '').trim();
                                                    if (!newThreadData.title.trim() || !cleanContent) return;

                                                    const userStr = localStorage.getItem('csm_user');
                                                    if (!userStr) {
                                                        navigate('/login');
                                                        return;
                                                    }
                                                    const user = JSON.parse(userStr);

                                                    try {
                                                        const response = await fetch('https://incsmsociety.site/api/forum/create_thread.php', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                author_id: user.id,
                                                                title: newThreadData.title,
                                                                content: newThreadData.content,
                                                                category: newThreadData.category,
                                                                link: newThreadData.link,
                                                                link_metadata: newThreadData.link_metadata
                                                            })
                                                        });
                                                        const data = await response.json();
                                                        if (data.success) {
                                                            setShowNewThreadForm(false);
                                                            setNewThreadData({ title: '', category: 'kaizen-corner', content: '', link: '', link_metadata: null });
                                                            const editor = document.getElementById('thread-content-editor');
                                                            if (editor) editor.innerHTML = '';
                                                            fetchThreads();
                                                        } else {
                                                            alert("Gagal: " + data.message);
                                                        }
                                                    } catch (error) {
                                                        console.error(error);
                                                        alert("Terjadi kesalahan jaringan.");
                                                    }
                                                }}
                                                disabled={!newThreadData.title.trim() || !newThreadData.content.replace(/<[^>]*>?/gm, '').trim()}
                                                className="bg-primary hover:bg-primary-light disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                            >
                                                Terbitkan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-10 text-gray-500">Memuat diskusi...</div>
                    ) : filteredThreads.map(thread => {
                        const authorName = thread.author_name;
                        const authorAvatar = thread.author_avatar || "https://ui-avatars.com/api/?name=" + authorName;
                        const catLabel = categories.find(c => c.id === thread.category)?.label || thread.category;
                        let linkMeta = thread.link_metadata;
                        if (typeof linkMeta === 'string') {
                            try { linkMeta = JSON.parse(linkMeta); } catch(e) { linkMeta = null; }
                        }
                        const tags = thread.tags ? thread.tags.split(',') : [];

                        return (
                            <div key={thread.id} className="bg-surface-card rounded-2xl border border-accent/20 p-6 md:p-8 shadow-lg hover:shadow-2xl hover:border-accent/40 transition-all duration-300 group">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className="absolute inset-0 bg-accent rounded-full blur-sm opacity-20 group-hover:opacity-50 transition-opacity"></div>
                                            <img src={authorAvatar} alt={authorName} className="w-14 h-14 rounded-full border-2 border-accent object-cover relative z-10 shadow-sm" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-primary text-lg leading-tight hover:text-accent transition-colors cursor-pointer">{authorName}</h4>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 font-medium">
                                                <span>•</span>
                                                <span>{formatDate(thread.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="shrink-0 bg-accent/10 border border-accent/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
                                        {catLabel}
                                    </span>
                                </div>

                                <Link to={`/forum/${thread.id}`} className="block">
                                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-3 group-hover:text-accent transition-colors cursor-pointer leading-tight">
                                        {thread.title}
                                    </h2>

                                    <div
                                        className="font-sans text-sm md:text-base text-gray-600 leading-relaxed mb-6 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: thread.content }}
                                    ></div>
                                </Link>

                                {/* Link Preview Card */}
                                {linkMeta && (
                                    <a href={linkMeta.url} target="_blank" rel="noopener noreferrer" className="block mb-6 rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50 transition-all duration-300 group/link">
                                        {linkMeta.image && (
                                            <div className="w-full h-48 bg-gray-100 relative overflow-hidden border-b border-gray-200">
                                                <img src={linkMeta.image} alt={linkMeta.title} className="w-full h-full object-cover group-hover/link:scale-105 transition-transform duration-700 ease-out" />
                                            </div>
                                        )}
                                        <div className="p-4 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                                <LinkIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1 font-medium uppercase tracking-wider">
                                                    {linkMeta.domain || 'Lampiran Tautan'}
                                                </div>
                                                <h4 className="font-bold text-gray-900 text-base leading-tight mb-1 line-clamp-1 group-hover/link:text-primary transition-colors">{linkMeta.title || linkMeta.url}</h4>
                                            </div>
                                        </div>
                                    </a>
                                )}

                                {/* Tags */}
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {tags.map(tag => (
                                            <span key={tag} className="text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 cursor-pointer px-2.5 py-1 rounded-md transition-colors">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-gray-100 gap-4">
                                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
                                        <div onClick={() => handleLike(thread.id)} className="flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors cursor-pointer group/icon">
                                            <div className={`p-2 rounded-full transition-colors ${thread.is_liked_by_me ? 'bg-pink-50' : 'group-hover/icon:bg-pink-50'}`}>
                                                <Heart className={`w-5 h-5 ${thread.is_liked_by_me ? 'fill-pink-600 text-pink-600' : ''}`} />
                                            </div>
                                            <span className="text-sm font-semibold">{thread.likes_count || 0}</span>
                                        </div>
                                        <Link to={`/forum/${thread.id}`} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer group/icon">
                                            <div className="p-2 rounded-full group-hover/icon:bg-blue-50 transition-colors">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-semibold">{thread.replies_count || 0}</span>
                                        </Link>
                                        <Link to={`/forum/${thread.id}`} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors cursor-pointer group/icon">
                                            <div className="p-2 rounded-full group-hover/icon:bg-purple-50 transition-colors">
                                                <Eye className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-semibold">{thread.views_count || 0}</span>
                                        </Link>
                                    </div>
                                    <Link to={`/forum/${thread.id}`} className="text-primary font-bold text-sm flex items-center gap-1 hover:text-accent transition-colors">
                                        Ikuti Diskusi <ChevronRight className="w-4 h-4" />
                                    </Link>
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
