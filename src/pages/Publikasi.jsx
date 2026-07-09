import React, { useState, useRef, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, BookOpen, Download, Loader2, Lock, EyeOff, Search, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import Toast from '../components/shared/Toast';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

// Each page inside the flipbook. The flipbook sets the container size.
// We render <Page> with matching width so canvas fits exactly.
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

export default function Publikasi() {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [publikasiList, setPublikasiList] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
    const [showAccessDenied, setShowAccessDenied] = useState(false);
    
    // Filter & Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [zoomLevel, setZoomLevel] = useState(1);

    // Dimensions for the flipbook (in pixels)
    const [bookDims, setBookDims] = useState({ w: 400, h: 566 });

    // 3-second preview logic for private docs
    useEffect(() => {
        let timeoutId;
        if (selectedDoc && selectedDoc.visibility === 'private' && !isLoading) {
            const userStr = localStorage.getItem('csm_user');
            if (!userStr) {
                timeoutId = setTimeout(() => {
                    setShowAccessDenied(true);
                }, 1000);
            }
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [selectedDoc, isLoading]);

    useEffect(() => {
        const fetchPublikasi = async () => {
            try {
                const res = await fetch(`${import.meta.env.BASE_URL}api/get_publikasi.php`);
                const json = await res.json();
                if (json.status === 'success') {
                    // Filter only published ones for public view
                    const published = json.data.filter(p => p.status === 'publish');
                    setPublikasiList(published);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsFetching(false);
            }
        };
        fetchPublikasi();
    }, []);

    const bookRef = useRef();

    const openDocument = (doc) => {
        setSelectedDoc(doc);
        setNumPages(null);
        setPageNumber(1);
        setIsLoading(true);
        setShowAccessDenied(false);
    };

    const closeDocument = () => {
        setSelectedDoc(null);
        setNumPages(null);
        setPageNumber(1);
        setShowAccessDenied(false);
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
            // Available height: viewport height - 160px (toolbar + controls), more padding on mobile for stacked toolbar
            const availH = window.innerHeight - (isMobile ? 220 : 160);
            // Available width: viewport width - padding
            const availW = window.innerWidth - (isMobile ? 20 : 40);

            // Start with available width for one page
            // On desktop, 2 pages side-by-side, so max page width is half available width.
            // On mobile, 1 page is shown (portrait), so max page width is full available width.
            let pageW = isMobile ? availW : availW / 2;
            let pageH = pageW * ratio;

            // If too tall, recalculate from height
            if (pageH > availH) {
                pageH = availH;
                pageW = pageH / ratio;
            }

            setBookDims({ w: Math.round(pageW), h: Math.round(pageH) });
        } catch (e) {
            console.error("Gagal membaca dimensi PDF", e);
        }
        setIsLoading(false);
    };

    const nextButtonClick = () => {
        if (bookRef.current) {
            bookRef.current.pageFlip().flipNext();
        }
    };

    const prevButtonClick = () => {
        if (bookRef.current) {
            bookRef.current.pageFlip().flipPrev();
        }
    };

    const onPage = (e) => {
        setPageNumber(e.data + 1);
    };

    return (
        <div className="min-h-screen bg-surface-warm pt-24 pb-20">
            {/* Header */}
            <div className="text-center px-4 max-w-4xl mx-auto mb-16">
                <span className="inline-block bg-accent/20 border border-accent/40 text-accent font-bold tracking-widest uppercase text-xs px-4 py-1.5 rounded-full mb-6 shadow-sm">
                    Pusat Literatur
                </span>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6">
                    Publikasi & Dokumen
                </h1>
                <p className="font-sans text-gray-600 text-lg max-w-2xl mx-auto">
                    Akses eksklusif ke berbagai buku saku, panduan operasional, dan jurnal riset yang disesuaikan untuk standar pelayanan The Fellow.
                </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari judul, penulis, deksripsi, atau tag..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-accent/20 rounded-xl focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all shadow-sm"
                    />
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                    {['Semua', ...Array.from(new Set(publikasiList.map(p => p.category)))].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filterCategory === cat ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/30 hover:bg-gray-50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Book Cards Grid */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {isFetching ? (
                    <div className="col-span-full text-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </div>
                ) : (
                    (() => {
                        const filteredPublikasi = publikasiList.filter(pub => {
                            const matchCat = filterCategory === 'Semua' || pub.category === filterCategory;
                            const term = searchTerm.toLowerCase();
                            const matchSearch = 
                                pub.title.toLowerCase().includes(term) || 
                                (pub.description && pub.description.toLowerCase().includes(term)) ||
                                (pub.author && pub.author.toLowerCase().includes(term)) ||
                                (pub.tags_str && pub.tags_str.toLowerCase().includes(term));
                            return matchCat && matchSearch;
                        });

                        if (filteredPublikasi.length === 0) {
                            return (
                                <div className="col-span-full text-center py-12 text-gray-500 bg-white/50 rounded-2xl border border-dashed border-gray-300">
                                    <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                    <p className="font-medium text-lg">Tidak ada publikasi yang ditemukan.</p>
                                    <p className="text-sm">Coba ubah kata kunci atau filter kategori Anda.</p>
                                </div>
                            );
                        }

                        return filteredPublikasi.map((pub) => (
                            <div
                                key={pub.id}
                                className="group bg-surface-card border border-accent/20 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col transform hover:-translate-y-2"
                                onClick={() => openDocument(pub)}
                            >

                                <div className="h-64 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10"></div>
                                    
                                    {pub.visibility === 'private' && (
                                        <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur text-primary text-xs font-bold px-3 py-1.5 rounded-full z-30 flex items-center gap-1.5 shadow-lg border border-primary/20">
                                            <Lock className="w-3.5 h-3.5" />
                                            <span className="uppercase tracking-wider">Member Only</span>
                                        </div>
                                    )}

                                    <img src={`${import.meta.env.BASE_URL}${pub.coverImg.substring(1)}`} alt={pub.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-4 z-20">
                                        <BookOpen className="w-6 h-6 text-accent mb-2" />
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">{pub.category}</span>
                                        <span className="text-accent text-xs font-bold uppercase tracking-wider">{pub.author}</span>
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-primary mb-3 line-clamp-2">{pub.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">{pub.description}</p>
                                    
                                    {pub.tags && pub.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-6">
                                            {pub.tags.map(tag => (
                                                <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">#{tag}</span>
                                            ))}
                                        </div>
                                    )}

                                    <button className="w-full bg-primary text-white font-sans text-sm font-semibold py-3 rounded hover:bg-primary-light transition-colors flex items-center justify-center gap-2 mt-auto">
                                        <BookOpen className="w-4 h-4" /> Baca Sekarang
                                    </button>
                                </div>
                            </div>
                        ));
                    })()
                )}
            </div>

            {/* Fullscreen Flipbook Modal */}
            {selectedDoc && (
                <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
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
                            {/* Zoom controls */}
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
                            
                            {selectedDoc.visibility === 'public' || localStorage.getItem('csm_user') ? (
                                <a 
                                    href={`${import.meta.env.BASE_URL}${selectedDoc.fileUrl.substring(1)}`} 
                                    download 
                                    className="flex items-center gap-1.5 bg-accent/20 hover:bg-accent text-accent hover:text-primary px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
                                >
                                    <Download className="w-4 h-4" /> <span className="hidden sm:inline">Unduh PDF</span>
                                </a>
                            ) : null}

                            <button onClick={closeDocument} className="hidden sm:block p-2 text-white hover:text-red-400 hover:bg-red-400/20 rounded-lg transition-colors ml-1">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Book Container with Zoom and Safari Fixes */}
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
                                {isLoading && (
                                    <div className="flex flex-col items-center text-white gap-4">
                                        <Loader2 className="w-12 h-12 text-accent animate-spin" />
                                        <p className="font-serif text-xl">Membuka Lembaran Buku...</p>
                                    </div>
                                )}

                            {!isLoading && numPages && (
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
                                        {/* Cover Page */}
                                        <FlipPage isCover={true} title={selectedDoc.title} description={selectedDoc.description} pageWidth={bookDims.w} zoomLevel={zoomLevel} />

                                        {/* Inner PDF Pages */}
                                        {Array.from(new Array(numPages), (el, index) => (
                                            <FlipPage key={`page_${index + 1}`} pageNumber={index + 1} pageWidth={bookDims.w} zoomLevel={zoomLevel} />
                                        ))}

                                        {/* Back Cover */}
                                        <FlipPage isCover={true} title="Selesai" description={selectedDoc.author} pageWidth={bookDims.w} zoomLevel={zoomLevel} />
                                    </HTMLFlipBook>
                                </div>
                            )}
                        </Document>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    {!isLoading && numPages && (
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

                    {/* Access Denied Blur Overlay - TRUE FULLSCREEN */}
                    {showAccessDenied && (
                        <div className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
                            <div className="bg-surface-warm/10 p-8 rounded-full mb-6 border border-white/10 shadow-2xl">
                                <EyeOff className="w-16 h-16 text-white opacity-90" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4 text-center px-4 tracking-wide">Akses Terbatas</h2>
                            <p className="text-white/80 font-sans text-center max-w-md px-6 leading-relaxed mb-8">
                                Anda harus login sebagai Member/Fellow untuk membaca keseluruhan publikasi ini.
                            </p>
                            <button onClick={closeDocument} className="px-8 py-3 bg-accent text-primary font-bold rounded-lg hover:bg-white transition-all shadow-lg transform hover:-translate-y-1">
                                Tutup Dokumen
                            </button>
                        </div>
                    )}

                </div>
            )}

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
