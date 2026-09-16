import React, { useState, useEffect, useRef } from 'react';
import { Target, Activity, Calendar, ChevronUp, ChevronDown, Check, Users, UserPlus, UserMinus, UserCheck } from 'lucide-react';

export default function TargetNpsMonthly() {
    const today = new Date();
    
    // States
    const [targetNps, setTargetNps] = useState(() => Number(localStorage.getItem('calc_nps_monthly_target')) || 85);
    const [promoters, setPromoters] = useState(() => Number(localStorage.getItem('calc_nps_monthly_promoters')) || 0);
    const [passives, setPassives] = useState(() => Number(localStorage.getItem('calc_nps_monthly_passives')) || 0);
    const [detractors, setDetractors] = useState(() => Number(localStorage.getItem('calc_nps_monthly_detractors')) || 0);
    
    const [showRealisticTarget, setShowRealisticTarget] = useState(true);
    
    const [workingDays, setWorkingDays] = useState(() => {
        const stored = localStorage.getItem('calc_nps_monthly_working_days');
        if (stored) return JSON.parse(stored);
        return { 0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true }; 
    });
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem('calc_nps_monthly_target', targetNps);
        localStorage.setItem('calc_nps_monthly_promoters', promoters);
        localStorage.setItem('calc_nps_monthly_passives', passives);
        localStorage.setItem('calc_nps_monthly_detractors', detractors);
        localStorage.setItem('calc_nps_monthly_working_days', JSON.stringify(workingDays));
    }, [targetNps, promoters, passives, detractors, workingDays]);

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleWorkingDay = (dayIndex) => {
        setWorkingDays(prev => ({
            ...prev,
            [dayIndex]: !prev[dayIndex]
        }));
    };

    // Handlers
    const handleNumberChange = (setter) => (e) => {
        const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
        setter(isNaN(val) ? 0 : val);
    };

    // Basic Calcs
    const totalSurveys = promoters + passives + detractors;
    const currentNps = totalSurveys > 0 ? Math.round(((promoters - detractors) / totalSurveys) * 100) : 0;
    
    const npsColor = currentNps >= targetNps ? 'text-green-600' : 'text-amber-500';
    const npsBgColor = currentNps >= targetNps ? 'bg-green-500' : 'bg-amber-500';

    // Required Pure Promoters
    let requiredPurePromoters = 0;
    let isImpossible = false;
    
    if (currentNps < targetNps) {
        if (targetNps === 100 && (passives > 0 || detractors > 0)) {
            isImpossible = true;
        } else {
            requiredPurePromoters = Math.ceil((targetNps * totalSurveys - 100 * (promoters - detractors)) / (100 - targetNps));
        }
    }

    // Working Days Calculation
    const year = today.getFullYear();
    const month = today.getMonth();
    const currentDay = today.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let effectiveTotalDays = 0;
    let effectiveCurrentDay = 0;
    
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dayOfWeek = dateObj.getDay();
        const isWorking = workingDays[dayOfWeek];

        if (isWorking) {
            effectiveTotalDays++;
            if (d <= currentDay) {
                effectiveCurrentDay++;
            }
        }
    }

    const remainingDays = Math.max(0, effectiveTotalDays - effectiveCurrentDay);
    const avgSurveysPerDay = effectiveCurrentDay > 0 ? (totalSurveys / effectiveCurrentDay).toFixed(1) : 0;
    const estimatedRemainingSurveys = Math.round(Number(avgSurveysPerDay) * remainingDays);
    const estimatedTotalSurveys = totalSurveys + estimatedRemainingSurveys;
    
    // Min promoters from remaining surveys
    let minPromotersFromRemaining = 0;
    let projectionImpossible = false;
    
    if (estimatedRemainingSurveys > 0) {
        minPromotersFromRemaining = Math.ceil((targetNps * estimatedTotalSurveys - 100 * (promoters - detractors)) / 100);
        if (minPromotersFromRemaining > estimatedRemainingSurveys) {
            projectionImpossible = true;
        }
        // Cannot be negative
        if (minPromotersFromRemaining < 0) minPromotersFromRemaining = 0;
    } else if (remainingDays === 0 && currentNps < targetNps) {
        projectionImpossible = true;
    }

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm relative overflow-hidden border border-gray-200 text-gray-800 flex flex-col gap-6 w-full animate-in fade-in duration-300">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center w-full relative z-20">
                <div className="flex-1 w-full relative">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-gray-500 font-bold uppercase tracking-widest text-[11px] flex items-center gap-2">
                                <Activity size={14} className="text-primary" /> Target NPS {today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </h3>
                            <div className="flex items-end gap-3 mt-2">
                                <div className="flex items-center">
                                    <span className={`text-5xl font-black ${npsColor}`}>{currentNps}</span>
                                    <span className="text-xl font-bold text-gray-400 ml-1 mt-3">%</span>
                                </div>
                                <span className="text-gray-300 font-bold mb-2 text-3xl">/</span>
                                <div className="flex flex-col">
                                    <div className="flex items-center">
                                        <input 
                                            type="text" 
                                            value={targetNps}
                                            onChange={handleNumberChange(setTargetNps)}
                                            className="bg-transparent text-3xl font-bold text-primary border-b-2 border-dashed border-primary focus:border-primary-dark focus:outline-none w-16 text-center pb-1 transition-colors"
                                            title="Edit Target NPS"
                                        />
                                        <span className="text-primary font-bold text-lg ml-1">%</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">Target</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 relative">
                            <div className="text-right">
                                <span className="text-xs font-bold px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 shadow-sm inline-block">
                                    Sisa {remainingDays} Hari Kerja
                                </span>
                            </div>
                            
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="text-xs font-semibold text-primary hover:text-primary-dark underline underline-offset-2 flex items-center gap-1 mt-1"
                                >
                                    Hari Aktif <ChevronDown size={12}/>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-xl rounded-xl p-3 z-50 w-48 animate-in fade-in zoom-in-95">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pilih Hari Kerja</span>
                                        <div className="space-y-2">
                                            {dayNames.map((dayName, idx) => (
                                                <label key={idx} className="flex items-center gap-2 cursor-pointer group">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${workingDays[idx] ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                                        {workingDays[idx] && <Check size={12} className="text-white" />}
                                                    </div>
                                                    <span className={`text-xs font-medium ${workingDays[idx] ? 'text-gray-800' : 'text-gray-400'}`}>{dayName}</span>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden"
                                                        checked={workingDays[idx]}
                                                        onChange={() => toggleWorkingDay(idx)}
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-3">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-green-600 tracking-wider mb-2 flex items-center gap-1"><UserCheck size={12}/> Promoters</span>
                            <input 
                                type="text"
                                value={promoters}
                                onChange={handleNumberChange(setPromoters)}
                                className="w-full bg-transparent text-center text-3xl font-black text-green-700 focus:outline-none border-b border-transparent focus:border-green-300"
                            />
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 flex items-center gap-1"><UserMinus size={12}/> Passives</span>
                            <input 
                                type="text"
                                value={passives}
                                onChange={handleNumberChange(setPassives)}
                                className="w-full bg-transparent text-center text-3xl font-black text-gray-700 focus:outline-none border-b border-transparent focus:border-gray-300"
                            />
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider mb-2 flex items-center gap-1"><Users size={12}/> Detractors</span>
                            <input 
                                type="text"
                                value={detractors}
                                onChange={handleNumberChange(setDetractors)}
                                className="w-full bg-transparent text-center text-3xl font-black text-red-700 focus:outline-none border-b border-transparent focus:border-red-300"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 shrink-0 z-10 relative">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center min-w-[180px] shadow-sm">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 text-center">Required Target<br/>(Tambahan Minimal)</span>
                        
                        {currentNps >= targetNps ? (
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                    <Check className="text-green-600" size={24} />
                                </div>
                                <span className="text-xs font-bold text-green-600 uppercase tracking-widest text-center">Tercapai!</span>
                            </div>
                        ) : isImpossible ? (
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-black text-red-500 mb-1 text-center">MUSTAHIL</span>
                                <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider text-center leading-tight">Target 100% gagal karena<br/>ada Pas/Det</span>
                            </div>
                        ) : (
                            <>
                                <span className="text-5xl font-black text-primary my-1">{requiredPurePromoters}</span>
                                <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded shadow-sm flex items-center gap-1"><UserPlus size={10}/> Promotor Murni</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full relative z-10 border-t border-dashed border-gray-200 pt-6 flex flex-col">
                <button 
                    onClick={() => setShowRealisticTarget(!showRealisticTarget)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-primary transition-colors uppercase tracking-widest self-center md:self-start bg-gray-50 hover:bg-blue-50 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-blue-200 shadow-sm"
                >
                    <Target size={16} className={showRealisticTarget ? "text-primary" : "text-gray-400"} /> 
                    Proyeksi Realistis Akhir Bulan 
                    {showRealisticTarget ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showRealisticTarget && (
                    <div className="mt-6 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-300 fade-in text-left">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Rata-rata Survey */}
                            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex flex-col relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10"><Activity size={64} /></div>
                                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-2">Rata-rata Responden</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-blue-700 leading-none">{avgSurveysPerDay}</span>
                                    <span className="text-xs font-bold text-blue-500 mb-1">survei/hari</span>
                                </div>
                                <span className="text-[10px] text-blue-500/80 font-medium mt-3">Total {totalSurveys} survei dalam {effectiveCurrentDay} hari kerja</span>
                            </div>

                            {/* Estimasi Tambahan Survey */}
                            <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl flex flex-col relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10"><Calendar size={64} /></div>
                                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-2">Estimasi Tambahan Survei</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-amber-700 leading-none">{estimatedRemainingSurveys}</span>
                                    <span className="text-xs font-bold text-amber-500 mb-1">survei baru</span>
                                </div>
                                <span className="text-[10px] text-amber-500/80 font-medium mt-3">({avgSurveysPerDay} rata-rata × {remainingDays} sisa hari kerja)</span>
                            </div>

                            {/* Required action from remaining surveys */}
                            <div className={`p-5 rounded-xl flex flex-col relative overflow-hidden border ${projectionImpossible ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="absolute -right-4 -bottom-4 opacity-5">
                                    <Target size={64} className={projectionImpossible ? 'text-red-700' : 'text-gray-800'} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${projectionImpossible ? 'text-red-600' : 'text-gray-600'}`}>
                                    Aksi Dibutuhkan (Akhir Bulan)
                                </span>
                                
                                {currentNps >= targetNps && estimatedRemainingSurveys === 0 ? (
                                    <div className="flex-1 flex flex-col justify-center">
                                        <span className="text-lg font-bold text-green-600">Target Sudah Tercapai!</span>
                                    </div>
                                ) : projectionImpossible ? (
                                    <div className="flex-1 flex flex-col justify-center">
                                        <span className="text-xl font-black text-red-600 leading-tight">Mustahil Kejar Target</span>
                                        <span className="text-[10px] text-red-500 mt-2 font-medium">Bahkan jika semua {estimatedRemainingSurveys} survei sisa adalah Promotor, target {targetNps}% tidak akan tercapai.</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-end gap-2 relative z-10">
                                            <span className="text-5xl font-black leading-none text-gray-800">{minPromotersFromRemaining}</span>
                                            <span className="text-xs font-bold text-gray-500 mb-1 leading-tight">Promotor<br/>Minimal</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium mt-3 leading-relaxed relative z-10">
                                            Dari {estimatedRemainingSurveys} estimasi survei sisa, minimal <strong className="text-gray-700">{minPromotersFromRemaining}</strong> harus Promotor (asumsi sisanya Passive) untuk capai {targetNps}%.
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
