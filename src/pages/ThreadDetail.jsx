import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Heart, Share2, MoreHorizontal, Link as LinkIcon, Calendar, TrendingUp, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ThreadDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [thread, setThread] = useState(null);
    const [threadReplies, setThreadReplies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Main Post States
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [replyText, setReplyText] = useState("");
    const [copied, setCopied] = useState(false);

    // Auth user
    const userStr = localStorage.getItem('csm_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserAvatar = currentUser ? (currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}`) : null;

    const fetchThreadData = async () => {
        setIsLoading(true);
        try {
            const resThread = await fetch(`https://incsmsociety.site/api/forum/get_thread.php?id=${id}${currentUser ? `&user_id=${currentUser.id}` : ''}`);
            const dataThread = await resThread.json();
            if (dataThread.success) {
                setThread(dataThread.data);
                setLikesCount(parseInt(dataThread.data.likes_count) || 0);
                setIsLiked(dataThread.data.is_liked_by_me);
            }

            fetchReplies();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReplies = async () => {
        try {
            const resReplies = await fetch(`https://incsmsociety.site/api/forum/get_replies.php?thread_id=${id}`);
            const dataReplies = await resReplies.json();
            if (dataReplies.success) {
                const allReps = dataReplies.data;
                const topLevel = allReps.filter(r => !r.parent_id);
                topLevel.forEach(tl => {
                    tl.replies = allReps.filter(r => r.parent_id === tl.id);
                });
                setThreadReplies(topLevel);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchThreadData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="bg-surface-warm min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Memuat detail diskusi...</div>
            </div>
        );
    }

    if (!thread) {
        return (
            <div className="bg-surface-warm min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-primary mb-4">Thread tidak ditemukan</h2>
                    <Link to="/forum" className="text-accent hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Forum
                    </Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit', minute: '2-digit',
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(date);
    };

    const handleMainLike = async () => {
        if (!currentUser) return navigate('/login');

        // Optimistic UI Update
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            await fetch('https://incsmsociety.site/api/forum/toggle_like.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    entity_id: thread.id,
                    entity_type: 'thread'
                })
            });
        } catch (e) {
            console.error(e);
            // Revert on fail
            setIsLiked(isLiked);
            setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const submitMainReply = async () => {
        if (!replyText.trim()) return;
        if (!currentUser) return navigate('/login');

        try {
            const res = await fetch('https://incsmsociety.site/api/forum/create_reply.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    thread_id: thread.id,
                    author_id: currentUser.id,
                    content: replyText
                })
            });
            const data = await res.json();
            if (data.success) {
                setReplyText("");
                setShowReplyForm(false);
                fetchReplies();
                thread.replies_count = (parseInt(thread.replies_count) || 0) + 1;
            }
        } catch (e) {
            console.error(e);
            alert("Terjadi kesalahan.");
        }
    };

    const LinkPreviewCard = ({ metadata: initialMetadata }) => {
        let metadata = initialMetadata;
        if (typeof metadata === 'string') {
            try { metadata = JSON.parse(metadata); } catch (e) { metadata = null; }
        }
        if (!metadata) return null;
        return (
            <a href={metadata.url} target="_blank" rel="noopener noreferrer" className="block mt-6 rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50 transition-all duration-300 group">
                {metadata.image && (
                    <div className="w-full h-56 bg-gray-100 relative overflow-hidden border-b border-gray-200">
                        <img src={metadata.image} alt={metadata.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    </div>
                )}
                <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                        <LinkIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1 flex items-center gap-1 font-medium uppercase tracking-wider">
                            {metadata.domain || 'Lampiran Tautan'}
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1 line-clamp-1 group-hover:text-primary transition-colors">{metadata.title || metadata.url}</h4>
                        {metadata.description && <p className="text-sm text-gray-600 line-clamp-1 leading-relaxed">{metadata.description}</p>}
                    </div>
                </div>
            </a>
        );
    };

    const ReplyItem = ({ reply, isNested = false }) => {
        const replyAuthorName = reply.author_name;
        const replyAuthorAvatar = reply.author_avatar || "https://ui-avatars.com/api/?name=" + replyAuthorName;

        const [isReplyLiked, setIsReplyLiked] = useState(false);
        const [replyLikes, setReplyLikes] = useState(parseInt(reply.likes_count) || 0);
        const [showNestedForm, setShowNestedForm] = useState(false);
        const [nestedText, setNestedText] = useState("");
        const [replyCopied, setReplyCopied] = useState(false);

        const toggleLike = async () => {
            if (!currentUser) return navigate('/login');
            setIsReplyLiked(!isReplyLiked);
            setReplyLikes(prev => isReplyLiked ? prev - 1 : prev + 1);

            try {
                await fetch('https://incsmsociety.site/api/forum/toggle_like.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: currentUser.id,
                        entity_id: reply.id,
                        entity_type: 'reply'
                    })
                });
            } catch (e) {
                console.error(e);
            }
        };

        const handleReplyShare = () => {
            navigator.clipboard.writeText(`${window.location.href}#${reply.id}`);
            setReplyCopied(true);
            setTimeout(() => setReplyCopied(false), 2000);
        };

        const submitNestedReply = async () => {
            if (!nestedText.trim()) return;
            if (!currentUser) return navigate('/login');

            try {
                const res = await fetch('https://incsmsociety.site/api/forum/create_reply.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        thread_id: thread.id,
                        author_id: currentUser.id,
                        parent_id: reply.id,
                        content: nestedText
                    })
                });
                const data = await res.json();
                if (data.success) {
                    setNestedText("");
                    setShowNestedForm(false);
                    fetchReplies();
                    thread.replies_count = (parseInt(thread.replies_count) || 0) + 1;
                }
            } catch (e) {
                console.error(e);
                alert("Terjadi kesalahan.");
            }
        };

        return (
            <div id={reply.id} className={`flex gap-3 md:gap-5 ${isNested ? 'mt-6' : 'border-b border-gray-100 pb-6 mb-6'}`}>
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full overflow-hidden border border-gray-200 z-10 bg-white cursor-pointer hover:border-primary transition-colors">
                        <img src={replyAuthorAvatar} alt={replyAuthorName} className="w-full h-full object-cover" />
                    </div>
                    {reply.replies && reply.replies.length > 0 && (
                        <div className="w-0.5 bg-gray-200 flex-grow mt-3 rounded-full"></div>
                    )}
                </div>

                <div className="flex-grow pt-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 hover:text-primary hover:underline transition-colors cursor-pointer">{replyAuthorName}</span>
                            <span className="text-sm text-gray-300">•</span>
                            <span className="text-sm text-gray-500">{formatDate(reply.created_at)}</span>
                        </div>
                        <button className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-gray-100">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    <p className="text-gray-800 text-base leading-relaxed mb-4 whitespace-pre-wrap">
                        {reply.content}
                    </p>

                    <div className="flex items-center gap-8 text-gray-500 font-medium">
                        <button
                            onClick={() => setShowNestedForm(!showNestedForm)}
                            className={`flex items-center gap-2 transition-colors group ${showNestedForm ? 'text-blue-600' : 'hover:text-blue-600'}`}
                        >
                            <div className={`p-2 rounded-full transition-colors ${showNestedForm ? 'bg-blue-50' : 'group-hover:bg-blue-50'}`}>
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <span className="text-sm">Balas</span>
                        </button>
                        <button
                            onClick={toggleLike}
                            className={`flex items-center gap-2 transition-colors group ${isReplyLiked ? 'text-pink-600' : 'hover:text-pink-600'}`}
                        >
                            <div className={`p-2 rounded-full transition-colors ${isReplyLiked ? 'bg-pink-50' : 'group-hover:bg-pink-50'}`}>
                                <Heart className={`w-4 h-4 ${isReplyLiked ? 'fill-current' : ''}`} />
                            </div>
                            <span className="text-sm">{replyLikes}</span>
                        </button>
                        <button
                            onClick={handleReplyShare}
                            className="flex items-center gap-2 hover:text-green-600 transition-colors group"
                        >
                            <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                                {replyCopied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                            </div>
                        </button>
                    </div>

                    {showNestedForm && (
                        <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4 flex gap-3 animate-fade-in-up">
                            <img 
                                src={currentUserAvatar} 
                                alt="Me" 
                                className="w-8 h-8 rounded-full border border-gray-200 object-cover shrink-0 shadow-sm"
                            />
                            <div className="flex-grow">
                                <textarea
                                    value={nestedText}
                                    onChange={(e) => setNestedText(e.target.value)}
                                    placeholder={`Balas ke ${replyAuthorName}...`}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 min-h-[80px] resize-none"
                                ></textarea>
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        onClick={() => setShowNestedForm(false)}
                                        className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={submitNestedReply}
                                        disabled={!nestedText.trim()}
                                        className="bg-primary hover:bg-primary-light disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                                    >
                                        Kirim
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {reply.replies && reply.replies.length > 0 && (
                        <div className="mt-2">
                            {reply.replies.map(nestedReply => (
                                <ReplyItem key={nestedReply.id} reply={nestedReply} isNested={true} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-surface-warm min-h-screen pt-10 pb-10">
            <div className="bg-primary pt-6 pb-16 px-4 relative overflow-hidden -mt-20 mb-8 shadow-md">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto mt-12 relative z-10">
                    <div className="flex items-center gap-4 text-white/80 hover:text-white transition-colors w-fit">
                        <Link to="/forum" className="flex items-center gap-2 font-medium">
                            <ArrowLeft className="w-5 h-5" /> Kembali ke Forum
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8 -mt-16 relative z-20">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface-card rounded-2xl border border-gray-200 p-6 shadow-xl sticky top-24">
                        <h3 className="font-serif font-bold text-primary text-lg mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-accent" />
                            Author Diskusi
                        </h3>

                        <div className="flex flex-col items-center text-center">
                            <div className="block mb-4 relative group cursor-pointer">
                                <div className="absolute inset-0 bg-accent rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                                <img src={thread.author_avatar || "https://ui-avatars.com/api/?name=" + thread.author_name} alt={thread.author_name} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover relative z-10 group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <div className="font-bold text-xl text-gray-900 hover:text-primary transition-colors cursor-pointer">{thread.author_name}</div>
                            {thread.author_title && (
                                <div className="text-sm text-gray-500 font-medium mt-1">{thread.author_title}</div>
                            )}

                            <div className="mt-4 mb-2 flex flex-wrap gap-2 justify-center">
                                <span className="inline-block bg-accent/10 border border-accent/20 text-accent-dark px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {thread.author_role || 'Member'}
                                </span>
                                {thread.author_csm_title && (
                                    <span className="inline-block bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {thread.author_csm_title}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                        <div className="p-6 md:p-8 md:pb-6">
                            <div className="flex items-center justify-between mb-6">
                                <span className="inline-flex items-center bg-primary/5 text-primary text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wide">
                                    {thread.category}
                                </span>
                                <button className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100">
                                    <MoreHorizontal className="w-6 h-6" />
                                </button>
                            </div>

                            <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                {thread.title}
                            </h1>

                            <div className="prose prose-lg max-w-none text-gray-800 mb-8 leading-relaxed whitespace-pre-wrap font-sans">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {thread.content}
                                </ReactMarkdown>
                            </div>

                            {thread.link_metadata && (
                                <div className="mb-8">
                                    <LinkPreviewCard metadata={thread.link_metadata} />
                                </div>
                            )}

                            {thread.tags && (
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {thread.tags.split(',').map(tag => (
                                        <span key={tag} className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md cursor-pointer transition-colors">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-t border-gray-100">
                                <div className="text-sm text-gray-500 flex items-center gap-2 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(thread.created_at)}
                                </div>
                                <div className="flex gap-6 text-sm">
                                    <div className="flex gap-1.5 items-center">
                                        <span className="font-bold text-gray-900">{thread.replies_count || 0}</span>
                                        <span className="text-gray-500">Balasan</span>
                                    </div>
                                    <div className="flex gap-1.5 items-center">
                                        <span className="font-bold text-gray-900">{likesCount}</span>
                                        <span className="text-gray-500">Suka</span>
                                    </div>
                                    <div className="flex gap-1.5 items-center">
                                        <span className="font-bold text-gray-900">{thread.views_count || 0}</span>
                                        <span className="text-gray-500">Tayangan</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-around py-3 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className={`flex items-center gap-2 font-medium transition-colors group px-6 py-2.5 rounded-xl ${showReplyForm ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span className="hidden sm:inline">Balas Diskusi</span>
                            </button>
                            <button
                                onClick={handleMainLike}
                                className={`flex items-center gap-2 font-medium transition-colors group px-6 py-2.5 rounded-xl ${isLiked ? 'text-pink-600 bg-pink-50' : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'}`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="hidden sm:inline">Suka</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors group px-6 py-2.5 rounded-xl hover:bg-green-50"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
                                <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Bagikan'}</span>
                            </button>
                        </div>
                    </div>

                    {showReplyForm && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 animate-fade-in-up">
                            <div className="flex gap-4">
                                <img 
                                    src={currentUserAvatar} 
                                    alt="Me" 
                                    className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover shrink-0"
                                />
                                <div className="flex-grow">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Tuliskan balasan atau pandangan Anda..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-800 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 min-h-[100px] resize-none transition-all text-base"
                                    ></textarea>
                                    <div className="flex justify-end gap-3 mt-3">
                                        <button
                                            onClick={() => setShowReplyForm(false)}
                                            className="text-gray-500 hover:text-gray-700 font-medium px-5 py-2.5 rounded-lg transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={submitMainReply}
                                            disabled={!replyText.trim()}
                                            className="bg-primary hover:bg-primary-light disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm hover:shadow-md"
                                        >
                                            Kirim Balasan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 md:p-8">
                        <h3 className="font-serif font-bold text-2xl text-gray-900 mb-8 pb-4 border-b border-gray-100 flex items-center gap-3">
                            Balasan <span className="bg-gray-100 text-gray-600 text-sm py-1 px-3 rounded-full font-sans">{threadReplies.length}</span>
                        </h3>

                        {threadReplies.length > 0 ? (
                            <div className="space-y-2">
                                {threadReplies.map(reply => (
                                    <ReplyItem key={reply.id} reply={reply} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">Belum ada balasan</h4>
                                <p className="text-gray-500">Jadilah yang pertama memberikan pandangan pada diskusi ini!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
