import React, { useState } from 'react';

export default function Footer() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* CTA Section */}
            <div className="bg-surface-card border-t border-b border-accent/20 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-light/50 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto py-8 px-4 text-center relative z-10">
                    <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2 drop-shadow-md">
                        Tingkatkan Kualitas Layanan Bersama Kami
                    </h3>
                    <p className="font-sans text-gray-400 max-w-2xl mx-auto mb-6 text-sm leading-relaxed">
                        Jadilah bagian dari komunitas intelektual yang mendedikasikan diri pada inovasi, kolaborasi, dan standar emas Customer Experience.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-accent to-accent-light text-primary font-bold px-6 py-2.5 rounded-md shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all duration-300 transform hover:-translate-y-1 text-sm"
                    >
                        Join With Us
                    </button>
                </div>
            </div>

            {/* Main Footer */}
            <footer className="bg-primary py-12 px-4 text-center relative">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center mb-6">
                        <img src="/logo-white.png" alt="Logo" className="h-12 w-auto" />
                    </div>
                    <h4 className="font-serif text-2xl text-white mb-2 tracking-wide">CSM <span className="text-accent italic">Intellectual Society</span></h4>
                    <p className="font-sans text-sm text-gray-400 mb-8 max-w-md mx-auto">
                        Mendorong pertukaran pengetahuan, kolaborasi intelektual, dan peningkatan layanan pelanggan secara berkelanjutan.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-500 font-sans">
                        <span>© 2026 CSM Intellectual Society. All rights reserved.</span>
                        <span className="hidden md:inline">·</span>
                        <a href="#" className="hover:text-accent transition-colors">Kebijakan Privasi</a>
                        <span className="hidden md:inline">·</span>
                        <a href="#" className="hover:text-accent transition-colors">Syarat & Ketentuan</a>
                    </div>
                </div>
            </footer>

            {/* Modal "In Development" */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm">
                    {/* Modal Content */}
                    <div className="bg-surface-card border border-accent/30 rounded-2xl shadow-2xl p-8 max-w-sm w-full relative animate-in fade-in zoom-in duration-300">
                        {/* Close button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-accent transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="text-center mt-2">
                            <div className="w-16 h-16 bg-accent/10 border border-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                {/* Construction/Code icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 18 22 12 16 6"></polyline>
                                    <polyline points="8 6 2 12 8 18"></polyline>
                                </svg>
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-white mb-3">Feature In Development</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                Fitur pendaftaran dan membership saat ini masih dalam tahap perancangan dan pengembangan. Terima kasih atas antusiasme Anda untuk bergabung dengan CSM Intellectual Society!
                            </p>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full bg-primary hover:bg-primary-light text-gray-300 font-medium py-3 rounded-lg border border-accent/30 hover:border-accent hover:text-white transition-all duration-300"
                            >
                                Kembali
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
