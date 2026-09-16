import React, { useState, useEffect, useRef } from 'react';
import { Target, Activity, Calendar, CalendarDays, ChevronUp, ChevronDown, Check, Users, UserPlus, UserMinus, UserCheck, Edit2 } from 'lucide-react';

export default function TargetNpsYearly() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentCalendarMonth = today.getMonth(); // 0-11
    
    // States
    const [fiscalStartMonth, setFiscalStartMonth] = useState(() => Number(localStorage.getItem('calc_nps_yearly_fiscal_start')) || 3); // 3 = April
    const [targetNps, setTargetNps] = useState(() => Number(localStorage.getItem('calc_nps_yearly_target')) || 85);
    
    const [monthlyData, setMonthlyData] = useState(() => {
        const stored = localStorage.getItem('calc_nps_yearly_monthly_data');
        if (stored) return JSON.parse(stored);
        return Array.from({length: 12}, () => ({ promoters: 0, passives: 0, detractors: 0 }));
    });
    
    const [showRealisticTarget, setShowRealisticTarget] = useState(true);
    const [showMonthlyTable, setShowMonthlyTable] = useState(false);
    
    const [workingDays, setWorkingDays] = useState(() => {
        const stored = localStorage.getItem('calc_nps_yearly_working_days');
        if (stored) return JSON.parse(stored);
        return { 0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true }; 
    });
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFiscalDropdownOpen, setIsFiscalDropdownOpen] = useState(false);
    const [hoverIndex, setHoverIndex] = useState(null);
    
    const dropdownRef = useRef(null);
    const fiscalDropdownRef = useRef(null);

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem('calc_nps_yearly_target', targetNps);
        localStorage.setItem('calc_nps_yearly_fiscal_start', fiscalStartMonth);
        localStorage.setItem('calc_nps_yearly_working_days', JSON.stringify(workingDays));
        localStorage.setItem('calc_nps_yearly_monthly_data', JSON.stringify(monthlyData));
    }, [targetNps, fiscalStartMonth, workingDays, monthlyData]);

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (fiscalDropdownRef.current && !fiscalDropdownRef.current.contains(event.target)) {
                setIsFiscalDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleWorkingDay = (dayIndex) => {
        setWorkingDays(prev => ({ ...prev, [dayIndex]: !prev[dayIndex] }));
    };

    const handleNumberChange = (setter) => (e) => {
        const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
        setter(isNaN(val) ? 0 : val);
    };

    // Determine current fiscal month (1-12)
    let currentFiscalMonthIdx = currentCalendarMonth - fiscalStartMonth;
    if (currentFiscalMonthIdx < 0) currentFiscalMonthIdx += 12;
    const currentFiscalMonth = currentFiscalMonthIdx + 1; // 1 to 12
    
    // YTD Aggregation
    const promotersYTD = monthlyData.slice(0, currentFiscalMonth).reduce((sum, m) => sum + m.promoters, 0);
    const passivesYTD = monthlyData.slice(0, currentFiscalMonth).reduce((sum, m) => sum + m.passives, 0);
    const detractorsYTD = monthlyData.slice(0, currentFiscalMonth).reduce((sum, m) => sum + m.detractors, 0);

    const handleYtdChange = (field, val) => {
        const newVal = isNaN(val) ? 0 : val;
        const base = Math.floor(newVal / currentFiscalMonth);
        const remainder = newVal % currentFiscalMonth;
        
        setMonthlyData(prev => prev.map((m, i) => {
            if (i < currentFiscalMonth) {
                return { ...m, [field]: base + (i < remainder ? 1 : 0) };
            }
            return m;
        }));
    };

    const handleMonthlyDataChange = (monthIdx, field, val) => {
        const newVal = isNaN(val) ? 0 : val;
        setMonthlyData(prev => {
            const next = [...prev];
            next[monthIdx] = { ...next[monthIdx], [field]: newVal };
            return next;
        });
    };

    // Basic Calcs
    const totalSurveysYTD = promotersYTD + passivesYTD + detractorsYTD;
    const currentNpsYTD = totalSurveysYTD > 0 ? Math.round(((promotersYTD - detractorsYTD) / totalSurveysYTD) * 100) : 0;
    
    const npsColor = currentNpsYTD >= targetNps ? 'text-green-600' : 'text-amber-500';

    // Required Pure Promoters
    let requiredPurePromoters = 0;
    let isImpossible = false;
    
    if (currentNpsYTD < targetNps) {
        if (targetNps === 100 && (passivesYTD > 0 || detractorsYTD > 0)) {
            isImpossible = true;
        } else {
            requiredPurePromoters = Math.ceil((targetNps * totalSurveysYTD - 100 * (promotersYTD - detractorsYTD)) / (100 - targetNps));
        }
    }

    // Working Days Calculation
    const fiscalStartDate = new Date(currentYear, fiscalStartMonth, 1);
    if (currentCalendarMonth < fiscalStartMonth) {
        fiscalStartDate.setFullYear(currentYear - 1);
    }
    const fiscalEndDate = new Date(fiscalStartDate);
    fiscalEndDate.setFullYear(fiscalStartDate.getFullYear() + 1);
    fiscalEndDate.setDate(0); 
    
    const countWorkingDays = (startDate, endDate) => {
        let count = 0;
        let d = new Date(startDate);
        d.setHours(0,0,0,0);
        let end = new Date(endDate);
        end.setHours(0,0,0,0);
        while (d <= end) {
            if (workingDays[d.getDay()]) count++;
            d.setDate(d.getDate() + 1);
        }
        return count;
    };
    
    const elapsedDays = countWorkingDays(fiscalStartDate, today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const remainingDays = Math.max(0, countWorkingDays(tomorrow, fiscalEndDate));
    const remainingMonths = 12 - currentFiscalMonth;

    const avgSurveysPerDay = elapsedDays > 0 ? (totalSurveysYTD / elapsedDays).toFixed(1) : 0;
    const estimatedRemainingSurveys = Math.round(Number(avgSurveysPerDay) * remainingDays);
    const estimatedTotalSurveys = totalSurveysYTD + estimatedRemainingSurveys;
    
    const promoterRate = totalSurveysYTD > 0 ? promotersYTD / totalSurveysYTD : 0;
    const passiveRate = totalSurveysYTD > 0 ? passivesYTD / totalSurveysYTD : 0;
    const detractorRate = totalSurveysYTD > 0 ? detractorsYTD / totalSurveysYTD : 0;
    
    const requiredPerMonth = remainingMonths > 0 ? Math.ceil(requiredPurePromoters / remainingMonths) : 0;
    const requiredPerDay = remainingDays > 0 ? Math.ceil(requiredPurePromoters / remainingDays) : 0;
    
    // Min promoters from remaining surveys
    let minPromotersFromRemaining = 0;
    let projectionImpossible = false;
    
    if (estimatedRemainingSurveys > 0) {
        minPromotersFromRemaining = Math.ceil((targetNps * estimatedTotalSurveys - 100 * (promotersYTD - detractorsYTD)) / 100);
        if (minPromotersFromRemaining > estimatedRemainingSurveys) projectionImpossible = true;
        if (minPromotersFromRemaining < 0) minPromotersFromRemaining = 0;
    } else if (remainingDays === 0 && currentNpsYTD < targetNps) {
        projectionImpossible = true;
    }

    // Chart Data calculations
    const svgW = 1000;
    const svgH = 200;
    
    const requiredMonthlyNPS = estimatedRemainingSurveys > 0 ? Math.min(100, (minPromotersFromRemaining / estimatedRemainingSurveys) * 100) : targetNps;
    
    const chartPoints = monthlyData.map((data, i) => {
        const monthNum = i + 1;
        const isPast = monthNum <= currentFiscalMonth;
        
        let monthProm = data.promoters;
        let monthPass = data.passives;
        let monthDet = data.detractors;
        let monthTotal = monthProm + monthPass + monthDet;
        let monthNps = monthTotal > 0 ? ((monthProm - monthDet) / monthTotal) * 100 : 0;
        
        let projNps = 0;
        let reqNps = 0;

        if (!isPast) {
            // Projected uses YTD average
            projNps = currentNpsYTD;
            // Required uses requiredMonthlyNPS
            reqNps = requiredMonthlyNPS;
        }

        // Calculate YTD NPS up to this month
        let cumProm = monthlyData.slice(0, i+1).reduce((s, m) => s + m.promoters, 0);
        let cumDet = monthlyData.slice(0, i+1).reduce((s, m) => s + m.detractors, 0);
        let cumTotal = monthlyData.slice(0, i+1).reduce((s, m) => s + m.promoters + m.passives + m.detractors, 0);
        let ytdNps = cumTotal > 0 ? ((cumProm - cumDet) / cumTotal) * 100 : 0;
        
        let projYtdNps = ytdNps;
        let reqYtdNps = ytdNps;

        if (!isPast) {
            // If projected (assume future surveys maintain currentNpsYTD) -> YTD stays currentNpsYTD
            projYtdNps = currentNpsYTD;
            
            // If required (assume future surveys perform at requiredMonthlyNPS) -> YTD gradually climbs to targetNps
            // Approximate this by linearly interpolating from current YTD to Target
            const monthsLeft = 12 - currentFiscalMonth;
            const steps = i - currentFiscalMonth + 1;
            reqYtdNps = currentNpsYTD + ((targetNps - currentNpsYTD) / monthsLeft) * steps;
        }

        return {
            monthIndex: i,
            isPast,
            monthTotal, monthNps, ytdNps,
            projNps, reqNps, projYtdNps, reqYtdNps
        };
    });

    const getCoord = (val) => svgH - ((val + 100) / 200) * svgH; // Map -100 to 100 onto 0 to svgH

    const getWorkingDaysInCalendarMonth = (year, monthIdx) => {
        let count = 0;
        const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, monthIdx, d);
            if (workingDays[dateObj.getDay()]) count++;
        }
        return count;
    };

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const xAxisLabels = Array.from({length: 12}).map((_, i) => {
        const mIdx = (fiscalStartMonth + i) % 12;
        const yOffset = Math.floor((fiscalStartMonth + i) / 12);
        const y = fiscalStartDate.getFullYear() + yOffset;
        return `${shortMonthNames[mIdx]} ${y.toString().slice(-2)}`;
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
                                <Activity size={14} className="text-primary" /> Aktual NPS YTD / Target Tahunan
                            </h3>
                            <div className="flex items-end gap-3 mt-2">
                                <div className="flex items-center">
                                    <span className={`text-5xl font-black ${npsColor}`}>{currentNpsYTD}</span>
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
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">Target Tahunan</span>
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
                                                        <input type="checkbox" className="hidden" checked={workingDays[idx]} onChange={() => toggleWorkingDay(idx)}/>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="w-px h-3 bg-gray-300"></div>

                                {/* Dropdown Bulan Mulai */}
                                <div className="relative" ref={fiscalDropdownRef}>
                                    <button 
                                        onClick={() => setIsFiscalDropdownOpen(!isFiscalDropdownOpen)}
                                        className="text-xs font-semibold text-primary hover:text-primary-dark underline underline-offset-2 flex items-center gap-1"
                                    >
                                        Mulai: {shortMonthNames[fiscalStartMonth]} <ChevronDown size={12}/>
                                    </button>
                                    {isFiscalDropdownOpen && (
                                        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-xl rounded-xl p-3 z-50 w-48 animate-in fade-in zoom-in-95 max-h-64 overflow-y-auto">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Bulan Awal Fiscal</span>
                                            <div className="space-y-1">
                                                {monthNames.map((mName, idx) => (
                                                    <button 
                                                        key={idx}
                                                        onClick={() => { setFiscalStartMonth(idx); setIsFiscalDropdownOpen(false); }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${fiscalStartMonth === idx ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        {mName}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-3">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-green-600 tracking-wider mb-2 flex items-center gap-1"><UserCheck size={12}/> Promoters YTD</span>
                            <input 
                                type="text"
                                value={promotersYTD}
                                onChange={(e) => handleYtdChange('promoters', parseInt(e.target.value.replace(/\D/g, ''), 10))}
                                className="w-full bg-transparent text-center text-3xl font-black text-green-700 focus:outline-none border-b border-transparent focus:border-green-300"
                            />
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 flex items-center gap-1"><UserMinus size={12}/> Passives YTD</span>
                            <input 
                                type="text"
                                value={passivesYTD}
                                onChange={(e) => handleYtdChange('passives', parseInt(e.target.value.replace(/\D/g, ''), 10))}
                                className="w-full bg-transparent text-center text-3xl font-black text-gray-700 focus:outline-none border-b border-transparent focus:border-gray-300"
                            />
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider mb-2 flex items-center gap-1"><Users size={12}/> Detractors YTD</span>
                            <input 
                                type="text"
                                value={detractorsYTD}
                                onChange={(e) => handleYtdChange('detractors', parseInt(e.target.value.replace(/\D/g, ''), 10))}
                                className="w-full bg-transparent text-center text-3xl font-black text-red-700 focus:outline-none border-b border-transparent focus:border-red-300"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 shrink-0 z-10 relative">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center min-w-[180px] shadow-sm">
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2 text-center">Required Target<br/>(Tambahan Minimal)</span>
                        
                        {currentNpsYTD >= targetNps ? (
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                    <Check className="text-green-600" size={24} />
                                </div>
                                <span className="text-xs font-bold text-green-600 uppercase tracking-widest text-center">Aman!</span>
                            </div>
                        ) : isImpossible ? (
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-black text-red-500 mb-1 text-center">MUSTAHIL</span>
                                <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider text-center leading-tight">Target 100% gagal</span>
                            </div>
                        ) : (
                            <>
                                <span className="text-5xl font-black text-primary my-1">{requiredPurePromoters}</span>
                                <span className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider bg-white border border-gray-200 px-2 py-1 rounded shadow-sm flex items-center gap-1 mb-3"><UserPlus size={10}/> Promotor Murni Total</span>
                                
                                <div className="flex w-full justify-between items-center bg-white border border-gray-100 rounded-lg p-2 mt-auto">
                                    <div className="flex flex-col items-center flex-1 border-r border-gray-100">
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">Per Bulan</span>
                                        <span className="text-sm font-black text-gray-700">{requiredPerMonth}</span>
                                    </div>
                                    <div className="flex flex-col items-center flex-1">
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">Per Hari</span>
                                        <span className="text-sm font-black text-gray-700">{requiredPerDay}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Toggle Table */}
            <div className="w-full relative z-10 flex justify-center mt-2">
                <button 
                    onClick={() => setShowMonthlyTable(!showMonthlyTable)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary-dark uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100"
                >
                    <Edit2 size={12}/> Edit Rincian Bulanan {showMonthlyTable ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                </button>
            </div>

            {/* Monthly Table */}
            {showMonthlyTable && (
                <div className="relative z-10 bg-gray-50 border border-gray-200 rounded-xl p-4 animate-in slide-in-from-top-2 fade-in overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest p-2 border-b border-gray-200">Bulan</th>
                                <th className="text-[10px] font-bold text-green-600 uppercase tracking-widest p-2 border-b border-gray-200 text-center">Promoters</th>
                                <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest p-2 border-b border-gray-200 text-center">Passives</th>
                                <th className="text-[10px] font-bold text-red-600 uppercase tracking-widest p-2 border-b border-gray-200 text-center">Detractors</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyData.map((data, i) => {
                                const isEst = i >= currentFiscalMonth;
                                let estProm = 0, estPas = 0, estDet = 0, reqProm = 0;
                                
                                if (isEst) {
                                    const mIdx = (fiscalStartMonth + i) % 12;
                                    const yOffset = Math.floor((fiscalStartMonth + i) / 12);
                                    const calYear = fiscalStartDate.getFullYear() + yOffset;
                                    const wDays = getWorkingDaysInCalendarMonth(calYear, mIdx);
                                    const estTotal = Math.round(Number(avgSurveysPerDay) * wDays);
                                    
                                    estProm = Math.round(estTotal * promoterRate);
                                    estPas = Math.round(estTotal * passiveRate);
                                    estDet = Math.round(estTotal * detractorRate);
                                    reqProm = Math.ceil(estTotal * (chartPoints[i].reqNps / 100));
                                }

                                return (
                                    <tr key={i} className={isEst ? 'bg-gray-100/50' : ''}>
                                        <td className="p-2 border-b border-gray-100 text-xs font-bold text-gray-700">
                                            {xAxisLabels[i]} {isEst && <span className="text-[9px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded ml-1 uppercase">Est</span>}
                                        </td>
                                        <td className="p-2 border-b border-gray-100 text-center">
                                            {!isEst ? (
                                                <input type="number" min="0" value={data.promoters} onChange={(e) => handleMonthlyDataChange(i, 'promoters', parseInt(e.target.value, 10))} className="w-16 text-center text-sm font-bold border border-gray-300 rounded p-1"/>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded" title="Proyeksi Tren">Proj: {estProm}</span>
                                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded" title="Required Target">Req: {reqProm}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-2 border-b border-gray-100 text-center">
                                            {!isEst ? (
                                                <input type="number" min="0" value={data.passives} onChange={(e) => handleMonthlyDataChange(i, 'passives', parseInt(e.target.value, 10))} className="w-16 text-center text-sm font-bold border border-gray-300 rounded p-1"/>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded" title="Proyeksi Tren">Proj: {estPas}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-2 border-b border-gray-100 text-center">
                                            {!isEst ? (
                                                <input type="number" min="0" value={data.detractors} onChange={(e) => handleMonthlyDataChange(i, 'detractors', parseInt(e.target.value, 10))} className="w-16 text-center text-sm font-bold border border-gray-300 rounded p-1"/>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded" title="Proyeksi Tren">Proj: {estDet}</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Divider & Proyeksi Realistis */}
            <div className="w-full relative z-10 border-t border-dashed border-gray-200 pt-6 flex flex-col">
                <button 
                    onClick={() => setShowRealisticTarget(!showRealisticTarget)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-primary transition-colors uppercase tracking-widest self-center md:self-start bg-gray-50 hover:bg-blue-50 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-blue-200 shadow-sm"
                >
                    <Target size={16} className={showRealisticTarget ? "text-primary" : "text-gray-400"} /> 
                    Proyeksi Realistis Akhir Tahun 
                    {showRealisticTarget ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showRealisticTarget && (
                    <div className="mt-6 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-300 fade-in text-left">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Rata-rata Survey YTD */}
                            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex flex-col relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10"><Activity size={64} /></div>
                                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-2">Rata-rata Responden YTD</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-blue-700 leading-none">{avgSurveysPerDay}</span>
                                    <span className="text-xs font-bold text-blue-500 mb-1">survei/hari</span>
                                </div>
                                <div className="mt-3 flex justify-between items-center text-[10px] bg-white/60 rounded px-2 py-1">
                                    <span className="font-bold text-green-600">{(promoterRate*100).toFixed(1)}% P</span>
                                    <span className="font-bold text-gray-500">{(passiveRate*100).toFixed(1)}% Pas</span>
                                    <span className="font-bold text-red-600">{(detractorRate*100).toFixed(1)}% D</span>
                                </div>
                                <span className="text-[10px] text-blue-500/80 font-medium mt-1.5">Total {totalSurveysYTD} survei dalam {elapsedDays} hari kerja</span>
                            </div>

                            {/* Estimasi Tambahan Survey Sisa Tahun */}
                            <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl flex flex-col relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10"><CalendarDays size={64} /></div>
                                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-2">Estimasi Survei Sisa Tahun</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-amber-700 leading-none">{estimatedRemainingSurveys}</span>
                                    <span className="text-xs font-bold text-amber-500 mb-1">survei baru</span>
                                </div>
                                <div className="mt-3 flex justify-between items-center text-[10px] bg-white/60 rounded px-2 py-1">
                                    <span className="font-bold text-green-600">{Math.round(estimatedRemainingSurveys * promoterRate)} P</span>
                                    <span className="font-bold text-gray-500">{Math.round(estimatedRemainingSurveys * passiveRate)} Pas</span>
                                    <span className="font-bold text-red-600">{Math.round(estimatedRemainingSurveys * detractorRate)} D</span>
                                </div>
                                <span className="text-[10px] text-amber-500/80 font-medium mt-1.5">({avgSurveysPerDay} rata-rata × {remainingDays} sisa hari kerja)</span>
                            </div>

                            {/* Required action from remaining surveys */}
                            <div className={`p-5 rounded-xl flex flex-col relative overflow-hidden border ${projectionImpossible ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="absolute -right-4 -bottom-4 opacity-5">
                                    <Target size={64} className={projectionImpossible ? 'text-red-700' : 'text-gray-800'} />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${projectionImpossible ? 'text-red-600' : 'text-gray-600'}`}>
                                    Aksi Dibutuhkan (Akhir Tahun)
                                </span>
                                
                                {currentNpsYTD >= targetNps && estimatedRemainingSurveys === 0 ? (
                                    <div className="flex-1 flex flex-col justify-center">
                                        <span className="text-lg font-bold text-green-600">Target Sudah Tercapai!</span>
                                    </div>
                                ) : projectionImpossible ? (
                                    <div className="flex-1 flex flex-col justify-center">
                                        <span className="text-xl font-black text-red-600 leading-tight">Mustahil Kejar Target</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-end gap-2 relative z-10">
                                            <span className="text-5xl font-black leading-none text-gray-800">{minPromotersFromRemaining}</span>
                                            <span className="text-xs font-bold text-gray-500 mb-1 leading-tight">Promotor<br/>Minimal</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium mt-3 leading-relaxed relative z-10">
                                            Dari {estimatedRemainingSurveys} estimasi survei sisa tahun ini, minimal <strong className="text-gray-700">{minPromotersFromRemaining}</strong> harus Promotor untuk capai target tahunan.
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {/* 1 Year Chart */}
                        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="font-bold text-gray-800">Proyeksi Target NPS 1 Tahun</h3>
                                    <p className="text-xs text-gray-500 mt-1">Estimasi pencapaian akhir tahun berdasarkan YTD vs Target Required.</p>
                                </div>
                                <div className="flex flex-wrap gap-3 text-[9px] font-bold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-red-500 dashed"></div> Target Tahunan</div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#1A2744]"></div> Aktual Bulanan</div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Proyeksi Tren (YTD)</div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Required Rate</div>
                                </div>
                            </div>
                            
                            <div className="w-full h-64 relative pb-6 pr-4 pl-8">
                                {/* Grid */}
                                <div className="absolute inset-0 pt-0 pb-6 pl-8 pr-4 flex flex-col justify-between pointer-events-none">
                                    {[100, 50, 0, -50, -100].map(val => (
                                        <div key={val} className="flex items-center w-full relative h-0">
                                            <span className="absolute -left-8 text-[9px] text-gray-400 font-bold w-6 text-right -mt-2">{val}</span>
                                            <div className="flex-1 border-b border-gray-100 border-dashed"></div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* SVG */}
                                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    {/* Target Line */}
                                    <line x1="0" y1={getCoord(targetNps)} x2={svgW} y2={getCoord(targetNps)} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
                                    
                                    {/* Lines and Points */}
                                    {chartPoints.map((p, i) => {
                                        if (i === 0) return null;
                                        const prev = chartPoints[i - 1];
                                        
                                        const x1 = ((prev.monthIndex) / 11) * svgW;
                                        const x2 = ((p.monthIndex) / 11) * svgW;
                                        
                                        return (
                                            <g key={`lines-${i}`}>
                                                {/* Actual Monthly */}
                                                {p.isPast && (
                                                    <line x1={x1} y1={getCoord(prev.monthNps)} x2={x2} y2={getCoord(p.monthNps)} stroke="#1A2744" strokeWidth="2" strokeLinecap="round" />
                                                )}
                                                
                                                {/* Projected Monthly */}
                                                {!p.isPast && prev.isPast && (
                                                    <line x1={x1} y1={getCoord(prev.monthNps)} x2={x2} y2={getCoord(p.projNps)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
                                                )}
                                                {!p.isPast && !prev.isPast && (
                                                    <line x1={x1} y1={getCoord(prev.projNps)} x2={x2} y2={getCoord(p.projNps)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
                                                )}

                                                {/* Required Monthly */}
                                                {!p.isPast && prev.isPast && (
                                                    <line x1={x1} y1={getCoord(prev.monthNps)} x2={x2} y2={getCoord(p.reqNps)} stroke="#22c55e" strokeWidth="2" strokeDasharray="4,4" />
                                                )}
                                                {!p.isPast && !prev.isPast && (
                                                    <line x1={x1} y1={getCoord(prev.reqNps)} x2={x2} y2={getCoord(p.reqNps)} stroke="#22c55e" strokeWidth="2" strokeDasharray="4,4" />
                                                )}
                                            </g>
                                        );
                                    })}
                                    
                                    {/* Points */}
                                    {chartPoints.map((p, i) => {
                                        const cx = ((i) / 11) * svgW;
                                        const isHovered = hoverIndex === i;
                                        return (
                                            <g key={`points-${i}`}>
                                                {p.isPast && <circle cx={cx} cy={getCoord(p.monthNps)} r={isHovered ? 6 : 4} fill="#1A2744" stroke="#fff" strokeWidth="1.5" className="transition-all" />}
                                                {!p.isPast && <circle cx={cx} cy={getCoord(p.projNps)} r={isHovered ? 5 : 3} fill="#f59e0b" />}
                                                {!p.isPast && <circle cx={cx} cy={getCoord(p.reqNps)} r={isHovered ? 5 : 3} fill="#22c55e" />}
                                                
                                                {/* Hitbox */}
                                                <rect 
                                                    x={cx - (svgW / 22)} y={0} width={svgW / 11} height={svgH} fill="transparent"
                                                    onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}
                                                    className="cursor-crosshair"
                                                />
                                            </g>
                                        );
                                    })}
                                </svg>
                                
                                {/* Tooltip */}
                                {hoverIndex !== null && (
                                    <div 
                                        className="absolute top-0 pointer-events-none z-50 transition-all duration-150"
                                        style={{ left: `${(hoverIndex / 11) * 100}%`, transform: hoverIndex > 5 ? 'translateX(-105%)' : 'translateX(5%)' }}
                                    >
                                        <div className="bg-white/95 backdrop-blur shadow-xl border border-gray-100 rounded-xl p-3 w-52 animate-in fade-in zoom-in-95">
                                            <div className="font-bold text-gray-800 mb-2 border-b pb-1 text-[11px] uppercase tracking-widest text-center">
                                                {xAxisLabels[hoverIndex]} {chartPoints[hoverIndex].isPast ? '(Aktual)' : '(Proyeksi)'}
                                            </div>
                                            
                                            {chartPoints[hoverIndex].isPast ? (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span className="text-gray-500">Responden Bulan Ini</span>
                                                        <span className="font-bold text-gray-700">{chartPoints[hoverIndex].monthTotal}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] bg-blue-50 px-1.5 py-1 rounded">
                                                        <span className="font-bold text-[#1A2744]">NPS Aktual</span>
                                                        <span className="font-black text-[#1A2744]">{Math.round(chartPoints[hoverIndex].monthNps)}%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px] bg-purple-50 px-1.5 py-1 rounded mt-1">
                                                        <span className="font-bold text-purple-700">YTD Average</span>
                                                        <span className="font-black text-purple-700">{Math.round(chartPoints[hoverIndex].ytdNps)}%</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {(() => {
                                                        const mIdx = (fiscalStartMonth + hoverIndex) % 12;
                                                        const yOffset = Math.floor((fiscalStartMonth + hoverIndex) / 12);
                                                        const calYear = fiscalStartDate.getFullYear() + yOffset;
                                                        const wDays = getWorkingDaysInCalendarMonth(calYear, mIdx);
                                                        const estTotal = Math.round(Number(avgSurveysPerDay) * wDays);
                                                        const estProm = Math.round(estTotal * promoterRate);
                                                        const estPas = Math.round(estTotal * passiveRate);
                                                        const estDet = Math.round(estTotal * detractorRate);
                                                        const reqProm = Math.ceil(estTotal * (chartPoints[hoverIndex].reqNps / 100));
                                                        
                                                        return (
                                                            <>
                                                                <div className="flex justify-between items-center text-[10px]">
                                                                    <span className="text-gray-500">Estimasi Responden ({wDays} HK)</span>
                                                                    <span className="font-bold text-gray-700">{estTotal}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-[10px] bg-amber-50 px-1.5 py-1 rounded">
                                                                    <span className="font-bold text-amber-600">Proyeksi Tren ({Math.round(chartPoints[hoverIndex].projNps)}%)</span>
                                                                    <span className="font-black text-amber-700">{estProm} P | {estPas} Pas | {estDet} D</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-[10px] bg-green-50 px-1.5 py-1 rounded mt-1">
                                                                    <span className="font-bold text-green-600">Required Target ({Math.round(chartPoints[hoverIndex].reqNps)}%)</span>
                                                                    <span className="font-black text-green-700">{reqProm} Promotor</span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                    <div className="text-[8px] text-gray-400 italic text-center mt-1 leading-tight border-t border-gray-100 pt-1">
                                                        *Required: Target Promotor murni spesifik untuk bulan ini agar YTD mencapai {targetNps}%.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* X-Axis Labels */}
                                <div className="absolute top-full left-8 right-4 flex justify-between mt-2">
                                    {xAxisLabels.map((label, i) => (
                                        <div key={i} className="text-center w-8 -ml-4 flex flex-col items-center">
                                            <span className={`text-[9px] font-black ${i >= currentFiscalMonth ? 'text-gray-400' : 'text-gray-700'}`}>{label.split(' ')[0]}</span>
                                            <span className={`text-[8px] ${i >= currentFiscalMonth ? 'text-gray-300' : 'text-gray-500'}`}>{label.split(' ')[1]}</span>
                                            {i >= currentFiscalMonth && <span className="text-[7px] bg-gray-100 text-gray-400 px-1 rounded uppercase mt-0.5">Est</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                    </div>
                )}
            </div>
        </div>
    );
}
