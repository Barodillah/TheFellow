import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2, Bookmark, Eye, Heart, MessageSquare, ExternalLink, MoreHorizontal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function ArticleDetail() {
  useDocumentTitle('Baca Artikel');
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [threadReplies, setThreadReplies] = useState([]);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('csm_user') || '{}');
        const userId = userData.id || '';

        const fetchArticle = async () => {
            try {
                const response = await fetch(`https://incsmsociety.site/api/get_article_detail.php?slug=${slug}&user_id=${userId}`);
                const data = await response.json();
                if (data.success && data.data) {
                    setArticle({
                        ...data.data,
                        author: data.data.author_name || 'Penulis Anonim',
                        author_avatar: data.data.author_avatar || null,
                        date: new Date(data.data.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
                        image: data.data.cover_image || ''
                    });

                    if (data.data.forum_thread_id) {
                        fetchReplies(data.data.forum_thread_id);
                    }
                } else {
                    navigate('/articles');
                }
            } catch (error) {
                console.error("Fetch detail error:", error);
                navigate('/articles');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchReplies = async (threadId) => {
            try {
                const resReplies = await fetch(`https://incsmsociety.site/api/forum/get_replies.php?thread_id=${threadId}`);
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

        fetchArticle();
    }, [slug, navigate]);

    if (isLoading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    if (!article) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        date.setHours(date.getHours() + 7);
        return new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit', minute: '2-digit',
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(date);
    };

    const ReplyItemReadonly = ({ reply, isNested = false }) => {
        const replyAuthorName = reply.author_name;
        const replyAuthorAvatar = reply.author_avatar || "https://ui-avatars.com/api/?name=" + replyAuthorName;
        const handleRedirect = () => navigate(`/forum/${article.forum_thread_id}#${reply.id}`);

        return (
            <div className={`flex gap-3 md:gap-5 ${isNested ? 'mt-6' : 'border-b border-gray-100 pb-6 mb-6'}`}>
                <div className="flex flex-col items-center">
                    <div 
                        className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full overflow-hidden border border-gray-200 z-10 bg-white cursor-pointer hover:border-primary transition-colors"
                        onClick={handleRedirect}
                    >
                        <img src={replyAuthorAvatar} alt={replyAuthorName} className="w-full h-full object-cover" />
                    </div>
                    {reply.replies && reply.replies.length > 0 && (
                        <div className="w-0.5 bg-gray-200 flex-grow mt-3 rounded-full"></div>
                    )}
                </div>

                <div className="flex-grow pt-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span 
                                className="font-bold text-gray-900 hover:text-primary hover:underline transition-colors cursor-pointer"
                                onClick={handleRedirect}
                            >
                                {replyAuthorName}
                            </span>
                            <span className="text-sm text-gray-300">•</span>
                            <span className="text-sm text-gray-500">{formatDate(reply.created_at)}</span>
                        </div>
                        <button 
                            className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-gray-100"
                            onClick={handleRedirect}
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    <p className="text-gray-800 text-base leading-relaxed mb-4 whitespace-pre-wrap cursor-text">
                        {reply.content}
                    </p>

                    <div className="flex items-center gap-8 text-gray-500 font-medium">
                        <button
                            onClick={handleRedirect}
                            className="flex items-center gap-2 transition-colors group hover:text-blue-600"
                        >
                            <div className="p-2 rounded-full transition-colors group-hover:bg-blue-50">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <span className="text-sm">Balas</span>
                        </button>
                        <button
                            onClick={handleRedirect}
                            className="flex items-center gap-2 transition-colors group hover:text-pink-600"
                        >
                            <div className="p-2 rounded-full transition-colors group-hover:bg-pink-50">
                                <Heart className="w-4 h-4" />
                            </div>
                            <span className="text-sm">{reply.likes_count || 0}</span>
                        </button>
                    </div>

                    {reply.replies && reply.replies.length > 0 && (
                        <div className="mt-2">
                            {reply.replies.map(nested => (
                                <ReplyItemReadonly key={nested.id} reply={nested} isNested={true} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleLike = async () => {
        if (!article || !article.forum_thread_id) return;
        const userData = JSON.parse(localStorage.getItem('csm_user') || '{}');
        const userId = userData.id;
        
        if (!userId) {
            alert("Silakan login untuk menyukai artikel ini.");
            return;
        }

        try {
            const response = await fetch('https://incsmsociety.site/api/forum/toggle_like.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    entity_id: article.forum_thread_id,
                    entity_type: 'thread'
                })
            });
            const result = await response.json();
            if (result.success) {
                setArticle(prev => ({
                    ...prev,
                    is_liked: result.action === 'liked',
                    likes_count: result.action === 'liked' ? prev.likes_count + 1 : prev.likes_count - 1
                }));
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    return (
        <div className="bg-surface-warm min-h-screen pt-6 md:pt-8 pb-20">
            {/* Top Navigation */}
            <div className="max-w-4xl mx-auto px-4 mb-8">
                <Link
                    to="/articles"
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-accent transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Jurnal
                </Link>
            </div>

            {/* Article Header */}
            <header className="max-w-4xl mx-auto px-4 mb-12 text-center">
                <span className="inline-block bg-accent/10 text-accent font-bold tracking-widest uppercase text-xs px-4 py-1.5 rounded-full mb-6">
                    {article.category}
                </span>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-8">
                    {article.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center overflow-hidden">
                            {article.author_avatar ? (
                                <img src={article.author_avatar} alt={article.author} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 text-primary" />
                            )}
                        </div>
                        {article.author}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        {article.date}
                    </div>
                </div>
            </header>

            {/* Hero Image */}
            <div className="max-w-5xl mx-auto px-4 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video md:aspect-[21/9]">
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                    {/* Excerpt Inside Hero Image (Align Bottom) */}
                    <div className="absolute bottom-6 md:bottom-10 left-0 w-full px-6 md:px-12 flex justify-center">
                        <div className="w-full bg-black/5 hover:bg-black/20 backdrop-blur-sm hover:backdrop-blur-md transition-all duration-500 border border-white/20 p-5 md:p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
                            <p className="font-sans text-base md:text-xl text-white font-light leading-relaxed italic drop-shadow-md text-center">
                                "{article.excerpt}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10 -mt-4 md:-mt-6 mb-16">
                <div className="bg-surface-card rounded-2xl border border-gray-100 shadow-xl p-8 md:p-12">
                    {/* Metrics and Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-500" title="Dilihat">
                                <Eye className="w-5 h-5 text-gray-400" />
                                <span className="font-semibold text-sm">{article.views_count || 0}</span>
                            </div>
                            <button onClick={handleLike} className={`flex items-center gap-2 transition-colors group ${article.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`} title={article.is_liked ? "Batal Suka" : "Suka"}>
                                <Heart className={`w-5 h-5 transition-colors ${article.is_liked ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover:text-red-500'}`} />
                                <span className="font-semibold text-sm">{article.likes_count || 0}</span>
                            </button>
                            <button
                                onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="flex items-center gap-2 text-gray-500 hover:text-accent transition-colors group" title="Komentar"
                            >
                                <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-accent" />
                                <span className="font-semibold text-sm">{article.comments_count || 0}</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-accent hover:border-accent hover:bg-accent/5 transition-all group" title="Bagikan">
                                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-accent hover:border-accent hover:bg-accent/5 transition-all group" title="Simpan">
                                <Bookmark className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Markdown Content (simulated journal styling) */}
                    <div
                        className="prose prose-lg prose-slate max-w-none font-sans
                                   prose-headings:text-primary prose-headings:font-bold
                                   prose-p:text-gray-800 prose-p:leading-relaxed prose-p:mb-6
                                   prose-blockquote:border-accent prose-blockquote:bg-accent/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-xl prose-blockquote:text-primary prose-blockquote:italic
                                   prose-strong:text-primary prose-strong:font-bold
                                   prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-li:text-gray-800 prose-li:mb-2
                                   prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6
                                   prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-4xl font-extrabold text-primary mt-10 mb-6" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-3xl font-bold text-primary mt-10 mb-5 border-b border-gray-100 pb-2" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-2xl font-bold text-primary mt-8 mb-4" {...props} />,
                                h4: ({ node, ...props }) => <h4 className="text-xl font-bold text-primary mt-6 mb-3" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-6 text-gray-800 leading-relaxed" {...props} />,
                                img: ({ node, ...props }) => (
                                    <figure className="my-12">
                                        <img 
                                            {...props} 
                                            className="w-full h-auto rounded-xl shadow-md border border-gray-200 object-cover max-h-[500px] cursor-pointer hover:opacity-90 transition-opacity" 
                                            onClick={() => setSelectedImage(props.src)}
                                        />
                                        <figcaption className="text-center text-sm text-gray-500 mt-4 font-sans italic">{props.alt || 'Lampiran Visual / Data Pendukung'}</figcaption>
                                    </figure>
                                )
                            }}
                        >
                            {article.content ? article.content.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/^(\#{1,6})(?!#|\s)(.*)/gm, '$1 $2') : 'Konten tidak tersedia.'}
                        </ReactMarkdown>
                    </div>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-12 pt-8 border-t border-gray-100">
                            <span className="text-sm font-semibold text-gray-500 mr-2">Topik Terkait:</span>
                            {article.tags.map((tag, idx) => (
                                <span key={idx} className="px-4 py-1.5 bg-surface-warm text-primary rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200 hover:border-accent hover:text-accent transition-colors cursor-pointer">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* References */}
                    {article.references && article.references.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h4 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <ExternalLink className="w-5 h-5 text-accent" /> Sumber & Referensi Terkait
                            </h4>
                            <ul className="space-y-3">
                                {article.references.map((ref, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                                        <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-accent hover:underline transition-colors leading-relaxed font-medium">
                                            {ref.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Author Bio Box */}
                <div className="mt-16 bg-primary text-white rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="w-20 h-20 rounded-full bg-surface-card p-1 flex-shrink-0 z-10">
                        <div className="w-full h-full rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
                            {article.author_avatar ? (
                                <img src={article.author_avatar} alt={article.author} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-accent" />
                            )}
                        </div>
                    </div>
                    <div className="text-center md:text-left z-10">
                        <h3 className="font-serif text-2xl font-bold mb-2">Ditulis oleh {article.author}</h3>
                        <p className="font-sans text-gray-300 text-sm leading-relaxed max-w-xl">
                            {article.author} adalah Fellow di CSM Intellectual Society yang berdedikasi penuh pada peningkatan standar pelayanan dan inovasi berkelanjutan. Artikel ini merepresentasikan pandangan dan temuan lapangan dari penulis.
                        </p>
                    </div>
                </div>

                {/* Comments Section */}
                <div id="comments-section" className="mt-16 bg-surface-card rounded-2xl border border-gray-100 shadow-xl p-8 md:p-12">
                    <h3 className="font-serif text-3xl font-bold text-primary mb-8 flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-accent" /> Diskusi Artikel ({article.comments_count || 0})
                    </h3>

                    {/* Fake Comment Input */}
                    <div className="flex gap-4 mb-2">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <div className="flex-grow">
                            <div className="relative group">
                                <textarea
                                    readOnly
                                    onClick={() => navigate(`/forum/${article.forum_thread_id}`)}
                                    onFocus={() => navigate(`/forum/${article.forum_thread_id}`)}
                                    placeholder="Tuliskan komentar atau pandangan Anda mengenai artikel ini..."
                                    className="w-full bg-surface-warm border border-gray-200 group-hover:border-accent group-hover:ring-1 group-hover:ring-accent transition-all rounded-xl px-5 py-4 text-sm md:text-base text-gray-800 min-h-[100px] resize-none cursor-text focus:outline-none placeholder:text-gray-400"
                                ></textarea>
                                <div className="mt-3 flex justify-end">
                                    <button 
                                        onClick={() => navigate(`/forum/${article.forum_thread_id}`)}
                                        className="bg-primary hover:bg-primary-light text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm hover:shadow-md"
                                    >
                                        Kirim Komentar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Komentar (Readonly) */}
                    {threadReplies.length > 0 && (
                        <div className="mt-10 pt-8 border-t border-gray-100">
                            <div className="space-y-2">
                                {threadReplies.map(reply => (
                                    <ReplyItemReadonly key={reply.id} reply={reply} />
                                ))}
                            </div>
                        </div>
                    )}

                    {article.forum_thread_id && article.comments_count > 0 && (
                        <div className="text-center mt-6 pt-8 border-t border-gray-100">
                            <p className="text-gray-600 mb-3">Terdapat <span className="font-bold text-primary">{article.comments_count} balasan</span> dari Fellow lainnya di Forum.</p>
                            <Link to={`/forum/${article.forum_thread_id}`} className="inline-flex items-center gap-2 text-accent font-bold hover:text-primary transition-colors">
                                Baca seluruh diskusi <ArrowLeft className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Fullscreen Image Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-7xl max-h-screen">
                        <button 
                            className="absolute -top-12 right-0 text-white hover:text-accent p-2 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                        >
                            Tutup
                        </button>
                        <img 
                            src={selectedImage} 
                            alt="Fullscreen view" 
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
