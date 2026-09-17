import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Power } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManageEvents() {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, title: '', event_date: '', description: '', is_active: true });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`https://incsmsociety.site/api/get_events.php?t=${Date.now()}`);
            const data = await res.json();
            if (data.status === 'success') {
                setEvents(data.data);
            }
        } catch (err) {
            console.error("Gagal memuat events", err);
        }
    };

    const openModal = (event = null) => {
        if (event) {
            setFormData(event);
        } else {
            setFormData({ id: null, title: '', event_date: '', description: '', is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const endpoint = formData.id ? 'edit_event.php' : 'add_event.php';
        
        try {
            const res = await fetch(`https://incsmsociety.site/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.status === 'success') {
                fetchEvents();
                setIsModalOpen(false);
                showToast(formData.id ? 'Event berhasil diperbarui' : 'Event berhasil ditambahkan');
            } else {
                showToast(data.message || 'Gagal menyimpan event', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan jaringan', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteConfirm(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            const res = await fetch(`https://incsmsociety.site/api/delete_event.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deleteConfirm })
            });
            const data = await res.json();
            if (data.status === 'success') {
                fetchEvents();
                showToast('Event berhasil dihapus');
            } else {
                showToast(data.message || 'Gagal menghapus event', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setDeleteConfirm(null);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const res = await fetch(`https://incsmsociety.site/api/toggle_event.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_active: !currentStatus })
            });
            const data = await res.json();
            if (data.status === 'success') {
                fetchEvents();
                showToast('Status event diperbarui');
            } else {
                showToast(data.message || 'Gagal mengubah status', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan jaringan', 'error');
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12 p-4 lg:p-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 mt-6 lg:mt-0">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary mb-1">
                        Manage Events
                    </h1>
                    <p className="text-gray-500 text-sm">Kelola event yang tampil di halaman utama.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Event</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">Judul Event</th>
                                <th className="p-4 font-semibold">Tanggal</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">Belum ada event.</td>
                                </tr>
                            ) : (
                                events.map((ev) => (
                                    <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-primary whitespace-pre-line">{ev.title}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1 mt-1">{ev.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                {ev.event_date}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => toggleActive(ev.id, ev.is_active)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${ev.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                <Power className="w-3 h-3" />
                                                {ev.is_active ? 'Aktif' : 'Non-aktif'}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openModal(ev)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteClick(ev.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-primary">
                                {formData.id ? 'Edit Event' : 'Tambah Event'}
                            </h2>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Event (Bisa multi-baris)</label>
                                <textarea 
                                    required 
                                    rows="2"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Event (Contoh: Sept 9, 2026)</label>
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    value={formData.event_date} 
                                    onChange={e => setFormData({...formData, event_date: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                                <textarea 
                                    required
                                    rows="3" 
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                ></textarea>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="is_active" 
                                    checked={formData.is_active} 
                                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer">Set sebagai aktif (ditampilkan di Home)</label>
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                    Batal
                                </button>
                                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-lg shadow-primary/20">
                                    Simpan Event
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center"
                    >
                        <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Hapus Event?</h2>
                        <p className="text-gray-500 text-sm mb-6">Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                                Batal
                            </button>
                            <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/20">
                                Ya, Hapus
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Toast Alert */}
            {toast.show && (
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className={`fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-xl shadow-lg text-white font-medium text-sm flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
                >
                    {toast.message}
                </motion.div>
            )}
        </div>
    );
}
