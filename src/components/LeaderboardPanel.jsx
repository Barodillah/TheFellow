import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Star } from 'lucide-react';

export default function LeaderboardPanel({ isOpen, onClose }) {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    useEffect(() => {
        if (isOpen) {
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
            fetchGlobalLeaderboard();
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50"
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
                                onClick={onClose}
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
                                                <div className={`absolute top-0 left-0 w-1 h-full ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-300' : 'bg-amber-700'}`} />
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
    );
}
