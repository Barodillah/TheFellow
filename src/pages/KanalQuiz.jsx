import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, Clock, Calendar, CheckCircle, CheckCircle2, Lock, Plus, ArrowRight, Search, AlertCircle, Trophy, History, X, Star, ChevronRight, PlayCircle, MoreVertical, Edit, Trash2, PowerOff } from 'lucide-react';
import { motion } from 'framer-motion';
import LeaderboardPanel from '../components/LeaderboardPanel';
import ConfirmModal from '../components/shared/ConfirmModal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function KanalQuiz() {
  useDocumentTitle('Kanal Kuis');
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Leaderboard state
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

    // Admin Action states
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [deletingQuiz, setDeletingQuiz] = useState(null);
    const [statusConfirm, setStatusConfirm] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && !event.target.closest('.dropdown-container')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    const handleChangeStatus = (quizId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'expired' : 'active';
        setStatusConfirm({ quizId, newStatus });
    };

    const confirmChangeStatus = async () => {
        if (!statusConfirm) return;
        const { quizId, newStatus } = statusConfirm;
        try {
            setIsActionLoading(true);
            const response = await fetch('https://incsmsociety.site/api/edit_quiz.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: quizId, status: newStatus })
            });
            const result = await response.json();
            if (result.success) {
                setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, status: newStatus } : q));
                setActiveDropdown(null);
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Gagal mengubah status kuis.');
        } finally {
            setIsActionLoading(false);
            setStatusConfirm(null);
        }
    };

    const handleDeleteQuiz = async () => {
        if (!deletingQuiz) return;
        try {
            setIsActionLoading(true);
            const response = await fetch('https://incsmsociety.site/api/delete_quiz.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deletingQuiz.id })
            });
            const result = await response.json();
            if (result.success) {
                setQuizzes(quizzes.filter(q => q.id !== deletingQuiz.id));
                setDeletingQuiz(null);
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Gagal menghapus kuis.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUpdateQuiz = async (e) => {
        e.preventDefault();
        if (!editingQuiz) return;
        try {
            setIsActionLoading(true);
            const response = await fetch('https://incsmsociety.site/api/edit_quiz.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: editingQuiz.id,
                    title: editingQuiz.title,
                    description: editingQuiz.description,
                    deadline: editingQuiz.deadline
                })
            });
            const result = await response.json();
            if (result.success) {
                setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? { ...q, title: editingQuiz.title, description: editingQuiz.description, deadline: editingQuiz.deadline } : q));
                setEditingQuiz(null);
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Gagal memperbarui kuis.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleOpenLeaderboard = () => {
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
                                            <div className="flex justify-between items-start mt-2">
                                                <h3 className="font-bold text-gray-800 text-lg mb-2 pr-2">{quiz.title}</h3>
                                                {user?.role === 'admin' && (
                                                    <div className="relative z-20 dropdown-container">
                                                        <button onClick={() => setActiveDropdown(activeDropdown === quiz.id ? null : quiz.id)} className="p-1 hover:bg-gray-100 rounded-full mt-1">
                                                            <MoreVertical className="w-5 h-5 text-gray-500" />
                                                        </button>
                                                        {activeDropdown === quiz.id && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-30">
                                                                <button onClick={() => {setEditingQuiz(quiz); setActiveDropdown(null);}} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Edit className="w-4 h-4"/> Edit Detail</button>
                                                                <button onClick={() => handleChangeStatus(quiz.id, quiz.status)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><PowerOff className="w-4 h-4"/> Tutup Kuis</button>
                                                                <button onClick={() => {setDeletingQuiz(quiz); setActiveDropdown(null);}} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4"/> Hapus Kuis</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
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
                                                <h3 className="font-semibold text-gray-700 text-sm pr-2">{quiz.title}</h3>
                                                {user?.role === 'admin' && (
                                                    <div className="relative z-20 dropdown-container">
                                                        <button onClick={() => setActiveDropdown(activeDropdown === quiz.id ? null : quiz.id)} className="p-1 hover:bg-gray-200 rounded-full">
                                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                        {activeDropdown === quiz.id && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-30">
                                                                <button onClick={() => {setEditingQuiz(quiz); setActiveDropdown(null);}} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Edit className="w-4 h-4"/> Edit Detail</button>
                                                                <button onClick={() => handleChangeStatus(quiz.id, quiz.status)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><PowerOff className="w-4 h-4"/> Buka Kuis</button>
                                                                <button onClick={() => {setDeletingQuiz(quiz); setActiveDropdown(null);}} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4"/> Hapus Kuis</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
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
                                                    <span className="text-lg font-bold text-green-600">{quiz.userScore ?? 0}</span>
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

            <LeaderboardPanel isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />

            {/* Modals */}
            {editingQuiz && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setEditingQuiz(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Edit Detail Kuis</h2>
                        <form onSubmit={handleUpdateQuiz} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Kuis</label>
                                <input required type="text" value={editingQuiz.title} onChange={(e) => setEditingQuiz({...editingQuiz, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
                                <textarea value={editingQuiz.description} onChange={(e) => setEditingQuiz({...editingQuiz, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm h-24" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline Kuis</label>
                                <input required type="datetime-local" value={editingQuiz.deadline} onChange={(e) => setEditingQuiz({...editingQuiz, deadline: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setEditingQuiz(null)} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Batal</button>
                                <button type="submit" disabled={isActionLoading} className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl shadow flex items-center gap-2">
                                    {isActionLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>} Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingQuiz && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Hapus Kuis?</h2>
                        <p className="text-sm text-gray-500 mb-6">Anda yakin ingin menghapus kuis <strong>"{deletingQuiz.title}"</strong> secara permanen? Semua riwayat dan nilai partisipan juga akan terhapus.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingQuiz(null)} className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Batal</button>
                            <button onClick={handleDeleteQuiz} disabled={isActionLoading} className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition flex items-center justify-center gap-2">
                                {isActionLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>} Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!statusConfirm}
                title="Ubah Status Kuis?"
                message={`Yakin ingin mengubah status kuis ini menjadi "${statusConfirm?.newStatus}"?`}
                confirmText="Ya, Ubah Status"
                variant={statusConfirm?.newStatus === 'expired' ? 'warning' : 'primary'}
                isLoading={isActionLoading}
                onConfirm={confirmChangeStatus}
                onCancel={() => setStatusConfirm(null)}
            />
        </div>
    );
}
