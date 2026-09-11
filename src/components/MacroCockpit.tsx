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
  Info
} from 'lucide-react';
import { DayPlan, MacroGoals } from '@/lib/types';

interface MacroCockpitProps {
  dayPlan: DayPlan;
  targetGoals: MacroGoals;
  weeklyPlan?: DayPlan[];
}

export const MacroCockpit: React.FC<MacroCockpitProps> = ({ dayPlan, targetGoals, weeklyPlan = [] }) => {
  const [showPlateInfo, setShowPlateInfo] = useState(false);
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

      {/* Runder Teller-Visualizer "Der gesunde Teller" (50% Gemüse, 25% Protein, 25% Carbs) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-slate-50 to-[#EBF2F2]/40 border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#789A99]" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">
              Der gesunde Teller • Nicole-Aufteilung
            </h3>
          </div>
          <button
            onClick={() => setShowPlateInfo(!showPlateInfo)}
            className="text-[11px] text-[#789A99] hover:text-[#3D5B5A] flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showPlateInfo ? 'Ausblenden' : 'Erklärung'}</span>
          </button>
        </div>

        {showPlateInfo && (
          <p className="text-xs text-slate-600 mb-4 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed animate-in fade-in duration-150">
            <strong>Das Harvard- &amp; Nicole-Tellerprinzip:</strong> Für maximale Sättigung bei geringem Fettbudget besteht die Hauptmahlzeit zur Hälfte aus frischem Gemüse/Salat (50%), zu einem Viertel aus fettarmem Eiweiß (25%) und zu einem Viertel aus ballaststoffreichen Kohlenhydraten (25%).
          </p>
        )}

        <div className="flex flex-col md:flex-row items-center justify-around gap-6 pt-2">
          {/* Stilisierter Runder Teller mit Sektoren */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-white shadow-md border-4 border-slate-100 flex items-center justify-center shrink-0">
            {/* Porzellan-Rand Effekt */}
            <div className="absolute inset-1 rounded-full border border-slate-200/80 pointer-events-none" />
            <div className="absolute inset-3 rounded-full border border-slate-200/40 pointer-events-none" />

            {/* Sektoren via SVG Donut */}
            <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
              {/* 50% Gemüse / Ballaststoffe (0 bis 180 Grad) */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="transparent"
                stroke="#10B981"
                strokeWidth="20"
                strokeDasharray="113.1 113.1"
                strokeDashoffset="0"
                className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
              />
              {/* 25% Protein (180 bis 270 Grad) */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="transparent"
                stroke="#0EA5E9"
                strokeWidth="20"
                strokeDasharray="56.5 169.7"
                strokeDashoffset="-113.1"
                className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
              />
              {/* 25% Carbs & Fette im Budget (270 bis 360 Grad) */}
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth="20"
                strokeDasharray="56.5 169.7"
                strokeDashoffset="-169.6"
                className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
              />
            </svg>

            {/* Teller Zentrum */}
            <div className="absolute w-14 h-14 rounded-full bg-white shadow-xs border border-slate-200 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold uppercase text-slate-400">Balance</span>
              <span className="text-[11px] font-black text-emerald-700">100%</span>
            </div>
          </div>

          {/* Legende & Nährstoff-Sektoren */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2.5 w-full max-w-md">
            {/* Sektor 1 */}
            <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Salad className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">50% Gemüse &amp; Salat</div>
                  <div className="text-[10px] text-slate-500">Ballaststoffe, Volumen, Vitamine</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700">{total.fiber}g Ballastst.</span>
            </div>

            {/* Sektor 2 */}
            <div className="p-2.5 rounded-xl bg-white border border-sky-200/80 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Fish className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">25% Protein (Prio 1)</div>
                  <div className="text-[10px] text-slate-500">Quark, Geflügel, Fisch, Hülsenfrüchte</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-700">{total.protein}g / 103g</span>
            </div>

            {/* Sektor 3 */}
            <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Wheat className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">25% Carbs &amp; Fette</div>
                  <div className="text-[10px] text-slate-500">Vollkorn, Haferflocken, max. 44g Fett</div>
                </div>
              </div>
              <span className={`text-xs font-mono font-bold ${isFatWarning ? 'text-rose-600' : 'text-amber-700'}`}>
                {total.fat}g Fett
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
