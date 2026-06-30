import React from 'react';
import { Link } from 'react-router-dom';

export default function HOMEStandard() {
    const pillars = [
        {
            id: 'hospitality', key: 'H', title: 'Hospitality',
            desc: 'Keramahan yang melampaui batas formalitas, lahir dari ketulusan hati yang murni.',
            points: [
                'Sapaan hangat 3-detik pertama.',
                'Intonasi suara yang bersahabat dan tulus.',
                'Kesiapan melayani tanpa pamrih.'
            ],
            dos: ['Tersenyum saat melakukan kontak mata', 'Menawarkan bantuan sebelum diminta'],
            donts: ['Terlihat sibuk atau mengabaikan saat pelanggan datang', 'Menjawab dengan nada datar']
        },
        {
            id: 'one', key: 'O', title: 'One Service Standard',
            desc: 'Konsistensi keunggulan pelayanan di semua titik sentuh diler tanpa diskriminasi.',
            points: [
                'Keseragaman kualitas serah terima unit di seluruh Indonesia tanpa kompromi.',
                'Prosedur standar penanganan keluhan.',
                'Kebersihan dan kerapian fasilitas diler sesuai standar.'
            ],
            dos: ['Mengikuti checklist standar operasional', 'Memastikan seragam dan penampilan selalu rapi'],
            donts: ['Memotong langkah-langkah prosedur karena terburu-buru', 'Membedakan perlakuan antar pelanggan']
        },
        {
            id: 'memorable', key: 'M', title: 'Memorable Experience',
            desc: 'Menciptakan momen emosional tak terlupakan pada titik kritis interaksi.',
            points: [
                'Sentuhan personal kecil gratis yang disesuaikan dengan profil spesifik keluarga customer.',
                'Mengingat nama dan detail preferensi pelanggan.',
                'Memberikan kejutan kecil di hari spesial pelanggan.'
            ],
            dos: ['Mencatat preferensi unik pelanggan di sistem', 'Memberikan apresiasi atas kesetiaan mereka'],
            donts: ['Bersikap terlalu kaku bak robot', 'Melupakan detail penting yang sudah disampaikan pelanggan']
        },
        {
            id: 'empathy', key: 'E', title: 'Empathy',
            desc: 'Menyelami dan memahami kekhawatiran serta ekspektasi terdalam customer.',
            points: [
                'Kemampuan mendengar aktif saat menghadapi keluhan dengan emosi tinggi.',
                'Memposisikan diri di sudut pandang pelanggan.',
                'Memberikan solusi yang menunjukkan kepedulian sejati.'
            ],
            dos: ['Mendengarkan keluhan sampai selesai tanpa memotong', 'Menyampaikan permohonan maaf yang tulus'],
            donts: ['Menyalahkan pihak lain atau pelanggan', 'Menunjukkan bahasa tubuh yang defensif']
        }
    ];

    return (
        <div className="py-20 px-4 max-w-7xl mx-auto">
            <h1 className="font-serif text-4xl font-bold text-primary mb-4 text-center">Standar Pelayanan H.O.M.E</h1>
            <p className="text-center text-slate-500 mb-16 max-w-2xl mx-auto text-lg">Panduan lengkap 4 pilar standar pelayanan Mitsubishi CSM untuk menghadirkan ketulusan yang berkesan di setiap langkah perjalanan pelanggan.</p>
            
            <div className="space-y-16 mb-20">
                {pillars.map((pilar, index) => (
                    <div key={pilar.id} className={`flex flex-col md:flex-row gap-8 items-start ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                        <div className="md:w-1/3 flex-shrink-0 w-full">
                            <div className="bg-surface-card rounded-xl p-8 border border-accent/30 shadow-lg h-full flex flex-col items-center justify-center text-center min-h-[250px]">
                                <span className="font-serif text-8xl font-extrabold text-accent mb-4">{pilar.key}</span>
                                <h2 className="font-serif text-3xl font-bold text-primary">{pilar.title}</h2>
                            </div>
                        </div>
                        <div className="md:w-2/3 w-full space-y-6">
                            <p className="text-xl text-slate-700 leading-relaxed italic border-l-4 border-accent pl-4 py-2 bg-white/50 rounded-r-lg">
                                "{pilar.desc}"
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
                                    <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Do's
                                    </h4>
                                    <ul className="space-y-2">
                                        {pilar.dos.map((item, i) => <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span><span>{item}</span></li>)}
                                    </ul>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
                                    <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        Don'ts
                                    </h4>
                                    <ul className="space-y-2">
                                        {pilar.donts.map((item, i) => <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span><span>{item}</span></li>)}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-primary mb-3">Fokus Utama:</h4>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
                                    {pilar.points.map((point, i) => (
                                        <li key={i}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div id="quiz" className="bg-surface-card rounded-lg border border-accent/30 shadow-md p-10 text-center max-w-3xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="font-serif text-9xl font-bold">?</span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-primary mb-4 relative z-10">Quiz Evaluasi H.O.M.E</h2>
                <p className="text-slate-500 mb-8 text-lg relative z-10">Uji pemahaman Anda tentang standar pelayanan H.O.M.E melalui skenario studi kasus sehari-hari di diler.</p>
                <Link to="/quiz" className="bg-accent hover:bg-accent-light text-primary font-sans text-base font-bold px-10 py-4 rounded shadow-lg transition duration-200 uppercase tracking-wide relative z-10 inline-block mt-4">
                    Mulai Quiz Sekarang
                </Link>
            </div>
        </div>
    );
}
