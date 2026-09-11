'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  ChefHat,
  Search,
  Plus,
  Check,
  Flame,
  ArrowRight,
  Clock,
  RotateCcw,
  Layers,
  Utensils
} from 'lucide-react';
import { Recipe, MealType } from '@/lib/types';
import { RecipeImage } from './RecipeImage';

interface FridgeLeftoversModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  onOpenCookMode: (recipe: Recipe) => void;
  onSelectForPlan?: (recipe: Recipe) => void;
  onGenerateAiWithIngredients?: (ingredients: string[]) => void;
  customImages?: Record<string, string>;
}

const COMMON_STAPLES = [
  'Hähnchenbrust',
  'Eier',
  'Magerquark',
  'Zucchini',
  'Brokkoli',
  'Tomaten',
  'Lachs',
  'Skyr',
  'Champignons',
  'Blattspinat',
  'Paprika',
  'Vollkornbrot',
  'Rama Cremefine 7%',
  'Feta light',
  'Möhren',
  'Kichererbsen',
  'Haferflocken',
  'Gurke',
];

export const FridgeLeftoversModal: React.FC<FridgeLeftoversModalProps> = ({
  isOpen,
  onClose,
  recipes,
  onOpenCookMode,
  onSelectForPlan,
  onGenerateAiWithIngredients,
  customImages,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const handleToggleIngredient = (ing: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInput.trim();
    if (clean && !selectedIngredients.includes(clean)) {
      setSelectedIngredients((prev) => [...prev, clean]);
      setCustomInput('');
    }
  };

  // Score recipes by matching ingredients
  const matchedRecipes = useMemo(() => {
    if (selectedIngredients.length === 0 || !Array.isArray(recipes)) return [];

    const scored = recipes
      .filter((r) => r && r.id)
      .map((recipe) => {
        let allIngs: string[] = [];

        if (recipe.ingredients) {
          if (Array.isArray(recipe.ingredients)) {
            allIngs = recipe.ingredients.map((i: any) =>
              typeof i === 'string' ? i.toLowerCase() : JSON.stringify(i).toLowerCase()
            );
          } else if (typeof recipe.ingredients === 'object') {
            allIngs = Object.values(recipe.ingredients)
              .flat()
              .filter(Boolean)
              .map((i: any) =>
                typeof i === 'string' ? i.toLowerCase() : String(i).toLowerCase()
              );
          }
        }

        const matched = selectedIngredients.filter((sel) => {
          const lowerSel = sel.toLowerCase();
          return allIngs.some((ing) => ing.includes(lowerSel));
        });

        return {
          recipe,
          matchCount: matched.length,
          matchedIngredients: matched,
        };
      });

    return scored
      .filter((s) => s.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);
  }, [recipes, selectedIngredients]);

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-linear-to-r from-[#111C1E] to-[#1F3135] text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFD2C2]/20 text-[#FFD2C2] border border-[#FFD2C2]/30 flex items-center gap-1">
                <ChefHat className="w-3 h-3" /> Zero-Waste Chef
              </span>
              <span className="text-xs text-slate-300">
                160 Nicole-Rezepte durchsuchen
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1.5 text-white">
              Kühlschrank-Resteverwerter
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Wähle an, was noch in deinem Kühlschrank liegt. Wir finden sofort die passenden Rezepte aus deinem Plan oder lassen die KI ein neues Gericht zaubern.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Staple Chips & Custom Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                1. Welche Zutaten hast du vorrätig?
              </span>
              {selectedIngredients.length > 0 && (
                <button
                  onClick={() => setSelectedIngredients([])}
                  className="text-xs text-[#789A99] hover:underline"
                >
                  Auswahl leeren
                </button>
              )}
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_STAPLES.map((staple) => {
                const isSelected = selectedIngredients.includes(staple);
                return (
                  <button
                    key={staple}
                    onClick={() => handleToggleIngredient(staple)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#789A99] text-white shadow-xs font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {staple}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleAddCustom} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Andere Zutat eingeben (z. B. Bohnen, Quinoa, Apfel)..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#789A99]"
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-50 transition-colors"
              >
                + Zutat
              </button>
            </form>
          </div>

          {/* AI Magic Generator CTA */}
          {selectedIngredients.length > 0 && onGenerateAiWithIngredients && (
            <div className="bg-linear-to-r from-[#FAF5F2] to-[#F5ECE8] p-4 rounded-2xl border border-[#FFD2C2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-white text-[#994931] border border-[#FFD2C2] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Kein passendes Rezept dabei oder Lust auf Neues?
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Lass die KI ein brandneues Rezept generieren, das exakt diese Reste aufbraucht ({selectedIngredients.join(', ')}).
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onGenerateAiWithIngredients(selectedIngredients);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#994931] hover:bg-[#803823] text-white transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
              >
                ✨ Neues KI-Rezept kreieren
              </button>
            </div>
          )}

          {/* Matched Recipes List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                2. Gefundene Treffer aus deinem Rezeptpool:
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {matchedRecipes.length} passende Rezepte
              </span>
            </div>

            {selectedIngredients.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60 text-slate-400 space-y-1">
                <Utensils className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                <p className="text-xs font-semibold text-slate-600">Wähle oben mindestens eine Zutat aus</p>
                <p className="text-[11px]">Wir sortieren alle 160 Rezepte nach den meisten Übereinstimmungen.</p>
              </div>
            ) : matchedRecipes.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60 text-slate-500 space-y-2">
                <p className="text-xs font-semibold text-slate-700">Kein exakter Treffer im Standard-Pool</p>
                <p className="text-[11px] text-slate-400">Nutze den KI-Button oben, um ein maßgeschneidertes Rezept zu zaubern!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedRecipes.slice(0, 8).map(({ recipe, matchCount, matchedIngredients }) => (
                  <div
                    key={recipe.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-[#789A99] transition-all shadow-xs flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <RecipeImage
                          recipe={recipe}
                          aspectRatio="square"
                          customImages={customImages}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#789A99] block">
                          {recipe.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                          {recipe.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 font-mono">
                          <span>{recipe.kcal} kcal</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">{recipe.protein}g P</span>
                          <span>•</span>
                          <span className="text-[#789A99]">{recipe.fat}g F</span>
                        </div>
                      </div>
                    </div>

                    {/* Matched Tags */}
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ {matchCount} Treffer ({matchedIngredients.join(', ')})
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onOpenCookMode(recipe);
                          onClose();
                        }}
                        className="px-3 py-1 bg-[#789A99] hover:bg-[#658584] text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs cursor-pointer"
                      >
                        Kochen
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
