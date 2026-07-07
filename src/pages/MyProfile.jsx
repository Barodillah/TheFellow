import React, { useState, useEffect, useRef } from 'react';
import { Award, Activity, BookOpen, MessageSquare, Edit3, Save, X, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/shared/Toast';

export default function MyProfile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    const [formData, setFormData] = useState({
        name: '',
        title: '',
        csmTitle: '',
        bio: '',
        quote: '',
        specializations: '',
    });

    useEffect(() => {
        const userData = localStorage.getItem('csm_user');
        if (!userData) {
            navigate('/');
        } else {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            resetForm(parsed);
        }
    }, [navigate]);

    const resetForm = (userData) => {
        setFormData({
            name: userData.name || '',
            title: userData.title || '',
            csmTitle: userData.csmTitle || '',
            bio: userData.bio || '',
            quote: userData.quote || '',
            specializations: Array.isArray(userData.specializations) ? userData.specializations.join(', ') : '',
        });
    };

    if (!user) return <div className="p-8 text-center text-gray-500">Memuat profil...</div>;

    // Stats and fixed data that aren't editable in this simple form
    const fixedData = {
        avatar: user.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg',
        badges: Array.isArray(user.badges) ? user.badges : [],
        joinYear: user.joinYear || new Date().getFullYear(),
        stats: user.stats || { articles: 0, threads: 0, pdcaCases: 0 },
        achievements: user.achievements || []
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://incsmsociety.site/api/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    ...formData
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                localStorage.setItem('csm_user', JSON.stringify(data.user));
                setUser(data.user);
                setIsEditing(false);
                showToast('Profil berhasil diperbarui!', 'success');
            } else {
                showToast(data.message || 'Gagal memperbarui profil.', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        resetForm(user);
        setIsEditing(false);
    };

    const handleAvatarClick = () => {
        if (isEditing && fileInputRef.current && !uploadingAvatar) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran file maksimal 2MB.', 'error');
            e.target.value = null;
            return;
        }

        setUploadingAvatar(true);
        const uploadData = new FormData();
        uploadData.append('id', user.id);
        uploadData.append('avatar', file);

        try {
            const response = await fetch('https://incsmsociety.site/api/upload_avatar.php', {
                method: 'POST',
                body: uploadData // fetch otomatis menyetel multipart/form-data
            });

            const data = await response.json();
            if (data.status === 'success') {
                const updatedUser = { ...user, avatar: data.avatar };
                localStorage.setItem('csm_user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                showToast('Avatar berhasil diperbarui!', 'success');
            } else {
                showToast(data.message || 'Gagal mengunggah avatar.', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi server.', 'error');
        } finally {
            setUploadingAvatar(false);
            e.target.value = null; // Reset nilai input
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">Profil Saya</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola informasi publik dan biografi intelektual Anda.</p>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Profil</span>
                    </button>
                )}
            </div>

            <div className="bg-surface-card rounded-xl border-2 border-accent/30 shadow-xl overflow-hidden">
                <div className="bg-primary p-8 sm:p-12 text-surface-warm relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Award className="w-40 h-40 text-accent" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg, image/webp" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleAvatarChange} 
                        />
                        <div className="relative group" onClick={handleAvatarClick}>
                            <img 
                                src={fixedData.avatar} 
                                alt={formData.name} 
                                className={`w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-accent shadow-lg ${uploadingAvatar ? 'opacity-50' : ''}`}
                            />
                            
                            {uploadingAvatar && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}

                            {isEditing && !uploadingAvatar && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="text-center sm:text-left w-full max-w-lg">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={formData.title} 
                                        readOnly
                                        className="w-full bg-transparent border-none rounded px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-accent/70 cursor-not-allowed focus:outline-none"
                                        placeholder="Gelar / Jabatan (e.g., SENIOR FELLOW)"
                                        title="Jabatan hanya bisa diubah oleh Admin"
                                    />
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-2xl sm:text-3xl font-serif font-bold text-white focus:outline-none focus:border-accent"
                                        placeholder="Nama Lengkap"
                                    />
                                    <input 
                                        type="text" 
                                        name="csmTitle" 
                                        value={formData.csmTitle} 
                                        onChange={handleChange} 
                                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-accent-light focus:outline-none focus:border-accent"
                                        placeholder="Spesialisasi CSM (e.g., Ahli Kinerja Pelayanan)"
                                    />
                                </div>
                            ) : (
                                <>
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-accent px-3 py-1 rounded inline-block mb-3">{formData.title}</span>
                                    <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-2">{formData.name}</h1>
                                    <p className="text-accent-light font-semibold mb-4">{formData.csmTitle}</p>
                                </>
                            )}
                            
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6 mt-4">
                                {fixedData.badges.map((badge, idx) => (
                                    <span key={idx} className="bg-primary-light border border-accent/40 text-xs px-2.5 py-1 rounded-full text-gray-300">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                            
                            <p className="font-sans text-sm text-gray-400 italic">Bergabung sejak {fixedData.joinYear}</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-8 sm:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-8">
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-primary mb-4">Biografi Intelektual</h3>
                                {isEditing ? (
                                    <textarea 
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full border border-gray-300 rounded-lg p-4 text-sm sm:text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-y"
                                        placeholder="Tuliskan biografi Anda di sini..."
                                    />
                                ) : (
                                    <p className="font-sans text-slate-600 leading-relaxed text-sm sm:text-base mb-6">
                                        {formData.bio}
                                    </p>
                                )}
                            </div>
                            
                            <div className="bg-primary-light/10 border-l-4 border-accent p-6 rounded-r-lg relative">
                                {isEditing ? (
                                    <textarea 
                                        name="quote"
                                        value={formData.quote}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full bg-transparent border-b border-accent/30 p-2 font-serif text-lg text-primary italic focus:outline-none focus:border-accent resize-none"
                                        placeholder="Kutipan favorit Anda..."
                                    />
                                ) : (
                                    <p className="font-serif text-xl sm:text-2xl italic text-primary leading-snug">
                                        "{formData.quote}"
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-primary mb-4">Spesialisasi Kaizen</h3>
                                {isEditing ? (
                                    <div>
                                        <input 
                                            type="text"
                                            name="specializations"
                                            value={formData.specializations}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                                            placeholder="Pisahkan dengan koma (e.g., Inovasi, Manajemen, Analitik)"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Gunakan koma (,) untuk memisahkan spesialisasi.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {formData.specializations.split(',').map((spec, idx) => {
                                            const trimmed = spec.trim();
                                            if(!trimmed) return null;
                                            return (
                                                <div key={idx} className="bg-surface-warm border border-accent/30 text-primary px-4 py-2 rounded shadow-sm text-sm font-semibold">
                                                    {trimmed}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Tampilkan pencapaian (read-only saja untuk saat ini) */}
                            {fixedData.achievements && fixedData.achievements.length > 0 && !isEditing && (
                                <div className="mt-8 border-t border-gray-100 pt-8">
                                    <h4 className="font-serif text-xl font-bold text-primary mb-3">Pencapaian & Dedikasi Terbaru</h4>
                                    <div className="font-sans text-slate-600 leading-relaxed text-sm sm:text-base space-y-2">
                                        {fixedData.achievements.map((ach, idx) => (
                                            <p key={idx} className="flex items-start gap-2">
                                                <span className="text-accent mt-1">•</span>
                                                <span>{ach}</span>
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Kolom Kanan: Stats / Kontribusi */}
                        <div className="space-y-6">
                            <div className="bg-surface-warm p-6 rounded-lg border border-accent/20">
                                <h3 className="font-serif text-lg font-bold text-primary mb-4 border-b border-accent/20 pb-2">Kontribusi Society</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <BookOpen className="w-5 h-5 text-accent" />
                                            <span className="text-sm font-semibold">Artikel Jurnal</span>
                                        </div>
                                        <span className="font-bold text-primary">{fixedData.stats.articles}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <MessageSquare className="w-5 h-5 text-accent" />
                                            <span className="text-sm font-semibold">Diskusi Forum</span>
                                        </div>
                                        <span className="font-bold text-primary">{fixedData.stats.threads}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <Activity className="w-5 h-5 text-accent" />
                                            <span className="text-sm font-semibold">Kasus PDCA</span>
                                        </div>
                                        <span className="font-bold text-primary">{fixedData.stats.pdcaCases}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3 rounded-b-xl">
                        <button 
                            onClick={handleCancel}
                            className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            <X className="w-4 h-4" />
                            <span>Batal</span>
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-md shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            <Toast 
                show={toast.show} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast(prev => ({ ...prev, show: false }))} 
            />
        </div>
    );
}
