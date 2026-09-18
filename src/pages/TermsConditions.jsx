import React from 'react';
import { ScrollText, Users, Scale, HeartHandshake } from 'lucide-react';

export default function TermsConditions() {
    return (
        <div className="bg-surface-warm min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative w-full pt-24 pb-12 flex items-center justify-center overflow-hidden">
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <ScrollText className="w-16 h-16 text-accent mx-auto mb-6" />
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4 drop-shadow-lg tracking-tight">
                        Syarat & Ketentuan
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto italic font-serif">
                        "One Purpose, Different Groups, One Standard of Excellence."
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 relative z-30 space-y-12">
                <div className="bg-surface-card border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm relative">
                    
                    <div className="space-y-10 text-gray-700 leading-relaxed">
                        
                        <section>
                            <p className="text-lg">
                                Selamat datang di ekosistem digital komunitas. Ketentuan ini diadaptasi dari semangat <strong>CSM Sans Frontieres Pact</strong>, yang dibangun atas dasar keyakinan bahwa persaingan antar Dealer Group tidak seharusnya menjadi penghalang bagi kemajuan profesi dan industri.
                            </p>
                            <p className="mt-4">
                                Dengan menggunakan layanan dalam aplikasi ini, Anda setuju untuk mematuhi prinsip-prinsip yang terangkum dalam pasal-pasal berikut:
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="w-6 h-6 text-primary" />
                                <h2 className="font-serif text-2xl font-bold text-primary">Prinsip Dasar Penggunaan</h2>
                            </div>
                            <ul className="list-disc pl-6 space-y-3">
                                <li><strong>Integrity:</strong> Menggunakan platform ini dengan kejujuran, etika, dan profesionalisme.</li>
                                <li><strong>Mutual Respect:</strong> Menghormati perbedaan struktur, kewenangan, dan strategi bisnis masing-masing pihak.</li>
                                <li><strong>Knowledge Sharing:</strong> Bersedia berbagi pengalaman dan *best practice* demi kemajuan bersama tanpa melanggar kerahasiaan.</li>
                                <li><strong>Customer First:</strong> Memastikan kepentingan pelanggan adalah orientasi utama dalam penggunaan dan pengembangan fitur.</li>
                                <li><strong>Collaboration over Ego:</strong> Mengutamakan kolaborasi positif tanpa menghilangkan identitas organisasi masing-masing.</li>
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Scale className="w-6 h-6 text-primary" />
                                <h2 className="font-serif text-2xl font-bold text-primary">Komitmen Bersama & Kerahasiaan</h2>
                            </div>
                            <p className="mb-4">
                                Seluruh anggota yang tergabung dalam komunitas ini berkomitmen untuk saling mendukung dan menjaga nama baik profesi. 
                            </p>
                            <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                                <h3 className="font-bold text-primary mb-2">Penting:</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Dilarang keras menyebarkan informasi rahasia, data pelanggan, strategi bisnis, atau informasi lain yang bersifat <em>confidential</em> milik grup lain yang secara tidak sengaja diketahui.</li>
                                    <li>Informasi yang didapatkan dari platform diskusi ini tidak boleh digunakan untuk merugikan grup/pihak lain.</li>
                                    <li>Segala aktivitas diskusi dan berbagi wawasan tetap harus memperhatikan hukum persaingan usaha yang sehat.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <HeartHandshake className="w-6 h-6 text-primary" />
                                <h2 className="font-serif text-2xl font-bold text-primary">Independensi & Penyelesaian Perbedaan</h2>
                            </div>
                            <p className="mb-4">
                                Aplikasi ini tidak mengubah struktur, wewenang, maupun hubungan bisnis entitas masing-masing pengguna. Setiap pengguna tetap bertanggung jawab secara profesional kepada organisasinya.
                            </p>
                            <p>
                                Apabila terdapat perbedaan pandangan atau masalah dalam interaksi di platform ini, penyelesaian diutamakan melalui: <strong>Dialog → Klarifikasi → Musyawarah → Solusi.</strong> Perbedaan tidak boleh merusak hubungan profesional atau tujuan bersama.
                            </p>
                        </section>

                        <section className="border-t border-gray-200 pt-8 mt-8">
                            <p className="text-center font-serif italic text-lg text-gray-800">
                                "Pelanggan tidak mengenal batas Dealer Group dan pengalaman pelanggan adalah tanggung jawab kita bersama. Karena itu, kami memilih untuk belajar satu sama lain daripada berjalan sendiri-sendiri."
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
