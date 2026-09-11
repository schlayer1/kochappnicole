'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Shuffle,
  Flame,
  Check,
  ArrowRightLeft,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';
import { Recipe } from '@/lib/types';
import { RecipeImage } from './RecipeImage';
import { findSmartSwapAlternatives, SwapAlternative } from '@/lib/smart-swap';

interface MealSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceRecipe: Recipe | null;
  dayName: string;
  slotTitle: string;
  allRecipes: Recipe[];
  customImages?: Record<string, string>;
  onExecuteSwap: (newRecipe: Recipe) => void;
}

export const MealSwapModal: React.FC<MealSwapModalProps> = ({
  isOpen,
  onClose,
  sourceRecipe,
  dayName,
  slotTitle,
  allRecipes,
  customImages,
  onExecuteSwap,
}) => {
  const [filterProtein, setFilterProtein] = useState<'all' | 'geflügel' | 'fisch' | 'veggie'>('all');

  const alternatives: SwapAlternative[] = useMemo(() => {
    if (!isOpen || !sourceRecipe || !Array.isArray(allRecipes)) return [];
    return findSmartSwapAlternatives(sourceRecipe, allRecipes, {
      proteinCategory: filterProtein,
      limit: 6,
    });
  }, [isOpen, sourceRecipe, allRecipes, filterProtein]);

  if (!isOpen || !sourceRecipe) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-linear-to-r from-[#111C1E] to-[#1F3135] text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFD2C2]/20 text-[#FFD2C2] border border-[#FFD2C2]/30 flex items-center gap-1">
                <Shuffle className="w-3 h-3" /> Mahlzeiten-Tausch-Joker
              </span>
              <span className="text-xs text-slate-300">
                {dayName} • {slotTitle}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1.5 text-white">
              Passende Alternative wählen
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
              Tausche dein Gericht mit 1 Klick aus. Alle Vorschläge halten dein 44g Fett-Limit und dein 103g Protein-Ziel garantiert im grünen Bereich.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Recipe Snapshot */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Aktuell geplant:
            </span>
            <span className="text-xs font-bold text-slate-900 truncate">
              {sourceRecipe.title}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            <span className="text-slate-600">{sourceRecipe.kcal} kcal</span>
            <span className="text-emerald-700 font-bold">{sourceRecipe.protein}g P</span>
            <span className="text-[#994931] font-semibold">{sourceRecipe.fat}g F</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 pt-4 flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Protein-Quelle:</span>
          {[
            { id: 'all', label: 'Alle' },
            { id: 'geflügel', label: '🍗 Geflügel' },
            { id: 'fisch', label: '🐟 Fisch' },
            { id: 'veggie', label: '🥗 Vegetarisch' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterProtein(cat.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                filterProtein === cat.id
                  ? 'bg-[#789A99] text-white shadow-xs font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Alternatives List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {alternatives.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
              <p className="text-xs font-semibold">Keine identischen Alternativen mit diesem Filter gefunden.</p>
              <p className="text-[11px] text-slate-400 mt-1">Wähle „Alle“, um die gesamte Rezeptauswahl zu sehen.</p>
            </div>
          ) : (
            alternatives.map(({ recipe, deltaKcal, deltaProtein, deltaFat, matchHighlight }) => (
              <div
                key={recipe.id}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-[#789A99] hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Image & Titles */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <RecipeImage
                      recipe={recipe}
                      aspectRatio="square"
                      customImages={customImages}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#789A99]">
                        {recipe.category}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                        {matchHighlight}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate mt-0.5">
                      {recipe.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-mono">
                      <span>{recipe.kcal} kcal</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">{recipe.protein}g Protein</span>
                      <span>•</span>
                      <span className="text-[#994931]">{recipe.fat}g Fett</span>
                    </div>
                  </div>
                </div>

                {/* Right: Deltas & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  {/* Delta Badges */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold">
                    {/* Fat Delta */}
                    <span
                      className={`px-2 py-0.5 rounded-lg flex items-center gap-0.5 ${
                        deltaFat <= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : deltaFat <= 2
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                      title="Fett-Differenz zum bisherigen Rezept"
                    >
                      {deltaFat === 0 ? '±0g' : deltaFat > 0 ? `+${deltaFat}g` : `${deltaFat}g`} Fett
                    </span>

                    {/* Protein Delta */}
                    <span
                      className={`px-2 py-0.5 rounded-lg flex items-center gap-0.5 ${
                        deltaProtein >= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      title="Protein-Differenz zum bisherigen Rezept"
                    >
                      {deltaProtein >= 0 ? `+${deltaProtein}g` : `${deltaProtein}g`} Prot
                    </span>
                  </div>

                  {/* Swap Button */}
                  <button
                    onClick={() => {
                      onExecuteSwap(recipe);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#789A99] hover:bg-[#658584] text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Tauschen
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
