import React, { useState, useEffect, useRef } from 'react';
import { Target, TrendingUp, Calendar, CalendarDays, Activity, ChevronUp, ChevronDown, Check } from 'lucide-react';

export default function TargetSalesMonthly() {
    const today = new Date();
    // Use stored values if available, or defaults
    const [target, setTarget] = useState(() => Number(localStorage.getItem('calc_sales_monthly_target')) || 100);
    const [aktual, setAktual] = useState(() => Number(localStorage.getItem('calc_sales_monthly_aktual')) || 0);
    const [showRealisticTarget, setShowRealisticTarget] = useState(true);
    
    // Parse working days from localStorage or use default (Mon-Sat true, Sun false)
    const [workingDays, setWorkingDays] = useState(() => {
        const stored = localStorage.getItem('calc_sales_monthly_working_days');
        if (stored) return JSON.parse(stored);
        return { 0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true }; 
    });
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('calc_sales_monthly_target', target);
        localStorage.setItem('calc_sales_monthly_aktual', aktual);
    }, [target, aktual]);

    useEffect(() => {
        localStorage.setItem('calc_sales_monthly_working_days', JSON.stringify(workingDays));
    }, [workingDays]);

    // Handle click outside for dropdown
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

    // Current date calculations
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-11
    const currentDay = today.getDate(); // 1-31
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate effective working days
    let effectiveTotalDays = 0;
    let effectiveCurrentDay = 0;
    
    // Compute day by day to build cumulative target line
    const dailyIdealTarget = [];
    
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
    
    // Now that we have effectiveTotalDays, calculate target per effective day
    const targetPerEffectiveDay = effectiveTotalDays > 0 ? (target / effectiveTotalDays) : 0;

    // Second pass to build ideal points (step function for chart)
    let cumulativeTarget = 0;
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dayOfWeek = dateObj.getDay();
        const isWorking = workingDays[dayOfWeek];

        if (isWorking) {
            cumulativeTarget += targetPerEffectiveDay;
        }
        dailyIdealTarget.push(cumulativeTarget);
    }

    const progressPercent = target > 0 ? Math.min(100, Math.round((aktual / target) * 100)) : 0;
    const targetDeficit = Math.max(0, target - aktual);
    
    // Potensi Booking = target per hari untuk sisa hari
    const targetPerDay = remainingDays > 0 ? Math.ceil(targetDeficit / remainingDays) : targetDeficit;
    
    // Rata-rata berjalan
    const avgPerDayNow = effectiveCurrentDay > 0 ? (aktual / effectiveCurrentDay).toFixed(1) : 0;
    
    // Estimasi tambahan jika rata-rata dipertahankan
    const estimatedRemaining = Math.round(Number(avgPerDayNow) * remainingDays);
    
    // Proyeksi total akhir
    const estimatedTotal = aktual + estimatedRemaining;
    const realisticProgress = target > 0 ? Math.min(100, Math.round((estimatedTotal / target) * 100)) : 0;

    // Status Pacing Hari Ini
    const targetSampaiHariIni = Math.round(dailyIdealTarget[currentDay - 1] || 0);
    const statusPacing = aktual - targetSampaiHariIni; // Surplus or deficit

    // Required Run Rate
    const requiredIncreasePct = avgPerDayNow > 0 && targetPerDay > 0
        ? Math.round(((targetPerDay - avgPerDayNow) / avgPerDayNow) * 100)
        : 0;

    // SVG Chart Calculations for Status Pacing Hari Ini
    const svgW = 1000;
    const svgH = 100;
    const svgMaxY = Math.max(target, aktual) * 1.1 || 100;

    // Ideal pacing line points (stepped based on working days)
    const idealPoints = dailyIdealTarget.map((val, i) => {
        const day = i + 1;
        const x = ((day - 1) / (daysInMonth - 1)) * svgW;
        const y = svgH - ((val / svgMaxY) * svgH);
        return `${x},${y}`;
    }).join(' ');

    // Actual pacing line points
    const cumulativeActual = Array.from({ length: currentDay }, (_, i) => {
        const day = i + 1;
        // Simple linear interpolation to the current actual
        const val = currentDay > 1 ? Math.round((aktual / (currentDay - 1)) * (day - 1)) : aktual;
        return { day, val };
    });

    // Make sure today's value is exactly aktual
    if (cumulativeActual.length > 0) {
        cumulativeActual[cumulativeActual.length - 1].val = aktual;
    }

    const actualPoints = cumulativeActual.map(d => {
        const x = ((d.day - 1) / (daysInMonth - 1)) * svgW;
        const y = svgH - ((d.val / svgMaxY) * svgH);
        return `${x},${y}`;
    }).join(' ');

    const handleTargetChange = (e) => {
        const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
        setTarget(isNaN(val) ? 0 : val);
    };

    const handleAktualChange = (e) => {
        const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
        setAktual(isNaN(val) ? 0 : val);
    };

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
                                <Activity size={14} className="text-primary" /> Aktual / Target {today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </h3>
                            <div className="flex items-end gap-3 mt-2">
                                <input 
                                    type="text" 
                                    value={aktual}
                                    onChange={handleAktualChange}
                                    className="bg-transparent text-4xl font-black text-gray-900 border-b-2 border-dashed border-gray-300 focus:border-primary focus:outline-none w-24 text-center pb-1 transition-colors"
                                    title="Edit Aktual"
                                />
                                <span className="text-gray-300 font-bold mb-2 text-3xl">/</span>
                                <input 
                                    type="text" 
                                    value={target}
                                    onChange={handleTargetChange}
                                    className="bg-transparent text-3xl font-bold text-primary border-b-2 border-dashed border-primary focus:border-primary-dark focus:outline-none w-20 text-center pb-1 transition-colors mb-1"
                                    title="Edit Target"
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 relative">
                            <div className="text-right">
                                <span className="text-xs font-bold px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 shadow-sm inline-block">
                                    Sisa {remainingDays} Hari Kerja
                                </span>
                            </div>
                            
                            {/* Dropdown Hari Aktif */}
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="text-xs font-semibold text-primary hover:text-primary-dark underline underline-offset-2 flex items-center gap-1"
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
                    
                    <div className="w-full bg-gray-100 rounded-full h-4 mt-6 mb-3 overflow-hidden border border-gray-200 shadow-inner">
                        <div className="bg-gradient-to-r from-primary to-blue-400 h-full rounded-full transition-all duration-1000 relative" style={{ width: `${progressPercent}%` }}>
                            <div className="absolute inset-0 bg-white/20 w-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <span className={progressPercent >= 100 ? 'text-green-600' : 'text-gray-500'}>Progress: {progressPercent}%</span>
                        <span className="text-primary">Kurang: {targetDeficit} Unit</span>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 shrink-0 z-10 relative">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center min-w-[150px] shadow-sm">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 text-center">Target Harian<br/>(Sisa {remainingDays} Hari)</span>
                        <span className="text-4xl font-black text-amber-500 my-1">{targetPerDay}</span>
                        <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">Unit / Hari</span>
                    </div>
                </div>
            </div>

            {/* Divider & Proyeksi Realistis */}
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
                        {/* Baris Pertama: Proyeksi Realistis Dasar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Avg per day */}
                            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex flex-col relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10"><Activity size={64} /></div>
                                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-2">Rata-rata Berjalan</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-blue-700 leading-none">{avgPerDayNow}</span>
                                    <span className="text-xs font-bold text-blue-500 mb-1">unit/hari</span>
                                </div>
                                <span className="text-[10px] text-blue-500/80 font-medium mt-3">Dari {effectiveCurrentDay} hari kerja berjalan</span>
                            </div>

                            {/* Estimated Remaining */}
                            <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl flex flex-col relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10"><Calendar size={64} /></div>
                                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-2">Estimasi Tambahan</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-amber-700 leading-none">{estimatedRemaining}</span>
                                    <span className="text-xs font-bold text-amber-500 mb-1">unit</span>
                                </div>
                                <span className="text-[10px] text-amber-500/80 font-medium mt-3">({avgPerDayNow} rata-rata × {remainingDays} sisa hari kerja)</span>
                            </div>

                            {/* Estimated Total */}
                            <div className={`p-5 rounded-xl flex flex-col relative overflow-hidden border ${estimatedTotal >= target ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="absolute -right-4 -bottom-4 opacity-10">
                                    <Target size={64} className={estimatedTotal >= target ? 'text-green-700' : 'text-red-700'} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${estimatedTotal >= target ? 'text-green-600' : 'text-red-600'}`}>
                                    Proyeksi Total Akhir
                                </span>
                                <div className="flex items-end gap-2 relative z-10">
                                    <span className={`text-5xl font-black leading-none ${estimatedTotal >= target ? 'text-green-700' : 'text-red-700'}`}>{estimatedTotal}</span>
                                    <span className={`text-xs font-bold mb-1 ${estimatedTotal >= target ? 'text-green-500' : 'text-red-500'}`}>unit</span>
                                </div>
                                <div className="mt-4 w-full bg-white/50 rounded-full h-2 overflow-hidden shadow-inner relative z-10">
                                    <div className={`h-full rounded-full ${estimatedTotal >= target ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${realisticProgress}%` }}></div>
                                </div>
                                <div className="flex flex-col mt-3 gap-2 relative z-10">
                                    <span className={`text-[10px] font-bold inline-flex items-center gap-1 ${estimatedTotal >= target ? 'text-green-600' : 'text-red-600'}`}>
                                        {estimatedTotal >= target ? (
                                            <>✨ Target {target} Akan Tercapai!</>
                                        ) : (
                                            <>⚠️ Beresiko Kurang {target - estimatedTotal} Unit dari Target ({target})</>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Baris Kedua: Analisis Lanjutan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                            {/* Pacing Harian */}
                            <div className="border border-gray-200 bg-gray-50 rounded-xl p-5 flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                        Status Pacing Hari Ini
                                    </span>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-600 font-medium leading-relaxed">
                                                Idealnya, hingga hari kalender ke-{currentDay} (Hari kerja efektif ke-{effectiveCurrentDay}) total capaian adalah <strong className="text-gray-800">{targetSampaiHariIni} unit</strong>.
                                                <br/>Capaian saat ini <strong className="text-gray-800">{aktual} unit</strong>.
                                            </p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-lg font-black text-xl shrink-0 border ${statusPacing >= 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                            {statusPacing >= 0 ? `+${statusPacing} Surplus` : `${statusPacing} Defisit`}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 w-full">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase mb-2 block">Garis Target Ideal vs Aktual (Kalender Penuh)</span>
                                    <div className="w-full h-16 relative mt-4">
                                        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                            <polyline points={idealPoints} fill="none" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4" />
                                            {actualPoints && (
                                                <polyline points={actualPoints} fill="none" stroke="#1A2744" strokeWidth="3" strokeLinejoin="round" />
                                            )}
                                        </svg>
                                        
                                        {/* Overlay Tooltips for points */}
                                        {cumulativeActual.map((d, idx) => {
                                            const leftPct = ((d.day - 1) / (daysInMonth - 1)) * 100;
                                            const topPct = (1 - (d.val / svgMaxY)) * 100;
                                            const idealForDay = Math.round(dailyIdealTarget[d.day - 1] || 0);
                                            const isLibur = !workingDays[new Date(year, month, d.day).getDay()];
                                            
                                            return (
                                                <div 
                                                    key={d.day}
                                                    className="absolute w-5 h-5 -ml-2.5 -mt-2.5 flex items-center justify-center cursor-pointer group z-10"
                                                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                                                >
                                                    <div className={`w-2 h-2 rounded-full bg-primary transition-all group-hover:scale-150 ${idx === cumulativeActual.length - 1 ? 'scale-125 ring-2 ring-primary/30' : 'opacity-0 group-hover:opacity-100'}`} />
                                                    
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900/95 text-white text-[10px] p-2 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 border border-gray-700">
                                                        <div className="font-bold border-b border-gray-700 pb-1 mb-1 text-gray-200">
                                                            Tanggal {d.day} {isLibur ? '(Libur)' : ''}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-blue-300 font-bold">Aktual: {d.val} unit</span>
                                                            <span className="text-gray-400">Target Ideal: {idealForDay} unit</span>
                                                        </div>
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900/95"></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Required Run Rate */}
                            <div className="border border-gray-200 bg-gray-50 rounded-xl p-5 flex flex-col justify-center">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Required Run Rate (Aksi Dibutuhkan)</span>
                                <p className="text-xs text-gray-600 font-medium leading-relaxed mt-2">
                                    Untuk bisa mengejar sisa target <strong className="text-gray-800">{targetDeficit} unit</strong> di sisa <strong className="text-gray-800">{remainingDays} hari kerja</strong>, dibutuhkan kinerja rata-rata:
                                </p>
                                <div className="my-4 text-center">
                                    <span className="text-4xl font-black text-gray-900">{targetPerDay}</span>
                                    <span className="text-[10px] font-bold text-gray-500 ml-1">unit / hari</span>
                                </div>
                                <div className={`p-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 ${requiredIncreasePct > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                    <Activity size={16} />
                                    {requiredIncreasePct > 0 
                                        ? `Perlu menaikkan kecepatan +${requiredIncreasePct}% dari rata-rata saat ini.` 
                                        : `Kecepatan saat ini sudah melampaui kebutuhan. Pertahankan!`}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
