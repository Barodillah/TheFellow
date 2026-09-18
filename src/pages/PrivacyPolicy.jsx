import React from 'react';
import { ShieldCheck, Database, Lock } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="bg-surface-warm min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative w-full pt-24 pb-12 flex items-center justify-center overflow-hidden">
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <ShieldCheck className="w-16 h-16 text-accent mx-auto mb-6" />
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4 drop-shadow-lg tracking-tight">
                        Kebijakan Privasi
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Komitmen kami terhadap keamanan dan kerahasiaan data Anda
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 relative z-30 space-y-12">
                <div className="bg-surface-card border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm relative">
                    
                    <div className="space-y-10 text-gray-700 leading-relaxed">
                        
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Database className="w-6 h-6 text-primary" />
                                <h2 className="font-serif text-2xl font-bold text-primary">Penyimpanan Data Lokal</h2>
                            </div>
                            <p className="mb-4">
                                Aplikasi ini dirancang dengan prinsip <strong>Privacy First</strong> (Mengutamakan Privasi). Seluruh data yang Anda olah di dalam aplikasi ini, termasuk data konsumen, catatan pribadi, profil, dan berkas lainnya, <strong>sepenuhnya disimpan di memori penyimpanan lokal (local storage) perangkat Anda</strong>. 
                            </p>
                            <p>
                                Kami tidak mengirim, menyalin, atau menyimpan data Anda di server kami. Hal ini memberikan Anda kendali penuh atas informasi yang Anda miliki, mencegah akses tidak sah dari pihak luar.
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Lock className="w-6 h-6 text-primary" />
                                <h2 className="font-serif text-2xl font-bold text-primary">Bukti Keamanan dan Batasan Perangkat</h2>
                            </div>
                            <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                                <p className="mb-4 text-gray-800 font-medium">
                                    Sebagai bukti nyata bahwa data Anda tidak disimpan di server, Anda dapat mencoba skenario berikut:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Apabila Anda melakukan login ke akun Anda menggunakan perangkat lain (misalnya ponsel lain atau komputer yang berbeda), data yang sebelumnya Anda simpan di perangkat awal <strong>tidak akan muncul</strong>.</li>
                                    <li>Data hanya akan tersedia dan terikat secara eksklusif pada perangkat di mana data tersebut pertama kali dibuat dan diolah.</li>
                                </ul>
                                <p className="mt-4 text-sm text-gray-600 italic">
                                    Pengecualian berlaku jika Anda secara eksplisit dan sadar memilih untuk membagikan data tersebut (misalnya mempublikasikan dokumen atau membagikan ke forum publik).
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-serif text-2xl font-bold text-primary mb-4">Komitmen Kerahasiaan Sesuai CSM Sans Frontieres Pact</h2>
                            <p className="mb-4">
                                Sebagai bagian dari komitmen kami dalam memajukan budaya pelayanan, kami memegang teguh asas kerahasiaan seperti yang tertuang dalam <em>CSM Sans Frontieres Pact</em>:
                            </p>
                            <ul className="list-disc pl-6 space-y-3">
                                <li>Setiap anggota wajib menjaga kerahasiaan informasi yang diperoleh melalui forum kerja sama.</li>
                                <li>Informasi yang bersifat rahasia (termasuk data pelanggan, data finansial, strategi perusahaan, dsb) tidak boleh dibagikan atau digunakan di luar tujuan kerja sama tanpa izin pihak yang berwenang.</li>
                                <li>Kami tidak menggunakan informasi apa pun untuk merugikan pihak lain, dan sangat menghargai independensi masing-masing grup.</li>
                            </ul>
                        </section>

                        <section className="border-t border-gray-200 pt-8 mt-8 text-sm text-gray-500">
                            <p>
                                Kebijakan ini dapat diperbarui sewaktu-waktu seiring dengan perkembangan aplikasi dan kebutuhan operasional. Setiap perubahan akan tetap berlandaskan pada prinsip kerahasiaan dan kepatuhan yang telah disepakati.
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
