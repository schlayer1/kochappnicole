'use client';

import React from 'react';
import { Flame, ShieldAlert, CheckCircle2, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { DayPlan, MacroGoals } from '@/lib/types';

interface MacroCockpitProps {
  dayPlan: DayPlan;
  targetGoals: MacroGoals;
}

export const MacroCockpit: React.FC<MacroCockpitProps> = ({ dayPlan, targetGoals }) => {
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

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4">
        
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
    </div>
  );
};
