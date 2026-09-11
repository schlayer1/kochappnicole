import React, { useState } from 'react';
import { X, Check, Search, Sparkles } from 'lucide-react';
import { MealType, Recipe } from '@/lib/types';
import { RecipeImage } from './RecipeImage';

interface MealPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: MealType;
  dayName: string;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenAiGenerator: () => void;
}

export const MealPickerModal: React.FC<MealPickerModalProps> = ({
  isOpen,
  onClose,
  mealType,
  dayName,
  recipes,
  onSelectRecipe,
  onOpenAiGenerator,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const titleMap: Record<MealType, string> = {
    breakfast: 'Frühstück 2.0 wählen',
    lunch: 'Mittagessen (Gesunder Teller) wählen',
    dinner: 'Abendbrot wählen',
    snack: 'Snack & Büro-Option wählen',
  };

  const filtered = recipes.filter((r) => {
    const matchesSlot =
      r.mealType === mealType ||
      r.mealType === 'any' ||
      (mealType === 'dinner' && r.mealType === 'lunch') ||
      (mealType === 'lunch' && r.mealType === 'dinner');

    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    return matchesSlot && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E0EAE9] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-[#F0F5F4] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#789A99]">
              {dayName} • Slot anpassen
            </span>
            <h3 className="font-bold text-[#111C1E] text-base">{titleMap[mealType]}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#111C1E] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & AI CTA */}
        <div className="p-4 bg-[#F8FAFA] border-b border-[#E0EAE9] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rezept suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#E0EAE9] focus:outline-none focus:border-[#789A99]"
            />
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenAiGenerator();
            }}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FFF4F0] text-[#994931] border border-[#FFD2C2] hover:bg-[#FCEAE5] whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFD2C2]" /> Mit KI kreieren
          </button>
        </div>

        {/* Recipes List */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => {
                onSelectRecipe(r);
                onClose();
              }}
              className="p-2.5 rounded-2xl border border-[#E0EAE9] hover:border-[#789A99] hover:bg-[#F8FAFA] cursor-pointer transition-all flex items-center justify-between gap-3 group"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 shadow-xs bg-slate-100">
                <RecipeImage
                  recipe={r}
                  aspectRatio="square"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-[#111C1E] group-hover:text-[#789A99] transition-colors truncate">
                    {r.title}
                  </h4>
                  {r.isAiGenerated && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#FFD2C2] text-[#994931] font-bold">
                      KI
                    </span>
                  )}
                </div>
                {r.subtitle && (
                  <p className="text-[11px] text-[#586F73] mt-0.5">{r.subtitle}</p>
                )}

                <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums text-slate-500 mt-1.5">
                  <span>{r.kcal} kcal</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">{r.protein}g P</span>
                  <span>•</span>
                  <span className="text-[#789A99] font-semibold">{r.fat}g F</span>
                  <span>•</span>
                  <span>{r.carbs}g KH</span>
                  <span>•</span>
                  <span>{r.prepMins} Min</span>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full border border-[#E0EAE9] group-hover:border-[#789A99] group-hover:bg-[#789A99] group-hover:text-white flex items-center justify-center text-slate-300 transition-all shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
