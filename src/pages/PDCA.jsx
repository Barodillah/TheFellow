import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Target, Activity, CheckCircle2, ChevronLeft, Calendar, User, Lightbulb, RefreshCw, Trash2, ShieldCheck, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateFinalEvaluation } from '../services/openRouterService';

const PDCATracker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // State for the evaluation modal/inline-form
  const [evaluatingActionId, setEvaluatingActionId] = useState(null);
  const [evaluationText, setEvaluationText] = useState('');
  
  const [isGeneratingEval, setIsGeneratingEval] = useState(false);
  
  // State for Continuous PDCA Confirmation Modal
  const [confirmCycle, setConfirmCycle] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const saved = localStorage.getItem('pdca_projects_list');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProjects(parsed);
      
      if (location.state?.openProjectId) {
        const toOpen = parsed.find(p => p.id === location.state.openProjectId);
        if (toOpen) setSelectedProject(toOpen);
        window.history.replaceState({}, document.title);
      }
    }
  };

  const saveProjects = (updatedProjects) => {
    localStorage.setItem('pdca_projects_list', JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
    
    // Update selected project if it's currently open
    if (selectedProject) {
      const updatedSelected = updatedProjects.find(p => p.id === selectedProject.id);
      setSelectedProject(updatedSelected || null);
    }
  };

  const deleteProject = (id) => {
    if(window.confirm('Hapus proyek PDCA ini?')) {
      const newProjects = projects.filter(p => p.id !== id);
      saveProjects(newProjects);
      if(selectedProject?.id === id) setSelectedProject(null);
    }
  };

  const getProgress = (proj) => {
    if (!proj.actionPlans || proj.actionPlans.length === 0) return 0;
    const done = proj.actionPlans.filter(a => a.status === 'done').length;
    return Math.round((done / proj.actionPlans.length) * 100);
  };

  const openEvaluationForm = (actionId) => {
    // If it's already done, maybe we allow re-evaluating or just unchecking.
    // Let's assume clicking check again unchecks it.
    const action = selectedProject.actionPlans.find(a => a.id === actionId);
    if (action.status === 'done') {
      submitEvaluation(actionId, '', 'pending'); // Revert to pending
    } else {
      setEvaluatingActionId(actionId);
      setEvaluationText(action.evaluation || '');
    }
  };

  const submitEvaluation = (actionId, text, status = 'done') => {
    const updatedProjects = projects.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          actionPlans: p.actionPlans.map(a => 
            a.id === actionId ? { ...a, evaluation: text, status } : a
          )
        };
      }
      return p;
    });
    saveProjects(updatedProjects);
    setEvaluatingActionId(null);
    setEvaluationText('');
  };

  const handleGenerateFinalEval = async () => {
    setIsGeneratingEval(true);
    try {
      const evalData = await generateFinalEvaluation(
        selectedProject.problem, 
        selectedProject.rcaResult, 
        selectedProject.actionPlans
      );
      
      const updatedProjects = projects.map(p => {
        if (p.id === selectedProject.id) {
          return { ...p, status: 'completed', aiEvaluation: evalData };
        }
        return p;
      });
      saveProjects(updatedProjects);
    } catch (error) {
      alert("Gagal membuat evaluasi akhir: " + error.message);
    } finally {
      setIsGeneratingEval(false);
    }
  };

  if (!selectedProject) {
    // LIST VIEW
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">PDCA Tracker</h1>
            <p className="text-gray-500 mt-2">Pantau eksekusi rencana aksi dan evaluasi hasil siklus Anda.</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">Belum ada proyek PDCA yang disimpan.</p>
            <p className="text-gray-400 text-sm mt-2">Buat rencana baru lewat PDCA Generator terlebih dahulu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => {
              const progress = getProgress(proj);
              return (
                <div key={proj.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${proj.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {proj.status === 'completed' ? 'Selesai' : 'Aktif'}
                    </span>
                    <button onClick={() => deleteProject(proj.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">{proj.problem}</h3>
                  <p className="text-sm text-gray-500 mb-6 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> 
                    {new Date(proj.dateCreated).toLocaleDateString('id-ID')}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">Progress</span>
                      <span className="text-gray-800 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{width: `${progress}%`}}></div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedProject(proj)}
                    className="w-full mt-2 bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium py-2 rounded-xl transition-colors border border-gray-200"
                  >
                    Buka Tracker
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // DETAIL VIEW
  const allActionsDone = selectedProject.actionPlans?.every(a => a.status === 'done');
  const progress = getProgress(selectedProject);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button 
        onClick={() => setSelectedProject(null)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" /> Kembali ke Daftar
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold mb-3 inline-block ${selectedProject.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {selectedProject.status === 'completed' ? 'Siklus Selesai' : 'Siklus Aktif'}
            </span>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Kendala: {selectedProject.problem}</h1>
            <p className="text-gray-500 text-sm">Dibuat pada {new Date(selectedProject.dateCreated).toLocaleDateString('id-ID')}</p>
          </div>
          
          <div className="w-32 text-right">
             <div className="text-3xl font-bold text-gray-800">{progress}%</div>
             <p className="text-xs text-gray-500 font-medium uppercase">Progress Pelaksanaan</p>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 mb-8">
          <h3 className="font-semibold text-orange-900 flex items-center gap-2 mb-2"><Target className="w-5 h-5"/> Akar Masalah (Root Cause)</h3>
          <div className="text-gray-700 text-sm whitespace-pre-wrap prose prose-sm prose-orange max-w-none">
            <ReactMarkdown>{selectedProject.rcaResult}</ReactMarkdown>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Daftar Rencana Aksi (Act)</h2>
        <div className="space-y-4">
          {selectedProject.actionPlans?.map(plan => (
            <div key={plan.id} className={`p-5 rounded-xl border transition-all ${plan.status === 'done' ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100 shadow-sm'}`}>
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => openEvaluationForm(plan.id)}
                  disabled={selectedProject.status === 'completed'}
                  className={`mt-1 rounded-full p-1 transition-colors ${plan.status === 'done' ? 'text-green-600 bg-green-100' : 'text-gray-300 hover:text-blue-500 bg-gray-50 border border-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>
                <div className="flex-1">
                  <p className={`font-medium text-lg ${plan.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {plan.goal}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"><User className="w-4 h-4"/> {plan.pic}</span>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-md ${new Date(plan.deadline) < new Date() && plan.status !== 'done' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                      <Calendar className="w-4 h-4"/> {plan.deadline}
                    </span>
                  </div>
                  
                  {plan.status === 'done' && plan.evaluation && (
                     <div className="mt-4 bg-white p-3 rounded-lg border border-gray-100 text-sm text-gray-700 relative">
                       <span className="absolute -top-2 left-4 bg-white px-1 text-xs font-semibold text-gray-400">Evaluasi Pelaksanaan</span>
                       {plan.evaluation}
                     </div>
                  )}
                </div>
              </div>

              {/* Evaluation Form Modal/Inline for this action */}
              {evaluatingActionId === plan.id && (
                <div className="mt-4 ml-12 bg-blue-50 p-4 rounded-xl border border-blue-200 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-blue-900 mb-2">Evaluasi Hasil Pelaksanaan (Wajib)</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-3"
                    placeholder="Bagaimana hasilnya? Apakah berjalan sesuai rencana? Adakah kendala saat eksekusi?"
                    value={evaluationText}
                    onChange={(e) => setEvaluationText(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEvaluatingActionId(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">Batal</button>
                    <button 
                      disabled={!evaluationText}
                      onClick={() => submitEvaluation(plan.id, evaluationText)} 
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Simpan & Tandai Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI Final Evaluation Section */}
        {allActionsDone && (
          <div className="mt-12 border-t pt-8">
            {!selectedProject.aiEvaluation ? (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white shadow-lg">
                <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-90" />
                <h2 className="text-2xl font-bold mb-2">Semua Rencana Aksi Telah Selesai!</h2>
                <p className="opacity-90 mb-6 max-w-2xl mx-auto">Sistem siap mengevaluasi hasil siklus ini berdasarkan *Root Cause* awal dan *Evaluasi* dari tiap tindakan. AI akan memberikan saran mana yang harus distandarisasi, diperbarui, atau dibuang pada siklus PDCA Anda selanjutnya.</p>
                <button 
                  onClick={handleGenerateFinalEval}
                  disabled={isGeneratingEval}
                  className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGeneratingEval ? <><RefreshCw className="w-5 h-5 animate-spin"/> Menganalisis...</> : <><Lightbulb className="w-5 h-5"/> Generate Evaluasi Akhir (AI)</>}
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 text-indigo-600" /> Hasil Evaluasi & Rekomendasi AI
                </h2>
                
                <p className="text-gray-700 text-lg mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm leading-relaxed">
                  {selectedProject.aiEvaluation.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Retain */}
                  <div className="bg-white border-t-4 border-t-green-500 rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-green-700 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Dipertahankan (Retain)</h3>
                    <ul className="space-y-3">
                      {selectedProject.aiEvaluation.retain?.length > 0 ? selectedProject.aiEvaluation.retain.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span> {item}
                        </li>
                      )) : <li className="text-sm text-gray-400 italic">Tidak ada</li>}
                    </ul>
                  </div>

                  {/* Update */}
                  <div className="bg-white border-t-4 border-t-yellow-500 rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-yellow-700 mb-4 flex items-center gap-2"><RefreshCw className="w-5 h-5"/> Diperbarui (Update)</h3>
                    <ul className="space-y-3">
                      {selectedProject.aiEvaluation.update?.length > 0 ? selectedProject.aiEvaluation.update.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0"></span> 
                          <button 
                            onClick={() => setConfirmCycle({ item, project: selectedProject })}
                            className="text-sm text-left text-gray-700 hover:text-blue-600 hover:underline transition-colors"
                          >
                            {item}
                          </button>
                        </li>
                      )) : <li className="text-sm text-gray-400 italic">Tidak ada</li>}
                    </ul>
                  </div>

                  {/* Discard */}
                  <div className="bg-white border-t-4 border-t-red-500 rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2"><Trash2 className="w-5 h-5"/> Dibuang (Discard)</h3>
                    <ul className="space-y-3">
                      {selectedProject.aiEvaluation.discard?.length > 0 ? selectedProject.aiEvaluation.discard.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span> {item}
                        </li>
                      )) : <li className="text-sm text-gray-400 italic">Tidak ada</li>}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500 mb-4">Siklus PDCA ini telah selesai. Gunakan rekomendasi di atas untuk merencanakan siklus berikutnya jika masalah belum sepenuhnya tuntas.</p>
                  <button onClick={() => setSelectedProject(null)} className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors">
                    Kembali ke Daftar Proyek
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Continuous PDCA */}
      {confirmCycle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Mulai Siklus PDCA Baru?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Anda akan diarahkan ke PDCA Generator untuk memecahkan kendala berdasarkan hasil evaluasi ini:
              <br /><br />
              <span className="font-semibold text-gray-800 italic">"{confirmCycle.item}"</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmCycle(null)}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  navigate('/pdca-generator', {
                    state: {
                      newCycle: true,
                      problem: confirmCycle.item,
                      context: `Siklus lanjutan dari kendala sebelumnya:\n"${confirmCycle.project.problem}"\n\nKesimpulan RCA:\n${confirmCycle.project.rcaResult}`
                    }
                  });
                }}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
              >
                Mulai Analisis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDCATracker;
