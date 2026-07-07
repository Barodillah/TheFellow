import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Award, MessageSquare, Briefcase, Search } from 'lucide-react';
import Toast from '../components/shared/Toast';

export default function PanelFellows() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('https://incsmsociety.site/api/get_users.php');
                const data = await res.json();
                if (data.status === 'success') {
                    setUsers(data.users);
                } else {
                    setToast({ show: true, message: data.message || 'Gagal memuat pengguna', type: 'error' });
                }
            } catch (error) {
                setToast({ show: true, message: 'Kesalahan koneksi', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.title && user.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const fellows = filteredUsers.filter(u => u.role === 'admin' || u.role === 'fellow');
    const members = filteredUsers.filter(u => u.role === 'member');

    const UserCard = ({ user }) => (
        <Link 
            to={`/directory/${user.id}`} 
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-accent/10 transition-all duration-500 flex flex-col h-full transform hover:-translate-y-1 border border-gray-100"
        >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50 flex-grow">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500 z-10"></div>
                
                <img 
                    src={user.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg'} 
                    alt={user.name} 
                    className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                />

                <div className="absolute top-4 right-4 z-20">
                    <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                        {user.join_year || new Date().getFullYear()}
                    </span>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-5 z-20 flex flex-col justify-end">
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                        <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-1">
                            {user.role === 'member' ? 'Member' : 'Fellow'}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-white mb-0.5 group-hover:text-accent transition-colors duration-300">
                            {user.name}
                        </h3>
                        <p className="text-gray-300 text-xs font-medium mb-0">{user.title || 'CSM Enthusiast'}</p>
                        
                        <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-300 ease-in-out">
                            <div className="overflow-hidden mt-3 border-t border-white/20 pt-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-accent px-1.5 py-0.5 rounded">
                                            <Award className="w-2.5 h-2.5" /> 0
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">
                                            <MessageSquare className="w-2.5 h-2.5" /> 0
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">
                                            <Briefcase className="w-2.5 h-2.5" /> 0
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white transform group-hover:rotate-[-45deg] transition-all duration-300">
                                        <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="max-w-7xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary mb-1">Direktori Internal</h1>
                    <p className="text-gray-500 text-sm">Temukan dan terhubung dengan sesama anggota CSM Intellectual Society.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari nama atau jabatan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-500">Memuat direktori...</div>
            ) : (
                <div className="space-y-16">
                    {/* Section Fellows */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-2">
                            <Award className="w-6 h-6 text-accent" />
                            <h2 className="text-2xl font-serif font-bold text-gray-800">The Fellows</h2>
                            <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{fellows.length}</span>
                        </div>
                        {fellows.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {fellows.map(user => <UserCard key={user.id} user={user} />)}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm italic">Belum ada data Fellow yang sesuai pencarian.</p>
                        )}
                    </section>

                    {/* Section Members */}
                    <section>
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                            </span>
                            <h2 className="text-2xl font-serif font-bold text-gray-800">The Sans Frontières (Members)</h2>
                            <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{members.length}</span>
                        </div>
                        {members.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {members.map(user => <UserCard key={user.id} user={user} />)}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm italic">Belum ada data Member yang sesuai pencarian.</p>
                        )}
                    </section>
                </div>
            )}

            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
        </div>
    );
}
