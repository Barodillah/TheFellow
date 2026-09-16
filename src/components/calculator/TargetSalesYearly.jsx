import React, { useState, useEffect, useRef } from 'react';
import { Target, TrendingUp, Calendar, CalendarDays, Activity, ChevronUp, ChevronDown, Check } from 'lucide-react';
export default function TargetSalesYearly() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentCalendarMonth = today.getMonth(); // 0-11
    
    // States
    const [fiscalStartMonth, setFiscalStartMonth] = useState(() => Number(localStorage.getItem('calc_sales_fiscal_start')) || 3); // 3 = April
    const [totalTarget, setTotalTarget] = useState(() => Number(localStorage.getItem('calc_sales_fiscal_target')) || 12000);
    const [aktualYTD, setAktualYTD] = useState(() => Number(localStorage.getItem('calc_sales_fiscal_aktual')) || 0);
    const [showRealisticTarget, setShowRealisticTarget] = useState(true);
    const [hoverIndex, setHoverIndex] = useState(null);
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isWorkingDaysOpen, setIsWorkingDaysOpen] = useState(false);
    
    const [workingDays, setWorkingDays] = useState(() => {
        const saved = localStorage.getItem('calc_sales_working_days');
        return saved ? JSON.parse(saved) : {
            0: false, // Minggu
            1: true,  // Senin
            2: true,  // Selasa
            3: true,  // Rabu
            4: true,  // Kamis
            5: true,  // Jumat
            6: true   // Sabtu
        };
    });

    const dropdownRef = React.useRef(null);
    const workingDaysRef = React.useRef(null);
    
    useEffect(() => {
        localStorage.setItem('calc_sales_fiscal_start', fiscalStartMonth);
        localStorage.setItem('calc_sales_fiscal_target', totalTarget);
        localStorage.setItem('calc_sales_fiscal_aktual', aktualYTD);
        localStorage.setItem('calc_sales_working_days', JSON.stringify(workingDays));
    }, [fiscalStartMonth, totalTarget, aktualYTD, workingDays]);
    
    // Handle click outside for dropdowns
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (workingDaysRef.current && !workingDaysRef.current.contains(event.target)) {
                setIsWorkingDaysOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleWorkingDay = (dayIndex) => {
        setWorkingDays(prev => ({...prev, [dayIndex]: !prev[dayIndex]}));
    };
    
    // Determine current fiscal month (1-12)
    let currentFiscalMonthIdx = currentCalendarMonth - fiscalStartMonth;
    if (currentFiscalMonthIdx < 0) currentFiscalMonthIdx += 12;
    const currentFiscalMonth = currentFiscalMonthIdx + 1; // 1 to 12
    
    // Working Days Calculation
    const fiscalStartDate = new Date(currentYear, fiscalStartMonth, 1);
    if (currentCalendarMonth < fiscalStartMonth) {
        fiscalStartDate.setFullYear(currentYear - 1);
    }
    
    const fiscalEndDate = new Date(fiscalStartDate);
    fiscalEndDate.setFullYear(fiscalStartDate.getFullYear() + 1);
    fiscalEndDate.setDate(0); // Last day of previous month
    
    const countWorkingDays = (startDate, endDate) => {
        let count = 0;
        let d = new Date(startDate);
        d.setHours(0,0,0,0);
        let end = new Date(endDate);
        end.setHours(0,0,0,0);
        
        while (d <= end) {
            if (workingDays[d.getDay()]) {
                count++;
            }
            d.setDate(d.getDate() + 1);
        }
        return count;
    };
    
    const elapsedDays = countWorkingDays(fiscalStartDate, today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const remainingDays = countWorkingDays(tomorrow, fiscalEndDate);
    const totalWorkingDays = elapsedDays + remainingDays;

    const avgMonthlyTarget = Math.round(totalTarget / 12);
    
    const handleTotalTargetChange = (e) => {
        const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
        setTotalTarget(isNaN(val) ? 0 : val);
    };
    
    const handleAvgMonthlyTargetChange = (e) => {
        const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
        setTotalTarget(isNaN(val) ? 0 : val * 12);
    };

    const handleAktualYTDChange = (e) => {
        const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
        setAktualYTD(isNaN(val) ? 0 : val);
    };

    const avgActualPerMonth = currentFiscalMonth > 0 ? Math.round(aktualYTD / currentFiscalMonth) : 0;
    const avgActualPerDay = elapsedDays > 0 ? (aktualYTD / elapsedDays).toFixed(1) : 0;

    const remainingMonths = 12 - currentFiscalMonth;
    const targetDeficit = Math.max(0, totalTarget - aktualYTD);
    
    const targetPerRemainingMonth = remainingMonths > 0 ? Math.ceil(targetDeficit / remainingMonths) : targetDeficit;
    const targetPerDay = remainingDays > 0 ? Math.ceil(targetDeficit / remainingDays) : targetDeficit;
    
    const projectedFinal = Math.round(aktualYTD + (avgActualPerDay * remainingDays));
    const realisticProgress = totalTarget > 0 ? Math.min(100, Math.round((projectedFinal / totalTarget) * 100)) : 0;
    
    const idealYTD = avgMonthlyTarget * currentFiscalMonth;
    const statusPacing = aktualYTD - idealYTD;
    
    const requiredIncreasePct = avgActualPerMonth > 0 && targetPerRemainingMonth > 0
        ? Math.round(((targetPerRemainingMonth - avgActualPerMonth) / avgActualPerMonth) * 100)
        : 0;
        
    const progressPercent = totalTarget > 0 ? Math.min(100, Math.round((aktualYTD / totalTarget) * 100)) : 0;

    // SVG Chart
    const svgW = 1000;
    const svgH = 150;
    const svgMaxY = Math.max(totalTarget, projectedFinal) * 1.1 || 100;
    
    const idealPoints = Array.from({length: 12}, (_, i) => {
        const month = i + 1;
        const x = ((month - 1) / 11) * svgW;
        const y = svgH - (((totalTarget / 12) * month) / svgMaxY) * svgH;
        return `${x},${y}`;
    }).join(' ');
    
    const actualPointsArray = Array.from({length: currentFiscalMonth}, (_, i) => {
        const month = i + 1;
        const x = ((month - 1) / 11) * svgW;
        const yVal = month === currentFiscalMonth ? aktualYTD : Math.round((aktualYTD / currentFiscalMonth) * month);
        const y = svgH - (yVal / svgMaxY) * svgH;
        return { x, y, yVal, month };
    });
    const actualPoints = actualPointsArray.map(p => `${p.x},${p.y}`).join(' ');
    
    const projectedPointsArray = [];
    if (currentFiscalMonth <= 12) {
        const lastActual = actualPointsArray[actualPointsArray.length - 1];
        if (lastActual) projectedPointsArray.push(lastActual);
        
        for (let i = currentFiscalMonth + 1; i <= 12; i++) {
            const x = ((i - 1) / 11) * svgW;
            const yVal = Math.round(aktualYTD + (avgActualPerMonth * (i - currentFiscalMonth)));
            const y = svgH - (yVal / svgMaxY) * svgH;
            projectedPointsArray.push({ x, y, yVal, month: i });
        }
    }
    const projectedPoints = projectedPointsArray.map(p => `${p.x},${p.y}`).join(' ');
    
    const requiredPointsArray = [];
    if (currentFiscalMonth <= 12 && remainingMonths > 0) {
        const lastActual = actualPointsArray[actualPointsArray.length - 1];
        if (lastActual) requiredPointsArray.push(lastActual);
        
        for (let i = currentFiscalMonth + 1; i <= 12; i++) {
            const x = ((i - 1) / 11) * svgW;
            const yVal = Math.round(aktualYTD + (targetPerRemainingMonth * (i - currentFiscalMonth)));
            const y = svgH - (yVal / svgMaxY) * svgH;
            requiredPointsArray.push({ x, y, yVal, month: i });
        }
    }
    const requiredPoints = requiredPointsArray.map(p => `${p.x},${p.y}`).join(' ');

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const xAxisLabels = Array.from({length: 12}).map((_, i) => {
        const mIdx = (fiscalStartMonth + i) % 12;
        const yOffset = Math.floor((fiscalStartMonth + i) / 12);
        const y = fiscalStartDate.getFullYear() + yOffset;
        const shortYear = y.toString().slice(-2);
        return `${shortMonthNames[mIdx]} ${shortYear}`;
    });

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm relative overflow-hidden border border-gray-200 text-gray-800 flex flex-col gap-6 w-full animate-in fade-in duration-300">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center w-full relative z-20">
                <div className="flex-1 w-full relative">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-gray-500 font-bold uppercase tracking-widest text-[11px] flex items-center gap-2">
                                <Activity size={14} className="text-primary" /> Aktual YTD / Total Target Tahunan
                            </h3>
                            <div className="flex items-end gap-3 mt-2">
                                <input 
                                    type="text" 
                                    value={aktualYTD}
                                    onChange={handleAktualYTDChange}
                                    className="bg-transparent text-4xl font-black text-gray-900 border-b-2 border-dashed border-gray-300 focus:border-primary focus:outline-none w-24 text-center pb-1 transition-colors"
                                    title="Edit Aktual YTD"
                                />
                                <span className="text-gray-300 font-bold mb-2 text-3xl">/</span>
                                <div className="flex flex-col">
                                    <input 
                                        type="text" 
                                        value={totalTarget}
                                        onChange={handleTotalTargetChange}
                                        className="bg-transparent text-3xl font-bold text-primary border-b-2 border-dashed border-primary focus:border-primary-dark focus:outline-none w-24 text-center pb-1 transition-colors mb-1"
                                        title="Edit Total Target Tahunan"
                                    />
                                    <div className="flex items-center gap-1 mt-1 justify-center">
                                        <span className="text-[9px] text-gray-400 font-medium">Avg:</span>
                                        <input 
                                            type="text"
                                            value={avgMonthlyTarget}
                                            onChange={handleAvgMonthlyTargetChange}
                                            className="bg-transparent text-[10px] font-bold text-gray-500 border-b border-dashed border-gray-300 focus:border-primary focus:outline-none w-10 text-center transition-colors"
                                            title="Edit Target Rata-rata Bulanan"
                                        />
                                        <span className="text-[9px] text-gray-400 font-medium">/bln</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 relative">
                            <div className="text-right">
                                <span className="text-xs font-bold px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 shadow-sm inline-block">
                                    Sisa {remainingMonths} Bulan ({remainingDays} Hr)
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-1">
                                {/* Dropdown Hari Aktif */}
                                <div className="relative" ref={workingDaysRef}>
                                    <button 
                                        onClick={() => setIsWorkingDaysOpen(!isWorkingDaysOpen)}
                                        className="text-xs font-semibold text-primary hover:text-primary-dark underline underline-offset-2 flex items-center gap-1"
                                    >
                                        Hari Aktif <ChevronDown size={12}/>
                                    </button>
                                    {isWorkingDaysOpen && (
                                        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-xl rounded-xl p-3 z-50 w-48 animate-in fade-in zoom-in-95">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pilih Hari Kerja</span>
                                            <div className="space-y-2">
                                                {dayNames.map((day, idx) => (
                                                    <label key={idx} className="flex items-center gap-2 cursor-pointer group">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${workingDays[idx] ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                                            {workingDays[idx] && <Check size={12} className="text-white" />}
                                                        </div>
                                                        <span className={`text-xs font-medium ${workingDays[idx] ? 'text-gray-800' : 'text-gray-400'}`}>{day}</span>
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

                                {/* Dropdown Awal Fiskal */}
                                <div className="relative" ref={dropdownRef}>
                                    <button 
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="text-xs font-semibold text-primary hover:text-primary-dark underline underline-offset-2 flex items-center gap-1"
                                    >
                                        Mulai: {monthNames[fiscalStartMonth]} <ChevronDown size={12}/>
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-xl rounded-xl p-3 z-50 w-48 animate-in fade-in zoom-in-95 h-64 overflow-y-auto">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pilih Bulan Awal</span>
                                            <div className="space-y-1">
                                                {monthNames.map((monthName, idx) => (
                                                    <button 
                                                        key={idx}
                                                        onClick={() => { setFiscalStartMonth(idx); setIsDropdownOpen(false); }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${fiscalStartMonth === idx ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        {monthName}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-4 mt-6 mb-3 overflow-hidden border border-gray-200 shadow-inner">
                        <div className="bg-gradient-to-r from-primary to-blue-400 h-full rounded-full transition-all duration-1000 relative" style={{ width: `${progressPercent}%` }}>
                            <div className="absolute inset-0 bg-white/20 w-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <span className={progressPercent >= 100 ? 'text-green-600' : 'text-gray-500'}>Progress Tahunan: {progressPercent}%</span>
                        <span className="text-primary">Kurang: {targetDeficit} Unit</span>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 shrink-0 z-10 relative mt-4 md:mt-0">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center min-w-[130px] shadow-sm">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 text-center">Target Bulanan<br/>(Sisa {remainingMonths} Bulan)</span>
                        <span className="text-4xl font-black text-amber-500 my-1">{targetPerRemainingMonth}</span>
                        <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">Unit / Bulan</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center min-w-[130px] shadow-sm">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 text-center">Target Harian<br/>(Sisa {remainingDays} Hari)</span>
                        <span className="text-4xl font-black text-primary my-1">{targetPerDay}</span>
                        <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">Unit / Hari</span>
                    </div>
                </div>
            </div>

            {/* Proyeksi Realistis */}
            <div className="w-full relative z-10 border-t border-dashed border-gray-200 pt-6 flex flex-col">
                <button 
                    onClick={() => setShowRealisticTarget(!showRealisticTarget)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-primary transition-colors uppercase tracking-widest self-center md:self-start bg-gray-50 hover:bg-blue-50 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-blue-200 shadow-sm"
                >
                    <Target size={16} className={showRealisticTarget ? "text-primary" : "text-gray-400"} /> 
                    Proyeksi Akhir Fiscal Year
                    {showRealisticTarget ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showRealisticTarget && (
                    <div className="mt-6 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-300 fade-in text-left">
                        {/* Baris Pertama: Proyeksi */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Avg per month actual */}
                            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex flex-col relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10"><Activity size={64} /></div>
                                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-2">Rata-rata Berjalan</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-blue-700 leading-none">{avgActualPerMonth}</span>
                                    <span className="text-xs font-bold text-blue-500 mb-1">unit/bulan</span>
                                </div>
                                <span className="text-[11px] font-bold text-blue-600 mt-2">≈ {avgActualPerDay} unit/hari</span>
                                <span className="text-[10px] text-blue-500/80 font-medium mt-1">Dari {currentFiscalMonth} bulan ({elapsedDays} hari) berlalu</span>
                            </div>

                            {/* Estimated Remaining */}
                            <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl flex flex-col relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10"><Calendar size={64} /></div>
                                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-2">Estimasi Tambahan</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-amber-700 leading-none">{Math.round(avgActualPerDay * remainingDays)}</span>
                                    <span className="text-xs font-bold text-amber-500 mb-1">unit</span>
                                </div>
                                <span className="text-[10px] text-amber-500/80 font-medium mt-3">Sisa harus dikejar dalam {remainingMonths} bulan ({remainingDays} hr)</span>
                            </div>

                            {/* Estimated Total */}
                            <div className={`p-5 rounded-xl flex flex-col relative overflow-hidden border ${projectedFinal >= totalTarget ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="absolute -right-4 -bottom-4 opacity-10">
                                    <Target size={64} className={projectedFinal >= totalTarget ? 'text-green-700' : 'text-red-700'} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${projectedFinal >= totalTarget ? 'text-green-600' : 'text-red-600'}`}>
                                    Proyeksi Total Tahunan
                                </span>
                                <div className="flex items-end gap-2 relative z-10">
                                    <span className={`text-5xl font-black leading-none ${projectedFinal >= totalTarget ? 'text-green-700' : 'text-red-700'}`}>{projectedFinal}</span>
                                    <span className={`text-xs font-bold mb-1 ${projectedFinal >= totalTarget ? 'text-green-500' : 'text-red-500'}`}>unit</span>
                                </div>
                                <div className="mt-4 w-full bg-white/50 rounded-full h-2 overflow-hidden shadow-inner relative z-10">
                                    <div className={`h-full rounded-full ${projectedFinal >= totalTarget ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${realisticProgress}%` }}></div>
                                </div>
                                <div className="flex flex-col mt-3 gap-2 relative z-10">
                                    <span className={`text-[10px] font-bold inline-flex items-center gap-1 ${projectedFinal >= totalTarget ? 'text-green-600' : 'text-red-600'}`}>
                                        {projectedFinal >= totalTarget ? (
                                            <>✨ Target {totalTarget} Akan Tercapai!</>
                                        ) : (
                                            <>⚠️ Beresiko Kurang {totalTarget - projectedFinal} Unit dari Target Tahunan</>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Grafik Bercabang */}
                        <div className="border border-gray-200 bg-gray-50 rounded-xl p-5 mt-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center justify-between">
                                <span>Pacing Tahunan & Required Run Rate</span>
                                <div className="flex gap-4 text-[9px]">
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400"></div> Target YTD</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#1A2744]"></div> Aktual</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Proyeksi Tren</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Required Pacing</span>
                                </div>
                            </span>
                            
                            <div className="flex flex-col md:flex-row gap-6 mt-4">
                                {/* Insight Box */}
                                <div className="md:w-1/3 flex flex-col justify-center space-y-4">
                                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Status Pacing (Bulan {currentFiscalMonth})</div>
                                        <div className={`text-lg font-black ${statusPacing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {statusPacing >= 0 ? `+${statusPacing} Surplus` : `${statusPacing} Defisit`}
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Target Dibutuhkan (Required)</div>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <div className="text-lg font-black text-gray-900 leading-none">{targetPerRemainingMonth} <span className="text-xs font-normal">unit/bulan</span></div>
                                            <div className="text-md font-bold text-primary leading-none">{targetPerDay} <span className="text-[10px] font-normal">unit/hari</span></div>
                                        </div>
                                        {requiredIncreasePct > 0 && (
                                            <div className="text-[10px] text-orange-600 font-bold mt-2">
                                                Perlu naik +{requiredIncreasePct}% dari rata-rata saat ini.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SVG Chart */}
                                <div className="md:w-2/3 h-40 relative">
                                    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                        {/* Ideal Target */}
                                        <polyline points={idealPoints} fill="none" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4" />
                                        
                                        {/* Actual YTD */}
                                        {actualPoints && (
                                            <polyline points={actualPoints} fill="none" stroke="#1A2744" strokeWidth="4" strokeLinejoin="round" />
                                        )}
                                        
                                        {/* Projected Trend */}
                                        {projectedPoints && (
                                            <polyline points={projectedPoints} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 4" strokeLinejoin="round" />
                                        )}
                                        
                                        {/* Required Run Rate */}
                                        {requiredPoints && (
                                            <polyline points={requiredPoints} fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 4" strokeLinejoin="round" />
                                        )}

                                        {/* Hitboxes for Tooltip & Hover points */}
                                        {Array.from({length: 12}).map((_, i) => {
                                            const month = i + 1;
                                            const x = ((month - 1) / 11) * svgW;
                                            const isHovered = hoverIndex === i;
                                            
                                            // Get data points for this month
                                            const actualPoint = actualPointsArray.find(p => p.month === month);
                                            const projPoint = projectedPointsArray.find(p => p.month === month);
                                            const reqPoint = requiredPointsArray.find(p => p.month === month);

                                            return (
                                                <g key={i}>
                                                    {isHovered && (
                                                        <line x1={x} y1={0} x2={x} y2={svgH} stroke="#e5e7eb" strokeWidth="2" strokeDasharray="4 4" />
                                                    )}
                                                    
                                                    {actualPoint && <circle cx={actualPoint.x} cy={actualPoint.y} r={isHovered ? 6 : 4} fill="#1A2744" className="transition-all duration-200" />}
                                                    {projPoint && <circle cx={projPoint.x} cy={projPoint.y} r={isHovered ? 5 : 3} fill="#f59e0b" className="transition-all duration-200" />}
                                                    {reqPoint && <circle cx={reqPoint.x} cy={reqPoint.y} r={isHovered ? 5 : 3} fill="#10b981" className="transition-all duration-200" />}
                                                    
                                                    {/* Invisible interactive area for hover */}
                                                    <rect 
                                                        x={x - (svgW / 22)} 
                                                        y={0} 
                                                        width={svgW / 11} 
                                                        height={svgH} 
                                                        fill="transparent" 
                                                        onMouseEnter={() => setHoverIndex(i)}
                                                        onMouseLeave={() => setHoverIndex(null)}
                                                        className="cursor-crosshair"
                                                    />
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    {/* Tooltip rendered outside SVG for better scaling */}
                                    {hoverIndex !== null && (
                                        <div 
                                            className="absolute top-0 pointer-events-none z-50 transition-all duration-150"
                                            style={{ 
                                                left: `${(hoverIndex / 11) * 100}%`,
                                                transform: hoverIndex > 5 ? 'translateX(-105%)' : 'translateX(5%)'
                                            }}
                                        >
                                            <div className="bg-white/95 backdrop-blur shadow-xl border border-gray-100 rounded-xl p-3.5 w-48 animate-in fade-in zoom-in-95">
                                                <div className="font-bold text-gray-800 mb-2 border-b pb-1.5">{xAxisLabels[hoverIndex]}</div>
                                                <div className="flex justify-between items-center mb-1 text-[11px]">
                                                    <span className="text-gray-500">Target Ideal:</span>
                                                    <span className="font-bold">{Math.round((totalTarget / 12) * (hoverIndex + 1))}</span>
                                                </div>
                                                
                                                {actualPointsArray.find(p => p.month === hoverIndex + 1) && (
                                                    <div className="flex justify-between items-center mb-1 text-[11px]">
                                                        <span className="text-gray-800 font-bold">Aktual:</span>
                                                        <span className="font-black text-[#1A2744]">{actualPointsArray.find(p => p.month === hoverIndex + 1).yVal}</span>
                                                    </div>
                                                )}
                                                
                                                {projectedPointsArray.find(p => p.month === hoverIndex + 1) && !actualPointsArray.find(p => p.month === hoverIndex + 1) && (
                                                    <div className="flex justify-between items-center mb-1 text-[11px]">
                                                        <span className="text-amber-600">Proyeksi Tren:</span>
                                                        <span className="font-bold text-amber-600">{projectedPointsArray.find(p => p.month === hoverIndex + 1).yVal}</span>
                                                    </div>
                                                )}
                                                
                                                {requiredPointsArray.find(p => p.month === hoverIndex + 1) && !actualPointsArray.find(p => p.month === hoverIndex + 1) && (
                                                    <div className="flex justify-between items-center mb-1 text-[11px]">
                                                        <span className="text-green-600">Required:</span>
                                                        <span className="font-bold text-green-600">{requiredPointsArray.find(p => p.month === hoverIndex + 1).yVal}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* X-Axis labels */}
                                    <div className="absolute top-full left-0 w-full flex justify-between mt-2 px-1">
                                        {xAxisLabels.map((label, i) => (
                                            <span key={i} className="text-[9px] font-bold text-gray-400 whitespace-nowrap -ml-2">{label}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
