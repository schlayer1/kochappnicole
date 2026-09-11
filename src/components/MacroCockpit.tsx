'use client';

import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  CheckCircle2,
  Award,
  TrendingUp,
  AlertTriangle,
  PieChart,
  Salad,
  Fish,
  Wheat,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { DayPlan, MacroGoals } from '@/lib/types';

interface MacroCockpitProps {
  dayPlan: DayPlan;
  targetGoals: MacroGoals;
  weeklyPlan?: DayPlan[];
}

export const MacroCockpit: React.FC<MacroCockpitProps> = ({ dayPlan, targetGoals, weeklyPlan = [] }) => {
  const [showPlateInfo, setShowPlateInfo] = useState(false);
  const [plateMode, setPlateMode] = useState<'target' | 'week'>('target');
  const [isPlateCollapsed, setIsPlateCollapsed] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fit_plate_collapsed');
      if (saved === 'true') setIsPlateCollapsed(true);
    }
  }, []);

  const meals = [dayPlan.breakfast, dayPlan.lunch, dayPlan.dinner, dayPlan.snack].filter(Boolean);

  const total = meals.reduce(
    (acc, meal) => {
      if (!meal) return acc;
      return {
        calories: acc.calories + meal.kcal,
        protein: acc.protein + meal.protein,
        fat: acc.fat + meal.fat,
        carbs: acc.carbs + meal.carbs,
        fiber: acc.fiber + meal.fiber,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  );

  const calPercent = Math.min(100, Math.round((total.calories / targetGoals.calories) * 100));
  const proteinPercent = Math.min(100, Math.round((total.protein / targetGoals.protein) * 100));
  const fatPercent = Math.min(100, Math.round((total.fat / targetGoals.fat) * 100));
  const carbsPercent = Math.min(100, Math.round((total.carbs / targetGoals.carbs) * 100));
  const fiberPercent = Math.min(100, Math.round((total.fiber / targetGoals.fiber) * 100));

  const isFatWarning = total.fat > targetGoals.fat;
  const isProteinReached = total.protein >= targetGoals.protein;

  // Calculate weekly streak (consecutive days where fat <= 44g and protein >= 85g or meals assigned)
  const streakCount = React.useMemo(() => {
    let streak = 0;
    for (const d of weeklyPlan) {
      const dMeals = [d.breakfast, d.lunch, d.dinner, d.snack].filter(Boolean);
      if (dMeals.length === 0) continue;
      const dFat = dMeals.reduce((sum, m) => sum + (m?.fat || 0), 0);
      const dProtein = dMeals.reduce((sum, m) => sum + (m?.protein || 0), 0);
      if (dFat <= targetGoals.fat && dProtein >= 85) {
        streak++;
      }
    }
    return Math.max(streak, 1);
  }, [weeklyPlan, targetGoals.fat]);

  // Week Analysis Calculation
  const weekStats = React.useMemo(() => {
    if (!weeklyPlan || weeklyPlan.length === 0) {
      return {
        veggiePct: 50,
        proteinPct: 25,
        carbPct: 25,
        totalMeals: 0,
        avgProtein: 0,
        avgFat: 0,
        avgFiber: 0,
        score: 100,
        feedback: 'Noch keine Mahlzeiten für die Woche eingetragen.',
      };
    }

    let sumProtein = 0;
    let sumFat = 0;
    let sumCarbs = 0;
    let sumFiber = 0;
    let totalMeals = 0;
    let daysWithMeals = 0;

    weeklyPlan.forEach((d) => {
      const dMeals = [d.breakfast, d.lunch, d.dinner, d.snack].filter(Boolean);
      if (dMeals.length > 0) daysWithMeals++;
      dMeals.forEach((m) => {
        if (!m) return;
        sumProtein += m.protein;
        sumFat += m.fat;
        sumCarbs += m.carbs;
        sumFiber += m.fiber;
        totalMeals++;
      });
    });

    if (totalMeals === 0) {
      return {
        veggiePct: 50,
        proteinPct: 25,
        carbPct: 25,
        totalMeals: 0,
        avgProtein: 0,
        avgFat: 0,
        avgFiber: 0,
        score: 100,
        feedback: 'Noch keine Mahlzeiten in der Woche eingetragen.',
      };
    }

    const veggieVolume = sumFiber * 7.5;
    const proteinVolume = sumProtein * 1.0;
    const carbFatVolume = sumCarbs * 0.9 + sumFat * 0.6;
    const totalVolume = Math.max(1, veggieVolume + proteinVolume + carbFatVolume);

    let veggiePct = Math.round((veggieVolume / totalVolume) * 100);
    let proteinPct = Math.round((proteinVolume / totalVolume) * 100);
    veggiePct = Math.max(25, Math.min(65, veggiePct));
    proteinPct = Math.max(15, Math.min(45, proteinPct));
    const carbPct = 100 - veggiePct - proteinPct;

    const diff = Math.abs(veggiePct - 50) + Math.abs(proteinPct - 25) + Math.abs(carbPct - 25);
    const score = Math.max(68, Math.min(100, Math.round(100 - diff * 0.9)));

    let feedback = 'Hervorragende Teller-Balance über alle 7 Tage! Eiweiß und Frischeanteil sind ideal abgestimmt.';
    if (veggiePct < 40) {
      feedback = 'Tipp für die Woche: Ergänze bei 1–2 Mahlzeiten noch etwas Rohkost, Brokkoli oder einen Beilagensalat.';
    } else if (proteinPct < 22) {
      feedback = 'Tipp für die Woche: Baue noch etwas mehr Magerquark, Geflügel oder Hülsenfrüchte ein, um die 25% Protein voll zu treffen.';
    } else if (carbPct > 35) {
      feedback = 'Tipp für die Woche: Achte auf das Fettbudget bei Dressings und Soßen, um den Carbs/Fett-Sektor schlank zu halten.';
    }

    return {
      veggiePct,
      proteinPct,
      carbPct,
      totalMeals,
      avgProtein: Math.round(sumProtein / (daysWithMeals || 1)),
      avgFat: Math.round(sumFat / (daysWithMeals || 1)),
      avgFiber: Math.round(sumFiber / (daysWithMeals || 1)),
      score,
      feedback,
    };
  }, [weeklyPlan]);

  const currentVeggiePct = plateMode === 'week' ? weekStats.veggiePct : 50;
  const currentProteinPct = plateMode === 'week' ? weekStats.proteinPct : 25;
  const currentCarbPct = plateMode === 'week' ? weekStats.carbPct : 25;

  const slice1Len = (currentVeggiePct / 100) * 226.2;
  const slice2Len = (currentProteinPct / 100) * 226.2;
  const slice3Len = (currentCarbPct / 100) * 226.2;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all space-y-6">
      {/* Top Header & Status Indicators */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Tages-Nährwertcockpit: {dayPlan.dayName}
            </h2>
            {dayPlan.fastingMode === '16:8' ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                ☕ 16:8 Fastentag
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF2F2] text-[#3D5B5A] border border-[#C5D8D7]/60">
                {meals.length} / 4 Slots belegt
              </span>
            )}

            {/* Streak Pill */}
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1 shadow-xs">
              🔥 {streakCount} Tage Streak
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Echtzeit-Synchronisation mit Vorgaben der Ernährungstagebuchanalyse
          </p>
        </div>

        {/* Linear/Vercel Style Neon Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {isFatWarning ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/25 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Fett-Warnung: {total.fat}g / max. {targetGoals.fat}g
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#789A99]/10 text-[#3D5B5A] border border-[#789A99]/25">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#789A99]" />
              Fett im Zielbereich ({total.fat}g / {targetGoals.fat}g)
            </span>
          )}

          {isProteinReached ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              Protein-Ziel erreicht! ({total.protein}g)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60">
              <TrendingUp className="w-3 h-3 text-slate-400" />
              Noch {Math.max(0, targetGoals.protein - total.protein)}g bis 103g Protein
            </span>
          )}
        </div>
      </div>

      {/* Grid of 5 Macro Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Kalorien */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <Flame className="w-3.5 h-3.5 text-[#FFD2C2]" />
              Kalorien
            </span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {calPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {total.calories}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {targetGoals.calories} kcal</span>
          </div>
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${calPercent}%`,
                backgroundColor: calPercent > 105 ? '#E11D48' : '#789A99',
              }}
            />
          </div>
        </div>

        {/* Protein (Ziel: 103g) */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium text-slate-600">Protein (Prio)</span>
            <span className="font-mono tabular-nums font-semibold text-emerald-600">
              {proteinPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {total.protein}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {targetGoals.protein} g</span>
          </div>
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${proteinPercent}%`,
                backgroundColor: total.protein >= targetGoals.protein ? '#059669' : '#789A99',
              }}
            />
          </div>
        </div>

        {/* Fett (Ziel: max. 44g!) */}
        <div className={`p-3.5 rounded-xl border transition-colors ${
          isFatWarning
            ? 'bg-rose-50/40 border-rose-200'
            : 'bg-slate-50/70 border-slate-200/70 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium text-slate-600">Fett (Max-Limit)</span>
            <span className={`font-mono tabular-nums font-semibold ${isFatWarning ? 'text-rose-600' : 'text-[#789A99]'}`}>
              {fatPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold font-mono tabular-nums ${isFatWarning ? 'text-rose-600' : 'text-slate-900'}`}>
              {total.fat}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {targetGoals.fat} g</span>
          </div>
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${fatPercent}%`,
                backgroundColor: isFatWarning ? '#E11D48' : '#FFD2C2',
              }}
            />
          </div>
        </div>

        {/* Kohlenhydrate (Ziel: 165g) */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium text-slate-600">Kohlenhydrate</span>
            <span className="font-mono tabular-nums font-semibold text-slate-600">
              {carbsPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {total.carbs}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {targetGoals.carbs} g</span>
          </div>
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 bg-[#789A99]"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
        </div>

        {/* Ballaststoffe (Ziel: 25g) */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-colors col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium text-slate-600">Ballaststoffe</span>
            <span className="font-mono tabular-nums font-semibold text-slate-600">
              {fiberPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
              {total.fiber}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {targetGoals.fiber} g</span>
          </div>
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 bg-[#789A99]"
              style={{ width: `${fiberPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Runder Teller-Visualizer "Der gesunde Teller" (Collapsible + Wochen-Analyse) */}
      <div className="rounded-2xl bg-linear-to-br from-slate-50 to-[#EBF2F2]/40 border border-slate-200/80 overflow-hidden transition-all">
        {/* Header Bar with Accordion Toggle */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-2 border-b border-slate-200/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#789A99]/15 flex items-center justify-center text-[#789A99]">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Der gesunde Teller
                </h3>
                {plateMode === 'week' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Wochen-Score: {weekStats.score}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {plateMode === 'target'
                  ? 'Optimal-Verteilung: 50% Gemüse • 25% Protein • 25% Carbs'
                  : `Deine echte Woche: ${weekStats.totalMeals} Mahlzeiten analysiert`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mode Switcher Tabs */}
            <div className="hidden sm:flex items-center bg-white/80 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPlateMode('target')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  plateMode === 'target'
                    ? 'bg-[#789A99] text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Soll-Ziel
              </button>
              <button
                type="button"
                onClick={() => setPlateMode('week')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  plateMode === 'week'
                    ? 'bg-[#789A99] text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Wochen-Analyse
              </button>
            </div>

            {/* Accordion Collapse Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !isPlateCollapsed;
                setIsPlateCollapsed(next);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('fit_plate_collapsed', String(next));
                }
              }}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title={isPlateCollapsed ? 'Teller ausklappen' : 'Teller einklappen'}
            >
              {isPlateCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isPlateCollapsed && (
          <div className="p-4 sm:p-5 pt-3 space-y-4 animate-in fade-in duration-200">
            {/* Mobile Mode Switcher */}
            <div className="flex sm:hidden items-center bg-white/80 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPlateMode('target')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  plateMode === 'target'
                    ? 'bg-[#789A99] text-white shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                Soll-Ziel
              </button>
              <button
                type="button"
                onClick={() => setPlateMode('week')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  plateMode === 'week'
                    ? 'bg-[#789A99] text-white shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                Wochen-Analyse
              </button>
            </div>

            {/* Info or Weekly Feedback banner */}
            {plateMode === 'week' ? (
              <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs leading-relaxed">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 mb-0.5">
                    Wochen-Fazit ({weekStats.score}% Übereinstimmung mit deinem Teller-Ziel):
                  </div>
                  <p className="text-slate-600 text-[11px]">{weekStats.feedback}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white/60 p-2 rounded-xl border border-slate-200/60">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  💡 <strong>Harvard- &amp; Nicole-Prinzip:</strong> 50% Frische/Gemüse, 25% mageres Eiweiß und 25% komplexe Kohlenhydrate.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPlateInfo(!showPlateInfo)}
                  className="text-[11px] text-[#789A99] hover:underline shrink-0 ml-2 font-semibold cursor-pointer"
                >
                  {showPlateInfo ? 'Schließen' : 'Details'}
                </button>
              </div>
            )}

            {showPlateInfo && plateMode === 'target' && (
              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed animate-in fade-in duration-150">
                Für maximale Sättigung bei geringem Fettbudget besteht jede Mahlzeit zur Hälfte aus frischem Gemüse/Salat (50%), zu einem Viertel aus fettarmem Eiweiß (25%) und zu einem Viertel aus ballaststoffreichen Kohlenhydraten (25%).
              </p>
            )}

            <div className="flex flex-col md:flex-row items-center justify-around gap-6 pt-1">
              {/* Stilisierter Runder Teller mit dynamischen Sektoren */}
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-white dark:bg-[#111a1c] shadow-md border-4 border-[#E0EAE9] dark:border-[#1e2c2f] flex items-center justify-center shrink-0">
                {/* Porzellan-Rand Effekt */}
                <div className="absolute inset-1 rounded-full border border-[#C5D8D7]/60 dark:border-[#2D4348] pointer-events-none" />
                <div className="absolute inset-3 rounded-full border border-slate-200/40 dark:border-slate-800 pointer-events-none" />

                {/* Sektoren via SVG Donut */}
                <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
                  {/* Sektor 1: Gemüse / Ballaststoffe -> Aqua Mist (#789A99) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#789A99"
                    strokeWidth="20"
                    strokeDasharray={`${slice1Len} ${226.2 - slice1Len}`}
                    strokeDashoffset="0"
                    className="opacity-95 hover:opacity-100 transition-all duration-300"
                  />
                  {/* Sektor 2: Protein -> Deep Slate (#3D5B5A) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#3D5B5A"
                    strokeWidth="20"
                    strokeDasharray={`${slice2Len} ${226.2 - slice2Len}`}
                    strokeDashoffset={`${-slice1Len}`}
                    className="opacity-95 hover:opacity-100 transition-all duration-300"
                  />
                  {/* Sektor 3: Carbs & Fette -> Peach Ice (#FFD2C2) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#FFD2C2"
                    strokeWidth="20"
                    strokeDasharray={`${slice3Len} ${226.2 - slice3Len}`}
                    strokeDashoffset={`${-(slice1Len + slice2Len)}`}
                    className="opacity-95 hover:opacity-100 transition-all duration-300"
                  />
                </svg>

                {/* Teller Zentrum */}
                <div className="absolute w-14 h-14 rounded-full bg-white dark:bg-[#182629] shadow-xs border border-[#C5D8D7] dark:border-[#2D4348] flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold uppercase text-[#586F73] dark:text-slate-400">
                    {plateMode === 'week' ? 'Ø Woche' : 'Balance'}
                  </span>
                  <span className="text-[11px] font-black text-[#789A99]">
                    {plateMode === 'week' ? `${weekStats.score}%` : '100%'}
                  </span>
                </div>
              </div>

              {/* Legende & Nährstoff-Sektoren */}
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2.5 w-full max-w-md">
                {/* Sektor 1: Gemüse & Frische */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#182629] border border-[#C5D8D7] dark:border-[#2D4348] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#EBF2F2] dark:bg-[#203135] text-[#789A99] flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {currentVeggiePct}%
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Gemüse, Salat &amp; Frische</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {plateMode === 'week' ? `Ø ${weekStats.avgFiber}g Ballaststoffe / Tag` : 'Ziel: 50% der Mahlzeit'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#789A99]">
                    {plateMode === 'week' ? `${currentVeggiePct}%` : `${total.fiber}g heute`}
                  </span>
                </div>

                {/* Sektor 2: Protein */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#182629] border border-[#C5D8D7] dark:border-[#2D4348] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#DEE9E8] dark:bg-[#203135] text-[#3D5B5A] dark:text-[#789A99] flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {currentProteinPct}%
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Mageres Protein (Prio 103g)</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {plateMode === 'week' ? `Ø ${weekStats.avgProtein}g Protein / Tag` : 'Ziel: 25% der Mahlzeit'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#3D5B5A] dark:text-[#789A99]">
                    {plateMode === 'week' ? `${currentProteinPct}%` : `${total.protein}g / 103g`}
                  </span>
                </div>

                {/* Sektor 3: Carbs & Fette */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#182629] border border-[#FFD2C2] dark:border-[#FFD2C2]/30 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#FFF4F0] dark:bg-[#203135] text-[#994931] flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {currentCarbPct}%
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Carbs &amp; gesunde Fette</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {plateMode === 'week' ? `Ø ${weekStats.avgFat}g Fett / Tag (Budget ≤44g)` : 'Ziel: 25% der Mahlzeit'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold ${isFatWarning ? 'text-rose-600' : 'text-[#994931]'}`}>
                    {plateMode === 'week' ? `${currentCarbPct}%` : `${total.fat}g Fett`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
