'use client';

import React from 'react';
import { Clock, ChefHat, RefreshCw, Sparkles, Plus, Calendar, Flame } from 'lucide-react';
import { DayPlan, MealType, Recipe } from '@/lib/types';

interface MealPlannerProps {
  weeklyPlan: DayPlan[];
  selectedDayIdx: number;
  setSelectedDayIdx: (idx: number) => void;
  onOpenMealPicker: (dayIdx: number, mealType: MealType) => void;
  onOpenAiForSlot: (dayIdx: number, mealType: MealType) => void;
  onOpenCookMode: (recipe: Recipe) => void;
  onRemoveMeal: (dayIdx: number, mealType: MealType) => void;
  onToggleFastDay: (dayIdx: number) => void;
}

export const MealPlanner: React.FC<MealPlannerProps> = ({
  weeklyPlan,
  selectedDayIdx,
  setSelectedDayIdx,
  onOpenMealPicker,
  onOpenAiForSlot,
  onOpenCookMode,
  onRemoveMeal,
  onToggleFastDay,
}) => {
  const currentDay = weeklyPlan[selectedDayIdx] || weeklyPlan[0];

  const mealSlots: { type: MealType; title: string; subtitle: string; recipe: Recipe | null | undefined }[] = [
    {
      type: 'breakfast',
      title: 'Frühstück 2.0',
      subtitle: 'Skyr-Bowl, Vollkornstulle mit Pute & Ei oder Overnight Oats',
      recipe: currentDay?.breakfast,
    },
    {
      type: 'lunch',
      title: 'Mittagessen',
      subtitle: 'Der Gesunde Teller: 50% Gemüse, 25% mageres Eiweiß, 25% Carbs',
      recipe: currentDay?.lunch,
    },
    {
      type: 'dinner',
      title: 'Abendbrot',
      subtitle: 'Eiweißreich, sättigend & strikt im Fettbudget (Cremefine 7%)',
      recipe: currentDay?.dinner,
    },
    {
      type: 'snack',
      title: 'Snack & Büro-Option',
      subtitle: 'Frisches Obst (Kaki/Apfel/Beeren) + Handvoll Nüsse oder Proteinriegel',
      recipe: currentDay?.snack,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 7-Days Linear/macOS Style Segmented Switcher */}
      <div className="bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/60 overflow-x-auto scrollbar-none flex items-center gap-1.5">
        {weeklyPlan.map((day, idx) => {
          const isSelected = idx === selectedDayIdx;
          const mealCount = [day.breakfast, day.lunch, day.dinner, day.snack].filter(Boolean).length;
          
          return (
            <button
              key={day.dayName}
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex-1 min-w-[105px] py-2.5 px-3 rounded-xl text-left transition-all duration-150 active:scale-[0.98] ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-black/5'
                  : 'bg-white/80 hover:bg-white text-slate-800 border border-transparent hover:border-slate-200/60'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                {day.dayName.slice(0, 2)}
              </div>
              <div className="text-xs sm:text-sm font-bold truncate tracking-tight">
                {day.dayName}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  mealCount === 4 ? 'bg-[#789A99]' : mealCount > 0 ? 'bg-[#FFD2C2]' : 'bg-slate-300'
                }`} />
                <span className={`text-[10px] font-mono tabular-nums ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {mealCount}/4 Slots
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fast Day Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <span className="text-xs text-slate-500 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          Status für {currentDay?.dayName}:
        </span>
        <button
          onClick={() => onToggleFastDay(selectedDayIdx)}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-150 active:scale-[0.98] ${
            currentDay?.isFastDay
              ? 'bg-[#FFD2C2]/40 text-[#994931] border-[#FFD2C2]'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          {currentDay?.isFastDay ? 'Fastentag Aktiv' : 'Als Entlastungstag markieren'}
        </button>
      </div>

      {/* 4 Meal Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mealSlots.map((slot) => {
          const { recipe } = slot;

          return (
            <div
              key={slot.type}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Slot Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#789A99]">
                        {slot.title}
                      </span>
                      {recipe?.isAiGenerated && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFD2C2]/50 text-[#994931] border border-[#FFD2C2]">
                          <Sparkles className="w-2.5 h-2.5" /> KI-Kreation
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {slot.subtitle}
                    </p>
                  </div>

                  {recipe && (
                    <button
                      onClick={() => onRemoveMeal(selectedDayIdx, slot.type)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Aus Slot entfernen"
                    >
                      Entfernen
                    </button>
                  )}
                </div>

                {/* Slot Content */}
                {recipe ? (
                  <div className="pt-3.5 space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug tracking-tight">
                        {recipe.title}
                      </h4>
                      {recipe.subtitle && (
                        <p className="text-xs text-slate-400 mt-0.5">{recipe.subtitle}</p>
                      )}
                    </div>

                    {/* Macro Indicator Grid */}
                    <div className="grid grid-cols-5 gap-1.5 p-2 rounded-xl bg-slate-50/80 border border-slate-200/60 text-center">
                      <div>
                        <div className="text-[9px] font-medium text-slate-400 uppercase">Kcal</div>
                        <div className="text-xs font-bold font-mono tabular-nums text-slate-900">{recipe.kcal}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-medium text-slate-400 uppercase">Protein</div>
                        <div className="text-xs font-bold font-mono tabular-nums text-emerald-600">{recipe.protein}g</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-medium text-slate-400 uppercase">Fett</div>
                        <div className={`text-xs font-bold font-mono tabular-nums ${recipe.fat > 14 ? 'text-rose-600' : 'text-[#789A99]'}`}>
                          {recipe.fat}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-medium text-slate-400 uppercase">Carbs</div>
                        <div className="text-xs font-bold font-mono tabular-nums text-slate-700">{recipe.carbs}g</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-medium text-slate-400 uppercase">Ballast.</div>
                        <div className="text-xs font-bold font-mono tabular-nums text-slate-700">{recipe.fiber}g</div>
                      </div>
                    </div>

                    {/* Why Nicole Fits Badge */}
                    <div className="text-xs text-[#3D5B5A] bg-[#789A99]/10 p-2.5 rounded-xl border border-[#789A99]/20 leading-relaxed">
                      <span className="font-bold text-[#789A99]">Nicole-Vorgabe: </span>
                      {recipe.whyNicole}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-400 mb-3">Noch keine Mahlzeit für diesen Slot gewählt</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenMealPicker(selectedDayIdx, slot.type)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#789A99] text-white hover:bg-[#658584] transition-all duration-150 active:scale-[0.98] shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Aus Rezeptpool wählen
                      </button>
                      <button
                        onClick={() => onOpenAiForSlot(selectedDayIdx, slot.type)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#FFD2C2]/40 text-[#994931] border border-[#FFD2C2] hover:bg-[#FFD2C2]/60 transition-all duration-150 active:scale-[0.98]"
                      >
                        <Sparkles className="w-3 h-3 text-[#FFD2C2]" /> Mit KI kreieren
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Slot Actions */}
              {recipe && (
                <div className="flex items-center justify-between gap-2 pt-3.5 mt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenMealPicker(selectedDayIdx, slot.type)}
                      className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors active:scale-[0.98]"
                    >
                      <RefreshCw className="w-3 h-3" /> Tauschen
                    </button>
                    <span className="text-xs text-slate-200">•</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#789A99]" /> {recipe.prepMins} Min
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenCookMode(recipe)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all duration-150 active:scale-[0.98] shadow-xs"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-[#FFD2C2]" /> Zubereiten
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
