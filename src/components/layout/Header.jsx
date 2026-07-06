import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, ChevronDown } from 'lucide-react';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileDropdown, setMobileDropdown] = useState(null);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const closeMenu = () => {
        setMobileMenuOpen(false);
        setMobileDropdown(null);
    };

    const toggleMobileDropdown = (name) => {
        setMobileDropdown(mobileDropdown === name ? null : name);
    };

    return (
        <header className="sticky top-0 z-40 bg-primary text-surface-warm border-b border-accent/30 shadow-lg backdrop-blur-md bg-opacity-95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 cursor-pointer">
                        <img src="/logo-white.png" alt="Logo" className="h-10 w-auto" />
                        <div>
                            <span className="font-serif font-bold text-lg tracking-wider text-white">CSM <span className="text-accent">· Intellectual Society</span></span>
                            <p className="text-[9px] font-sans tracking-widest text-accent/80 uppercase">Fellowship Platform</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-6 items-center">
                        <Link 
                            to="/" 
                            className={`text-sm font-medium hover:text-accent transition duration-200 ${isActive('/') ? 'text-accent' : 'text-gray-300'}`}
                        >
                            Beranda
                        </Link>
                        
                        {/* Fellowship Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-accent transition duration-200 py-2">
                                <span>Fellowship</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute left-0 mt-0 w-48 bg-surface-card rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-accent/20 z-50">
                                <Link 
                                    to="/fellows" 
                                    className={`block px-4 py-2 text-sm hover:bg-surface-warm transition-colors ${isActive('/fellows') ? 'text-accent font-bold' : 'text-primary'}`}
                                >
                                    Direktori Fellow
                                </Link>
                                <Link 
                                    to="/forum" 
                                    className={`block px-4 py-2 text-sm hover:bg-surface-warm transition-colors ${isActive('/forum') ? 'text-accent font-bold' : 'text-primary'}`}
                                >
                                    Forum Diskusi
                                </Link>
                            </div>
                        </div>

                        {/* News Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-accent transition duration-200 py-2">
                                <span>News</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute left-0 mt-0 w-48 bg-surface-card rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-accent/20 z-50">
                                <Link 
                                    to="/articles" 
                                    className={`block px-4 py-2 text-sm hover:bg-surface-warm transition-colors ${isActive('/articles') ? 'text-accent font-bold' : 'text-primary'}`}
                                >
                                    Artikel & Publikasi
                                </Link>
                                <Link 
                                    to="/prestasi" 
                                    className={`block px-4 py-2 text-sm hover:bg-surface-warm transition-colors ${isActive('/prestasi') ? 'text-accent font-bold' : 'text-primary'}`}
                                >
                                    Prestasi
                                </Link>
                            </div>
                        </div>

                        {/* Pilar Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-accent transition duration-200 py-2">
                                <span>Pilar</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute left-0 mt-0 w-48 bg-surface-card rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-accent/20 z-50">
                                <Link 
                                    to="/pdca" 
                                    className={`block px-4 py-2 text-sm hover:bg-surface-warm transition-colors ${isActive('/pdca') ? 'text-accent font-bold' : 'text-primary'}`}
                                >
                                    PDCA Tracker
                                </Link>
                                <Link 
                                    to="/home-standard" 
                                    className={`block px-4 py-2 text-sm hover:bg-surface-warm transition-colors ${isActive('/home-standard') ? 'text-accent font-bold' : 'text-primary'}`}
                                >
                                    Standar H.O.M.E
                                </Link>
                            </div>
                        </div>

                        <Link 
                            to="/about" 
                            className={`text-sm font-medium hover:text-accent transition duration-200 ${isActive('/about') ? 'text-accent' : 'text-gray-300'}`}
                        >
                            Tentang Kami
                        </Link>
                    </nav>

                    {/* Quick CTAs / Hamburger */}
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-accent to-accent-light text-primary hover:opacity-90 px-4 py-2 rounded font-sans text-xs font-semibold tracking-wide transition duration-300 shadow"
                        >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>LOGIN</span>
                        </Link>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-gray-300 hover:text-white"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-primary border-t border-accent/20 px-4 py-4 space-y-3">
                    <Link 
                        to="/" 
                        onClick={closeMenu}
                        className="block w-full text-left py-2 px-3 rounded hover:bg-primary-light text-gray-200 text-sm"
                    >
                        Beranda
                    </Link>

                    {/* Mobile Fellowship Dropdown */}
                    <div>
                        <button 
                            onClick={() => toggleMobileDropdown('fellowship')}
                            className="flex items-center justify-between w-full text-left py-2 px-3 rounded hover:bg-primary-light text-gray-200 text-sm"
                        >
                            <span>Fellowship</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileDropdown === 'fellowship' ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileDropdown === 'fellowship' && (
                            <div className="pl-6 py-2 space-y-2">
                                <Link 
                                    to="/fellows" 
                                    onClick={closeMenu}
                                    className="block w-full text-left py-1 text-gray-400 hover:text-accent text-sm"
                                >
                                    Direktori Fellow
                                </Link>
                                <Link 
                                    to="/forum" 
                                    onClick={closeMenu}
                                    className="block w-full text-left py-1 text-gray-400 hover:text-accent text-sm"
                                >
                                    Forum Diskusi
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile News Dropdown */}
                    <div>
                        <button 
                            onClick={() => toggleMobileDropdown('news')}
                            className="flex items-center justify-between w-full text-left py-2 px-3 rounded hover:bg-primary-light text-gray-200 text-sm"
                        >
                            <span>News</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileDropdown === 'news' ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileDropdown === 'news' && (
                            <div className="pl-6 py-2 space-y-2">
                                <Link 
                                    to="/articles" 
                                    onClick={closeMenu}
                                    className="block w-full text-left py-1 text-gray-400 hover:text-accent text-sm"
                                >
                                    Artikel & Publikasi
                                </Link>
                                <Link 
                                    to="/prestasi" 
                                    onClick={closeMenu}
                                    className="block w-full text-left py-1 text-gray-400 hover:text-accent text-sm"
                                >
                                    Prestasi
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Pilar Dropdown */}
                    <div>
                        <button 
                            onClick={() => toggleMobileDropdown('pilar')}
                            className="flex items-center justify-between w-full text-left py-2 px-3 rounded hover:bg-primary-light text-gray-200 text-sm"
                        >
                            <span>Pilar</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileDropdown === 'pilar' ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileDropdown === 'pilar' && (
                            <div className="pl-6 py-2 space-y-2">
                                <Link 
                                    to="/pdca" 
                                    onClick={closeMenu}
                                    className="block w-full text-left py-1 text-gray-400 hover:text-accent text-sm"
                                >
                                    PDCA Tracker
                                </Link>
                                <Link 
                                    to="/home-standard" 
                                    onClick={closeMenu}
                                    className="block w-full text-left py-1 text-gray-400 hover:text-accent text-sm"
                                >
                                    Standar H.O.M.E
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link 
                        to="/about" 
                        onClick={closeMenu}
                        className="block w-full text-left py-2 px-3 rounded hover:bg-primary-light text-gray-200 text-sm"
                    >
                        Tentang Kami
                    </Link>

                    <Link
                        to="/login"
                        onClick={closeMenu}
                        className="flex items-center justify-center space-x-2 w-full bg-accent text-primary py-2.5 rounded font-sans text-xs font-semibold mt-4 shadow"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>LOGIN</span>
                    </Link>
                </div>
            )}
        </header>
    );
}
