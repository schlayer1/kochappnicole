'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Calendar,
  ShoppingBag,
  CheckSquare,
  Flame,
  Clock,
  Download,
  FileText,
  Sparkles,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { DayPlan, ShoppingItem } from '@/lib/types';

interface PrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyPlan: DayPlan[];
  shoppingItems: ShoppingItem[];
}

type PrintMode = 'plan' | 'shopping';

export const PrintExportModal: React.FC<PrintExportModalProps> = ({
  isOpen,
  onClose,
  weeklyPlan,
  shoppingItems,
}) => {
  const [printMode, setPrintMode] = useState<PrintMode>('plan');

  if (!isOpen) return null;

  const [copiedNotice, setCopiedNotice] = useState(false);

  // Group shopping items by category
  const categorizedShopping = shoppingItems
    .filter((it) => !it.checked && !it.isPantry)
    .reduce((acc, item) => {
      const cat = item.category || 'Vorrat & Gewürze';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, ShoppingItem[]>);

  const handleShareOrCopy = async () => {
    let textContent = '';
    if (printMode === 'plan') {
      textContent = `🗓️ WOCHEN-SPEISEPLAN • FIT & HEALTHY\nZiel: 1.508 kcal | 44g Fett | 103g Protein\n\n`;
      weeklyPlan.forEach((d) => {
        textContent += `📌 ${d.dayName.toUpperCase()}:\n`;
        if (d.fastingMode === '16:8') {
          textContent += `  • Frühstück: Gefastet (16:8)\n`;
        } else if (d.breakfast) {
          textContent += `  • Frühstück: ${d.breakfast.title}\n`;
        }
        if (d.lunch) textContent += `  • Mittag: ${d.lunch.title}\n`;
        if (d.dinner) textContent += `  • Abend: ${d.dinner.title}\n`;
        if (d.snack) textContent += `  • Snack: ${d.snack.title}\n`;
        textContent += `\n`;
      });
    } else {
      textContent = `🛒 EINKAUFSZETTEL • FIT & HEALTHY\n\n`;
      Object.entries(categorizedShopping).forEach(([cat, its]) => {
        textContent += `📦 ${cat.toUpperCase()}:\n`;
        its.forEach((i) => {
          textContent += `  [ ] ${i.amount ? `${i.amount} ` : ''}${i.name}\n`;
        });
        textContent += `\n`;
      });
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: printMode === 'plan' ? 'Wochen-Speiseplan' : 'Einkaufszettel',
          text: textContent,
        });
        return;
      } catch (e) {
        // user cancelled or share failed, fallback to clipboard below
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(textContent);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    }
  };

  const handleTriggerPrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('window.print error:', e);
    }

    // Fallback for iOS Standalone PWA if window.print is silenced
    const isStandalone = typeof window !== 'undefined' && ((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches);
    if (isStandalone) {
      const printableElement = document.getElementById('printable-area');
      if (printableElement) {
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.write(`
            <html>
              <head>
                <title>${printMode === 'plan' ? 'Wochenplan' : 'Einkaufszettel'}</title>
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #111; }
                  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                  th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
                  th { background: #f0f0f0; }
                </style>
              </head>
              <body>
                ${printableElement.innerHTML}
                <script>window.onload = function() { window.print(); }</script>
              </body>
            </html>
          `);
          printWin.document.close();
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header - Screen only */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-linear-to-r from-[#111C1E] to-[#1F3135] text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Druck- &amp; PDF-Studio
              </h2>
              <p className="text-xs text-slate-300">
                Wähle deine Ansicht und drucke sie direkt oder speichere sie als PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareOrCopy}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Per WhatsApp teilen oder als Text kopieren"
            >
              {copiedNotice ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Kopiert!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#FFD2C2]" />
                  <span className="hidden sm:inline">Teilen</span>
                </>
              )}
            </button>

            <button
              onClick={handleTriggerPrint}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4 text-[#789A99]" />
              Drucken / PDF
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher - Screen only */}
        <div className="p-3 bg-slate-100/70 border-b border-slate-200/70 flex items-center justify-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => setPrintMode('plan')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              printMode === 'plan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#789A99]" />
            Wochenplan für den Kühlschrank
          </button>

          <button
            type="button"
            onClick={() => setPrintMode('shopping')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              printMode === 'shopping'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#789A99]" />
            Einkaufszettel im Taschenformat
          </button>
        </div>

        {/* Printable View Container */}
        <div id="printable-area" className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50 print:bg-white print:p-0 print:m-0">
          
          {/* Printable Wochenplan */}
          {printMode === 'plan' && (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:p-0">
              
              {/* Print Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-[#789A99] uppercase">
                    Nicole Keller • Fit &amp; Healthy
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Wochen-Speiseplan
                  </h1>
                </div>
                <div className="text-right text-xs font-mono text-slate-500">
                  <span>Ziel: 1508 kcal • Max 44g Fett • Min 103g Protein</span>
                </div>
              </div>

              {/* 7 Days Table Grid */}
              <div className="space-y-4">
                {weeklyPlan.map((day) => {
                  const dayKcal = [day.breakfast, day.lunch, day.dinner, day.snack].reduce(
                    (acc, r) => acc + (r?.kcal || 0),
                    0
                  );
                  const dayProtein = [day.breakfast, day.lunch, day.dinner, day.snack].reduce(
                    (acc, r) => acc + (r?.protein || 0),
                    0
                  );
                  const dayFat = [day.breakfast, day.lunch, day.dinner, day.snack].reduce(
                    (acc, r) => acc + (r?.fat || 0),
                    0
                  );

                  return (
                    <div
                      key={day.dayName}
                      className="border border-slate-300 rounded-xl p-3.5 print:break-inside-avoid bg-white"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 uppercase">
                            {day.dayName}
                          </span>
                          {day.fastingMode === '16:8' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                              16:8 Intervallfasten
                            </span>
                          )}
                          {day.isFastDay && day.fastingMode !== '16:8' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFD2C2] text-[#994931]">
                              Entlastungstag
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-mono font-bold text-slate-700">
                          {dayKcal} kcal • {dayProtein}g Protein • {dayFat}g Fett
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                            Frühstück
                          </span>
                          <p className="font-semibold text-slate-900 line-clamp-2 mt-0.5">
                            {day.fastingMode === '16:8'
                              ? '☕ Gefastet (16:8)'
                              : day.breakfast?.title || '–'}
                          </p>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                            Mittagessen
                          </span>
                          <p className="font-semibold text-slate-900 line-clamp-2 mt-0.5">
                            {day.lunch?.title || '–'}
                          </p>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                            Abendbrot
                          </span>
                          <p className="font-semibold text-slate-900 line-clamp-2 mt-0.5">
                            {day.dinner?.title || '–'}
                          </p>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-lg">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                            Snack
                          </span>
                          <p className="font-semibold text-slate-900 line-clamp-2 mt-0.5">
                            {day.snack?.title || '–'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Print Footer */}
              <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                Gedruckt aus deiner persönlichen Nicole-App • fit &amp; healthy
              </div>
            </div>
          )}

          {/* Printable Einkaufszettel */}
          {printMode === 'shopping' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xs border border-slate-200 print:border-none print:shadow-none print:p-0">
              
              <div className="border-b-2 border-slate-900 pb-3 mb-5 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#789A99] uppercase">
                    Nicole Keller • Einkaufsliste
                  </span>
                  <h1 className="text-xl font-black text-slate-900">
                    Einkaufszettel
                  </h1>
                </div>
                <div className="text-right text-xs font-mono text-slate-500">
                  <span>{Object.values(categorizedShopping).flat().length} Artikel zu besorgen</span>
                </div>
              </div>

              {/* Multi-Column Categorized Aisle List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(categorizedShopping).map(([category, items]) => (
                  <div
                    key={category}
                    className="border border-slate-300 rounded-xl p-3 bg-white print:break-inside-avoid"
                  >
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-2">
                      {category}
                    </h3>
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li key={item.id} className="text-xs flex items-center gap-2 text-slate-800">
                          <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs inline-block shrink-0" />
                          <span className="font-medium">{item.name}</span>
                          {item.amount && (
                            <span className="text-slate-500 font-mono text-[10px]">
                              ({item.amount})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Print Footer */}
              <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
                Gedruckt mit ankreuzbaren Kästchen [ ] • fit &amp; healthy
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
