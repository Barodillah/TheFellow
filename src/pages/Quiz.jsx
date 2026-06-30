import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Award } from 'lucide-react';

export default function Quiz() {
    const navigate = useNavigate();
    
    // Mini Quiz States
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [quizScore, setQuizScore] = useState(null);

    const QUIZ_QUESTIONS = [
        {
            q: "Ada customer datang dalam keadaan marah besar di showroom diler Anda karena keterlambatan asuransi. Langkah pertama Anda?",
            options: [
                { text: "Langsung meminta maaf secara tulus dan mendengarkan keluhannya tanpa memotong (Empati)", score: 4, label: "E" },
                { text: "Memanggil tim asuransi terkait untuk segera menjelaskan status klaim (One Standard)", score: 3, label: "O" },
                { text: "Menyuguhkan minuman dingin kesukaan customer agar emosinya mereda terlebih dahulu (Hospitality)", score: 2, label: "H" },
                { text: "Mencatat komplain tersebut pada form kendala untuk ditinjau esok hari (Kaizen)", score: 1, label: "P" }
            ]
        },
        {
            q: "Bagaimana cara Anda memastikan pelayanan yang konsisten di semua area cabang diler?",
            options: [
                { text: "Menerapkan Checklist Standar Operasional yang diaudit berkala di seluruh area (One Standard)", score: 4, label: "O" },
                { text: "Melatih garda depan agar menyapa customer dengan senyum 3-jari yang tulus (Hospitality)", score: 3, label: "H" },
                { text: "Melakukan analisis PDCA bulanan untuk memangkas hambatan pelayanan (Kaizen)", score: 2, label: "P" },
                { text: "Mengadakan sesi curhat mingguan bersama staff untuk mendalami curhatan customer (Empati)", score: 1, label: "E" }
            ]
        },
        {
            q: "Seberapa penting kenangan yang membekas (Memorable Experience) dalam proses serah terima unit baru?",
            options: [
                { text: "Sangat vital, kita wajib menambahkan sentuhan personal tak terlupakan bagi keluarga customer (Memorable)", score: 4, label: "M" },
                { text: "Penting untuk memastikan semua kelengkapan surat kendaraan telah divalidasi tepat waktu (One Standard)", score: 3, label: "O" },
                { text: "Cukup penting untuk memberi sambutan ramah dan dokumentasi foto standar (Hospitality)", score: 2, label: "H" },
                { text: "Penting sebagai bahan perbaikan proses serah terima diler berikutnya (Kaizen)", score: 1, label: "P" }
            ]
        },
        {
            q: "Ketika mendapati antrean diler bertambah panjang pada libur akhir pekan, tindakan darurat Anda?",
            options: [
                { text: "Melakukan penyesuaian proses seketika (Kaizen) dengan membuka loket pra-pendaftaran darurat", score: 4, label: "P" },
                { text: "Menghampiri antrean untuk membagikan cemilan hangat dan meminta maaf atas ketidaknyamanan (Hospitality)", score: 3, label: "H" },
                { text: "Memprioritaskan customer yang memiliki kebutuhan mendesak terlebih dahulu (Empati)", score: 2, label: "E" },
                { text: "Tetap konsisten mengikuti antrean sesuai nomor urutan demi keadilan pelayanan (One Standard)", score: 1, label: "O" }
            ]
        },
        {
            q: "Bagi Anda, apa arti utama pilar 'Empati' dalam keseharian operasional diler?",
            options: [
                { text: "Mampu memposisikan diri sebagai customer untuk memahami motif di balik kegusarannya", score: 4, label: "E" },
                { text: "Menciptakan hubungan emosional jangka panjang yang membuat customer merasa seperti keluarga", score: 3, label: "M" },
                { text: "Memastikan hak-hak layanan customer terpenuhi secara adil tanpa diskriminasi", score: 2, label: "O" },
                { text: "Menjadikan kritik pedas customer sebagai data utama perbaikan sistemik diler", score: 1, label: "P" }
            ]
        }
    ];

    const handleSelectQuizAnswer = (score) => {
        const updatedAnswers = [...quizAnswers, score];
        setQuizAnswers(updatedAnswers);

        if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            const total = updatedAnswers.reduce((sum, val) => sum + val, 0);
            setQuizScore(total);
        }
    };

    const resetQuiz = () => {
        setQuizStarted(false);
        setCurrentQuestionIndex(0);
        setQuizAnswers([]);
        setQuizScore(null);
    };

    const getQuizResultDescription = (score) => {
        if (score >= 17) {
            return {
                title: "Master of Customer Experience",
                desc: "Luar biasa! Nilai kepemimpinan dan rasa empati Anda telah sejalan dengan standar tertinggi Fellow Society. Anda adalah motor penggerak Kaizen sejati di Mitsubishi.",
                badge: "Grandmaster Award"
            };
        } else if (score >= 12) {
            return {
                title: "Guardian of Standard",
                desc: "Kerja bagus! Anda memiliki pemahaman pelayanan H.O.M.E yang solid dan konsisten menjalankan standarisasi. Teruskan perbaikan Kaizen kecil setiap hari.",
                badge: "H.O.M.E Guard"
            };
        } else {
            return {
                title: "Kaizen Apprentice",
                desc: "Anda memiliki pondasi yang baik, namun masih ada ruang yang luas untuk meningkatkan ketajaman empati dan kreativitas layanan dalam menciptakan Memorable Experience.",
                badge: "Rising Kaizen"
            };
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-warm">
            <section className="bg-primary text-surface-warm w-full max-w-4xl rounded-lg border-2 border-accent p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <HelpCircle className="w-48 h-48 text-accent" />
                </div>

                <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-accent bg-primary-light px-3 py-1 rounded">Evaluasi Mandiri Intelektual</span>
                    <h2 className="font-serif text-3xl font-bold text-white">Quiz Evaluasi: Seberapa H.O.M.E Kamu?</h2>
                    <p className="font-sans text-xs sm:text-sm text-gray-300">
                        Uji ketajaman naluri pelayanan pelanggan Anda dengan menjawab skenario nyata yang dihadapi para CSM Mitsubishi di lapangan sehari-hari.
                    </p>

                    <div className="h-[1px] bg-accent/30 my-4" />

                    {!quizStarted && !quizScore && (
                        <div className="py-8">
                            <button
                                onClick={() => setQuizStarted(true)}
                                className="bg-gradient-to-r from-accent to-accent-light text-primary hover:opacity-95 px-8 py-4 rounded font-bold text-sm tracking-wide shadow"
                            >
                                MULAI QUIZ MANDIRI
                            </button>
                            <p className="text-[10px] text-gray-400 mt-3">Durasi pengerjaan kurang dari 3 menit · Total 5 Pertanyaan</p>
                        </div>
                    )}

                    {quizStarted && (
                        <div className="text-left bg-black/20 p-6 rounded-lg border border-accent/20 space-y-6">
                            {/* Progress bar */}
                            <div>
                                <div className="flex justify-between text-xs text-gray-300 mb-2">
                                    <span>Pertanyaan {currentQuestionIndex + 1} dari 5</span>
                                    <span>Progress: {Math.round(((currentQuestionIndex) / 5) * 100)}%</span>
                                </div>
                                <div className="w-full bg-primary-light h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-accent h-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }} />
                                </div>
                            </div>

                            {/* Question */}
                            <h3 className="font-serif text-lg font-bold text-white leading-snug">
                                {QUIZ_QUESTIONS[currentQuestionIndex].q}
                            </h3>

                            {/* Options */}
                            <div className="space-y-3">
                                {QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectQuizAnswer(option.score)}
                                        className="w-full text-left p-4 rounded bg-primary-light/50 hover:bg-primary-light text-xs sm:text-sm text-gray-200 border border-accent/20 hover:border-accent transition duration-200"
                                    >
                                        {option.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {quizScore !== null && (
                        <div className="bg-black/20 p-8 rounded-lg border border-accent text-center space-y-6 animate-in fade-in zoom-in">
                            <span className="text-[10px] bg-green-700 text-white px-3 py-1 rounded font-bold uppercase tracking-wider">Hasil Evaluasi</span>

                            <div className="py-2">
                                <span className="block text-[11px] text-gray-400 uppercase font-medium">Skor Total Naluri Anda:</span>
                                <span className="font-serif text-5xl font-extrabold text-accent">{quizScore} / 20</span>
                            </div>

                            <div className="max-w-md mx-auto space-y-2">
                                <h3 className="font-serif text-xl font-bold text-accent">
                                    {getQuizResultDescription(quizScore).title}
                                </h3>
                                <p className="font-sans text-xs text-gray-300 leading-relaxed">
                                    {getQuizResultDescription(quizScore).desc}
                                </p>
                            </div>

                            <div className="bg-primary-light/50 py-3 px-6 rounded-full inline-flex items-center gap-2 border border-accent/30 text-xs text-accent font-semibold">
                                <Award className="w-4 h-4" />
                                <span>Lencana Virtual Diperoleh: {getQuizResultDescription(quizScore).badge}</span>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                                <button
                                    onClick={resetQuiz}
                                    className="border border-accent/50 hover:bg-accent/10 text-accent text-xs font-semibold px-6 py-2.5 rounded transition duration-200"
                                >
                                    Ulangi Tes
                                </button>
                                <button
                                    onClick={() => navigate('/fellows')}
                                    className="bg-accent text-primary hover:opacity-95 text-xs font-semibold px-6 py-2.5 rounded transition duration-200"
                                >
                                    Bandingkan dengan Para Fellow
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
