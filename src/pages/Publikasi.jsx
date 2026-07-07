import React, { useState, useRef, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, BookOpen, Download, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PUBLICATIONS = [
    {
        id: 1,
        title: "POCKETBOOK SOP CS & Sales",
        author: "CSM Intellectual Society",
        coverImg: "/pdf/cover/POCKETBOOK-SOP-CS-Sales.jpg",
        fileUrl: "/pdf/POCKETBOOK-SOP-CS-Sales.pdf",
        desc: "Buku saku standar operasional prosedur untuk Customer Service dan Sales."
    },
    {
        id: 2,
        title: "Pocketbook CS",
        author: "CSM Intellectual Society",
        coverImg: "/pdf/cover/Pocketbook-CS.jpg",
        fileUrl: "/pdf/Pocketbook-CS.pdf",
        desc: "Panduan praktis sehari-hari untuk operasional Customer Service di diler."
    },
    {
        id: 3,
        title: "Foresight Black Swans",
        author: "Deloitte Insights",
        coverImg: "/pdf/cover/ch-deloitte-foresight-black-swans.jpg",
        fileUrl: "/pdf/ch-deloitte-foresight-black-swans.pdf",
        desc: "Kajian strategis mengenai fenomena Black Swan dalam operasional bisnis."
    }
];

// Each page inside the flipbook. The flipbook sets the container size.
// We render <Page> with matching width so canvas fits exactly.
const FlipPage = React.forwardRef(({ pageNumber, isCover, title, pageWidth }, ref) => {
    return (
        <div ref={ref} className="bg-white overflow-hidden">
            {isCover ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-primary border-4 border-double border-accent m-2 rounded">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4 text-accent">{title}</h2>
                    <p className="text-gray-300 font-sans tracking-widest uppercase text-sm">The Fellow</p>
                </div>
            ) : (
                <div className="w-full h-full overflow-hidden">
                    <Page
                        pageNumber={pageNumber}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={pageWidth}
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
    // Dimensions for the flipbook (in pixels)
    const [bookDims, setBookDims] = useState({ w: 400, h: 566 });

    const bookRef = useRef();

    const openDocument = (doc) => {
        setSelectedDoc(doc);
        setNumPages(null);
        setPageNumber(1);
        setIsLoading(true);
    };

    const closeDocument = () => {
        setSelectedDoc(null);
        setNumPages(null);
        setPageNumber(1);
    };

    const onDocumentLoadSuccess = async (pdf) => {
        setNumPages(pdf.numPages);
        try {
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            const ratio = viewport.height / viewport.width;

            // Calculate page width to fit the viewport nicely
            // Available height: viewport height - 200px (toolbar + controls)
            // Available width: viewport width - 80px padding
            const availH = window.innerHeight - 200;
            const availW = window.innerWidth - 80;

            // Start with available width, cap height
            let pageW = Math.min(availW, 500);
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

            {/* Book Cards Grid */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {PUBLICATIONS.map((pub) => (
                    <div
                        key={pub.id}
                        className="group bg-surface-card border border-accent/20 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col transform hover:-translate-y-2"
                        onClick={() => openDocument(pub)}
                    >
                        <div className="h-64 overflow-hidden relative">
                            <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10"></div>
                            <img src={pub.coverImg} alt={pub.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-4 z-20">
                                <BookOpen className="w-6 h-6 text-accent mb-2" />
                            </div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <h3 className="font-serif text-2xl font-bold text-primary mb-2 line-clamp-2">{pub.title}</h3>
                            <p className="text-accent text-sm font-bold uppercase tracking-wider mb-4">{pub.author}</p>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">{pub.desc}</p>
                            <button className="w-full bg-primary text-white font-sans text-sm font-semibold py-3 rounded hover:bg-primary-light transition-colors flex items-center justify-center gap-2">
                                <BookOpen className="w-4 h-4" /> Baca Sekarang
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fullscreen Flipbook Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">

                    {/* Toolbar */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 z-50">
                        <div className="flex items-center gap-4">
                            <button onClick={closeDocument} className="text-white hover:text-accent transition-colors flex items-center gap-2">
                                <X className="w-6 h-6" /> <span className="hidden sm:inline font-bold">Tutup</span>
                            </button>
                            <div className="h-6 w-px bg-white/20"></div>
                            <h3 className="text-white font-serif font-bold text-lg hidden md:block">{selectedDoc.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-white">
                            <a href={selectedDoc.fileUrl} download className="hover:text-accent transition-colors flex items-center gap-2 text-sm font-bold" onClick={(e) => e.stopPropagation()}>
                                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Unduh PDF</span>
                            </a>
                        </div>
                    </div>

                    {/* Book Container */}
                    <div className="relative flex-grow flex items-center justify-center w-full px-4 py-20 mt-8">

                        <Document
                            file={selectedDoc.fileUrl}
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
                                        <FlipPage isCover={true} title={selectedDoc.title} pageWidth={bookDims.w} />

                                        {/* Inner PDF Pages */}
                                        {Array.from(new Array(numPages), (el, index) => (
                                            <FlipPage key={`page_${index + 1}`} pageNumber={index + 1} pageWidth={bookDims.w} />
                                        ))}

                                        {/* Back Cover */}
                                        <FlipPage isCover={true} title="Selesai" pageWidth={bookDims.w} />
                                    </HTMLFlipBook>
                                </div>
                            )}
                        </Document>
                    </div>

                    {/* Footer Controls */}
                    {!isLoading && numPages && (
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 z-50">
                            <button onClick={prevButtonClick} className="text-white hover:text-accent transition-transform hover:-translate-x-1">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <span className="text-white font-bold font-serif min-w-[80px] text-center">
                                Hlm {pageNumber} / {numPages + 2}
                            </span>
                            <button onClick={nextButtonClick} className="text-white hover:text-accent transition-transform hover:translate-x-1">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
