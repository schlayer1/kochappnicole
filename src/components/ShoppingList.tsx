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
  ChefHat,
  Calendar,
  Filter,
  X,
  Utensils,
  ChevronDown,
  Plus,
  Trash2,
  Compass,
  Loader2
} from 'lucide-react';
import { ShoppingItem, DayPlan, Recipe } from '@/lib/types';
import { SpeechInputButton } from './SpeechInputButton';

interface ShoppingListProps {
  items: ShoppingItem[];
  weeklyPlan?: DayPlan[];
  onToggleItem: (id: string) => void;
  onTogglePantry: (id: string) => void;
  onRegenerateFromPlan: () => void;
  onAddCustomItem?: (name: string, amount: string, category: ShoppingItem['category']) => void;
  onDeleteCustomItem?: (id: string) => void;
}

type TabType = 'toBuy' | 'pantry' | 'done' | 'all';

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] as const;

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  weeklyPlan = [],
  onToggleItem,
  onTogglePantry,
  onRegenerateFromPlan,
  onAddCustomItem,
  onDeleteCustomItem,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('toBuy');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRouteOrdered, setIsRouteOrdered] = useState(true);

  // Tactile & Audio-Haptic Feedback (works on iPhone iOS Safari & Android)
  const triggerHaptic = (durationMs = 20) => {
    // 1. Android & devices with Vibration API
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(durationMs);
      } catch (e) {
        // ignore vibrate errors if blocked
      }
    }

    // 2. iOS Safari Audio-Haptic Click (Micro-Pop synthesized via Web Audio API)
    if (typeof window !== 'undefined') {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(160, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.03);
          gain.gain.setValueAtTime(0.14, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.032);
        }
      } catch (e) {
        // audio may require user gesture
      }
    }
  };

  // Dynamic Supermarket & Freshness AI Tip
  const [customAiTip, setCustomAiTip] = useState<string | null>(null);
  const [isLoadingAiTip, setIsLoadingAiTip] = useState(false);

  const dynamicTip = useMemo(() => {
    if (customAiTip) return customAiTip;

    const unbought = items.filter((it) => !it.checked && !it.isPantry);
    const itemNames = unbought.map((it) => it.name.toLowerCase()).join(' ');

    if (itemNames.includes('kräuter') || itemNames.includes('petersilie') || itemNames.includes('koriander') || itemNames.includes('basilikum') || itemNames.includes('dill')) {
      return '🌱 Frische Kräuter im Korb: Stelle die Stiele wie einen Blumenstrauß in ein kleines Glas Wasser auf die Küchentheke (oder wickle sie in ein feuchtes Küchentuch ins Gemüsefach). So bleiben sie 7–10 Tage knackig statt schlapp zu werden!';
    }
    if (itemNames.includes('beere') || itemNames.includes('himbeer') || itemNames.includes('heidelbeer') || itemNames.includes('erdbeer')) {
      return '🫐 Frische Beeren: Erst unmittelbar vor dem Snacken waschen! Lege nach dem Einkauf ein Blatt Küchenrolle auf den Boden der Packung – das saugt Kondensfeuchtigkeit auf und verhindert Schimmelbildung zuverlässig.';
    }
    if (itemNames.includes('pute') || itemNames.includes('hähnchen') || itemNames.includes('hack') || itemNames.includes('lachs') || itemNames.includes('garnele')) {
      return '🍗 Frisches Fleisch & Fisch: Immer ganz unten auf der Glasplatte direkt über dem Gemüsefach lagern – dort ist es mit 2–3°C am kältesten. Was du erst nach 3 Tagen zubereitest, direkt am Einkaufstag portionsweise einfrieren.';
    }
    if (itemNames.includes('spinat') || itemNames.includes('rucola') || itemNames.includes('salat') || itemNames.includes('feldsalat')) {
      return '🥗 Salat & Blattspinat: Einen halben Apfel oder ein trockenes Küchenpapier in die Tüte geben und fest verschließen. Übrig gebliebene Spinatblätter kannst du im Zweifel sofort einfrieren und direkt in die Pfanne oder den Smoothie werfen.';
    }
    if (itemNames.includes('skyr') || itemNames.includes('quark') || itemNames.includes('cremefine') || itemNames.includes('feta')) {
      return '🥛 Geöffnete Milchprodukte: Skyr & Magerquark mit einem Silikondeckel verschließen (hält 5–7 Tage). Angebrochenen Feta in ein Schraubglas mit leicht gesalzenem Wasser legen – so bleibt er bis zu 2 Wochen wunderbar frisch und cremig!';
    }
    if (itemNames.includes('brot') || itemNames.includes('toast') || itemNames.includes('vollkornbrot')) {
      return '🍞 Frisches Vollkornbrot: Die halbe Packung direkt scheibenweise einfrieren. Die Scheiben lassen sich morgens in 60 Sekunden im Toaster aufbacken – schmeckt knusprig wie frisch aus der Bäckerei!';
    }
    return '💡 Smarter Einkaufs-Tipp: Kaufe gezielt nach deinem Wochenplan ein. Durch die abgestimmten Portionsgrößen verhinderst du angebrochene Reste im Kühlschrank und sparst bares Geld.';
  }, [items, customAiTip]);

  const handleRequestAiTip = async () => {
    setIsLoadingAiTip(true);
    try {
      const topItems = items
        .filter((it) => !it.checked && !it.isPantry)
        .slice(0, 10)
        .map((it) => it.name)
        .join(', ');

      if (!topItems) {
        setCustomAiTip('Deine Einkaufsliste ist leer! Plane Mahlzeiten im Wochenplan, um smarte Frische-Tipps zu erhalten.');
        setIsLoadingAiTip(false);
        return;
      }

      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Gib mir genau ZWEI kurze, geniale Küchen- und Frischetipps zur richtigen Lagerung, Haltbarkeit oder Restevermeidung für folgende Produkte aus meinem aktuellen Einkaufskorb: ${topItems}. Formatiere es als 2 knappe Sätze mit passendem Emoji.`,
        }),
      });
      const data = await res.json();
      if (data.recipe?.instructions && data.recipe.instructions.length > 0) {
        setCustomAiTip(`✨ ${data.recipe.instructions.slice(0, 2).join(' ')}`);
      } else {
        setCustomAiTip('✨ Tipp: Frisches Gemüse und Kräuter immer trocken lagern und empfindliche Beeren erst kurz vor dem Essen waschen, um Schimmelbildung zu vermeiden.');
      }
    } catch (e) {
      setCustomAiTip('✨ Tipp: Trenne Äpfel und Bananen von anderem Obst, da ihr Reifegas (Ethylen) anderes Gemüse schneller verderben lässt.');
    } finally {
      setIsLoadingAiTip(false);
    }
  };

  // Custom Item Form State
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customCategory, setCustomCategory] = useState<ShoppingItem['category']>('Drogerie & Haushalt');

  // Supermarket walkthrough order: Produce -> Dairy/Fridge -> Meat/Fish -> Pantry -> Frozen -> Drugstore
  const standardCategories: ShoppingItem['category'][] = [
    'Frischetheke & Obst',
    'Kühlregal',
    'Geflügel & Fisch',
    'Vorrat & Gewürze',
    'Tiefkühl',
    'Drogerie & Haushalt',
  ];

  const categories = standardCategories;

  const categoryIcons: Record<ShoppingItem['category'], string> = {
    'Frischetheke & Obst': '🥑',
    'Kühlregal': '🥛',
    'Geflügel & Fisch': '🍗',
    'Tiefkühl': '❄️',
    'Vorrat & Gewürze': '🌾',
    'Drogerie & Haushalt': '🧼',
  };

  // Extract all scheduled dishes from weeklyPlan and items
  const allDishes = useMemo(() => {
    const dishMap = new Map<string, { title: string; days: Set<string> }>();

    if (weeklyPlan && weeklyPlan.length > 0) {
      weeklyPlan.forEach((day) => {
        if (day.isFastDay) return;
        const meals = [day.breakfast, day.lunch, day.dinner, day.snack].filter(Boolean) as Recipe[];
        meals.forEach((r) => {
          if (!dishMap.has(r.title)) {
            dishMap.set(r.title, { title: r.title, days: new Set() });
          }
          dishMap.get(r.title)!.days.add(day.dayName);
        });
      });
    }

    // Also include from items (e.g. in case custom items have recipe tags)
    items.forEach((item) => {
      item.recipes?.forEach((r) => {
        if (!dishMap.has(r)) {
          dishMap.set(r, { title: r, days: new Set() });
        }
        item.days?.forEach((d) => dishMap.get(r)!.days.add(d));
      });
    });

    return Array.from(dishMap.values())
      .map((d) => ({
        title: d.title,
        days: Array.from(d.days),
      }))
      .sort((a, b) => a.title.localeCompare(b.title, 'de'));
  }, [weeklyPlan, items]);

  // Filtered dishes available for currently selected day
  const visibleDishes = useMemo(() => {
    if (selectedDay === 'all') return allDishes;
    return allDishes.filter((d) => d.days.includes(selectedDay));
  }, [allDishes, selectedDay]);

  // Counts of uncompleted items per day
  const itemCountByDay = useMemo(() => {
    const map: Record<string, number> = {};
    DAYS.forEach((d) => {
      map[d] = items.filter((it) => !it.isPantry && !it.checked && it.days?.includes(d)).length;
    });
    return map;
  }, [items]);

  // Global Counts
  const toBuyCount = useMemo(() => items.filter((i) => !i.checked && !i.isPantry).length, [items]);
  const doneCount = useMemo(() => items.filter((i) => i.checked && !i.isPantry).length, [items]);
  const pantryCount = useMemo(() => items.filter((i) => i.isPantry).length, [items]);

  // Filtered items based on Tab + Day + Dish + Search
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'toBuy' && (item.checked || item.isPantry)) return false;
      if (activeTab === 'pantry' && !item.isPantry) return false;
      if (activeTab === 'done' && (!item.checked || item.isPantry)) return false;

      // Day filter
      if (selectedDay !== 'all') {
        if (!item.days || !item.days.includes(selectedDay)) {
          return false;
        }
      }

      // Dish filter
      if (selectedRecipe !== 'all') {
        if (!item.recipes || !item.recipes.includes(selectedRecipe)) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAmount = item.amount?.toLowerCase().includes(q) || false;
        const matchesPack = item.packAdvice?.toLowerCase().includes(q) || false;
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesRecipe = item.recipeSource?.toLowerCase().includes(q) || false;
        return matchesName || matchesAmount || matchesPack || matchesCat || matchesRecipe;
      }

      return true;
    });
  }, [items, activeTab, selectedDay, selectedRecipe, searchQuery]);

  // Count of items in current filtered view that still need buying
  const filteredToBuyCount = useMemo(() => {
    return filteredItems.filter((i) => !i.checked && !i.isPantry).length;
  }, [filteredItems]);

  const hasActiveFilters = selectedDay !== 'all' || selectedRecipe !== 'all';

  // WhatsApp / Clipboard export (respects active day / dish filters!)
  const handleShare = async () => {
    const activeItems = filteredItems.filter((i) => !i.isPantry);

    let filterContext = '';
    if (selectedDay !== 'all' && selectedRecipe !== 'all') {
      filterContext = ` (${selectedDay} • ${selectedRecipe})`;
    } else if (selectedDay !== 'all') {
      filterContext = ` (Nur ${selectedDay})`;
    } else if (selectedRecipe !== 'all') {
      filterContext = ` (Gericht: ${selectedRecipe})`;
    }

    let text = `🛒 *fit und healthy Einkaufsliste${filterContext}*\n`;
    text += `Datum: ${new Date().toLocaleDateString('de-DE')} • ${activeItems.length} Artikel\n\n`;

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
        await navigator.share({ title: `Einkaufsliste Nicole${filterContext}`, text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    if (onAddCustomItem) {
      onAddCustomItem(customName.trim(), customAmount.trim(), customCategory);
      setCustomName('');
      setCustomAmount('');
      setIsAddingCustom(false);
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

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={() => {
                setIsRouteOrdered(!isRouteOrdered);
                triggerHaptic(15);
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] cursor-pointer ${
                isRouteOrdered
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Sortiert Abteilungen nach dem optimalen Laufweg durch den Supermarkt (Gemüse -> Frische -> Fleisch -> Vorrat -> Tiefkühl -> Kasse)"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isRouteOrdered ? 'Markt-Route aktiv' : 'Markt-Route'}</span>
            </button>

            <button
              onClick={() => setIsAddingCustom(!isAddingCustom)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] transition-all active:scale-[0.98]"
              title="Eigenen Haushalts- oder Drogerieartikel hinzufügen"
            >
              <Plus className="w-3.5 h-3.5 text-[#789A99]" />
              Eigener Artikel
            </button>

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

        {/* Quick Add Custom Item Form */}
        {isAddingCustom && (
          <form
            onSubmit={handleCreateCustomItem}
            className="p-4 bg-[#F8FAF9] rounded-2xl border border-[#C5D8D7] space-y-3 animate-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#3D5B5A] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#789A99]" /> Eigenen Artikel hinzufügen (z. B. Drogerie, Haushalt, Getränke):
              </span>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Schließen ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-5 relative">
                <input
                  type="text"
                  placeholder="Artikelname (z. B. Mineralwasser, Spülmittel, Zahnpasta)..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  autoFocus
                  className="w-full pl-3 pr-9 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#789A99]"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <SpeechInputButton
                    onTranscript={(txt) => setCustomName(txt)}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Menge (z. B. 2 Kisten, 1 Flasche)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#789A99]"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-2">
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className="w-full px-2.5 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#789A99]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryIcons[cat]} {cat}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#789A99] hover:bg-[#658584] text-white transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer shadow-xs"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          </form>
        )}

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
              placeholder="Zutat oder Gericht suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-9 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#789A99]"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <SpeechInputButton
                size="sm"
                onTranscript={(txt) => setSearchQuery(txt)}
              />
            </div>
          </div>

        </div>

        {/* --- Days & Dishes Filter Controls --- */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          
          {/* Day Pills Filter */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#789A99]" />
              <span>Nach Tag filtern:</span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedDay('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  selectedDay === 'all'
                    ? 'bg-[#789A99] text-white shadow-xs font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                Ganze Woche
              </button>

              {DAYS.map((day) => {
                const count = itemCountByDay[day] || 0;
                const isSelected = selectedDay === day;
                const shortName = day.slice(0, 2);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? 'all' : day)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#789A99] text-white shadow-xs font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                    }`}
                    title={`${day}: ${count} Produkte benötigt`}
                  >
                    <span>{shortName}</span>
                    <span className="hidden xl:inline">{day.slice(2)}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dish Selector Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
              <Utensils className="w-3.5 h-3.5 text-[#789A99]" />
              <span>Nach Gericht filtern:</span>
            </div>

            <div className="relative flex-1 sm:max-w-md">
              <select
                value={selectedRecipe}
                onChange={(e) => setSelectedRecipe(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#789A99] transition-colors appearance-none cursor-pointer"
              >
                <option value="all">
                  Alle Gerichte {selectedDay !== 'all' ? `(${selectedDay})` : '(Ganze Woche)'}
                </option>
                {visibleDishes.map((d) => (
                  <option key={d.title} value={d.title}>
                    {d.title} {d.days.length > 0 ? `[${d.days.map((x) => x.slice(0, 2)).join(', ')}]` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Active Filter Badges & Reset Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between gap-2 pt-2.5 px-3.5 py-2.5 bg-[#EBF2F2]/80 rounded-xl border border-[#C5D8D7] text-xs text-[#2C4847] flex-wrap animate-in fade-in duration-150">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#789A99]" /> Aktiver Filter:
              </span>

              {selectedDay !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-[#C5D8D7] text-slate-800 font-semibold shadow-2xs">
                  📅 {selectedDay}
                  <button
                    onClick={() => setSelectedDay('all')}
                    className="hover:text-rose-600 transition-colors ml-0.5"
                    title="Tagesfilter aufheben"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedRecipe !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-[#C5D8D7] text-slate-800 font-semibold max-w-[260px] truncate shadow-2xs">
                  🍲 {selectedRecipe}
                  <button
                    onClick={() => setSelectedRecipe('all')}
                    className="hover:text-rose-600 transition-colors ml-0.5"
                    title="Gerichte-Filter aufheben"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <span className="text-slate-600 font-mono text-[11px]">
                ({filteredItems.length} {filteredItems.length === 1 ? 'Artikel' : 'Artikel'} passend)
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedDay('all');
                setSelectedRecipe('all');
              }}
              className="text-xs font-semibold text-[#789A99] hover:text-[#586F73] underline hover:no-underline transition-all"
            >
              Filter zurücksetzen
            </button>
          </div>
        )}

      </div>

      {/* Main Items Display grouped by Supermarket Aisle */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center shadow-xs space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">
            {hasActiveFilters
              ? 'Keine Artikel für die gewählten Filter gefunden'
              : activeTab === 'toBuy'
              ? 'Keine offenen Einkäufe mehr!'
              : activeTab === 'pantry'
              ? 'Keine Vorratsartikel abgelegt.'
              : activeTab === 'done'
              ? 'Noch keine Einkäufe abgehakt.'
              : 'Keine Zutaten gefunden.'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Passe den Tag oder das Gericht an oder setze die Filter zurück.'
              : activeTab === 'toBuy'
              ? 'Alle benötigten Produkte für deinen aktuellen Wochenplan sind erledigt oder im Vorratsschrank.'
              : 'Passe den Filter an oder klicke oben auf „Aktualisieren“.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSelectedDay('all');
                setSelectedRecipe('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-semibold text-[#789A99] bg-[#EBF2F2] hover:bg-[#DEE9E8] px-3 py-1.5 rounded-lg border border-[#C5D8D7] transition-colors"
            >
              Alle Filter aufheben
            </button>
          )}
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
                        onClick={() => {
                          triggerHaptic(18);
                          onToggleItem(item.id);
                        }}
                        className="flex items-start gap-3 flex-1 text-left active:scale-[0.99] transition-transform cursor-pointer"
                      >
                        <div className="pt-0.5 shrink-0 active:scale-75 transition-transform duration-150">
                          {item.checked ? (
                            <CheckSquare className="w-4 h-4 text-[#789A99] animate-in zoom-in-75 duration-150" />
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

                          {/* Day Pills & Recipe Source Badges */}
                          <div className="flex items-center gap-2 flex-wrap pt-0.5">
                            {item.isCustom && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold">
                                Eigener Eintrag
                              </span>
                            )}

                            {item.days && item.days.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <Calendar className="w-2.5 h-2.5 text-[#789A99] shrink-0" />
                                {item.days.map((d) => (
                                  <span
                                    key={d}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDay(d);
                                    }}
                                    className={`text-[9px] px-1.5 py-0.2 rounded font-medium cursor-pointer transition-colors ${
                                      selectedDay === d
                                        ? 'bg-[#789A99] text-white font-semibold'
                                        : 'bg-slate-100 hover:bg-[#EBF2F2] text-slate-600 hover:text-[#3D5B5A]'
                                    }`}
                                    title={`Klicken, um nur Artikel für ${d} anzuzeigen`}
                                  >
                                    {d.slice(0, 2)}
                                  </span>
                                ))}
                              </div>
                            )}

                            {item.recipeSource && (
                              <div className="flex items-start gap-1 text-[10px] text-slate-400 mt-0.5 max-w-full">
                                <ChefHat className="w-2.5 h-2.5 shrink-0 text-[#789A99] mt-0.5" />
                                <span className="break-words leading-tight whitespace-normal">
                                  Für: {item.recipeSource}
                                </span>
                              </div>
                            )}
                          </div>

                        </div>
                      </button>

                      {/* Pantry Toggle & Delete Custom Button */}
                      <div className="flex items-center gap-1 shrink-0 ml-2 pt-0.5">
                        <button
                          onClick={() => {
                            triggerHaptic(15);
                            onTogglePantry(item.id);
                          }}
                          className={`text-[10px] px-2 py-1 rounded-lg font-medium border transition-all cursor-pointer ${
                            item.isPantry
                              ? 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200/70'
                              : 'text-slate-400 border-transparent hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                          }`}
                          title={item.isPantry ? 'Von Vorrat zurück auf Einkaufsliste setzen' : 'Als Vorrat markieren (bereits im Haus)'}
                        >
                          <Archive className="w-2.5 h-2.5 inline mr-1" />
                          {item.isPantry ? 'Im Vorrat' : 'Hab ich da'}
                        </button>

                        {item.isCustom && onDeleteCustomItem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCustomItem(item.id);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eigenen Eintrag löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Supermarket & Freshness Tip */}
      <div className="bg-[#FAF5F2] border border-[#FFD2C2]/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-3.5">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#994931] shrink-0 border border-[#FFD2C2] shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#994931]" />
          </div>
          <div className="space-y-1 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">
              Smarter Supermarkt- &amp; Frische-Tipp:
            </p>
            <p className="text-slate-600 leading-relaxed">
              {dynamicTip}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRequestAiTip}
          disabled={isLoadingAiTip}
          className="self-end sm:self-center shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#FFF4F0] text-[#994931] border border-[#FFD2C2] transition-all active:scale-95 shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
          title="Erzeugt maßgeschneiderte Frische- und Lagerungstipps speziell für deinen aktuellen Korb"
        >
          {isLoadingAiTip ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-[#994931]" />
              <span>Analysiere Korb...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-[#994931]" />
              <span>KI-Frische-Tipp</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
