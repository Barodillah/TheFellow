import React, { useState } from 'react';
import { Target, TrendingUp, Calendar, CalendarDays } from 'lucide-react';
import TargetSalesMonthly from '../components/calculator/TargetSalesMonthly';
import TargetSalesYearly from '../components/calculator/TargetSalesYearly';
import TargetNpsMonthly from '../components/calculator/TargetNpsMonthly';
import TargetNpsYearly from '../components/calculator/TargetNpsYearly';

export default function CalculatorTarget() {
    const [activeMainTab, setActiveMainTab] = useState('NPS'); // 'NPS' | 'Sales'
    const [activeSubTab, setActiveSubTab] = useState('Monthly'); // 'Monthly' | 'FiscalYear'

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">Kalkulator Target</h1>
                    <p className="text-gray-500 mt-2">Hitung dan proyeksikan pencapaian target bulanan serta tahunan Anda secara akurat.</p>
                </div>
            </div>

            {/* Main Tabs Container */}
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-1 w-full max-w-xl relative mx-auto mt-6">
                <button
                    onClick={() => setActiveMainTab('NPS')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl transition-all duration-300 font-semibold z-10 ${
                        activeMainTab === 'NPS'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                    }`}
                >
                    <Target className="w-5 h-5" />
                    Target NPS
                </button>
                <button
                    onClick={() => setActiveMainTab('Sales')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl transition-all duration-300 font-semibold z-10 ${
                        activeMainTab === 'Sales'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                    }`}
                >
                    <TrendingUp className="w-5 h-5" />
                    Target Sales / Units
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[500px]">
                
                {/* Sub Tabs */}
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                    <button
                        onClick={() => setActiveSubTab('Monthly')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 text-sm font-semibold ${
                            activeSubTab === 'Monthly'
                                ? 'bg-accent/15 text-accent-dark border-accent/30 border shadow-sm'
                                : 'bg-surface-warm text-gray-500 hover:bg-gray-100 border border-transparent hover:text-primary'
                        }`}
                    >
                        <Calendar className={`w-4 h-4 ${activeSubTab === 'Monthly' ? 'text-accent-dark' : 'text-gray-400'}`} />
                        Monthly
                    </button>
                    <button
                        onClick={() => setActiveSubTab('FiscalYear')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 text-sm font-semibold ${
                            activeSubTab === 'FiscalYear'
                                ? 'bg-accent/15 text-accent-dark border-accent/30 border shadow-sm'
                                : 'bg-surface-warm text-gray-500 hover:bg-gray-100 border border-transparent hover:text-primary'
                        }`}
                    >
                        <CalendarDays className={`w-4 h-4 ${activeSubTab === 'FiscalYear' ? 'text-accent-dark' : 'text-gray-400'}`} />
                        Fiscal Year
                    </button>
                </div>

                {/* Main Content */}
                {activeMainTab === 'Sales' && activeSubTab === 'Monthly' && (
                    <TargetSalesMonthly />
                )}
                {activeMainTab === 'Sales' && activeSubTab === 'FiscalYear' && (
                    <TargetSalesYearly />
                )}
                {activeMainTab === 'NPS' && activeSubTab === 'Monthly' && (
                    <TargetNpsMonthly />
                )}
                {activeMainTab === 'NPS' && activeSubTab === 'FiscalYear' && (
                    <TargetNpsYearly />
                )}

            </div>
        </div>
    );
}
