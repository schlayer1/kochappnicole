'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Share2,
  Check,
  RefreshCw,
  Archive,
  ShoppingBag,
  RotateCcw,
  Search,
  Sparkles,
  Package,
  Layers,
  ChefHat
} from 'lucide-react';
import { ShoppingItem } from '@/lib/types';

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onTogglePantry: (id: string) => void;
  onRegenerateFromPlan: () => void;
}

type TabType = 'toBuy' | 'pantry' | 'done' | 'all';

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  onToggleItem,
  onTogglePantry,
  onRegenerateFromPlan,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('toBuy');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const categories: ShoppingItem['category'][] = [
    'Frischetheke & Obst',
    'Kühlregal',
    'Geflügel & Fisch',
    'Tiefkühl',
    'Vorrat & Gewürze',
  ];

  const categoryIcons: Record<ShoppingItem['category'], string> = {
    'Frischetheke & Obst': '🥑',
    'Kühlregal': '🥛',
    'Geflügel & Fisch': '🍗',
    'Tiefkühl': '❄️',
    'Vorrat & Gewürze': '🌾',
  };

  // Counts
  const toBuyCount = useMemo(() => items.filter((i) => !i.checked && !i.isPantry).length, [items]);
  const doneCount = useMemo(() => items.filter((i) => i.checked && !i.isPantry).length, [items]);
  const pantryCount = useMemo(() => items.filter((i) => i.isPantry).length, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'toBuy' && (item.checked || item.isPantry)) return false;
      if (activeTab === 'pantry' && !item.isPantry) return false;
      if (activeTab === 'done' && (!item.checked || item.isPantry)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAmount = item.amount?.toLowerCase().includes(q) || false;
        const matchesPack = item.packAdvice?.toLowerCase().includes(q) || false;
        const matchesCat = item.category.toLowerCase().includes(q);
        return matchesName || matchesAmount || matchesPack || matchesCat;
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  // WhatsApp / Clipboard export
  const handleShare = async () => {
    const activeItems = items.filter((i) => !i.isPantry);
    let text = '🛒 *Veggi & Fit 2.0 Einkaufsliste (Nicole)*\n';
    text += `Datum: ${new Date().toLocaleDateString('de-DE')} • ${toBuyCount} Artikel zu besorgen\n\n`;

    categories.forEach((cat) => {
      const catItems = activeItems.filter((i) => i.category === cat);
      if (catItems.length > 0) {
        text += `*${categoryIcons[cat]} ${cat}:*\n`;
        catItems.forEach((it) => {
          const checkMark = it.checked ? '✅' : '▫️';
          const amountStr = it.amount ? ` (${it.amount})` : '';
          const packStr = it.packAdvice ? ` → ${it.packAdvice}` : '';
          text += `${checkMark} ${it.name}${amountStr}${packStr}\n`;
        });
        text += '\n';
      }
    });

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Einkaufsliste Nicole', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Stats, Search, and Action Buttons */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EBF2F2] flex items-center justify-center text-[#789A99]">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Intelligente Einkaufsliste
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EBF2F2] text-[#3D5B5A] border border-[#C5D8D7]/70 font-semibold font-mono tabular-nums">
                {toBuyCount} zu besorgen
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gleiche Zutaten (z. B. alle Skyr- & Quarkmengen) werden automatisch zusammengerechnet mit REWE/Discounter-Packungsgrößen.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onRegenerateFromPlan}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all active:scale-[0.98]"
              title="Aktualisiert die Einkaufsliste aus deinem aktuellen Wochenplan"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#789A99]" />
              Aktualisieren
            </button>

            <button
              onClick={handleShare}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#789A99] hover:bg-[#658584] text-white transition-all active:scale-[0.98] shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" /> Kopiert!
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#FFD2C2]" /> Teilen / WhatsApp
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* Segmented Control */}
          <div className="flex p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 overflow-x-auto text-xs font-medium scrollbar-none">
            <button
              onClick={() => setActiveTab('toBuy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'toBuy'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#789A99]" />
              Zu Kaufen
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                activeTab === 'toBuy' ? 'bg-[#EBF2F2] text-[#3D5B5A]' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {toBuyCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pantry')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'pantry'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-600" />
              Im Vorrat / Gewürze
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                activeTab === 'pantry' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {pantryCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('done')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'done'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              Erledigt
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                activeTab === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {doneCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Alle ({items.length})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Zutat suchen (z. B. Skyr, Hafer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#789A99]"
            />
          </div>

        </div>

      </div>

      {/* Main Items Display grouped by Supermarket Aisle */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center shadow-xs space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">
            {activeTab === 'toBuy' && 'Keine offenen Einkäufe mehr!'}
            {activeTab === 'pantry' && 'Keine Vorratsartikel abgelegt.'}
            {activeTab === 'done' && 'Noch keine Einkäufe abgehakt.'}
            {activeTab === 'all' && 'Keine Zutaten gefunden.'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'toBuy'
              ? 'Alle benötigten Produkte für deinen aktuellen Wochenplan sind erledigt oder im Vorratsschrank.'
              : 'Passe den Filter an oder klicke oben auf „Aktualisieren“.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map((cat) => {
            const catItems = filteredItems.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div
                key={cat}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3"
              >
                {/* Department Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{categoryIcons[cat]}</span>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#3D5B5A]">
                      {cat}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {catItems.length} {catItems.length === 1 ? 'Artikel' : 'Artikel'}
                  </span>
                </div>

                {/* Items in Aisle */}
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className={`group flex items-start justify-between p-3 rounded-xl border transition-all duration-150 ${
                        item.checked
                          ? 'bg-slate-50/70 border-slate-100 opacity-60'
                          : item.isPantry
                          ? 'bg-amber-50/40 border-amber-200/60 text-slate-700'
                          : 'bg-white hover:bg-[#F8FAF9] text-slate-900 border-slate-200/80 hover:border-[#C5D8D7]'
                      }`}
                    >
                      {/* Checkbox & Product Details */}
                      <button
                        onClick={() => onToggleItem(item.id)}
                        className="flex items-start gap-3 flex-1 text-left active:scale-[0.99] transition-transform"
                      >
                        <div className="pt-0.5 shrink-0">
                          {item.checked ? (
                            <CheckSquare className="w-4 h-4 text-[#789A99]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                          )}
                        </div>

                        <div className="space-y-1 flex-1 pr-2">
                          <div className="flex items-baseline justify-between gap-2 flex-wrap">
                            <span className={`text-xs font-semibold ${item.checked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {item.name}
                            </span>
                            {item.amount && (
                              <span className={`text-xs font-bold font-mono tabular-nums px-2 py-0.5 rounded-md ${
                                item.checked
                                  ? 'bg-slate-100 text-slate-400'
                                  : 'bg-[#EBF2F2] text-[#2C4847] border border-[#C5D8D7]/60'
                              }`}>
                                {item.amount}
                              </span>
                            )}
                          </div>

                          {/* Pack advice (e.g. "ca. 2x Becher à 500g") */}
                          {item.packAdvice && (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#789A99]">
                              <Package className="w-3 h-3 text-[#789A99] shrink-0" />
                              <span>{item.packAdvice}</span>
                            </div>
                          )}

                          {/* Recipe sources */}
                          {item.recipeSource && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                              <ChefHat className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">Für: {item.recipeSource}</span>
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Pantry Toggle Button */}
                      <div className="flex items-center gap-1 shrink-0 ml-2 pt-0.5">
                        <button
                          onClick={() => onTogglePantry(item.id)}
                          className={`text-[10px] px-2 py-1 rounded-lg font-medium border transition-all ${
                            item.isPantry
                              ? 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200/70'
                              : 'text-slate-400 border-transparent hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                          }`}
                          title={item.isPantry ? 'Von Vorrat zurück auf Einkaufsliste setzen' : 'Als Vorrat markieren (bereits im Haus)'}
                        >
                          <Archive className="w-2.5 h-2.5 inline mr-1" />
                          {item.isPantry ? 'Im Vorrat' : 'Hab ich da'}
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helpful Discounter/REWE Shopping Tip */}
      <div className="bg-[#FAF5F2] border border-[#FFD2C2]/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#994931] shrink-0 border border-[#FFD2C2]">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">
            Nicole’s Zero-Waste Supermarkt-Tipp:
          </p>
          <p className="text-slate-600 leading-relaxed">
            Geöffnete Skyr- und Magerquark-Becher halten sich 4–6 Tage im Kühlschrank. Durch die clevere Bündelung im Wochenplan kaufst du exakt die passenden 500g-Becher, sodass keine Reste verderben. Rama Cremefine 7% ersetzt 100% Sahne bei nur 7% Fett.
          </p>
        </div>
      </div>

    </div>
  );
};
