import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Shield, User, Award, Search, Edit2, Trash2 } from 'lucide-react';
import Toast from '../components/shared/Toast';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    const initialForm = { name: '', email: '', phone: '', role: 'member', title: '', join_year: new Date().getFullYear() };
    const [formData, setFormData] = useState(initialForm);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://incsmsociety.site/api/get_users.php');
            const data = await res.json();
            if (data.status === 'success') {
                setUsers(data.users);
            } else {
                showToast(data.message || 'Gagal memuat pengguna', 'error');
            }
        } catch (error) {
            showToast('Kesalahan koneksi saat memuat pengguna', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.role) {
            showToast('Nama, email, dan role wajib diisi', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const endpoint = editingId ? 'https://incsmsociety.site/api/edit_user.php' : 'https://incsmsociety.site/api/add_user.php';
            const payload = editingId ? { ...formData, id: editingId } : formData;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.status === 'success') {
                showToast(data.message, 'success');
                setShowModal(false);
                setFormData(initialForm);
                setEditingId(null);
                fetchUsers(); // Refresh data
            } else {
                showToast(data.message || 'Gagal menyimpan pengguna', 'error');
            }
        } catch (error) {
            showToast('Kesalahan koneksi', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            title: user.title || '',
            join_year: user.join_year || new Date().getFullYear()
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus pengguna ini?')) return;

        try {
            const res = await fetch('https://incsmsociety.site/api/delete_user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.status === 'success') {
                showToast(data.message, 'success');
                fetchUsers();
            } else {
                showToast(data.message || 'Gagal menghapus pengguna', 'error');
            }
        } catch (error) {
            showToast('Kesalahan koneksi saat menghapus', 'error');
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData(initialForm);
        setShowModal(true);
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary mb-1">Manajemen Users</h1>
                    <p className="text-gray-500 text-sm">Kelola akses, fellow, dan member pada sistem ini.</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah User</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Kontak</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Registrasi No.</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400">Memuat data pengguna...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400">Belum ada pengguna terdaftar</td>
                                </tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <img 
                                                    src={u.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg'} 
                                                    alt={u.name} 
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm flex-shrink-0"
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-800">{u.name}</div>
                                                    {u.title && <div className="text-xs text-gray-500">{u.title}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-700">{u.email}</div>
                                            <div className="text-xs text-gray-400">{u.phone || '-'}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
                                                u.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                u.role === 'fellow' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-semibold text-gray-700">
                                                {u.registration_number || <span className="text-gray-400 font-normal">Pending</span>}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                                                u.has_password ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                                            }`}>
                                                {u.has_password ? 'Aktif' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus">
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

            {/* Modal Tambah User */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => !submitting && setShowModal(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 font-serif">{editingId ? 'Edit User' : 'Tambah User Baru'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                                    <input 
                                        type="text" name="name" value={formData.name} onChange={handleInputChange} required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input 
                                        type="email" name="email" value={formData.email} onChange={handleInputChange} required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                                    <input 
                                        type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                        placeholder="08123456789"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                        <select 
                                            name="role" value={formData.role} onChange={handleInputChange} required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none bg-white"
                                        >
                                            <option value="member">Member</option>
                                            <option value="fellow">Fellow</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gelar / Title</label>
                                        <input 
                                            type="text" name="title" value={formData.title} onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                            placeholder="e.g. Senior Fellow"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Bergabung</label>
                                    <input 
                                        type="number" name="join_year" value={formData.join_year} onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                        placeholder="Misal: 2024" min="2000" max="2100"
                                    />
                                </div>
                                {!editingId && (
                                    <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex items-start gap-2 mt-2">
                                        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <p>Nomor registrasi akan dibuat otomatis berdasarkan Role. Password pengguna ini akan diset kosong (pending) hingga pengguna melakukan aktivasi mandiri.</p>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                    <button 
                                        type="button" onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" disabled={submitting}
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-70 flex items-center justify-center min-w-[100px]"
                                    >
                                        {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
        </div>
    );
}
