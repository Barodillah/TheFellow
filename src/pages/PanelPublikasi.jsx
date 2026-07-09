import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, BookOpen, X, Upload, Loader2, Image as ImageIcon, FileText, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import Toast from '../components/shared/Toast';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

// Each page inside the flipbook
const FlipPage = React.forwardRef(({ pageNumber, isCover, title, description, pageWidth, zoomLevel = 1 }, ref) => {
    return (
        <div ref={ref} className="bg-white overflow-hidden">
            {isCover ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-primary border-4 border-double border-accent m-2 rounded">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 text-accent">{title}</h2>
                    <p className="text-gray-300 font-sans tracking-widest text-sm line-clamp-3 leading-relaxed">{description || 'The Fellow'}</p>
                </div>
            ) : (
                <div className="w-full h-full overflow-hidden">
                    <Page
                        pageNumber={pageNumber}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={pageWidth}
                        devicePixelRatio={Math.min(3, Math.max(window.devicePixelRatio || 1, zoomLevel * (window.devicePixelRatio || 1)))}
                        loading={
                            <div className="flex flex-col items-center justify-center text-gray-400 h-full w-full gap-2">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="text-sm">Memuat halaman {pageNumber}...</span>
                            </div>
                        }
                    />
                </div>
            )}
        </div>
    );
});
FlipPage.displayName = 'FlipPage';

export default function PanelPublikasi() {
    const { user } = useOutletContext();
    const [publikasi, setPublikasi] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Flipbook Preview State
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [bookDims, setBookDims] = useState({ w: 400, h: 566 });
    const [zoomLevel, setZoomLevel] = useState(1);
    const bookRef = useRef();

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Buku Saku',
        visibility: 'public',
        status: 'draft',
        author_id: '',
        tags: []
    });
    
    const [categorySelect, setCategorySelect] = useState('Buku Saku');
    const [tagInput, setTagInput] = useState('');
    
    const [pdfFile, setPdfFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        fetchPublikasi();
        if (user?.role === 'admin') {
            fetchUsersList();
        }
    }, [user]);

    const fetchUsersList = async () => {
        try {
            const res = await fetch(`${import.meta.env.BASE_URL}api/get_users.php`);
            const json = await res.json();
            if (json.status === 'success') {
                setUsersList(json.users || []);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const fetchPublikasi = async () => {
        setIsFetching(true);
        try {
            const res = await fetch(`${import.meta.env.BASE_URL}api/get_publikasi.php`);
            const json = await res.json();
            if (json.status === 'success') {
                setPublikasi(json.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsFetching(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditItem(item);
            setFormData({
                title: item.title,
                description: item.description,
                category: item.category,
                visibility: item.visibility,
                status: item.status,
                author_id: item.user_id,
                tags: item.tags || []
            });
            const stdCats = ['Buku Saku', 'Jurnal', 'Panduan'];
            if (stdCats.includes(item.category)) {
                setCategorySelect(item.category);
            } else {
                setCategorySelect('Lainnya');
            }
            setPdfFile(null);
            setCoverFile(null);
            setCoverPreview(item.coverImg);
        } else {
            setEditItem(null);
            setFormData({
                title: '',
                description: '',
                category: 'Buku Saku',
                visibility: 'public',
                status: 'draft',
                author_id: '',
                tags: []
            });
            setCategorySelect('Buku Saku');
            setTagInput('');
            setPdfFile(null);
            setCoverFile(null);
            setCoverPreview(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditItem(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !formData.tags.includes(newTag)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };
    
    const generateCover = async (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                try {
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjs.getDocument(typedarray).promise;
                    const page = await pdf.getPage(1);
                    
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    
                    await page.render(renderContext).promise;
                    
                    canvas.toBlob((blob) => {
                        const generatedCover = new File([blob], "cover.jpg", { type: "image/jpeg" });
                        resolve({ file: generatedCover, url: canvas.toDataURL('image/jpeg') });
                    }, 'image/jpeg', 0.8);
                } catch (err) {
                    reject(err);
                }
            };
            fileReader.onerror = reject;
            fileReader.readAsArrayBuffer(file);
        });
    };

    const handlePdfSelect = async (file) => {
        if (file && file.type === 'application/pdf') {
            if (file.size > 50 * 1024 * 1024) {
                showToast('Ukuran file PDF melebihi batas 50MB.', 'error');
                return;
            }
            setPdfFile(file);
            
            // Auto generate cover
            try {
                const coverData = await generateCover(file);
                setCoverFile(coverData.file);
                setCoverPreview(coverData.url);
            } catch (err) {
                console.error("Gagal men-generate cover:", err);
                showToast('Gagal memproses gambar dari PDF.', 'error');
            }
        } else {
            showToast('Harap pilih file PDF yang valid.', 'error');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handlePdfSelect(e.dataTransfer.files[0]);
        }
    };

    const handleCoverChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const data = new FormData();
        data.append('user_id', (user?.role === 'admin' && editItem && formData.author_id) ? formData.author_id : user.id);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', categorySelect === 'Lainnya' ? formData.category : categorySelect);
        data.append('visibility', formData.visibility);
        data.append('status', formData.status);
        data.append('tags', JSON.stringify(formData.tags));
        
        if (pdfFile) {
            data.append('pdf_file', pdfFile);
        }
        if (coverFile) {
            data.append('cover_file', coverFile);
        }

        if (editItem) {
            data.append('id', editItem.id);
        }

        try {
            const endpoint = editItem ? 'api/edit_publikasi.php' : 'api/add_publikasi.php';
            const res = await fetch(`${import.meta.env.BASE_URL}${endpoint}`, {
                method: 'POST',
                body: data
            });
            const json = await res.json();
            if (json.status === 'success') {
                showToast(json.message, 'success');
                fetchPublikasi();
                handleCloseModal();
            } else {
                showToast(json.message, 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan pada server.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus publikasi ini?")) {
            try {
                const res = await fetch(`${import.meta.env.BASE_URL}api/delete_publikasi.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                const json = await res.json();
                if (json.status === 'success') {
                    showToast(json.message, 'success');
                    setPublikasi(publikasi.filter(p => p.id !== id));
                } else {
                    showToast(json.message, 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Gagal menghapus data.', 'error');
            }
        }
    };

    // --- Flipbook Functions ---
    const openDocument = (doc) => {
        setSelectedDoc(doc);
        setNumPages(null);
        setPageNumber(1);
        setZoomLevel(1);
        setIsPdfLoading(true);
    };

    const closeDocument = () => {
        setSelectedDoc(null);
        setNumPages(null);
        setPageNumber(1);
        setZoomLevel(1);
    };

    const onDocumentLoadSuccess = async (pdf) => {
        setNumPages(pdf.numPages);
        try {
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            const ratio = viewport.height / viewport.width;
            
            // Calculate page width to fit the viewport nicely
            const isMobile = window.innerWidth < 640;
            const availH = window.innerHeight - (isMobile ? 220 : 160);
            const availW = window.innerWidth - (isMobile ? 20 : 40);

            // Start with available width for one page
            let pageW = isMobile ? availW : availW / 2;
            let pageH = pageW * ratio;
            
            if (pageH > availH) {
                pageH = availH;
                pageW = pageH / ratio;
            }
            setBookDims({ w: Math.round(pageW), h: Math.round(pageH) });
        } catch (e) {
            console.error("Gagal membaca dimensi PDF", e);
        }
        setIsPdfLoading(false);
    };

    const nextButtonClick = () => {
        if (bookRef.current) bookRef.current.pageFlip().flipNext();
    };

    const prevButtonClick = () => {
        if (bookRef.current) bookRef.current.pageFlip().flipPrev();
    };

    const onPage = (e) => {
        setPageNumber(e.data + 1);
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Publikasi</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola dokumen, buku saku, dan jurnal riset.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    <span>Tambah Publikasi</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Judul & Penulis</th>
                                <th className="px-6 py-4">Visibilitas</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isFetching ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : (user?.role === 'admin' ? publikasi : publikasi.filter(pub => pub.user_id === user?.id)).map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                {item.coverImg ? (
                                                    <img src={`${import.meta.env.BASE_URL}${item.coverImg.substring(1)}`} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <BookOpen className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">{item.title}</div>
                                                <div className="text-xs text-gray-500">{item.author}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {item.visibility === 'public' ? 'Publik' : 'Private'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                                            ${item.status === 'publish' ? 'bg-blue-100 text-blue-700' : ''}
                                            ${item.status === 'draft' ? 'bg-gray-100 text-gray-700' : ''}
                                            ${item.status === 'request' ? 'bg-yellow-100 text-yellow-700' : ''}
                                            ${item.status === 'archive' ? 'bg-red-100 text-red-700' : ''}
                                        `}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openDocument(item)}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                                title="Lihat PDF"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {!(user?.role !== 'admin' && item.status === 'publish') && (
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isFetching && (user?.role === 'admin' ? publikasi : publikasi.filter(pub => pub.user_id === user?.id)).length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Belum ada data publikasi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah/Edit */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editItem ? 'Edit Publikasi' : 'Tambah Publikasi'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Judul Publikasi</label>
                                        <input 
                                            type="text" 
                                            name="title" 
                                            value={formData.title} 
                                            onChange={handleChange} 
                                            required 
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="Masukkan judul..."
                                        />
                                    </div>
                                    
                                    {editItem && user?.role === 'admin' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Penulis (Pemilik Publikasi)</label>
                                            <select 
                                                name="author_id" 
                                                value={formData.author_id} 
                                                onChange={handleChange} 
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                                            >
                                                <option value="" disabled>Pilih Penulis...</option>
                                                {(usersList || []).map(u => (
                                                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Deskripsi Singkat</label>
                                        <textarea 
                                            name="description" 
                                            value={formData.description} 
                                            onChange={handleChange} 
                                            rows="3" 
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                                            placeholder="Penjelasan singkat mengenai publikasi..."
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
                                        <select
                                            value={categorySelect}
                                            onChange={(e) => {
                                                setCategorySelect(e.target.value);
                                                if (e.target.value !== 'Lainnya') {
                                                    setFormData(prev => ({ ...prev, category: e.target.value }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, category: '' }));
                                                }
                                            }}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all outline-none mb-2 cursor-pointer appearance-none text-sm"
                                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                                        >
                                            <option value="Buku Saku">Buku Saku</option>
                                            <option value="Jurnal">Jurnal</option>
                                            <option value="Panduan">Panduan</option>
                                            <option value="Lainnya">Kategori Lainnya...</option>
                                        </select>
                                        {categorySelect === 'Lainnya' && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                                <input
                                                    type="text"
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Ketik kategori kustom di sini..."
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                                                />
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 block">
                                            Tags <span className="text-xs text-gray-400 font-normal">(Tekan Enter atau Koma)</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-xl bg-white min-h-[42px] focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                                            {formData.tags.map(tag => (
                                                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                            <input 
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleTagKeyDown}
                                                placeholder={formData.tags.length === 0 ? "Ketik tag..." : ""}
                                                className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
                                                onBlur={() => {
                                                    if(tagInput.trim()) {
                                                        const newTag = tagInput.trim();
                                                        if (!formData.tags.includes(newTag)) {
                                                            setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
                                                        }
                                                        setTagInput('');
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    
                                    
                                    {!(user?.role !== 'admin' && formData.status === 'publish') && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Visibilitas</label>
                                                <select 
                                                    name="visibility" 
                                                    value={formData.visibility} 
                                                    onChange={handleChange} 
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                                                >
                                                    <option value="public">Publik</option>
                                                    <option value="private">Private (Khusus Fellow)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">Status Persetujuan</label>
                                                <select 
                                                    name="status" 
                                                    value={formData.status} 
                                                    onChange={handleChange} 
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                                                >
                                                    <option value="draft">Draft</option>
                                                    <option value="request">Request</option>
                                                    {(user?.role === 'admin' || formData.status === 'publish') && (
                                                        <option value="publish" disabled={user?.role !== 'admin'}>
                                                            Publish {user?.role !== 'admin' ? '(Admin)' : ''}
                                                        </option>
                                                    )}
                                                    {(user?.role === 'admin' || formData.status === 'archive') && (
                                                        <option value="archive" disabled={user?.role !== 'admin'}>
                                                            Archive {user?.role !== 'admin' ? '(Admin)' : ''}
                                                        </option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {/* Drag and Drop PDF */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 block">File PDF Dokumen</label>
                                        <div 
                                            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors
                                                ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:bg-gray-50'}
                                            `}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                                            <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                                {pdfFile ? (
                                                    <span className="text-primary truncate block max-w-xs mx-auto">{pdfFile.name}</span>
                                                ) : (
                                                    editItem ? 'Ganti File PDF (Opsional)' : 'Unggah File PDF'
                                                )}
                                            </h3>
                                            <p className="text-xs text-gray-500 mb-4">Max 50MB. Drag & drop kesini.</p>
                                            <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors inline-block">
                                                Pilih File
                                                <input type="file" className="hidden" accept=".pdf" onChange={(e) => {
                                                    if (e.target.files && e.target.files.length > 0) {
                                                        handlePdfSelect(e.target.files[0]);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Cover Preview */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 block">Cover Publikasi (Auto-Generate)</label>
                                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center h-64 relative">
                                        {coverPreview ? (
                                            <img src={coverPreview.startsWith('blob:') || coverPreview.startsWith('data:') ? coverPreview : `${import.meta.env.BASE_URL}${coverPreview.substring(1)}`} alt="Cover Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center text-gray-400 px-4">
                                                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-xs">Cover otomatis terdeteksi dari halaman pertama PDF.</p>
                                            </div>
                                        )}
                                        
                                        <label className="absolute bottom-4 right-4 bg-white/90 backdrop-blur shadow-sm border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white transition-colors cursor-pointer text-gray-700">
                                            Ganti Cover
                                            <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleCoverChange} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={handleCloseModal} className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium">
                                    Batal
                                </button>
                                <button type="submit" disabled={isLoading || (!editItem && !pdfFile)} className="px-5 py-2 text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-50">
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editItem ? 'Simpan Perubahan' : 'Tambah Publikasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            , document.body)}

            {/* Flipbook Preview Modal */}
            {selectedDoc && createPortal(
                <div className="fixed top-0 left-0 right-0 bottom-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
                    
                    {/* Toolbar */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 gap-3 z-50">
                        <div className="flex items-center justify-between w-full sm:w-auto">
                            <h3 className="text-white font-serif text-base sm:text-lg md:text-xl font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                                {selectedDoc.title}
                            </h3>
                            <button onClick={closeDocument} className="sm:hidden p-1.5 text-white hover:text-red-400 bg-white/10 rounded-lg transition-colors ml-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex items-center justify-center sm:justify-end gap-1 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                            <div className="flex items-center bg-white/10 rounded-lg px-1 sm:px-2 py-1">
                                <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))} className="p-1.5 text-white hover:text-accent transition-colors" title="Zoom Out">
                                    <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                <span className="text-white text-[10px] sm:text-xs font-bold w-8 sm:w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                                <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))} className="p-1.5 text-white hover:text-accent transition-colors" title="Zoom In">
                                    <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                                <div className="w-px h-4 bg-white/20 mx-1"></div>
                                <button onClick={() => setZoomLevel(1)} className="p-1.5 text-white hover:text-accent transition-colors" title="Reset Zoom">
                                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                            
                            <a 
                                href={`${import.meta.env.BASE_URL}${selectedDoc.fileUrl.substring(1)}`} 
                                download 
                                className="flex items-center gap-1.5 bg-accent/20 hover:bg-accent text-accent hover:text-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
                            >
                                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Unduh PDF</span>
                            </a>

                            <button onClick={closeDocument} className="hidden sm:block p-2 text-white hover:text-red-400 hover:bg-red-400/20 rounded-lg transition-colors ml-1">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Book Container */}
                    <div className="relative flex-1 min-h-0 w-full overflow-auto flex items-center justify-center pt-24 sm:pt-16 pb-24 sm:pb-24">
                        <div 
                            style={{ 
                                transform: `scale(${zoomLevel})`, 
                                transformOrigin: 'center', 
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                            }} 
                            className="flex justify-center items-center min-h-min min-w-min p-4"
                        >
                            <Document
                                file={`${import.meta.env.BASE_URL}${selectedDoc.fileUrl.substring(1)}`}
                                onLoadSuccess={onDocumentLoadSuccess}
                                className="flex flex-col items-center justify-center"
                            >
                                {isPdfLoading && (
                                    <div className="flex flex-col items-center text-white gap-4">
                                        <Loader2 className="w-12 h-12 text-accent animate-spin" />
                                        <p className="font-serif text-xl">Membuka Lembaran Buku...</p>
                                    </div>
                                )}
                                {!isPdfLoading && numPages && (
                                    <div className="relative shadow-2xl">
                                        <HTMLFlipBook
                                            width={bookDims.w}
                                            height={bookDims.h}
                                            size="fixed"
                                            maxShadowOpacity={0.5}
                                            showCover={true}
                                            mobileScrollSupport={true}
                                            onFlip={onPage}
                                            ref={bookRef}
                                            className="bg-transparent"
                                        >
                                            <FlipPage isCover={true} title={selectedDoc.title} description={selectedDoc.description} pageWidth={bookDims.w} zoomLevel={zoomLevel} />
                                            {Array.from(new Array(numPages), (el, index) => (
                                                <FlipPage key={`page_${index + 1}`} pageNumber={index + 1} pageWidth={bookDims.w} zoomLevel={zoomLevel} />
                                            ))}
                                            <FlipPage isCover={true} title="Selesai" description={selectedDoc.author || "The Fellow"} pageWidth={bookDims.w} zoomLevel={zoomLevel} />
                                        </HTMLFlipBook>
                                    </div>
                                )}
                            </Document>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    {!isPdfLoading && numPages && (
                        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/20 z-50">
                            <button onClick={prevButtonClick} className="p-1 sm:p-2 text-white hover:text-accent transition-transform hover:-translate-x-1 bg-white/5 rounded-full">
                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <span className="text-white font-bold font-serif min-w-[70px] sm:min-w-[80px] text-center text-sm sm:text-base">
                                Hlm {pageNumber} / {numPages + 2}
                            </span>
                            <button onClick={nextButtonClick} className="p-1 sm:p-2 text-white hover:text-accent transition-transform hover:translate-x-1 bg-white/5 rounded-full">
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    )}
                </div>
            , document.body)}

            {/* Toast Notification */}
            <Toast 
                show={toast.show} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast(prev => ({ ...prev, show: false }))} 
            />
        </div>
    );
}
