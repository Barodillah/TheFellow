import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, Clock, Calendar, CheckCircle, CheckCircle2, Lock, Plus, ArrowRight, Search, AlertCircle, Trophy, History, X, Star, ChevronRight, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KanalQuiz() {
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Leaderboard state
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('csm_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!user?.id) return; // Tunggu sampai user termuat dari localStorage

        const fetchQuizzes = async () => {
            try {
                setIsLoading(true);
                // Fetch dari live API
                const response = await fetch(`https://incsmsociety.site/api/get_quizzes.php?user_id=${user.id}`);
                const result = await response.json();

                if (result.success) {
                    setQuizzes(result.data);
                } else {
                    setError(result.message || 'Gagal memuat kuis');
                }
            } catch (err) {
                console.error('Error fetching quizzes:', err);
                setError('Gagal memuat kuis dari server.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuizzes();
    }, [user?.id]);

    const fetchGlobalLeaderboard = async () => {
        setLoadingLeaderboard(true);
        try {
            const res = await fetch(`https://incsmsociety.site/api/get_global_leaderboard.php?t=${Date.now()}`);
            const data = await res.json();
            if (data.success) {
                setLeaderboardData(data.data);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const handleOpenLeaderboard = () => {
        fetchGlobalLeaderboard();
        setIsLeaderboardOpen(true);
    };

    // Data filtering
    const activeQuizzes = quizzes.filter(q => q.status === 'active');
    const historyQuizzes = quizzes.filter(q => q.status === 'expired');

    const filteredActiveQuizzes = activeQuizzes.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredHistoryQuizzes = historyQuizzes.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-primary" />
                        Kanal Quiz
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Uji pemahaman Anda melalui evaluasi berkala dan kumpulkan poin intelektual.</p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-3">
                    <button
                        onClick={handleOpenLeaderboard}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-accent-light text-primary hover:shadow-lg px-5 py-2.5 rounded-xl text-sm font-bold transition-all transform hover:-translate-y-0.5"
                    >
                        <Trophy className="w-4 h-4" />
                        Leaderboard
                    </button>
                    {user?.role === 'admin' && (
                        <Link to="/kanal-quiz/create" className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4" />
                            Buat Quiz
                        </Link>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari kuis atau materi evaluasi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {/* Active Quizzes */}
                    <div className="mb-10">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Kuis Aktif (Wajib)
                        </h2>
                        {filteredActiveQuizzes.length === 0 ? (
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">
                                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">Luar biasa! Anda telah menyelesaikan semua kuis yang tersedia.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredActiveQuizzes.map(quiz => (
                                    <div key={quiz.id} className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                                        <div>
                                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                                Berjalan
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-lg mb-2 pr-12">{quiz.title}</h3>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>

                                            <div className="flex flex-col gap-2 mb-5">
                                                <div className="text-xs text-gray-500 font-medium">
                                                    {quiz.isCompleted ? (
                                                        <>Selesai: {quiz.submitted_at ? new Date(quiz.submitted_at.replace(' ', 'T') + 'Z').toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</>
                                                    ) : (
                                                        <>Batas: {quiz.deadline ? new Date(quiz.deadline.replace(' ', 'T') + 'Z').toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</>
                                                    )}
                                                </div>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold text-xs w-max ${quiz.isCompleted ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {quiz.isCompleted ? 'Telah Dikerjakan' : `Sisa: ${formatCountdown(quiz.deadline)}`}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                            <span className={`text-xs font-semibold ${quiz.isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                                                {quiz.isCompleted ? `Skor Tertinggi: ${quiz.userScore}` : 'Belum Dikerjakan'}
                                            </span>
                                            <Link
                                                to={`/kanal-quiz/take/${quiz.id}`}
                                                className={`flex items-center gap-1 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${quiz.isCompleted ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary/90'}`}
                                            >
                                                {quiz.isCompleted ? 'Kerjakan Lagi' : 'Mulai Kerjakan'} <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* History Quizzes */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-500" />
                            Riwayat & Pembahasan
                        </h2>
                        {filteredHistoryQuizzes.length === 0 ? (
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center text-gray-500 text-sm">
                                Belum ada riwayat kuis.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {filteredHistoryQuizzes.map(quiz => (
                                    <div key={quiz.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-colors flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-700 text-sm">{quiz.title}</h3>
                                            </div>

                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-4">
                                                <Calendar className="w-3 h-3" />
                                                Ditutup pada {quiz.deadline ? new Date(quiz.deadline.replace(' ', 'T') + 'Z').toLocaleDateString('id-ID') : '-'}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-auto">
                                            {quiz.isCompleted ? (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Skor Anda</span>
                                                    <span className="text-lg font-bold text-green-600">{quiz.score ?? 0}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-red-500 uppercase tracking-wider font-semibold">Terlewat</span>
                                                    <span className="text-lg font-bold text-gray-400">0</span>
                                                </div>
                                            )}

                                            <Link
                                                to={`/kanal-quiz/take/${quiz.id}`}
                                                className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Lihat Hasil Akhir
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Leaderboard Slide Over */}
            <AnimatePresence>
                {isLeaderboardOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsLeaderboardOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Trophy className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Leaderboard CSM</h2>
                                        <p className="text-sm text-white/70">Peringkat Poin Intelektual</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsLeaderboardOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                                {loadingLeaderboard ? (
                                    <div className="flex justify-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : leaderboardData.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        Belum ada data peringkat.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {leaderboardData.map((lb, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={lb.id}
                                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden"
                                            >
                                                {idx < 3 && (
                                                    <div className={`absolute top-0 left-0 w-1 h-full ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-300' : 'bg-amber-700'
                                                        }`} />
                                                )}
                                                <div className="flex-shrink-0 w-8 text-center font-bold text-gray-400">
                                                    #{idx + 1}
                                                </div>
                                                <img
                                                    src={lb.avatar ? (lb.avatar.startsWith('http') ? lb.avatar : `https://incsmsociety.site/api/${lb.avatar}`) : 'https://incsmsociety.site/uploads/avatar/default.jpg'}
                                                    alt={lb.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-800 truncate">{lb.name}</h3>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {lb.csm_title || (lb.role ? lb.role.charAt(0).toUpperCase() + lb.role.slice(1) : 'Member')}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0 flex flex-col items-end">
                                                    <div className="flex items-center gap-1 text-accent font-bold">
                                                        <span>{lb.total_points}</span>
                                                        <Star className="w-4 h-4 fill-current" />
                                                    </div>
                                                    <span className="text-[10px] text-gray-400">Poin</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
