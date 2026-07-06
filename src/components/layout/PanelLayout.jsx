import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Target,
    Award,
    User,
    Settings,
    LogOut,
    Menu,
    Search,
    Bell,
    X
} from 'lucide-react';

export default function PanelLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sidebarLinks = [
        { icon: LayoutDashboard, label: 'Overview', path: '/panel' },
        { icon: Target, label: 'PDCA Tracker', path: '/pdca' },
        { icon: MessageSquare, label: 'Forum Diskusi', path: '/forum' },
        { icon: Users, label: 'Direktori Fellow', path: '/fellows' },
        { icon: Award, label: 'Standar H.O.M.E', path: '/home-standard' },
        { divider: true },
        { icon: User, label: 'Profil Saya', path: '/profile' },
        { icon: Settings, label: 'Pengaturan', path: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-surface-warm overflow-hidden text-slate-800 font-sans antialiased">
            
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-card border-r border-accent/20 transition-all duration-300 transform 
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:static lg:translate-x-0 lg:flex 
                ${sidebarOpen ? 'w-64' : 'lg:w-20'}`}
            >
                <div className="flex items-center justify-between p-4 h-16 border-b border-accent/10">
                    {sidebarOpen ? (
                        <div className="flex items-center justify-between w-full">
                            <Link to="/" className="flex items-center space-x-2">
                                <img src="/logo-dark.png" alt="Logo" className="h-8 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                <span className="font-serif font-bold text-primary truncate">CSM Fellowship</span>
                            </Link>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-primary">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <Link to="/" className="mx-auto block">
                            <img src="/logo-dark.png" alt="Logo" className="h-8 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                        </Link>
                    )}
                </div>

                <div className="flex-1 py-6 overflow-y-auto">
                    <nav className="space-y-1 px-3">
                        {sidebarLinks.map((link, index) => {
                            if (link.divider) {
                                return <div key={index} className="h-px bg-accent/10 my-4 mx-3" />;
                            }

                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={index}
                                    to={link.path}
                                    className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                                        ${isActive
                                            ? 'bg-accent/10 text-accent font-semibold shadow-sm'
                                            : 'text-gray-500 hover:bg-surface-warm hover:text-primary'}`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-gray-400 group-hover:text-primary'} ${!sidebarOpen && 'mx-auto'}`} />
                                    {sidebarOpen && (
                                        <span className="ml-3 text-sm truncate">{link.label}</span>
                                    )}
                                    {isActive && sidebarOpen && (
                                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent" />
                                    )}
                                    {isActive && !sidebarOpen && (
                                        <div className="absolute top-1/2 -translate-y-1/2 right-1 w-1 h-4 rounded-full bg-accent" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-accent/10">
                    <Link to="/" className="flex items-center w-full px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors group">
                        <LogOut className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
                        {sidebarOpen && <span className="ml-3 text-sm font-medium">Keluar</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Panel Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 shadow-sm z-10 flex-shrink-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 -ml-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors hidden lg:block"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="relative hidden md:block w-64 ml-4">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm focus:ring-1 focus:ring-accent focus:border-accent bg-gray-50 focus:bg-white transition-all outline-none"
                                placeholder="Cari di dashboard..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 lg:space-x-4">
                        <button className="p-2 text-gray-400 hover:text-primary transition-colors relative rounded-full hover:bg-gray-50">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>

                        <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                        <div className="flex items-center space-x-3 cursor-pointer p-1 pr-2 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold font-serif shadow-sm">
                                BS
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-gray-700 leading-tight">Budi Santoso</p>
                                <p className="text-[10px] text-gray-500">Active Fellow</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Panel Main Content Area */}
                <main className="flex-1 overflow-y-auto relative">
                    {/* Background decor */}
                    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10"></div>

                    <div className="p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>

                {/* Panel Footer */}
                <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-500 flex-shrink-0">
                    <p>&copy; {new Date().getFullYear()} CSM Intellectual Society. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
