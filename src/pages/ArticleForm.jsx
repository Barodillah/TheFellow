import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Save, Send, Image as ImageIcon, Plus,
    X, Type, Bold, Italic, Link as LinkIcon, List, Quote, FileText, Table as TableIcon,
    ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight, Trash2,
    UploadCloud, Sparkles, Bot, Wand2
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Markdown } from 'tiptap-markdown';
import { BLOG_ARTICLES_DATA } from '../data/mockData';

const CATEGORIES = [
    { label: "Pemikiran Kritis (Thought Leadership)", value: "Pemikiran Kritis" },
    { label: "Pengalaman Pelanggan (CX)", value: "Pengalaman Pelanggan" },
    { label: "Penanganan Keluhan (Complaint Handling)", value: "Penanganan Keluhan" },
    { label: "Retensi & Loyalitas Pelanggan", value: "Retensi & Loyalitas Pelanggan" },
    { label: "Analisis Data & NPS", value: "Analisis Data & NPS" },
    { label: "Inovasi & Teknologi Layanan", value: "Inovasi & Teknologi Layanan" },
    { label: "Riset & Temuan (Research)", value: "Riset & Temuan" },
    { label: "Metodologi (PDCA/Kaizen)", value: "Metodologi" },
    { label: "Studi Kasus & Best Practice", value: "Studi Kasus" },
    { label: "Tinjauan Pustaka (Book Reviews)", value: "Tinjauan Pustaka" },
    { label: "Sosial, Kebijakan & Etika", value: "Sosial, Kebijakan & Etika" }
];

export default function ArticleForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // GET ACTUAL USER DATA
    const userStr = localStorage.getItem('csm_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const userRole = currentUser?.role || 'member';
    const userId = currentUser?.id || '';

    const [formData, setFormData] = useState({
        title: '',
        category: CATEGORIES[0].value,
        image: '',
        excerpt: '',
        content: '',
        tags: [],
        references: []
    });

    const [isLoading, setIsLoading] = useState(isEditMode);

    const [tagInput, setTagInput] = useState('');
    const contentTextareaRef = useRef(null);

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', url: '', text: '' });
    const [isUploading, setIsUploading] = useState(false);

    const openModal = (type) => {
        let selectedText = '';
        if (editor && type === 'link') {
            const { from, to } = editor.state.selection;
            if (from !== to) {
                selectedText = editor.state.doc.textBetween(from, to, ' ');
            }
        }
        setModalConfig({ isOpen: true, type, url: '', text: selectedText });
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, type: '', url: '', text: '' });
        setIsUploading(false);
    };

    const handleImageUpload = (file) => {
        if (!file || !file.type.startsWith('image/')) return;

        setIsUploading(true);

        // Convert ke base64 agar bisa dirender tanpa backend (sebagai prototype)
        const reader = new FileReader();
        reader.onload = (e) => {
            // Simulasi delay network kecil
            setTimeout(() => {
                setModalConfig(prev => ({ ...prev, url: e.target.result }));
                setIsUploading(false);
            }, 600);
        };
        reader.readAsDataURL(file);
    };

    const handleAiFormat = async () => {
        setIsUploading(true);
        try {
            if (!editor) return;
            const currentContent = editor.storage.markdown.getMarkdown();
            
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "google/gemini-2.5-flash",
                    messages: [
                        { role: "system", content: "You are a professional editor. Fix the following markdown text's formatting, double spaces, punctuation, and readability. Do not change the core meaning. Return ONLY the raw fixed markdown text without any wrapper or explanation." },
                        { role: "user", content: currentContent }
                    ]
                })
            });

            if (!response.ok) throw new Error("Gagal menghubungi AI");
            
            const data = await response.json();
            let fixedContent = data.choices[0].message.content;
            
            // Remove markdown code blocks if the AI accidentally wrapped it
            fixedContent = fixedContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');

            // Convert custom image format back for tiptap
            const mdContent = fixedContent.replace(/\[img:(.*?)\]/g, '![]($1)');
            editor.commands.setContent(mdContent);
        } catch (error) {
            console.error("AI Format Error:", error);
            alert("Terjadi kesalahan saat menghubungi AI: " + error.message);
        } finally {
            setIsUploading(false);
            closeModal();
        }
    };

    const handleGenerateArticle = async () => {
        setIsUploading(true);
        
        try {
            const prompt = modalConfig.text;
            
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "google/gemini-2.5-flash",
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "system", content: `You are an expert article writer for an intellectual fellowship. Generate a comprehensive article based on the user's prompt. 
Return ONLY a valid JSON object strictly matching this structure:
{
  "title": "string",
  "category": "string (Pick one: Pemikiran Kritis (Thought Leadership), Riset & Temuan (Research & Findings), Sosial & Kebijakan (Social & Policy), Inovasi & Teknologi (Innovation & Tech), Filsafat & Etika (Philosophy & Ethics), Tinjauan Pustaka (Book Reviews), Studi Kasus (Case Studies))",
  "excerpt": "string (1-2 sentences)",
  "content": "string (Full markdown article with headings, quotes, and lists if applicable)",
  "tags": ["tag1", "tag2", "tag3"],
  "references": [{"url": "string", "title": "string"}]
}` },
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!response.ok) throw new Error("Gagal menghubungi AI");
            
            const data = await response.json();
            const aiGeneratedArticle = JSON.parse(data.choices[0].message.content);

            setFormData(prev => ({
                ...prev,
                title: aiGeneratedArticle.title || prev.title,
                category: aiGeneratedArticle.category || prev.category,
                excerpt: aiGeneratedArticle.excerpt || prev.excerpt,
                tags: aiGeneratedArticle.tags || prev.tags,
                references: aiGeneratedArticle.references || prev.references
            }));
            
            if (editor && aiGeneratedArticle.content) {
                editor.commands.setContent(aiGeneratedArticle.content);
            }
        } catch (error) {
            console.error("AI Generator Error:", error);
            alert("Terjadi kesalahan saat men-generate artikel: " + error.message);
        } finally {
            setIsUploading(false);
            closeModal();
        }
    };

    const handleModalUrlBlur = async (url) => {
        if (modalConfig.type !== 'link' || !url || !url.startsWith('http')) return;
        if (modalConfig.text && modalConfig.text !== "Memuat judul...") return;

        setModalConfig(prev => ({ ...prev, text: "Memuat judul..." }));

        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            let fetchedTitle = '';
            if (data && data.contents) {
                const match = data.contents.match(/<title>(.*?)<\/title>/i);
                if (match && match[1]) {
                    fetchedTitle = match[1].trim();
                }
            }

            setModalConfig(prev => prev.text === "Memuat judul..." ? { ...prev, text: fetchedTitle || "" } : prev);
        } catch (error) {
            setModalConfig(prev => prev.text === "Memuat judul..." ? { ...prev, text: "" } : prev);
        }
    };

    const handleModalSubmit = (e) => {
        e.preventDefault();
        const { type, url, text } = modalConfig;
        if (!url || !editor) return;

        if (type === 'link') {
            const linkText = text && text !== "Memuat judul..." ? text : url;
            // Always insert content, replacing any selection
            editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run();
        } else if (type === 'image') {
            editor.chain().focus().setImage({ src: url }).run();
        }
        closeModal();
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            LinkExtension.configure({
                openOnClick: false,
            }),
            ImageExtension,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Markdown,
        ],
        content: isEditMode ? formData.content : `Ceritakan inovasi, pemikiran kritis, atau hasil riset Anda di sini...

### Mengapa ini penting?
[Berikan konteks atau latar belakang singkat]

### Solusi atau Temuan
[Jelaskan metode, solusi, atau temuan dari analisa Anda]

### Dampak dan Hasil
[Gambarkan dampak nyata terhadap kepuasan pelanggan]`,
        onUpdate: ({ editor }) => {
            setFormData(prev => ({ ...prev, content: editor.storage.markdown.getMarkdown() }));
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] w-full bg-white px-5 py-4 leading-relaxed font-sans prose-table:border-collapse prose-table:table-fixed prose-td:border prose-td:border-gray-300 prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50',
            },
        },
    });

    useEffect(() => {
        const fetchArticleDetail = async () => {
            if (!isEditMode) return;
            try {
                const response = await fetch(`https://incsmsociety.site/api/get_article_detail.php?id=${id}`);
                const result = await response.json();
                if (result.success && result.data) {
                    const article = result.data;
                    setFormData({
                        title: article.title,
                        category: article.category,
                        image: article.cover_image || '',
                        excerpt: article.excerpt,
                        content: article.content,
                        tags: article.tags || [],
                        references: article.references || []
                    });
                    if (editor && !editor.isDestroyed) {
                        editor.commands.setContent(article.content);
                    }
                } else {
                    alert("Gagal memuat artikel: " + result.message);
                }
            } catch (error) {
                console.error("Fetch detail error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (editor) {
            fetchArticleDetail();
        }
    }, [isEditMode, id, editor]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Tags Logic ---
    const addTag = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    // --- References Logic ---
    const addReference = () => {
        setFormData(prev => ({
            ...prev,
            references: [...prev.references, { title: '', url: '' }]
        }));
    };

    const updateReference = (index, field, value) => {
        const newRefs = [...formData.references];
        newRefs[index][field] = value;
        setFormData(prev => ({ ...prev, references: newRefs }));
    };

    const removeReference = (index) => {
        const newRefs = formData.references.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, references: newRefs }));
    };

    const handleUrlBlur = async (index, url) => {
        if (!url || !url.startsWith('http')) return;

        // Hanya fetch jika judul masih kosong
        if (formData.references[index].title && formData.references[index].title !== "Memuat judul...") return;

        // Set state loading sementara di title
        updateReference(index, 'title', "Memuat judul...");

        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            let fetchedTitle = '';
            if (data && data.contents) {
                // Ekstrak tag title dari HTML
                const match = data.contents.match(/<title>(.*?)<\/title>/i);
                if (match && match[1]) {
                    fetchedTitle = match[1].trim();
                }
            }

            // Hapus suffix nama web jika ada (opsional, tapi biarkan saja)

            updateReference(index, 'title', fetchedTitle || "");

        } catch (error) {
            console.error("Error fetching title:", error);
            updateReference(index, 'title', "");
        }
    };

    // --- Submission ---
    const handleSubmit = async (actionType) => {
        if (!userId) {
            alert("Sesi Anda telah habis. Silakan login kembali.");
            return;
        }

        if (!formData.title || !formData.excerpt || !editor) {
            alert("Judul, Ringkasan, dan Konten Artikel wajib diisi!");
            return;
        }

        let finalStatus = 'draft';
        if (actionType === 'publish') {
            finalStatus = userRole === 'admin' ? 'published' : 'request';
        }

        setIsUploading(true);

        try {
            const currentContent = editor.storage.markdown.getMarkdown();
            const mdContent = currentContent.replace(/\[img:(.*?)\]/g, '![]($1)');

            const payload = {
                ...(isEditMode && { id }),
                author_id: userId,
                title: formData.title,
                category: formData.category,
                excerpt: formData.excerpt,
                content: mdContent,
                cover_image: formData.image || null,
                status: finalStatus,
                tags: formData.tags,
                references: formData.references.filter(r => r.url).map(r => ({ url: r.url, title: r.title }))
            };

            const endpoint = isEditMode 
                ? 'https://incsmsociety.site/api/edit_article.php'
                : 'https://incsmsociety.site/api/add_article.php';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log("Saved article ID:", result.article_id);
                navigate('/my-articles');
            } else {
                alert("Gagal menyimpan artikel: " + result.message);
            }
        } catch (error) {
            console.error("Submit error:", error);
            alert("Gagal menghubungi server.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link to="/my-articles" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-primary leading-tight">
                        {isEditMode ? 'Edit Artikel' : 'Tulis Artikel Baru'}
                    </h1>
                    <p className="text-sm text-gray-500">Bagikan pemikiran dan inovasi Anda dengan komunitas Fellow.</p>
                </div>

                <button 
                    onClick={() => openModal('ai_generator')} 
                    className="ml-auto px-5 py-2.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200 flex items-center gap-2 transition-all hover:scale-105 whitespace-nowrap"
                >
                    <Wand2 size={16} /> Generate Artikel AI
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Form Content */}
                <div className="p-6 md:p-8 space-y-8">

                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-gray-700">Judul Artikel <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Optimalisasi Proses PDCA..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Kategori <span className="text-red-500">*</span></label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm appearance-none"
                                >
                                    {CATEGORIES.map((cat, idx) => (
                                        <option key={idx} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">URL Gambar Sampul (Cover)</label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                />
                                {formData.image && (
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                        <img src={formData.image} alt="Cover Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Ringkasan Singkat (Excerpt) <span className="text-red-500">*</span></label>
                            <textarea
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleInputChange}
                                placeholder="Tuliskan 1-2 kalimat ringkasan tentang artikel ini..."
                                rows="2"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
                            ></textarea>
                            <p className="text-[10px] text-gray-400">Ringkasan ini akan muncul di halaman daftar artikel.</p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Custom Editor */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                            <span>Konten Utama <span className="text-red-500">*</span></span>
                            <span className="text-[10px] text-gray-400 font-normal uppercase tracking-wider">Mendukung Format Markdown & AI</span>
                        </label>

                        <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                            {/* Toolbar */}
                            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex flex-wrap gap-1 items-center">
                                <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('bold') ? 'bg-gray-200 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-200'}`} title="Bold"><Bold size={16} /></button>
                                <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('italic') ? 'bg-gray-200 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-200'}`} title="Italic"><Italic size={16} /></button>
                                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('heading') ? 'bg-gray-200 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-200'}`} title="Heading"><Type size={16} /></button>
                                <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('blockquote') ? 'bg-gray-200 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-200'}`} title="Quote"><Quote size={16} /></button>
                                <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded transition-colors ${editor?.isActive('bulletList') ? 'bg-gray-200 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-200'}`} title="List"><List size={16} /></button>
                                <button type="button" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-1.5 rounded transition-colors text-gray-600 hover:text-primary hover:bg-gray-200" title="Tabel"><TableIcon size={16} /></button>
                                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                <button type="button" onClick={() => openModal('link')} className={`p-1.5 rounded transition-colors ${editor?.isActive('link') ? 'bg-gray-200 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-200'}`} title="Insert Link"><LinkIcon size={16} /></button>
                                <button type="button" onClick={() => openModal('image')} className="p-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded flex items-center gap-1.5 px-3 transition-colors text-xs font-bold" title="Sisipkan Gambar">
                                    <ImageIcon size={14} /> Lampirkan Gambar
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => openModal('ai_format')} 
                                    disabled={formData.content.length < 300}
                                    className={`ml-auto p-1.5 rounded flex items-center gap-1.5 px-3 transition-colors text-xs font-bold border 
                                        ${formData.content.length < 300 
                                            ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed opacity-75' 
                                            : 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200'}`} 
                                    title={formData.content.length < 300 ? `Minimal 300 karakter untuk menggunakan AI (Saat ini: ${formData.content.length})` : "Penyempurnaan Format dengan AI"}
                                >
                                    <Sparkles size={14} /> Penyempurnaan Format
                                </button>
                            </div>

                            {/* Table Sub-Toolbar */}
                            {editor?.isActive('table') && (
                                <div className="bg-blue-50/50 border-b border-gray-200 px-3 py-1.5 flex flex-wrap gap-2 items-center">
                                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mr-2">Tabel:</span>

                                    <div className="flex gap-1">
                                        <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className="p-1 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1 text-[11px] font-semibold" title="Tambah Baris (Atas)"><ArrowUp size={12} /> Baris</button>
                                        <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1 text-[11px] font-semibold" title="Tambah Baris (Bawah)"><ArrowDown size={12} /> Baris</button>
                                        <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Hapus Baris"><X size={14} /></button>
                                    </div>

                                    <div className="w-px h-4 bg-blue-200 mx-1"></div>

                                    <div className="flex gap-1">
                                        <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className="p-1 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1 text-[11px] font-semibold" title="Tambah Kolom (Kiri)"><ArrowLeftIcon size={12} /> Kolom</button>
                                        <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1 text-[11px] font-semibold" title="Tambah Kolom (Kanan)">Kolom <ArrowRight size={12} /></button>
                                        <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Hapus Kolom"><X size={14} /></button>
                                    </div>

                                    <div className="w-px h-4 bg-blue-200 mx-1"></div>

                                    <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="p-1 text-red-600 hover:bg-red-50 rounded flex items-center gap-1 text-[11px] font-bold ml-auto" title="Hapus Tabel"><Trash2 size={12} /> Hapus Tabel</button>
                                </div>
                            )}

                            {/* Editor Area */}
                            <EditorContent editor={editor} />

                            {/* Footer helper */}
                            <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 flex justify-between items-center text-[10px] text-gray-400">
                                <span>Gunakan [img:url_gambar] untuk menyisipkan gambar dari respon AI.</span>
                                <span>{formData.content.length} karakter</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Tags and References */}
                    <div className="space-y-8">

                        {/* Tags */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-700">Tags</label>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-wrap gap-2 items-center min-h-[50px]">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-primary flex items-center gap-1.5 shadow-sm">
                                        #{tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={addTag}
                                    placeholder={formData.tags.length === 0 ? "Ketik topik lalu tekan Enter..." : "Tambah topik..."}
                                    className="bg-transparent focus:outline-none text-sm text-gray-700 flex-1 min-w-[120px]"
                                />
                            </div>
                        </div>

                        {/* References */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-700">Sumber & Referensi</label>
                                <button type="button" onClick={addReference} className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1">
                                    <Plus size={14} /> Tambah Referensi
                                </button>
                            </div>

                            {formData.references.length === 0 ? (
                                <div className="text-center p-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <p className="text-xs text-gray-400">Tidak ada referensi ditambahkan.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formData.references.map((ref, idx) => (
                                        <div key={idx} className="flex gap-3 items-start relative group">
                                            <div className="flex-1 space-y-3 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">URL Referensi</label>
                                                    <input
                                                        type="text"
                                                        value={ref.url}
                                                        onChange={(e) => updateReference(idx, 'url', e.target.value)}
                                                        onBlur={(e) => handleUrlBlur(idx, e.target.value)}
                                                        placeholder="Tempelkan (paste) link di sini..."
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary text-sm"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Judul Referensi</label>
                                                    <input
                                                        type="text"
                                                        value={ref.title}
                                                        onChange={(e) => updateReference(idx, 'title', e.target.value)}
                                                        placeholder={ref.title === "Memuat judul..." ? "Memuat..." : "Bisa diedit (Otomatis terisi jika URL valid)"}
                                                        disabled={ref.title === "Memuat judul..."}
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm font-semibold disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeReference(idx)}
                                                className="mt-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="Hapus referensi ini"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-end">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <button
                            onClick={() => handleSubmit('draft')}
                            disabled={isUploading}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} /> Simpan sebagai Draft
                        </button>
                        <button
                            onClick={() => handleSubmit('publish')}
                            disabled={isUploading}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isUploading ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Menyimpan...</>
                            ) : (
                                <><Send size={18} /> {userRole === 'admin' ? 'Terbitkan Sekarang' : 'Request Terbit (Publish)'}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Link/Image Modal */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className={`bg-white rounded-2xl p-6 w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${modalConfig.type === 'ai_generator' ? 'max-w-2xl' : 'max-w-sm'}`}>
                        <h3 className="text-lg font-black text-gray-800 mb-4">
                            {modalConfig.type === 'link' ? 'Masukkan Tautan' :
                                modalConfig.type === 'image' ? 'Masukkan URL Gambar' : ''}
                        </h3>
                        {modalConfig.type === 'ai_generator' ? (
                            <div>
                                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
                                    <Bot className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-black text-center text-gray-800 mb-2">AI Article Generator</h3>
                                <p className="text-sm text-center text-gray-500 mb-6">
                                    Berikan konteks, data mentah, metodologi, atau sumber acuan. AI akan merangkainya menjadi artikel utuh.
                                </p>
                                
                                <textarea
                                    autoFocus
                                    placeholder="Contoh: Buatkan artikel opini tentang hasil survei kepuasan pelanggan bulan ini. Konteks: sistem digitalisasi baru. Data: NPS naik jadi 60, resolusi masalah lebih cepat. Metodologi: observasi 500 pengguna aktif..."
                                    className="w-full h-64 bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm md:text-base focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none mb-6"
                                    value={modalConfig.text}
                                    onChange={(e) => setModalConfig(prev => ({ ...prev, text: e.target.value }))}
                                />
                                
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                        Batal
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleGenerateArticle}
                                        disabled={!modalConfig.text.trim() || isUploading}
                                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isUploading ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Meracik Artikel...</>
                                        ) : (
                                            <><Wand2 size={16} /> Generate Sekarang</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : modalConfig.type === 'ai_format' ? (
                            <div className="text-center">
                                <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                                <h3 className="text-lg font-black text-gray-800 mb-2">Penyempurnaan Format AI</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    AI akan merapikan struktur Markdown, memperbaiki spasi dan tanda baca, serta mengoptimalkan keterbacaan artikel Anda. Lanjutkan?
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button type="button" onClick={closeModal} className="px-6 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                        Batal
                                    </button>
                                    <button type="button" onClick={handleAiFormat} disabled={isUploading} className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex items-center gap-2">
                                        {isUploading ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Memproses...</>
                                        ) : 'Ya, Sempurnakan'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleModalSubmit} className="space-y-4">

                                {modalConfig.type === 'link' ? (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">URL Tautan</label>
                                            <input
                                                type="url"
                                                autoFocus
                                                required
                                                value={modalConfig.url}
                                                onChange={(e) => setModalConfig(prev => ({ ...prev, url: e.target.value }))}
                                                onBlur={(e) => handleModalUrlBlur(e.target.value)}
                                                placeholder="https://..."
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5 mb-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Teks Tautan</label>
                                            <input
                                                type="text"
                                                value={modalConfig.text}
                                                onChange={(e) => setModalConfig(prev => ({ ...prev, text: e.target.value }))}
                                                placeholder={modalConfig.text === "Memuat judul..." ? "Memuat..." : "Teks yang akan ditampilkan"}
                                                disabled={modalConfig.text === "Memuat judul..."}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm disabled:text-gray-400"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group relative overflow-hidden"
                                            onClick={() => document.getElementById('imageUpload').click()}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files[0]); }}
                                        >
                                            {isUploading ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                                                    <p className="text-xs font-bold text-primary">Mengunggah...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                                                    <p className="text-xs font-bold text-gray-600">Drag & drop gambar di sini</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">atau klik untuk memilih file dari komputer</p>
                                                    <input type="file" id="imageUpload" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0])} />
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 py-1">
                                            <div className="h-px bg-gray-200 flex-1"></div>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ATAU DARI URL</span>
                                            <div className="h-px bg-gray-200 flex-1"></div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <input
                                                type="url"
                                                value={modalConfig.url}
                                                onChange={(e) => setModalConfig(prev => ({ ...prev, url: e.target.value }))}
                                                placeholder="https://... (URL Gambar)"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                        Batal
                                    </button>
                                    <button type="submit" disabled={modalConfig.text === "Memuat judul..." || isUploading} className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 disabled:opacity-50">
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
