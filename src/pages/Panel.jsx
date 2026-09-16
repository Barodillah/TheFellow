import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Target,
    Award,
    User,
    ChevronRight,
    TrendingUp,
    CheckCircle2,
    Clock,
    Plus,
    Bell
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Panel() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [recentProjects, setRecentProjects] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [totalPoints, setTotalPoints] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [recentSubmissions, setRecentSubmissions] = useState([]);

    useEffect(() => {
        const userData = localStorage.getItem('csm_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const projects = JSON.parse(localStorage.getItem('pdca_projects_list') || '[]');
        setRecentProjects(projects.slice(0, 4));

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        
        const fetchQuizzes = async () => {
            try {
                const response = await fetch(`https://incsmsociety.site/api/get_quizzes.php?user_id=${user.id}`);
                const result = await response.json();
                
                if (result.success) {
                    // Kalkulasi poin intelektual
                    const points = result.data.reduce((sum, q) => sum + (q.isCompleted ? Number(q.userScore) : 0), 0);
                    setTotalPoints(points);

                    // Cari 1 kuis aktif (prioritaskan yang belum dikerjakan)
                    const activeQuizzes = result.data.filter(q => q.status === 'active');
                    const pendingQuiz = activeQuizzes.find(q => !q.isCompleted) || activeQuizzes[0];
                    setActiveQuiz(pendingQuiz || null);
                }
            } catch (err) {
                console.error("Gagal memuat kuis di Panel:", err);
            }

            try {
                const res = await fetch(`https://incsmsociety.site/api/get_recent_submissions.php`);
                const result = await res.json();
                if (result.success) {
                    setRecentSubmissions(result.data);
                }
            } catch (err) {
                console.error("Gagal memuat riwayat submission:", err);
            }
        };

        fetchQuizzes();
    }, [user?.id]);

    const getProgress = (proj) => {
        if (!proj.actionPlans || proj.actionPlans.length === 0) return 0;
        const done = proj.actionPlans.filter(a => a.status === 'done').length;
        return Math.round((done / proj.actionPlans.length) * 100);
    };

    const formatCountdown = (deadlineStr) => {
        if (!deadlineStr) return '-';
        const target = new Date(deadlineStr.replace(' ', 'T') + 'Z');
        const diff = target - currentTime;
        
        if (diff <= 0) return 'Tenggat Berlalu';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        
        let result = [];
        if (days > 0) result.push(`${days} Hari`);
        if (hours > 0 || days > 0) result.push(`${hours}j`);
        if (mins > 0 || hours > 0 || days > 0) result.push(`${mins}m`);
        result.push(`${secs}d`);
        
        return result.join(' ');
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary mb-1">
                        Selamat datang, {user?.name ? user.name.split(' ')[0] : 'Fellow'}!
                    </h1>
                    <p className="text-gray-500 text-sm">Lihat ringkasan aktivitas dan progres Anda di sini.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Link to="/pdca-generator" className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" />
                        <span>Buat PDCA Baru</span>
                    </Link>
                </div>
            </div>

            {/* Dashboard Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >

                {/* Profile Card */}
                <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-1 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -z-0"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-4 mb-6">
                            <img 
                                src={user?.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg'} 
                                alt={user?.name || 'User'} 
                                className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-accent"
                            />
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg capitalize">{user?.name || 'User Name'}</h3>
                                <div className="flex items-center space-x-1 text-accent bg-accent/10 px-2 py-0.5 rounded text-xs font-semibold w-fit mt-1 uppercase">
                                    <Award className="w-3 h-3" />
                                    <span>{user?.title || (user?.role === 'member' ? 'Member' : 'Fellow')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Join at</span>
                                <span className="font-medium text-gray-800">{user?.joinYear || new Date().getFullYear()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Poin Intelektual</span>
                                <span className="font-medium text-gray-800">{totalPoints} pts</span>
                            </div>
                        </div>
                    </div>
                    <Link to="/profile" className="mt-6 flex items-center justify-center space-x-2 w-full py-2 bg-gray-50 hover:bg-gray-100 text-primary text-sm font-medium rounded-xl transition-colors">
                        <span>Lihat Profil</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                {/* PDCA Summary Card */}
                <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center space-x-2">
                            <Target className="w-5 h-5 text-primary" />
                            <span>PDCA Tracker Terbaru</span>
                        </h3>
                        <Link to="/pdca" className="text-xs text-accent hover:text-accent-light font-semibold">Lihat Semua</Link>
                    </div>

                    {recentProjects.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">Belum ada proyek PDCA.</p>
                            <Link to="/pdca-generator" className="text-blue-500 hover:underline text-xs mt-2 inline-block">Buat sekarang</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentProjects.map(proj => {
                                const progress = getProgress(proj);
                                return (
                                    <div 
                                        key={proj.id} 
                                        onClick={() => navigate('/pdca', { state: { openProjectId: proj.id } })}
                                        className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 hover:border-blue-200 transition-colors cursor-pointer"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${proj.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {proj.status === 'completed' ? 'Selesai' : 'Aktif'}
                                                </span>
                                                <span className="text-xs text-gray-400">{new Date(proj.dateCreated).toLocaleDateString('id-ID')}</span>
                                            </div>
                                            <h4 className="font-semibold text-gray-800 text-sm truncate">{proj.problem}</h4>
                                        </div>
                                        <div className="w-full md:w-32 shrink-0">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500 font-medium">Progres</span>
                                                <span className="font-bold text-gray-800">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="bg-primary rounded-3xl p-6 shadow-md lg:col-span-1 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
                    <div>
                        <h3 className="font-bold flex items-center space-x-2 mb-2">
                            <Award className="w-5 h-5 text-accent" />
                            <span>Kuis Aktif (Wajib)</span>
                        </h3>
                        {activeQuiz ? (
                            <>
                                <p className="text-sm text-white mb-1 font-bold line-clamp-2">{activeQuiz.title}</p>
                                <p className="text-xs text-gray-300 mb-4 line-clamp-3">{activeQuiz.description}</p>
                                
                                <div className={`flex flex-col gap-2 mb-4 p-3 rounded-lg border ${activeQuiz.isCompleted ? 'bg-green-500/20 border-green-400/30' : 'bg-black/20 border-white/10'}`}>
                                    <div className="flex items-center gap-2 text-xs text-gray-200">
                                        <Clock className={`w-4 h-4 shrink-0 ${activeQuiz.isCompleted ? 'text-green-400' : 'text-accent'}`} />
                                        <span>
                                            {activeQuiz.isCompleted 
                                                ? `Selesai: ${activeQuiz.submitted_at ? new Date(activeQuiz.submitted_at.replace(' ', 'T') + 'Z').toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}`
                                                : `Batas: ${activeQuiz.deadline ? new Date(activeQuiz.deadline.replace(' ', 'T') + 'Z').toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}`
                                            }
                                        </span>
                                    </div>
                                    <div className={`text-xs font-bold ${activeQuiz.isCompleted ? 'text-green-400' : 'text-accent'}`}>
                                        {activeQuiz.isCompleted ? 'Telah Dikerjakan' : `Sisa: ${formatCountdown(activeQuiz.deadline)}`}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-gray-300 mb-4 line-clamp-3">Luar biasa! Tidak ada kuis wajib saat ini.</p>
                        )}
                    </div>

                    {activeQuiz ? (
                        <Link 
                            to={`/kanal-quiz/take/${activeQuiz.id}`} 
                            className={`inline-block mt-4 text-xs font-semibold px-4 py-2 rounded-lg transition-colors border text-center w-full ${activeQuiz.isCompleted ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' : 'bg-white/10 hover:bg-white/20 text-white border-white/10'}`}
                        >
                            {activeQuiz.isCompleted ? 'Kerjakan Lagi' : 'Kerjakan Sekarang'}
                        </Link>
                    ) : (
                        <Link to="/kanal-quiz" className="inline-block mt-4 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/10 text-center w-full">
                            Lihat Riwayat Kuis
                        </Link>
                    )}
                </motion.div>

                {/* Recent Submissions */}
                <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center space-x-2">
                            <Target className="w-5 h-5 text-primary" />
                            <span>Penyelesaian Kuis Terbaru</span>
                        </h3>
                        <Link to="/kanal-quiz" className="text-xs text-accent hover:text-accent-light font-semibold">Lihat Semua Kuis</Link>
                    </div>

                    {recentSubmissions.length === 0 ? (
                        <p className="text-xs text-gray-400">Belum ada aktivitas kuis terbaru.</p>
                    ) : (
                        <div className="space-y-4">
                            {recentSubmissions.slice(0, 3).map((sub, i) => {
                                const submittedTime = new Date(sub.submitted_at.replace(' ', 'T') + 'Z');
                                const now = new Date();
                                const diffHrs = Math.floor((now - submittedTime) / (1000 * 60 * 60));
                                const timeStr = diffHrs < 24 ? (diffHrs === 0 ? 'Baru saja' : `${diffHrs} jam lalu`) : `${Math.floor(diffHrs / 24)} hari lalu`;
                                
                                return (
                                    <div key={i} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                                            <img src={sub.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg'} alt={sub.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-800 truncate">{sub.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">Menyelesaikan: <span className="font-medium text-gray-700">{sub.quiz_title}</span></p>
                                        </div>
                                        <div className="flex flex-col items-end flex-shrink-0">
                                            <span className="text-xs font-bold text-green-600 mb-1">{sub.score} Pts</span>
                                            <div className="flex items-center text-[10px] text-gray-400 space-x-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{timeStr}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

            </motion.div>
        </div>
    );
}
