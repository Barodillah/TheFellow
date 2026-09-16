import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Save, ChevronRight, Plus, Trash2, ArrowLeft, GripVertical, AlertTriangle, FileText } from 'lucide-react';
import { generateQuizQuestions } from '../services/openRouterService';
import Toast from '../components/shared/Toast';

export default function CreateQuiz() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Step 1 State
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        deadline: ''
    });

    // Step 2 State
    const [questions, setQuestions] = useState([]);
    
    // AI State
    const [aiContext, setAiContext] = useState('');
    const [aiCount, setAiCount] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const handleNextStep = () => {
        if (!quizData.title || !quizData.deadline) {
            alert('Judul dan Deadline wajib diisi.');
            return;
        }
        setStep(2);
    };

    const handleGenerateAI = async () => {
        if (!aiContext.trim()) {
            alert('Mohon masukkan materi terlebih dahulu.');
            return;
        }
        setIsGenerating(true);
        try {
            const aiQuestions = await generateQuizQuestions(aiContext, aiCount);
            if (Array.isArray(aiQuestions)) {
                setQuestions(prev => [...prev, ...aiQuestions]);
                setAiContext('');
            }
        } catch (error) {
            console.error('Error generating AI questions:', error);
            alert('Gagal generate soal: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddManualQuestion = () => {
        setQuestions([
            ...questions,
            {
                q: 'Pertanyaan Baru',
                options: [
                    { text: 'Opsi A', score: 10, label: 'A' },
                    { text: 'Opsi B', score: 0, label: 'B' }
                ]
            }
        ]);
    };

    const updateQuestionText = (index, text) => {
        const newQs = [...questions];
        newQs[index].q = text;
        setQuestions(newQs);
    };

    const removeQuestion = (index) => {
        const newQs = [...questions];
        newQs.splice(index, 1);
        setQuestions(newQs);
    };

    const handleOptionChange = (qIndex, optIndex, field, value) => {
        const newQs = [...questions];
        newQs[qIndex].options[optIndex][field] = field === 'score' ? Number(value) : value;
        setQuestions(newQs);
    };

    const addOption = (qIndex) => {
        const newQs = [...questions];
        const labelStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nextLabel = labelStr[newQs[qIndex].options.length] || '?';
        newQs[qIndex].options.push({ text: 'Opsi Baru', score: 0, label: nextLabel });
        setQuestions(newQs);
    };

    const removeOption = (qIndex, optIndex) => {
        const newQs = [...questions];
        newQs[qIndex].options.splice(optIndex, 1);
        setQuestions(newQs);
    };

    const handleSaveQuiz = async (saveStatus = 'active') => {
        if (questions.length === 0) {
            alert('Harap tambahkan minimal 1 pertanyaan.');
            return;
        }
        
        const finalPayload = {
            title: quizData.title,
            description: quizData.description,
            deadline: quizData.deadline,
            status: saveStatus,
            questions: questions
        };

        try {
            const response = await fetch('https://incsmsociety.site/api/add_quiz.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(finalPayload)
            });

            const result = await response.json();

            if (result.success) {
                setToast({ show: true, message: `Quiz berhasil disimpan sebagai ${saveStatus === 'draft' ? 'Draft' : 'Aktif'}!`, type: 'success' });
                setTimeout(() => {
                    navigate('/kanal-quiz');
                }, 1500);
            } else {
                alert('Gagal menyimpan kuis: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving quiz:', error);
            alert('Terjadi kesalahan koneksi saat menyimpan kuis.');
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <Toast 
                show={toast.show} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, show: false })} 
            />
            {/* Header & Breadcrumb */}
            <div className="flex items-center gap-3 mb-8">
                <button onClick={() => step === 1 ? navigate('/kanal-quiz') : setStep(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Buat Quiz Baru</h1>
                    <div className="flex items-center text-xs font-semibold mt-1">
                        <span className={step >= 1 ? 'text-blue-600' : 'text-gray-400'}>1. Detail Kuis</span>
                        <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                        <span className={step >= 2 ? 'text-blue-600' : 'text-gray-400'}>2. Manajemen Soal</span>
                    </div>
                </div>
            </div>

            {/* Step 1: Info */}
            {step === 1 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Kuis <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 border"
                                placeholder="Misal: Evaluasi H.O.M.E Pilar Hospitality"
                                value={quizData.title}
                                onChange={e => setQuizData({...quizData, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Lengkap</label>
                            <textarea 
                                rows="3"
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 border"
                                placeholder="Jelaskan tujuan dari evaluasi kuis ini..."
                                value={quizData.description}
                                onChange={e => setQuizData({...quizData, description: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Batas Waktu (Deadline) <span className="text-red-500">*</span></label>
                            <input 
                                type="datetime-local" 
                                className="w-full md:w-1/3 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3 border"
                                value={quizData.deadline}
                                onChange={e => setQuizData({...quizData, deadline: e.target.value})}
                            />
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button 
                                onClick={handleNextStep}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                Lanjut ke Soal <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Soal */}
            {step === 2 && (
                <div className="space-y-6">
                    {/* AI Magic Box */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-blue-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-800 mb-3">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-lg">AI Quiz Generator</h3>
                        </div>
                        <p className="text-sm text-blue-900/70 mb-4">
                            Tempelkan materi SOP, panduan teknis, atau artikel. AI akan merangkumnya menjadi soal multiple-choice cerdas.
                        </p>
                        <div className="space-y-4">
                            <textarea
                                rows="4"
                                className="w-full border-blue-200 rounded-xl shadow-inner focus:border-blue-400 focus:ring-blue-400 text-sm p-3 border bg-white"
                                placeholder="Paste materi di sini..."
                                value={aiContext}
                                onChange={e => setAiContext(e.target.value)}
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-blue-800">Jumlah Soal:</span>
                                    <select 
                                        className="text-sm border-blue-200 rounded-lg py-1.5 px-3 bg-white text-blue-900 focus:ring-blue-500 border"
                                        value={aiCount}
                                        onChange={e => setAiCount(Number(e.target.value))}
                                    >
                                        <option value={3}>3 Soal</option>
                                        <option value={5}>5 Soal</option>
                                        <option value={10}>10 Soal</option>
                                    </select>
                                </div>
                                <button 
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating}
                                    className="bg-blue-600 disabled:bg-blue-400 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
                                >
                                    {isGenerating ? (
                                        <>Memproses Sihir AI...</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4" /> Generate Sekarang</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Question List */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Daftar Pertanyaan ({questions.length})</h3>
                        <button 
                            onClick={handleAddManualQuestion}
                            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Tambah Manual
                        </button>
                    </div>

                    <div className="space-y-4">
                        {questions.map((qItem, qIndex) => (
                            <div key={qIndex} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 cursor-grab text-gray-400 hover:text-gray-600">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        {/* Question Title */}
                                        <div className="flex items-start gap-2">
                                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">Q{qIndex + 1}</span>
                                            <input 
                                                type="text" 
                                                className="w-full border-gray-300 border-b focus:border-blue-500 focus:ring-0 text-sm font-medium px-0 py-1"
                                                value={qItem.q}
                                                onChange={e => updateQuestionText(qIndex, e.target.value)}
                                            />
                                            <button onClick={() => removeQuestion(qIndex)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Options */}
                                        <div className="pl-8 space-y-2">
                                            {qItem.options.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-3">
                                                    <span className="w-6 text-center text-xs font-bold text-gray-400">{opt.label}.</span>
                                                    <input 
                                                        type="text" 
                                                        className="flex-1 border-gray-200 rounded-lg text-sm p-2 focus:ring-blue-500 focus:border-blue-500 border"
                                                        value={opt.text}
                                                        onChange={e => handleOptionChange(qIndex, optIndex, 'text', e.target.value)}
                                                    />
                                                    <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                                                        <span className="text-[10px] uppercase font-semibold text-gray-500">Skor:</span>
                                                        <input 
                                                            type="number" 
                                                            className="w-16 border-transparent bg-transparent text-sm font-bold text-center p-1 focus:ring-0 text-blue-600"
                                                            value={opt.score}
                                                            onChange={e => handleOptionChange(qIndex, optIndex, 'score', e.target.value)}
                                                        />
                                                    </div>
                                                    <button onClick={() => removeOption(qIndex, optIndex)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                        <X_icon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => addOption(qIndex)}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> Tambah Opsi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {questions.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-600">Belum ada soal kuis.</p>
                                <p className="text-xs text-gray-400 mt-1">Gunakan AI atau tambah manual untuk mulai menyusun.</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-end gap-3">
                        <button 
                            onClick={() => handleSaveQuiz('draft')}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <FileText className="w-5 h-5" />
                            Simpan Draft
                        </button>
                        <button 
                            onClick={() => handleSaveQuiz('active')}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/30"
                        >
                            <Save className="w-5 h-5" />
                            Simpan & Publish Quiz
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Inline X icon for options
const X_icon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
