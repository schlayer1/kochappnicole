'use client';

import React, { useState } from 'react';
import {
  Clock,
  ChefHat,
  RefreshCw,
  Sparkles,
  Plus,
  Calendar,
  Dices,
  Printer,
  Copy,
  Check,
  Flame,
  ArrowRight,
  Utensils,
  Users
} from 'lucide-react';
import { DayPlan, MealType, Recipe } from '@/lib/types';
import { RecipeImage } from './RecipeImage';

interface MealPlannerProps {
  weeklyPlan: DayPlan[];
  selectedDayIdx: number;
  setSelectedDayIdx: (idx: number) => void;
  customImages?: Record<string, string>;
  onOpenMealPicker: (dayIdx: number, mealType: MealType) => void;
  onOpenAiForSlot: (dayIdx: number, mealType: MealType) => void;
  onOpenCookMode: (recipe: Recipe) => void;
  onRemoveMeal: (dayIdx: number, mealType: MealType) => void;
  onToggleFastDay: (dayIdx: number) => void;
  onAutoGeneratePlan?: () => void;
  onMealPrepTomorrow?: (dayIdx: number, recipe: Recipe) => void;
  onOpenImagePicker?: (recipe: Recipe) => void;
  onUpdateServings?: (dayIdx: number, slot: MealType, servings: number) => void;
}

export const MealPlanner: React.FC<MealPlannerProps> = ({
  weeklyPlan,
  selectedDayIdx,
  setSelectedDayIdx,
  customImages,
  onOpenMealPicker,
  onOpenAiForSlot,
  onOpenCookMode,
  onRemoveMeal,
  onToggleFastDay,
  onAutoGeneratePlan,
  onMealPrepTomorrow,
  onOpenImagePicker,
  onUpdateServings,
}) => {
  const [copiedSlot, setCopiedSlot] = useState<string | null>(null);
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
      subtitle: 'Frisches Obst (Kaki/Apfel/Beeren) + Nüsse oder Magerquark',
      recipe: currentDay?.snack,
    },
  ];

  const handleMealPrep = (recipe: Recipe, slotType: string) => {
    if (onMealPrepTomorrow) {
      onMealPrepTomorrow(selectedDayIdx, recipe);
      const slotKey = `${selectedDayIdx}-${slotType}`;
      setCopiedSlot(slotKey);
      setTimeout(() => setCopiedSlot(null), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Action Bar: Auto-Planer & Print/PDF */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] print:hidden">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Wochenplan-Zentrale
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatisiere deine Woche oder drucke den fertigen Aushang für den Kühlschrank
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAutoGeneratePlan && (
            <button
              onClick={onAutoGeneratePlan}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] transition-all active:scale-[0.98]"
              title="Stellt die 7 Tage automatisch makro-perfekt aus den 160 Rezepten zusammen"
            >
              <Dices className="w-4 h-4 text-[#789A99]" />
              Woche auto-planen
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all active:scale-[0.98]"
            title="Druckfertige A4-Ansicht des Wochenplans für die Kühlschranktür"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Plan drucken / PDF
          </button>
        </div>
      </div>

      {/* 7-Days Linear/macOS Style Segmented Switcher */}
      <div className="bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/60 overflow-x-auto scrollbar-none flex items-center gap-1.5 print:hidden">
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
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.02)] print:hidden">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        {mealSlots.map((slot) => {
          const { recipe } = slot;
          const isCopied = copiedSlot === `${selectedDayIdx}-${slot.type}`;

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
                    <div className="flex items-start gap-3">
                      <div
                        onClick={() => onOpenImagePicker && onOpenImagePicker(recipe)}
                        className={`w-13 h-13 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 shadow-xs bg-slate-100 ${
                          onOpenImagePicker ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                        }`}
                        title={onOpenImagePicker ? 'Klicken zum Ändern des Fotos' : undefined}
                      >
                        <RecipeImage
                          recipe={recipe}
                          aspectRatio="square"
                          customImages={customImages}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug tracking-tight line-clamp-2">
                            {recipe.title}
                          </h4>
                          
                          {/* Portion Switcher */}
                          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shrink-0">
                            {[1, 2, 4].map((srv) => {
                              const activeSrv = currentDay?.servings?.[slot.type] || 1;
                              return (
                                <button
                                  key={srv}
                                  onClick={() => onUpdateServings && onUpdateServings(selectedDayIdx, slot.type, srv)}
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-all ${
                                    activeSrv === srv
                                      ? 'bg-[#789A99] text-white shadow-xs'
                                      : 'text-slate-400 hover:text-slate-800'
                                  }`}
                                  title={`${srv} Portion${srv > 1 ? 'en' : ''}`}
                                >
                                  {srv}x
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {recipe.subtitle && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{recipe.subtitle}</p>
                        )}
                      </div>
                    </div>

                    {/* Meal-Prep Prompt when 2 portions selected */}
                    {(currentDay?.servings?.[slot.type] || 1) === 2 && (slot.type === 'dinner' || slot.type === 'lunch') && onMealPrepTomorrow && (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-900 text-xs">
                        <span className="flex items-center gap-1.5 font-medium">
                          <ChefHat className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>2 Portionen gekocht:</span>
                        </span>
                        <button
                          onClick={() => handleMealPrep(recipe, slot.type)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors shadow-2xs cursor-pointer"
                        >
                          Portion 2 für morgen vormerken
                        </button>
                      </div>
                    )}

                    {/* Macro Indicator Grid */}
                    <div className="grid grid-cols-5 gap-1.5 p-2 rounded-xl bg-slate-50/80 border border-slate-200/60 text-center">
                      <div>
                        <div className="text-[9px] font-medium text-slate-400 uppercase">Kcal</div>
                        <div className="text-xs font-bold font-mono tabular-nums text-slate-900">
                          {recipe.kcal * (currentDay?.servings?.[slot.type] || 1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-medium text-slate-400 uppercase">Protein</div>
                        <div className="text-xs font-bold font-mono tabular-nums text-emerald-600">
                          {recipe.protein * (currentDay?.servings?.[slot.type] || 1)}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-medium text-slate-400 uppercase">Fett</div>
                        <div className={`text-xs font-bold font-mono tabular-nums ${recipe.fat > 14 ? 'text-rose-600' : 'text-[#789A99]'}`}>
                          {recipe.fat * (currentDay?.servings?.[slot.type] || 1)}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-medium text-slate-400 uppercase">Carbs</div>
                        <div className="text-xs font-bold font-mono tabular-nums text-slate-700">
                          {recipe.carbs * (currentDay?.servings?.[slot.type] || 1)}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-medium text-slate-400 uppercase">Ballast.</div>
                        <div className="text-xs font-bold font-mono tabular-nums text-slate-700">
                          {recipe.fiber * (currentDay?.servings?.[slot.type] || 1)}g
                        </div>
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
                        <Sparkles className="w-3.5 h-3.5 text-[#FFD2C2]" /> Mit KI kreieren
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Slot Actions */}
              {recipe && (
                <div className="flex items-center justify-between gap-2 pt-3.5 mt-3 border-t border-slate-100 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenMealPicker(selectedDayIdx, slot.type)}
                      className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors active:scale-[0.98]"
                    >
                      <RefreshCw className="w-3 h-3" /> Tauschen
                    </button>

                    {/* Meal Prep Button: Vorkochen für morgen */}
                    {(slot.type === 'dinner' || slot.type === 'lunch') && onMealPrepTomorrow && (
                      <button
                        onClick={() => handleMealPrep(recipe, slot.type)}
                        className={`flex items-center gap-1 text-xs font-medium py-1 px-2.5 rounded-lg border transition-all active:scale-[0.98] ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'text-slate-500 hover:text-slate-900 border-transparent hover:border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Plant dieses Gericht automatisch für morgen Mittag als Meal-Prep ein"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Für morgen geplant!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#789A99]" /> Vorkochen (morgen)
                          </>
                        )}
                      </button>
                    )}

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

      {/* DEDICATED PRINT VIEW (Nur sichtbar beim Drucken oder PDF-Export) */}
      <div className="hidden print:block font-sans text-black p-4">
        <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">fit und healthy • Wochenplan</h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Ziel: 1.508 kcal • Max. 44g Fett • Min. 103g Protein • 50% Gemüse
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            Erstellt am: {new Date().toLocaleDateString('de-DE')}
          </div>
        </div>

        <div className="space-y-4">
          {weeklyPlan.map((day) => {
            const totalKcal = [day.breakfast, day.lunch, day.dinner, day.snack].reduce((acc, r) => acc + (r?.kcal || 0), 0);
            const totalProtein = [day.breakfast, day.lunch, day.dinner, day.snack].reduce((acc, r) => acc + (r?.protein || 0), 0);
            const totalFat = [day.breakfast, day.lunch, day.dinner, day.snack].reduce((acc, r) => acc + (r?.fat || 0), 0);

            return (
              <div key={day.dayName} className="border border-gray-300 rounded-lg p-3 page-break-inside-avoid">
                <div className="flex items-center justify-between font-bold border-b border-gray-200 pb-1.5 mb-2">
                  <span className="text-sm uppercase tracking-wide">{day.dayName}</span>
                  <span className="text-xs font-mono">
                    {day.isFastDay ? 'FASTENTAG' : `${totalKcal} kcal | ${totalProtein}g Protein | ${totalFat}g Fett`}
                  </span>
                </div>

                {day.isFastDay ? (
                  <p className="text-xs italic text-gray-500">Geplanter Entlastungs- / Fastentag</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-gray-600 block text-[10px] uppercase">Frühstück</span>
                      <p className="font-medium text-gray-900 leading-snug">{day.breakfast?.title || '–'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600 block text-[10px] uppercase">Mittagessen</span>
                      <p className="font-medium text-gray-900 leading-snug">{day.lunch?.title || '–'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600 block text-[10px] uppercase">Abendbrot</span>
                      <p className="font-medium text-gray-900 leading-snug">{day.dinner?.title || '–'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600 block text-[10px] uppercase">Snack</span>
                      <p className="font-medium text-gray-900 leading-snug">{day.snack?.title || '–'}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
