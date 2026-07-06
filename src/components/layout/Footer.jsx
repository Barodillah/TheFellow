import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
    const location = useLocation();

    return (
        <>
            {/* CTA Section */}
            {location.pathname !== '/login' && (
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
                        <Link
                            to="/login"
                            state={{ isLogin: false }}
                            className="inline-block bg-gradient-to-r from-accent to-accent-light text-primary font-bold px-6 py-2.5 rounded-md shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all duration-300 transform hover:-translate-y-1 text-sm"
                        >
                            Join With Us
                        </Link>
                    </div>
                </div>
            )}

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

        </>
    );
}
