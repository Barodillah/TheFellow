import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Award, MessageSquare, Briefcase, Search } from 'lucide-react';

export default function Fellows() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('https://incsmsociety.site/api/get_users.php');
                const data = await res.json();
                if (data.status === 'success') {
                    setUsers(data.users);
                }
            } catch (err) {
                console.error("Gagal memuat pengguna", err);
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
            to={`/fellows/${user.id}`} 
            className="group relative bg-primary rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-accent/20 transition-all duration-700 flex flex-col h-full transform hover:-translate-y-2 border border-accent/10"
        >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-primary-light flex-grow">
                
                {/* Decorative Top Gradient */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Main Gradient Overlay for Bottom Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500 z-10"></div>
                
                {/* Image */}
                <img 
                    src={user.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg'} 
                    alt={user.name} 
                    className="w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                />

                {/* Floating Badge (Join Year) */}
                <div className="absolute top-5 right-5 z-20 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="bg-surface-card/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                        Sejak {user.join_year || new Date().getFullYear()}
                    </span>
                </div>

                {/* Content Overlaid on Image Bottom */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end h-full">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-1">
                            {user.csm_title || (user.role === 'member' ? 'Member' : 'Fellow')}
                        </span>
                        <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-accent transition-colors duration-300">
                            {user.name}
                        </h3>
                        <p className="text-gray-300 text-sm font-semibold mb-0">{user.title || 'CSM Enthusiast'}</p>
                        
                        {/* Expandable Info on Hover */}
                        <div className="grid grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 transition-all duration-500 ease-in-out">
                            <div className="overflow-hidden mt-4 border-t border-white/10 pt-4">
                                <p className="text-xs text-gray-300 italic mb-5 leading-relaxed line-clamp-2">
                                    "{user.quote || 'Berkomitmen pada kualitas pelayanan.'}"
                                </p>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-primary bg-accent/90 px-2 py-1 rounded">
                                            <Award className="w-3 h-3" /> {user.stats_articles || 0}
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 border border-white/20 px-2 py-1 rounded">
                                            <MessageSquare className="w-3 h-3 text-gray-300" /> {user.stats_threads || 0}
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/10 border border-white/20 px-2 py-1 rounded">
                                            <Briefcase className="w-3 h-3 text-gray-300" /> {user.stats_pdca_cases || 0}
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-surface-card/30 border border-white/20 text-white flex items-center justify-center transform group-hover:rotate-[-45deg] transition-all duration-500">
                                        <ChevronRight className="w-4 h-4" />
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
        <div className="bg-surface-warm min-h-screen pt-24 pb-24">
            
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 mb-16 text-center relative z-10">
                <span className="inline-block bg-accent/20 border border-accent/30 text-accent font-bold tracking-widest uppercase text-xs px-4 py-1.5 rounded-full mb-4 shadow-sm">
                    CSM Intellectual Society
                </span>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 drop-shadow-md">
                    Direktori Anggota
                </h1>
                <p className="font-sans text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed mb-8">
                    Mengenal lebih dekat para pionir dan pakar pelopor standar emas <i>Customer Experience</i> di jaringan diler Mitsubishi Motors.
                </p>
                <div className="max-w-md mx-auto relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Cari nama atau jabatan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {loading ? (
                    <div className="text-center text-gray-500 py-12">Memuat direktori...</div>
                ) : (
                    <div className="space-y-24">
                        {/* Section Fellows */}
                        <section>
                            <div className="flex flex-col items-center mb-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Award className="w-8 h-8 text-accent" />
                                    <h2 className="text-3xl font-serif font-bold text-primary">The Fellows</h2>
                                </div>
                                <div className="w-24 h-1 bg-accent/50 rounded-full"></div>
                            </div>
                            
                            {fellows.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {fellows.map(user => <UserCard key={user.id} user={user} />)}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 italic">Belum ada Fellow terdaftar.</p>
                            )}
                        </section>

                        {/* Section Members */}
                        <section>
                            <div className="flex flex-col items-center mb-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <MessageSquare className="w-7 h-7 text-primary" />
                                    <h2 className="text-3xl font-serif font-bold text-primary">The Sans Frontières</h2>
                                </div>
                                <p className="text-sm text-gray-500 mb-2 uppercase tracking-widest font-bold">Members</p>
                                <div className="w-24 h-1 bg-primary/20 rounded-full"></div>
                            </div>
                            
                            {members.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {members.map(user => <UserCard key={user.id} user={user} />)}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 italic">Belum ada Member terdaftar.</p>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
