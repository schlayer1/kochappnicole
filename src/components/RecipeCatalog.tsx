'use client';

import React, { useState } from 'react';
import { Search, ChefHat, Clock, Sparkles, Plus, Check, ChevronDown } from 'lucide-react';
import { Recipe, MealType } from '@/lib/types';

interface RecipeCatalogProps {
  recipes: Recipe[];
  onOpenCookMode: (recipe: Recipe) => void;
  onAssignRecipeToDay: (recipe: Recipe, dayIdx: number, slot: MealType) => void;
  onOpenAiGenerator: () => void;
}

export const RecipeCatalog: React.FC<RecipeCatalogProps> = ({
  recipes,
  onOpenCookMode,
  onAssignRecipeToDay,
  onOpenAiGenerator,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [assigningRecipeId, setAssigningRecipeId] = useState<string | null>(null);

  const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  const filtered = recipes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.whyNicole.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'breakfast') return r.mealType === 'breakfast';
    if (selectedFilter === 'lunch') return r.mealType === 'lunch';
    if (selectedFilter === 'dinner') return r.mealType === 'dinner';
    if (selectedFilter === 'snack') return r.mealType === 'snack';
    if (selectedFilter === 'ai') return r.isAiGenerated;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner with AI Create CTA */}
      <div className="bg-linear-to-r from-[#111C1E] to-[#1F3135] text-white p-6 rounded-2xl border border-[#2D4348] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">
              {recipes.length} hinterlegte Rezepte & KI-Kreationen
            </span>
          </div>
          <h2 className="text-xl font-bold mt-2">
            Dein maßgeschneiderter Rezeptpool
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Alle Rezepte entsprechen streng deiner Ernährungsanalyse: Max. 44g Tagesfett-Budget, mind. 103g Eiweiß, viel Gemüse & Cremefine 7% statt Sahne.
          </p>
        </div>

        <button
          onClick={onOpenAiGenerator}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-[#789A99] hover:bg-[#658584] text-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-[#FFD2C2]" />
          Neues KI-Rezept kreieren
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Zutat, Name oder Schlagwort suchen (z.B. Skyr, Lachs, Pute)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-[#E0EAE9] focus:outline-none focus:border-[#789A99] transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Alle Rezepte' },
            { id: 'breakfast', label: 'Frühstück 2.0' },
            { id: 'lunch', label: 'Mittagessen' },
            { id: 'dinner', label: 'Abendbrot' },
            { id: 'snack', label: 'Snacks' },
            { id: 'ai', label: 'Nur KI-Kreationen' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedFilter === f.id
                  ? 'bg-[#789A99] text-white shadow-xs'
                  : 'bg-white text-[#586F73] border border-[#E0EAE9] hover:text-[#111C1E]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((recipe) => {
          const isAssigning = assigningRecipeId === recipe.id;

          return (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl border border-[#E0EAE9] p-5 shadow-xs flex flex-col justify-between hover:border-[#C5D8D7] transition-all"
            >
              <div>
                
                {/* Category & Tags */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#789A99]">
                    {recipe.category}
                  </span>
                  {recipe.isAiGenerated && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD2C2] text-[#994931] font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> KI-Generiert
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-[#111C1E] text-base leading-snug">
                  {recipe.title}
                </h3>
                {recipe.subtitle && (
                  <p className="text-xs text-[#586F73] mt-0.5">{recipe.subtitle}</p>
                )}

                {/* Macro Pills */}
                <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-[#F8FAFA] border border-[#E0EAE9] text-center my-3">
                  <div>
                    <div className="text-[10px] text-[#586F73]">Kcal</div>
                    <div className="text-xs font-bold font-mono tabular-nums text-[#111C1E]">{recipe.kcal}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#586F73]">Protein</div>
                    <div className="text-xs font-bold font-mono tabular-nums text-emerald-700">{recipe.protein}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#586F73]">Fett</div>
                    <div className="text-xs font-bold font-mono tabular-nums text-[#789A99]">{recipe.fat}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#586F73]">Ballastst.</div>
                    <div className="text-xs font-bold font-mono tabular-nums text-[#111C1E]">{recipe.fiber}g</div>
                  </div>
                </div>

                {/* Why Nicole fits rule */}
                <p className="text-xs text-[#3D5B5A] bg-[#EBF2F2]/60 p-2.5 rounded-lg border border-[#C5D8D7]/60 line-clamp-3">
                  <span className="font-semibold text-[#789A99]">Nicole-Vorgabe: </span>
                  {recipe.whyNicole}
                </p>

                {/* Ingredients snippet */}
                <div className="mt-3 pt-3 border-t border-[#F0F5F4]">
                  <div className="text-[11px] font-semibold text-[#111C1E] mb-1">Hauptzutaten:</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.values(recipe.ingredients).flat().slice(0, 4).map((ing, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 truncate max-w-[140px]">
                        {ing}
                      </span>
                    ))}
                    {Object.values(recipe.ingredients).flat().length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                        +{Object.values(recipe.ingredients).flat().length - 4} weitere
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-3 border-t border-[#F0F5F4] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#586F73] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#789A99]" /> {recipe.prepMins} Min
                  </span>

                  <button
                    onClick={() => onOpenCookMode(recipe)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#111C1E] text-white hover:bg-[#203135] transition-colors"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-[#FFD2C2]" /> Zubereiten
                  </button>
                </div>

                {/* Assign to Day Picker Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setAssigningRecipeId(isAssigning ? null : recipe.id)}
                    className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-[#3D5B5A] bg-[#EBF2F2] hover:bg-[#DEE9E8] rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3 text-[#789A99]" /> In Wochenplan einbinden
                    <ChevronDown className={`w-3 h-3 transition-transform ${isAssigning ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown for Days */}
                  {isAssigning && (
                    <div className="mt-2 p-2 bg-white rounded-xl border border-[#E0EAE9] shadow-lg space-y-1 z-20">
                      <div className="text-[10px] font-bold uppercase text-[#586F73] px-2 py-1">
                        Zu welchem Tag hinzufügen?
                      </div>
                      <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                        {days.map((dayName, dIdx) => (
                          <button
                            key={dayName}
                            onClick={() => {
                              onAssignRecipeToDay(
                                recipe,
                                dIdx,
                                recipe.mealType === 'any' ? 'lunch' : recipe.mealType
                              );
                              setAssigningRecipeId(null);
                            }}
                            className="text-left text-xs p-1.5 rounded-md hover:bg-[#F8FAFA] hover:text-[#789A99] transition-colors flex items-center justify-between"
                          >
                            <span>{dayName}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{recipe.mealType}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
