import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Trash2, Calendar, Award, Loader2, Edit2, Medal } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';

export default function PanelAchievements() {
    const { user } = useOutletContext();
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    const [formData, setFormData] = useState({
        year: new Date().getFullYear().toString(),
        titleType: '1st Winner / Gold',
        title: '1st Winner / Gold',
        competition: '',
        description: ''
    });

    useEffect(() => {
        fetchAchievements();
    }, [user.id]);

    const fetchAchievements = async () => {
        try {
            const res = await fetch(`https://incsmsociety.site/api/get_achievements.php?user_id=${user.id}`);
            const data = await res.json();
            if (data.status === 'success') {
                setAchievements(data.achievements);
            }
        } catch (err) {
            setError('Gagal memuat prestasi.');
        } finally {
            setLoading(false);
        }
    };

    const openModalForAdd = () => {
        setEditingId(null);
        setFormData({
            year: new Date().getFullYear().toString(),
            titleType: '1st Winner / Gold',
            title: '1st Winner / Gold',
            competition: '',
            description: ''
        });
        setShowModal(true);
    };

    const openModalForEdit = (item) => {
        setEditingId(item.id);
        const isStandard = ['1st Winner / Gold', '2nd Winner / Silver', '3rd Winner / Bronze'].includes(item.title);
        setFormData({
            year: item.year,
            titleType: isStandard ? item.title : 'Other',
            title: item.title,
            competition: item.competition || '',
            description: item.description || ''
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                user_id: user.id,
                ...(editingId && { id: editingId }),
                ...formData
            };
            const endpoint = editingId 
                ? 'https://incsmsociety.site/api/edit_achievement.php'
                : 'https://incsmsociety.site/api/add_achievement.php';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.status === 'success') {
                setShowModal(false);
                setFormData({
                    year: new Date().getFullYear().toString(),
                    titleType: '1st Winner / Gold',
                    title: '1st Winner / Gold',
                    competition: '',
                    description: ''
                });
                setEditingId(null);
                fetchAchievements();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus prestasi ini?')) return;
        setLoading(true);
        try {
            const res = await fetch('https://incsmsociety.site/api/delete_achievement.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, user_id: user.id })
            });
            const data = await res.json();
            if (data.status === 'success') {
                fetchAchievements();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Terjadi kesalahan saat menghapus.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTitleTypeChange = (e) => {
        const val = e.target.value;
        setFormData({ 
            ...formData, 
            titleType: val, 
            title: val === 'Other' ? '' : val 
        });
    };

    const getMedalColor = (title) => {
        if (title.includes('1st Winner') || title.includes('Gold')) return 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]';
        if (title.includes('2nd Winner') || title.includes('Silver')) return 'text-gray-400 drop-shadow-[0_0_8px_rgba(156,163,175,0.5)]';
        if (title.includes('3rd Winner') || title.includes('Bronze')) return 'text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]';
        return 'text-accent';
    };

    const isMedalWinner = (title) => {
        return title.includes('1st Winner') || title.includes('Gold') || 
               title.includes('2nd Winner') || title.includes('Silver') || 
               title.includes('3rd Winner') || title.includes('Bronze');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -z-0"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-accent" />
                        Manajemen Prestasi
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Kelola rekam jejak dan pencapaian Anda yang akan ditampilkan di Hall of Fame.
                    </p>
                </div>
                <button
                    onClick={openModalForAdd}
                    className="relative z-10 flex items-center space-x-2 bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Prestasi</span>
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            {loading && achievements.length === 0 ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : achievements.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-gray-700 mb-2">Belum Ada Prestasi</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Anda belum menambahkan rekam jejak atau pencapaian apa pun. Tambahkan sekarang untuk menampilkannya di Hall of Fame.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {achievements.map((item) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-shadow"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="flex items-center gap-1 bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-xs">
                                            <Calendar className="w-3 h-3" />
                                            {item.year}
                                        </span>
                                        {item.competition && (
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 uppercase tracking-wide">
                                                {item.competition}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => openModalForEdit(item)}
                                            className="text-gray-400 hover:text-accent transition-colors p-1"
                                            title="Edit Prestasi"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Hapus Prestasi"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className={`font-serif text-xl font-bold mb-2 leading-tight flex items-center gap-2 group-hover:text-primary transition-colors ${isMedalWinner(item.title) ? getMedalColor(item.title) : 'text-gray-800'}`}>
                                    {isMedalWinner(item.title) && <Medal className={`w-5 h-5 ${getMedalColor(item.title)}`} />}
                                    {item.title}
                                </h3>
                                {item.description && (
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal Tambah Prestasi */}
            {createPortal(
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-serif font-bold text-lg text-gray-800">
                                    {editingId ? 'Edit Prestasi' : 'Tambah Prestasi Baru'}
                                </h3>
                                <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                                    <div className="sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun</label>
                                        <input 
                                            type="text" 
                                            name="year" 
                                            required 
                                            value={formData.year}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent text-base bg-gray-50/50 focus:bg-white transition-all outline-none"
                                            placeholder="Mis: 2026"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori / Kompetisi</label>
                                        <input 
                                            type="text" 
                                            name="competition" 
                                            value={formData.competition}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent text-base bg-gray-50/50 focus:bg-white transition-all outline-none"
                                            placeholder="Mis: CSMA 2026, Internal Award"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul Pencapaian (Wajib)</label>
                                    <select 
                                        name="titleType" 
                                        value={formData.titleType}
                                        onChange={handleTitleTypeChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent font-serif text-lg bg-gray-50/50 focus:bg-white transition-all outline-none mb-3 cursor-pointer appearance-none"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                                    >
                                        <option value="1st Winner / Gold">🥇 1st Winner / Gold</option>
                                        <option value="2nd Winner / Silver">🥈 2nd Winner / Silver</option>
                                        <option value="3rd Winner / Bronze">🥉 3rd Winner / Bronze</option>
                                        <option value="Other">Custom Pencapaian Lainnya...</option>
                                    </select>

                                    {formData.titleType === 'Other' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                            <input 
                                                type="text" 
                                                name="title" 
                                                required 
                                                value={formData.title}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent font-serif text-lg bg-gray-50/50 focus:bg-white transition-all outline-none"
                                                placeholder="Mis: Best Manager 2026"
                                            />
                                        </motion.div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Singkat (Opsional)</label>
                                    <textarea 
                                        name="description" 
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent text-base bg-gray-50/50 focus:bg-white transition-all outline-none resize-none"
                                        placeholder="Ceritakan sedikit mengenai pencapaian ini..."
                                    ></textarea>
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="bg-primary hover:bg-primary-light text-white px-7 py-2.5 rounded-xl font-medium shadow-md transition-all disabled:opacity-50 flex items-center"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            , document.body)}
        </div>
    );
}
