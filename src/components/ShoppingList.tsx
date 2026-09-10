'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Share2, Check, RefreshCw, Archive, ShoppingBag } from 'lucide-react';
import { ShoppingItem } from '@/lib/types';

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onTogglePantry: (id: string) => void;
  onRegenerateFromPlan: () => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  onToggleItem,
  onTogglePantry,
  onRegenerateFromPlan,
}) => {
  const [copied, setCopied] = useState(false);

  const categories: ShoppingItem['category'][] = [
    'Frischetheke & Obst',
    'Kühlregal',
    'Geflügel & Fisch',
    'Tiefkühl',
    'Vorrat & Gewürze',
  ];

  const handleShare = async () => {
    const activeItems = items.filter((i) => !i.isPantry);
    let text = '🛒 *Veggi & Fit 2.0 Einkaufsliste (Nicole)*\n\n';

    categories.forEach((cat) => {
      const catItems = activeItems.filter((i) => i.category === cat);
      if (catItems.length > 0) {
        text += `*${cat}:*\n`;
        catItems.forEach((it) => {
          text += ` ${it.checked ? '[x]' : '[ ]'} ${it.name}\n`;
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

  const activeCount = items.filter((i) => !i.checked && !i.isPantry).length;
  const checkedCount = items.filter((i) => i.checked && !i.isPantry).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Stats and Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Intelligente Einkaufsliste
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#EBF2F2] text-[#3D5B5A] border border-[#C5D8D7]/60 font-semibold font-mono tabular-nums">
              {activeCount} offen • {checkedCount} erledigt
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatisch aus allen Mahlzeiten deines aktuellen Wochenplans zusammengestellt
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRegenerateFromPlan}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-150 active:scale-[0.98]"
            title="Neu aus aktuellem Wochenplan synchronisieren"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#789A99]" />
            Aktualisieren
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#789A99] hover:bg-[#658584] text-white transition-all duration-150 active:scale-[0.98] shadow-xs"
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

      {/* Items by Category */}
      {items.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center shadow-xs">
          <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Keine Zutaten im Wochenplan gefunden. Klicke auf „Aktualisieren“.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const catItems = items.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div
                key={cat}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <h3 className="font-bold text-[11px] uppercase tracking-wider text-[#789A99]">
                    {cat}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {catItems.filter((i) => !i.checked && !i.isPantry).length} offen
                  </span>
                </div>

                <div className="space-y-1.5">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 ${
                        item.checked
                          ? 'bg-slate-50/70 text-slate-400 border-slate-100 line-through'
                          : item.isPantry
                          ? 'bg-slate-50/50 text-slate-400 border-dashed border-slate-200'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/70'
                      }`}
                    >
                      {/* Checkbox & Name */}
                      <button
                        onClick={() => onToggleItem(item.id)}
                        className="flex items-center gap-2.5 flex-1 text-left active:scale-[0.99] transition-transform"
                      >
                        {item.checked ? (
                          <CheckSquare className="w-4 h-4 text-[#789A99] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 shrink-0 hover:text-slate-400" />
                        )}
                        <span className="text-xs font-medium">{item.name}</span>
                      </button>

                      {/* Pantry Toggle */}
                      <button
                        onClick={() => onTogglePantry(item.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition-colors shrink-0 ml-2 ${
                          item.isPantry
                            ? 'bg-[#EBF2F2] text-[#3D5B5A] border-[#C5D8D7]'
                            : 'text-slate-400 border-transparent hover:border-slate-200 hover:text-slate-600'
                        }`}
                        title="Bereits im Vorratsschrank vorhanden"
                      >
                        <Archive className="w-2.5 h-2.5 inline mr-1" />
                        {item.isPantry ? 'Im Vorrat' : 'Vorrat?'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
