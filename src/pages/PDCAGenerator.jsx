import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { BrainCircuit, CheckCircle2, ListTodo, Target, Activity, Plus, Trash2, Send, Lightbulb, MessageSquare, Save, ChevronRight } from 'lucide-react';
import { clarifyProblem, suggestWhyAnswer, analyzeRootCause, suggestPlan } from '../services/openRouterService';
import Toast from '../components/shared/Toast';

const PDCAGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Define
  const [problem, setProblem] = useState('');
  const [context, setContext] = useState('');
  const [isProblemClear, setIsProblemClear] = useState(false);
  const [clarificationChat, setClarificationChat] = useState([]);
  const [currentAnswers, setCurrentAnswers] = useState({});

  // Step 2: Analyze
  const [whyNodes, setWhyNodes] = useState([]);
  const [whyUIState, setWhyUIState] = useState({});
  const [rcaResult, setRcaResult] = useState('');

  // Step 3: Plan
  const [parameters, setParameters] = useState([]);
  const [actionPlans, setActionPlans] = useState([]);
  const [suggestedParams, setSuggestedParams] = useState([]);
  const [suggestedPlans, setSuggestedPlans] = useState([]);
  const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [newParam, setNewParam] = useState({ name: '', target: '' });
  const [newPlan, setNewPlan] = useState({ goal: '', pic: '', deadline: '' });

  // Load draft from LocalStorage
  useEffect(() => {
    if (location.state && location.state.newCycle) {
      setProblem(location.state.problem || '');
      setContext(location.state.context || '');
      // Clear other states
      setIsProblemClear(false);
      setClarificationChat([]);
      setWhyNodes([]);
      setWhyUIState({});
      setRcaResult('');
      setParameters([]);
      setActionPlans([]);
      setSuggestedParams([]);
      setSuggestedPlans([]);
      setHasFetchedSuggestions(false);
      setCurrentStep(1);
      
      // Clear draft storage so it doesn't conflict
      localStorage.removeItem('pdca_draft');
      
      // Remove state from history so reload doesn't trigger it again
      window.history.replaceState({}, document.title);
    } else {
      const savedData = localStorage.getItem('pdca_draft');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setProblem(parsed.problem || '');
          setContext(parsed.context || '');
          setIsProblemClear(parsed.isProblemClear || false);
          setClarificationChat(parsed.clarificationChat || []);
          setWhyNodes(parsed.whyNodes || []);
          setWhyUIState(parsed.whyUIState || {});
          setRcaResult(parsed.rcaResult || '');
          setParameters(parsed.parameters || []);
          setActionPlans(parsed.actionPlans || []);
          setSuggestedParams(parsed.suggestedParams || []);
          setSuggestedPlans(parsed.suggestedPlans || []);
          setHasFetchedSuggestions(parsed.hasFetchedSuggestions || false);
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        } catch (e) {
          console.error('Failed to parse draft data', e);
        }
      }
    }
  }, [location.state]);

  // Save draft
  useEffect(() => {
    const dataToSave = {
      problem, context, isProblemClear, clarificationChat,
      whyNodes, whyUIState, rcaResult,
      parameters, actionPlans,
      suggestedParams, suggestedPlans, hasFetchedSuggestions, currentStep
    };
    localStorage.setItem('pdca_draft', JSON.stringify(dataToSave));
  }, [problem, context, isProblemClear, clarificationChat, whyNodes, whyUIState, rcaResult, parameters, actionPlans, suggestedParams, suggestedPlans, hasFetchedSuggestions, currentStep]);

  // ==================== STEP 1 LOGIC ====================
  const handleIdentify = async () => {
    if (!problem) return alert("Kendala Utama harus diisi.");
    setIsLoading(true);

    try {
      const response = await clarifyProblem(problem, context, clarificationChat);
      if (response.isClear) {
        setIsProblemClear(true);
        setClarificationChat(prev => [...prev, { sender: 'ai', content: 'Kendala sudah sangat jelas! Anda bisa lanjut ke tahap berikutnya.' }]);
      } else if (response.questions && response.questions.length > 0) {
        setClarificationChat(prev => [...prev, {
          sender: 'ai',
          content: 'Mohon lengkapi detail berikut agar masalah tidak ambigu:',
          form: response.questions
        }]);
      }
    } catch (error) {
      alert("Gagal melakukan identifikasi: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitClarificationForm = () => {
    let answerText = Object.entries(currentAnswers)
      .map(([key, val]) => {
        if (Array.isArray(val)) {
          let combined = [...val];
          if (currentAnswers[`${key}_lainnya`]) {
            combined.push(currentAnswers[`${key}_lainnya`]);
          }
          if (combined.length === 0) return null;
          return `${key}: ${combined.join(', ')}`;
        }
        if (key.endsWith('_lainnya')) return null; // handled in array check
        if (!val) return null;
        return `${key}: ${val}`;
      })
      .filter(Boolean)
      .join(', ');

    if (!answerText) return alert("Mohon isi minimal satu jawaban.");

    setClarificationChat(prev => [...prev, { sender: 'user', content: answerText }]);
    setCurrentAnswers({});

    setTimeout(() => handleIdentify(), 500);
  };

  // ==================== STEP 2 LOGIC ====================
  useEffect(() => {
    if (currentStep === 2 && whyNodes.length === 0) {
      const rootNode = {
        id: 'root',
        level: 1,
        parentId: null,
        question: `Mengapa kendala utama terjadi?`,
        answers: [],
        status: 'pending'
      };
      setWhyNodes([rootNode]);
      setWhyUIState({ 'root': { suggestions: [], selected: [], manual: [], input: '', loading: false } });
      fetchWhySuggestionsForNode('root', [rootNode]);
    }
  }, [currentStep, whyNodes.length]);

  const fetchWhySuggestionsForNode = async (nodeId, nodes) => {
    setWhyUIState(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], loading: true } }));
    try {
      const node = nodes.find(n => n.id === nodeId);
      const pathContext = getPathContext(nodeId, nodes);
      const suggestions = await suggestWhyAnswer(problem, node.level - 1, pathContext);
      setWhyUIState(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], suggestions, loading: false } }));
    } catch (error) {
      console.error(error);
      setWhyUIState(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], loading: false } }));
    }
  };

  const getPathContext = (nodeId, nodes) => {
    const path = [];
    let curr = nodes.find(n => n.id === nodeId);
    while (curr && curr.parentId) {
      const parent = nodes.find(n => n.id === curr.parentId);
      if (parent) {
        path.unshift({ question: parent.question, answer: curr.question.match(/"(.*?)"/)?.[1] || "..." });
        curr = parent;
      } else break;
    }
    return path;
  };

  const submitWhyNode = async (nodeId) => {
    const ui = whyUIState[nodeId];
    if (!ui) return;
    const finalAnswers = [...ui.selected, ...ui.manual];
    if (finalAnswers.length === 0) return alert('Mohon pilih minimal satu jawaban.');

    const newNodes = whyNodes.map(n => n.id === nodeId ? { ...n, answers: finalAnswers, status: 'completed' } : n);
    setWhyNodes(newNodes);

    const currentNode = newNodes.find(n => n.id === nodeId);
    const levelNodes = newNodes.filter(n => n.level === currentNode.level);
    const allCompleted = levelNodes.every(n => n.status === 'completed');

    if (allCompleted && currentNode.level < 5) {
      const nextLevelNodes = [];
      const newUIState = { ...whyUIState };
      levelNodes.forEach(ln => {
        ln.answers.forEach((ans, idx) => {
          const newId = `${ln.id}_${idx}`;
          nextLevelNodes.push({
            id: newId,
            level: ln.level + 1,
            parentId: ln.id,
            question: `Mengapa "${ans}" terjadi?`,
            answers: [],
            status: 'pending'
          });
          newUIState[newId] = { suggestions: [], selected: [], manual: [], input: '', loading: false };
        });
      });

      const updatedNodes = [...newNodes, ...nextLevelNodes];
      setWhyNodes(updatedNodes);
      setWhyUIState(newUIState);

      nextLevelNodes.forEach(n => fetchWhySuggestionsForNode(n.id, updatedNodes));
    } else if (allCompleted && currentNode.level === 5) {
      generateRootCauseSummary(newNodes);
    }
  };

  const generateRootCauseSummary = async (nodes) => {
    setIsLoading(true);
    try {
      const result = await analyzeRootCause(problem, nodes || whyNodes);
      setRcaResult(result);
    } catch (error) {
      alert("Gagal menyimpulkan akar masalah: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== STEP 3 LOGIC ====================
  useEffect(() => {
    if (currentStep === 3 && rcaResult && !hasFetchedSuggestions) {
      fetchPlanSuggestions();
    }
  }, [currentStep, rcaResult]);

  const fetchPlanSuggestions = async () => {
    setIsLoading(true);
    try {
      const result = await suggestPlan(problem, rcaResult);
      if (result.parameters) setSuggestedParams(result.parameters);
      if (result.actionPlans) setSuggestedPlans(result.actionPlans);
      setHasFetchedSuggestions(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveParam = (param) => {
    setParameters([...parameters, { id: Date.now(), ...param }]);
    setSuggestedParams(suggestedParams.filter(p => p.name !== param.name));
  };

  const approvePlan = (plan) => {
    const today = new Date();
    today.setDate(today.getDate() + (plan.deadlineDays || 7));
    const deadlineStr = today.toISOString().split('T')[0];

    // Default action plan property for tracker: evaluation = '', status = 'pending'
    setActionPlans([...actionPlans, { id: Date.now(), status: 'pending', evaluation: '', goal: plan.goal, pic: plan.pic, deadline: deadlineStr }]);
    setSuggestedPlans(suggestedPlans.filter(p => p.goal !== plan.goal));
  };

  // ==================== SAVE PROJECT ====================
  const handleSavePlan = () => {
    if (actionPlans.length === 0) {
      return alert("Tambahkan setidaknya satu Rencana Aksi sebelum menyimpan Plan.");
    }

    const newProject = {
      id: Date.now(),
      dateCreated: new Date().toISOString(),
      problem,
      context,
      rcaResult,
      parameters,
      actionPlans,
      status: 'active', // active, completed
      aiEvaluation: null
    };

    const existingProjects = JSON.parse(localStorage.getItem('pdca_projects_list') || '[]');
    existingProjects.unshift(newProject); // Add to top
    localStorage.setItem('pdca_projects_list', JSON.stringify(existingProjects));

    // Clear draft
    localStorage.removeItem('pdca_draft');

    setToast({ show: true, message: "Plan berhasil disimpan! Anda akan dialihkan ke Tracker.", type: 'success' });
    setTimeout(() => {
      navigate('/pdca-tracker');
    }, 2000);
  };

  const steps = [
    { id: 1, title: 'Define', icon: <Target className="w-5 h-5" /> },
    { id: 2, title: 'Analyze', icon: <BrainCircuit className="w-5 h-5" /> },
    { id: 3, title: 'Plan', icon: <ListTodo className="w-5 h-5" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">PDCA Generator</h1>
          <p className="text-gray-500 mt-2">Buat Rencana PDCA yang terarah dengan bantuan AI</p>
        </div>
      </div>

      {/* Stepper Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex justify-between items-center relative">
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
        <div
          className="absolute top-1/2 left-10 h-0.5 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-300"
          style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 40px)` }}
        ></div>

        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center bg-white px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentStep >= step.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
              {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
            </div>
            <span className={`text-sm font-medium mt-2 ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'}`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-semibold text-gray-800">1. Identifikasi Kendala</h2>
              {isProblemClear && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Clear</span>}
            </div>

            <div className="space-y-8">
              {clarificationChat.length === 0 ? (
                <div className="space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kendala Utama <span className="text-red-500">*</span></label>
                    <textarea
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-24"
                      placeholder="Misal: NPS 3 bulan terakhir turun..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konteks / Background Tambahan</label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24"
                      placeholder="Misal: Pekerjaan, sektor bisnis, divisi, data nilai yang menurun, dll..."
                    />
                  </div>

                  <button
                    onClick={handleIdentify}
                    disabled={isLoading || !problem}
                    className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Activity className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                    Mulai Identifikasi
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Info Box */}
                  <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex flex-col gap-2 w-full">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kendala Utama</p>
                      <p className="font-medium text-gray-800">{problem}</p>
                    </div>
                    {context && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">Konteks Tambahan</p>
                        <p className="text-sm text-gray-700">{context}</p>
                      </div>
                    )}
                  </div>

                  {/* Chat Interface */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col min-h-[400px]">
                    <div className="flex-1 overflow-y-auto space-y-4 p-2">
                      {clarificationChat.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                            {msg.sender === 'ai' && <BrainCircuit className="w-4 h-4 mb-2 text-blue-500" />}
                            <p className="leading-relaxed">{msg.content}</p>

                            {msg.form && !isProblemClear && idx === clarificationChat.length - 1 && (
                              <div className="mt-5 space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                {msg.form.map(q => (
                                  <div key={q.id}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{q.label}</label>
                                    {q.type === 'text' || q.type === 'number' ? (
                                      <input
                                        type="text"
                                        className="w-full p-3 text-sm rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        onChange={(e) => setCurrentAnswers({ ...currentAnswers, [q.label]: e.target.value })}
                                      />
                                    ) : q.type === 'textarea' ? (
                                      <textarea
                                        className="w-full p-3 text-sm rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none min-h-[80px]"
                                        onChange={(e) => setCurrentAnswers({ ...currentAnswers, [q.label]: e.target.value })}
                                      />
                                    ) : q.type === 'multiselect' ? (
                                      <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                          {q.options?.map(opt => {
                                            const isSelected = (currentAnswers[q.label] || []).includes(opt);
                                            return (
                                              <button
                                                key={opt}
                                                onClick={() => {
                                                  const prev = currentAnswers[q.label] || [];
                                                  const next = isSelected ? prev.filter(x => x !== opt) : [...prev, opt];
                                                  setCurrentAnswers({ ...currentAnswers, [q.label]: next });
                                                }}
                                                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                              >
                                                {opt}
                                              </button>
                                            );
                                          })}
                                        </div>
                                        <input
                                          type="text"
                                          placeholder="Lainnya... (isi manual)"
                                          className="w-full p-2 mt-2 text-xs rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-all"
                                          onChange={(e) => setCurrentAnswers({ ...currentAnswers, [`${q.label}_lainnya`]: e.target.value })}
                                        />
                                      </div>
                                    ) : null}
                                  </div>
                                ))}
                                <button
                                  onClick={submitClarificationForm}
                                  disabled={isLoading}
                                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl text-sm font-semibold transition-colors flex justify-center items-center gap-2"
                                >
                                  {isLoading ? <Activity className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                                  Kirim Jawaban
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm flex gap-2 shadow-sm">
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">2. Root Cause Analysis (Interactive 5 Whys)</h2>

            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-6">
              <p className="font-medium text-gray-800">Kendala Utama:</p>
              <p className="text-gray-600">{problem}</p>
            </div>

            <div className="space-y-6">
              {whyNodes.map(node => {
                const ui = whyUIState[node.id] || { suggestions: [], selected: [], manual: [], input: '', loading: false };
                const isCompleted = node.status === 'completed';

                if (!isCompleted && rcaResult) return null;

                return (
                  <div key={node.id} className={`flex gap-4 items-start ${node.level > 1 ? 'ml-6' : ''}`}>
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold ${isCompleted ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-600 text-white shadow-md'}`}>
                      W{node.level}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className={`bg-white border p-4 rounded-2xl rounded-tl-sm shadow-sm ${isCompleted ? 'border-gray-200' : 'border-blue-100 border-2'}`}>
                        <p className="text-sm font-medium text-gray-800 mb-3">{node.question}</p>

                        {isCompleted ? (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {node.answers.map((ans, i) => (
                              <span key={i} className="bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-lg text-sm border border-indigo-100">{ans}</span>
                            ))}
                          </div>
                        ) : (
                          <>
                            {ui.loading ? (
                              <div className="flex items-center gap-2 text-blue-500 text-sm">
                                <Activity className="w-4 h-4 animate-spin" /> Sedang merumuskan saran...
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {/* AI Suggestions */}
                                {ui.suggestions.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                      <Lightbulb className="w-3 h-3" /> Saran AI:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {ui.suggestions.map((sug, i) => {
                                        const isSelected = ui.selected.includes(sug);
                                        return (
                                          <button
                                            key={i}
                                            onClick={() => {
                                              const newSelected = isSelected ? ui.selected.filter(s => s !== sug) : [...ui.selected, sug];
                                              setWhyUIState({ ...whyUIState, [node.id]: { ...ui, selected: newSelected } });
                                            }}
                                            className={`text-left px-3 py-2 text-sm rounded-lg transition-colors border ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-100/50'}`}
                                          >
                                            {sug}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Manual Inputs */}
                                <div className="space-y-2">
                                  {ui.manual.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {ui.manual.map((m, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-2 text-sm rounded-lg border border-gray-200">
                                          <span>{m}</span>
                                          <button onClick={() => setWhyUIState({ ...whyUIState, [node.id]: { ...ui, manual: ui.manual.filter((_, idx) => idx !== i) } })} className="text-gray-400 hover:text-red-500 ml-1">
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Ketik jawaban (bisa tambah berkali-kali)..."
                                      className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                      value={ui.input}
                                      onChange={(e) => setWhyUIState({ ...whyUIState, [node.id]: { ...ui, input: e.target.value } })}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && ui.input.trim()) {
                                          setWhyUIState({ ...whyUIState, [node.id]: { ...ui, manual: [...ui.manual, ui.input.trim()], input: '' } });
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        if (ui.input.trim()) {
                                          setWhyUIState({ ...whyUIState, [node.id]: { ...ui, manual: [...ui.manual, ui.input.trim()], input: '' } });
                                        }
                                      }}
                                      disabled={!ui.input.trim()}
                                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 w-12 rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors"
                                    >
                                      <Plus className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Submit Node */}
                                <div className="flex justify-end pt-2 border-t border-gray-100">
                                  <button
                                    onClick={() => submitWhyNode(node.id)}
                                    disabled={ui.selected.length === 0 && ui.manual.length === 0}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                                  >
                                    Kirim Jawaban W{node.level} <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {whyNodes.some(n => n.status === 'completed' && n.level >= 3) && !rcaResult && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => generateRootCauseSummary(whyNodes)}
                    disabled={isLoading}
                    className="text-sm text-gray-500 hover:text-blue-600 underline flex items-center gap-2 disabled:opacity-50 disabled:no-underline"
                  >
                    {isLoading ? (
                      <><Activity className="w-4 h-4 animate-spin" /> Sedang merumuskan kesimpulan...</>
                    ) : (
                      "Akhiri 5 Whys & Generate Kesimpulan"
                    )}
                  </button>
                </div>
              )}

              {rcaResult && (
                <div className="mt-8 space-y-6 animate-in zoom-in-95">
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <ListTodo className="w-6 h-6 text-indigo-600" /> Pohon Analisis 5 Whys
                    </h3>
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 overflow-x-auto">
                      {(() => {
                        const renderWhyTree = (nodes, parentId = null, depth = 0) => {
                          const children = nodes.filter(n => n.parentId === parentId && n.status === 'completed');
                          if (children.length === 0) return null;
                          return (
                            <ul className={depth > 0 ? "pl-6 mt-3 space-y-3 border-l-2 border-indigo-200" : "space-y-4"}>
                              {children.map(child => (
                                <li key={child.id} className="relative">
                                  {depth > 0 && <div className="absolute -left-[26px] top-4 w-6 h-[2px] bg-indigo-200" />}
                                  <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                                    <p className="text-sm font-semibold text-indigo-900 mb-2">
                                      <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mr-2">W{child.level}</span>
                                      {child.question}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {child.answers.length > 0 ? child.answers.map((ans, i) => (
                                        <span key={i} className="bg-indigo-50 text-indigo-800 text-xs px-2.5 py-1 rounded-md border border-indigo-100">
                                          {ans}
                                        </span>
                                      )) : (
                                        <span className="text-gray-400 text-xs italic">Belum dijawab</span>
                                      )}
                                    </div>
                                  </div>
                                  {renderWhyTree(nodes, child.id, depth + 1)}
                                </li>
                              ))}
                            </ul>
                          );
                        };
                        return renderWhyTree(whyNodes);
                      })()}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-6 border border-green-200 shadow-sm">
                    <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600" /> Kesimpulan Root Cause
                    </h3>
                    <div className="prose prose-green prose-sm max-w-none text-gray-800">
                      <ReactMarkdown>{rcaResult}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-baseline border-b pb-4">
              <h2 className="text-2xl font-semibold text-gray-800">3. Plan (Parameter & Rencana Aksi)</h2>
              {isLoading && <span className="flex items-center gap-2 text-sm text-blue-600"><Activity className="w-4 h-4 animate-spin" /> Generating Suggestions...</span>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Parameters */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" /> Parameter Kunci
                  </h3>

                  {suggestedParams.length > 0 && (
                    <div className="mb-6 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Saran Parameter AI</p>
                      {suggestedParams.map((p, idx) => (
                        <div key={idx} className="bg-white border border-blue-200 p-3 rounded-xl flex justify-between items-center shadow-sm">
                          <div>
                            <p className="font-medium text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-500">Target: {p.target}</p>
                          </div>
                          <button onClick={() => approveParam(p)} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                            Approve
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Parameter Terpilih</p>
                    {parameters.map(p => (
                      <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-200 flex justify-between items-center group">
                        <div>
                          <p className="font-medium text-gray-800">{p.name}</p>
                          <p className="text-xs font-semibold text-blue-600">Target: {p.target}</p>
                        </div>
                        <button onClick={() => setParameters(parameters.filter(x => x.id !== p.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <input type="text" placeholder="Nama Parameter" className="w-1/2 px-3 py-2 text-sm rounded-lg border outline-none focus:border-blue-500" value={newParam.name} onChange={e => setNewParam({ ...newParam, name: e.target.value })} />
                    <input type="text" placeholder="Target" className="w-1/3 px-3 py-2 text-sm rounded-lg border outline-none focus:border-blue-500" value={newParam.target} onChange={e => setNewParam({ ...newParam, target: e.target.value })} />
                    <button onClick={() => { if (newParam.name) { setParameters([...parameters, { id: Date.now(), ...newParam }]); setNewParam({ name: '', target: '' }); } }} className="flex-1 bg-gray-800 text-white rounded-lg flex items-center justify-center hover:bg-gray-900"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Action Plans */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-gray-600" /> Rencana Aksi
                  </h3>

                  {suggestedPlans.length > 0 && (
                    <div className="mb-6 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Saran Aksi AI</p>
                      {suggestedPlans.map((plan, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 p-3 rounded-xl flex justify-between items-center shadow-sm">
                          <div className="flex-1 mr-3">
                            <p className="font-medium text-sm text-gray-800">{plan.goal}</p>
                            <p className="text-xs text-gray-500">PIC: {plan.pic} • Est. {plan.deadlineDays} Hari</p>
                          </div>
                          <button onClick={() => approvePlan(plan)} className="text-xs bg-gray-200 text-gray-700 hover:bg-gray-800 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                            Approve
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Aksi Terpilih</p>
                    {actionPlans.map(plan => (
                      <div key={plan.id} className="bg-white p-3 rounded-xl border border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm text-gray-800">{plan.goal}</p>
                          <p className="text-xs text-gray-500">PIC: {plan.pic} | DL: {plan.deadline}</p>
                        </div>
                        <button onClick={() => setActionPlans(actionPlans.filter(x => x.id !== plan.id))} className="text-gray-300 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <input type="text" placeholder="Tindakan SMART" className="px-3 py-2 text-sm rounded-lg border outline-none focus:border-blue-500" value={newPlan.goal} onChange={e => setNewPlan({ ...newPlan, goal: e.target.value })} />
                    <div className="flex gap-2">
                      <input type="text" placeholder="PIC" className="flex-1 px-3 py-2 text-sm rounded-lg border outline-none focus:border-blue-500" value={newPlan.pic} onChange={e => setNewPlan({ ...newPlan, pic: e.target.value })} />
                      <input type="date" className="flex-1 px-3 py-2 text-sm rounded-lg border outline-none focus:border-blue-500" value={newPlan.deadline} onChange={e => setNewPlan({ ...newPlan, deadline: e.target.value })} />
                      <button onClick={() => { if (newPlan.goal) { setActionPlans([...actionPlans, { id: Date.now(), status: 'pending', evaluation: '', ...newPlan }]); setNewPlan({ goal: '', pic: '', deadline: '' }); } }} className="w-12 bg-gray-800 text-white rounded-lg flex items-center justify-center hover:bg-gray-900"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm'}`}
        >
          Kembali
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
            disabled={(currentStep === 1 && !isProblemClear) || (currentStep === 2 && !rcaResult)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lanjut <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-md disabled:opacity-50"
            disabled={isLoading || actionPlans.length === 0}
            onClick={handleSavePlan}
          >
            {isLoading ? <><Activity className="w-5 h-5 animate-spin" /> Processing...</> : <><Save className="w-5 h-5" /> Simpan Plan</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default PDCAGenerator;
