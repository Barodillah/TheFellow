import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Target,
    Award,
    Trophy,
    User,
    Settings,
    LogOut,
    Menu,
    Search,
    Bell,
    X,
    BookOpen,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    Calendar,
    FileText
} from 'lucide-react';
import LeaderboardPanel from '../LeaderboardPanel';

export default function PanelLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [openDropdowns, setOpenDropdowns] = useState({});
    const [showNotif, setShowNotif] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const notifRef = useRef(null);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotif(false);
            }
        };

        if (showNotif) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotif]);

    const toggleDropdown = (label) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    useEffect(() => {
        const userData = localStorage.getItem('csm_user');
        if (!userData) {
            navigate('/login');
        } else {
            setUser(JSON.parse(userData));
        }
    }, [navigate]);

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

    // Close sidebar on mobile when route changes
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [location.pathname]);

    const sidebarLinks = [
        { icon: LayoutDashboard, label: 'Overview', path: '/panel' },
        {
            icon: Target,
            label: 'Tools CSM',
            submenu: [
                { label: 'PDCA Generator', path: '/pdca-generator' },
                { label: 'PDCA Tracker', path: '/pdca-tracker' },
                { label: 'Activity Report', path: 'https://labsen.bewhy.id' },
                { label: 'Calculator Target', path: '/calculator-target' },
                { label: 'AI Roleplay', path: 'https://wai.bewhy.id' },
                { label: 'One Link Quesioner', path: '/one-link-quesioner' },
                { label: 'CSM Labs', path: '/smart-library' },
                { label: 'Whatsapp Blast', path: '/whatsapp-blast' },
            ]
        },
        {
            icon: Award,
            label: 'Pilar',
            submenu: [
                { label: 'Standar H.O.M.E', path: '/home-standard' },
                { label: 'Metodologi PDCA', path: '/pdca-metodologi' }
            ]
        },
        { icon: MessageSquare, label: 'Forum Diskusi', path: '/forum' },
        { icon: HelpCircle, label: 'Kanal Quiz', path: '/kanal-quiz' },
        { icon: Users, label: 'Direktori Fellow', path: '/directory' },
        { divider: true },
        { icon: FileText, label: 'Artikel Saya', path: '/my-articles' },
        { icon: User, label: 'Profil Saya', path: '/profile' },
        { icon: Trophy, label: 'Achievements', path: '/achievements' },
        { icon: BookOpen, label: 'Publikasi', path: '/manage-publikasi' },
        ...(user?.role === 'admin' ? [
            { divider: true },
            { icon: Users, label: 'Users', path: '/users' },
            { icon: Calendar, label: 'Manage Events', path: '/manage-events' }
        ] : [])
    ];

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('csm_user');
        navigate('/');
    };

    if (!user) return null; // Render nothing until user is validated

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

                            if (link.submenu) {
                                const isOpen = openDropdowns[link.label];
                                const isActive = link.submenu.some(sub => location.pathname === sub.path || location.pathname.startsWith(sub.path + '/'));

                                return (
                                    <div key={index} className="space-y-1">
                                        <button
                                            onClick={() => {
                                                if (!sidebarOpen) setSidebarOpen(true);
                                                toggleDropdown(link.label);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                                                ${isActive
                                                    ? 'bg-accent/10 text-accent font-semibold shadow-sm'
                                                    : 'text-gray-500 hover:bg-surface-warm hover:text-primary'}`}
                                        >
                                            <div className="flex items-center">
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-gray-400 group-hover:text-primary'} ${!sidebarOpen && 'mx-auto'}`} />
                                                {sidebarOpen && (
                                                    <span className="ml-3 text-sm truncate">{link.label}</span>
                                                )}
                                            </div>
                                            {sidebarOpen && (
                                                isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary" /> : <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                                            )}
                                        </button>

                                        {isOpen && sidebarOpen && (
                                            <div className="pl-10 pr-3 py-1 space-y-1">
                                                {link.submenu.map((sub, subIndex) => {
                                                    const isExternal = sub.path.startsWith('http');
                                                    if (isExternal) {
                                                        return (
                                                            <a
                                                                key={subIndex}
                                                                href={sub.path}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm text-gray-500 hover:text-primary hover:bg-surface-warm`}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full mr-2.5 bg-gray-400`} />
                                                                {sub.label}
                                                            </a>
                                                        );
                                                    }
                                                    const isSubActive = location.pathname === sub.path;
                                                    return (
                                                        <Link
                                                            key={subIndex}
                                                            to={sub.path}
                                                            className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm
                                                                ${isSubActive
                                                                    ? 'text-accent bg-accent/5 font-medium'
                                                                    : 'text-gray-500 hover:text-primary hover:bg-surface-warm'}`}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full mr-2.5 ${isSubActive ? 'bg-accent' : 'bg-gray-400'}`} />
                                                            {sub.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

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
                    <button onClick={handleLogout} className="flex items-center w-full px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors group">
                        <LogOut className={`w-5 h-5 ${!sidebarOpen && 'mx-auto'}`} />
                        {sidebarOpen && <span className="ml-3 text-sm font-medium">Keluar</span>}
                    </button>
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
                        <button 
                            onClick={() => setIsLeaderboardOpen(true)}
                            className="p-2 text-gray-400 hover:text-accent transition-colors rounded-full hover:bg-gray-50"
                            title="Leaderboard CSM"
                        >
                            <Trophy className="w-5 h-5" />
                        </button>
                        
                        <div className="relative" ref={notifRef}>
                            <button 
                                onClick={() => setShowNotif(!showNotif)}
                                className="p-2 text-gray-400 hover:text-primary transition-colors relative rounded-full hover:bg-gray-50"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                            </button>
                            
                            {/* Notification Dropdown */}
                            {showNotif && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h3 className="font-bold text-primary">Notifikasi</h3>
                                        <span className="text-xs text-accent font-semibold cursor-pointer">Tandai sudah dibaca</span>
                                    </div>
                                    <div className="max-h-[320px] overflow-y-auto">
                                        {/* Mock Notif 1 */}
                                        <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-700 leading-tight mb-1"><span className="font-bold text-primary">Sirojudin Hasan</span> membalas diskusi Anda di "Strategi Menghadapi Pelanggan".</p>
                                                <span className="text-xs text-gray-400">10 menit yang lalu</span>
                                            </div>
                                        </div>
                                        {/* Mock Notif 2 */}
                                        <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 opacity-60">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                <Target className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-700 leading-tight mb-1">PDCA Tracker: Proyek "Reduksi Antrean" mencapai fase CHECK.</p>
                                                <span className="text-xs text-gray-400">2 jam yang lalu</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 text-center border-t border-gray-100 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                                        <span className="text-sm font-semibold text-primary">Lihat Semua Notifikasi</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                        <div
                            onClick={() => navigate('/profile')}
                            className="flex items-center space-x-3 cursor-pointer p-1 pr-2 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                        >
                            <img
                                src={user?.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg'}
                                alt={user?.name || 'User'}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
                            />
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-gray-700 leading-tight">{user?.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase">{user?.role || 'Member'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Panel Main Content Area */}
                <main className="flex-1 overflow-y-auto relative">
                    {/* Background decor */}
                    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10"></div>

                    <div className="p-4 sm:p-6 lg:p-8">
                        <Outlet context={{ user }} />
                    </div>
                </main>

                {/* Panel Footer */}
                <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-500 flex-shrink-0">
                    <p>&copy; {new Date().getFullYear()} CSM Intellectual Society. All rights reserved.</p>
                </footer>
            </div>

            <LeaderboardPanel isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
        </div>
    );
}
