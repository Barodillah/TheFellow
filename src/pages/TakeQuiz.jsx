import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HelpCircle, Award, ArrowLeft, Loader2 } from 'lucide-react';

export default function TakeQuiz() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);

    // Quiz States
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [quizScore, setQuizScore] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('csm_user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/login'); // Redirect jika belum login
        }
    }, [navigate]);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!user) return;
            try {
                const response = await fetch(`https://incsmsociety.site/api/get_quizzes.php?user_id=${user.id}`);
                const result = await response.json();
                
                if (result.success) {
                    const found = result.data.find(q => q.id == id);
                    if (found) {
                        setQuizData(found);
                    } else {
                        setError('Kuis tidak ditemukan atau tidak aktif.');
                    }
                } else {
                    setError(result.message);
                }

                // Fetch Leaderboard
                try {
                    const lbResponse = await fetch(`https://incsmsociety.site/api/get_quiz_leaderboard.php?quiz_id=${id}`);
                    const lbResult = await lbResponse.json();
                    if (lbResult.success) {
                        setLeaderboard(lbResult.data);
                    }
                } catch (e) {
                    console.error("Gagal memuat leaderboard", e);
                }
            } catch (err) {
                setError('Gagal memuat kuis dari server.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuiz();
    }, [id, user]);

    const handleSelectQuizAnswer = async (score, optionIndex) => {
        const updatedAnswers = [...quizAnswers, { qIndex: currentQuestionIndex, selectedOption: optionIndex, score }];
        setQuizAnswers(updatedAnswers);

        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Selesai! Submit ke backend
            const total = updatedAnswers.reduce((sum, val) => sum + val.score, 0);
            
            try {
                setIsSubmitting(true);
                const response = await fetch('https://incsmsociety.site/api/submit_quiz.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        quiz_id: id,
                        user_id: user.id,
                        score: total,
                        answers: updatedAnswers
                    })
                });

                const result = await response.json();
                if (result.success) {
                    setQuizScore(total);
                } else {
                    alert('Gagal mengirim hasil: ' + result.message);
                }
            } catch (error) {
                alert('Terjadi kesalahan jaringan.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const getQuizResultDescription = (score, maxScore) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 85) {
            return {
                title: "Master Intelektual",
                desc: "Luar biasa! Pemahaman Anda sangat tajam dan melampaui ekspektasi.",
                badge: "Gold Award"
            };
        } else if (percentage >= 60) {
            return {
                title: "Guardian of Standard",
                desc: "Kerja bagus! Anda memiliki pemahaman yang solid, namun masih ada ruang untuk ditingkatkan.",
                badge: "Silver Award"
            };
        } else {
            return {
                title: "Kaizen Apprentice",
                desc: "Masih banyak yang perlu Anda pelajari. Jangan menyerah, baca kembali materi dan tingkatkan pemahaman Anda.",
                badge: "Bronze Award"
            };
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-warm">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !quizData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-warm">
                <div className="text-center p-8 bg-white rounded-2xl shadow">
                    <p className="text-red-500 font-bold mb-4">{error}</p>
                    <button onClick={() => navigate('/kanal-quiz')} className="bg-primary text-white px-6 py-2 rounded-lg">Kembali ke Kanal Quiz</button>
                </div>
            </div>
        );
    }

    const totalQuestions = quizData.questions ? quizData.questions.length : 0;
    // Cari total max score untuk menghitung persentase
    const maxPossibleScore = quizData.questions.reduce((sum, q) => {
        const maxOpt = Math.max(...q.options.map(opt => Number(opt.score) || 0), 0);
        return sum + maxOpt;
    }, 0);

    return (
        <div className="min-h-screen flex flex-col py-6 px-4 sm:px-6 lg:px-8 bg-surface-warm">
            <button 
                onClick={() => navigate('/kanal-quiz')}
                className="self-start mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
            >
                <ArrowLeft className="w-4 h-4" /> Kembali
            </button>

            <div className="flex-1 flex items-center justify-center">
                <section className="bg-primary text-surface-warm w-full max-w-4xl rounded-xl border border-accent/50 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <HelpCircle className="w-64 h-64 text-accent" />
                    </div>

                    <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-primary-light px-3 py-1 rounded">
                            Evaluasi Intelektual Wajib
                        </span>
                        <h2 className="font-serif text-3xl font-bold text-white leading-tight">{quizData.title}</h2>
                        <p className="font-sans text-xs sm:text-sm text-gray-400">
                            {quizData.description}
                        </p>

                        <div className="h-[1px] bg-accent/20 my-6" />

                        {!quizStarted && quizScore === null && (
                            <div className="py-8">
                                {quizData.isCompleted && (
                                    <div className="bg-green-500/10 text-green-400 border border-green-500/20 p-4 rounded-xl mb-6 inline-block text-left">
                                        <p className="font-bold text-sm">✓ Anda sudah mengerjakan kuis ini.</p>
                                        <p className="text-xs mt-1 text-gray-300">Skor Anda sebelumnya: <span className="font-bold text-accent">{quizData.userScore}</span></p>
                                    </div>
                                )}
                                <div className="block">
                                    <button
                                        onClick={() => setQuizStarted(true)}
                                        className="bg-gradient-to-r from-accent to-accent-light text-primary hover:opacity-95 px-10 py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-accent/20 transition-all hover:scale-105"
                                    >
                                        {quizData.isCompleted ? 'KERJAKAN ULANG KUIS' : 'MULAI KERJAKAN KUIS'}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-wider">Total {totalQuestions} Pertanyaan</p>
                            </div>
                        )}

                        {quizStarted && quizScore === null && (
                            <div className="text-left bg-black/30 p-6 sm:p-8 rounded-xl border border-accent/20 space-y-8 shadow-inner">
                                {/* Progress bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-gray-400 font-medium mb-3">
                                        <span>Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}</span>
                                        <span>{Math.round(((currentQuestionIndex) / totalQuestions) * 100)}% Selesai</span>
                                    </div>
                                    <div className="w-full bg-primary-light/50 h-2 rounded-full overflow-hidden">
                                        <div className="bg-accent h-full transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }} />
                                    </div>
                                </div>

                                {/* Question */}
                                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-relaxed">
                                    {quizData.questions[currentQuestionIndex].question_text}
                                </h3>

                                {/* Options */}
                                <div className="space-y-3">
                                    {isSubmitting ? (
                                        <div className="py-10 text-center text-accent animate-pulse flex flex-col items-center">
                                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                            <span className="text-sm font-semibold">Mengirim jawaban...</span>
                                        </div>
                                    ) : (
                                        quizData.questions[currentQuestionIndex].options.map((option, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSelectQuizAnswer(Number(option.score), i)}
                                                className="w-full flex items-center gap-4 text-left p-4 sm:p-5 rounded-xl bg-primary-light/30 hover:bg-primary-light text-sm sm:text-base text-gray-200 border border-transparent hover:border-accent/40 transition-all duration-200 group"
                                            >
                                                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-gray-400 font-bold text-sm group-hover:bg-accent group-hover:text-primary transition-colors">
                                                    {option.label || String.fromCharCode(65 + i)}
                                                </span>
                                                <span className="flex-1">{option.text}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {quizScore !== null && (
                            <div className="bg-black/30 p-8 sm:p-12 rounded-xl border border-accent/40 text-center space-y-6 animate-in fade-in zoom-in shadow-inner">
                                <span className="text-[10px] bg-green-600 text-white px-3 py-1 rounded uppercase tracking-wider font-bold shadow-lg">Hasil Tersimpan</span>

                                <div className="py-4">
                                    <span className="block text-xs text-gray-400 uppercase font-bold tracking-widest mb-2">Skor Poin Intelektual Anda</span>
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="font-serif text-6xl sm:text-7xl font-extrabold text-accent drop-shadow-lg">{quizScore}</span>
                                        <span className="text-lg text-gray-500 font-medium">/ {maxPossibleScore}</span>
                                    </div>
                                </div>

                                <div className="max-w-lg mx-auto space-y-3 bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <h3 className="font-serif text-2xl font-bold text-white">
                                        {getQuizResultDescription(quizScore, maxPossibleScore).title}
                                    </h3>
                                    <p className="font-sans text-sm text-gray-300 leading-relaxed">
                                        {getQuizResultDescription(quizScore, maxPossibleScore).desc}
                                    </p>
                                </div>

                                <div className="bg-accent/10 py-3 px-6 rounded-full inline-flex items-center gap-3 border border-accent/30 text-sm text-accent font-semibold shadow-inner mt-4">
                                    <Award className="w-5 h-5" />
                                    <span>Lencana Virtual: {getQuizResultDescription(quizScore, maxPossibleScore).badge}</span>
                                </div>

                                <div className="pt-8">
                                    <button
                                        onClick={() => navigate('/kanal-quiz')}
                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-8 py-3 rounded-xl transition duration-200"
                                    >
                                        Kembali ke Beranda Quiz
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Leaderboard Section */}
            {leaderboard.length > 0 && (
                <div className="w-full max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6 border-b pb-4">
                        <Award className="w-6 h-6 text-yellow-500" />
                        Leaderboard Tertinggi
                    </h3>
                    <div className="space-y-4">
                        {leaderboard.map((lb, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    idx === 1 ? 'bg-gray-200 text-gray-700' :
                                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-500'
                                }`}>
                                    {idx + 1}
                                </div>
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200">
                                    <img src={lb.avatar || 'https://incsmsociety.site/uploads/avatar/default.jpg'} alt={lb.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 truncate text-sm">{lb.name}</h4>
                                    <p className="text-xs text-gray-500">
                                        {new Date(lb.submitted_at.replace(' ', 'T') + 'Z').toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <div className="font-bold text-primary text-lg">{lb.score}</div>
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Points</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
