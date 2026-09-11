'use client';

import React, { useState, useMemo, useRef } from 'react';
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
  Utensils,
  Camera,
  UploadCloud,
  ShoppingCart,
  CheckCircle2,
  CalendarPlus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Recipe, MealType } from '@/lib/types';
import { RecipeImage } from './RecipeImage';

interface FridgeScanRecipe {
  title: string;
  description: string;
  prepTime: number;
  category: MealType;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  ingredientsAvailable: string[];
  ingredientsNeeded: string[];
  shoppingItems: string[];
  instructions: string[];
}

interface FridgeScanResult {
  detectedIngredients: string[];
  recipe: FridgeScanRecipe;
  nicoleVerdict: string;
  quickTip: string;
}

interface FridgeLeftoversModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  onOpenCookMode: (recipe: Recipe) => void;
  onSelectForPlan?: (recipe: Recipe) => void;
  onGenerateAiWithIngredients?: (ingredients: string[]) => void;
  customImages?: Record<string, string>;
  userApiKey?: string;
  groqApiKey?: string;
  geminiApiKey?: string;
  aiProvider?: 'groq' | 'gemini';
  onAddMissingToShoppingList?: (items: string[]) => void;
  onLogGeneratedRecipeToPlan?: (recipe: Recipe, slot: MealType) => void;
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
  userApiKey,
  groqApiKey,
  geminiApiKey,
  aiProvider = 'gemini',
  onAddMissingToShoppingList,
  onLogGeneratedRecipeToPlan,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');

  // Camera & Photo State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanResult, setScanResult] = useState<FridgeScanResult | null>(null);
  const [addedToShopping, setAddedToShopping] = useState(false);
  const [selectedPlanSlot, setSelectedPlanSlot] = useState<MealType>('lunch');
  const [planLoggedNotice, setPlanLoggedNotice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  // Process and downscale image to 800px JPEG via HTML5 Canvas
  const processImageFile = (file: File) => {
    setScanError('');
    setScanResult(null);
    setAddedToShopping(false);
    setPlanLoggedNotice(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.80);
          setPhotoPreview(compressedDataUrl);
          analyzeFridgeImage(compressedDataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const analyzeFridgeImage = async (base64Image: string) => {
    setIsScanning(true);
    setScanError('');

    try {
      const res = await fetch('/api/scan-fridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          userApiKey,
          groqApiKey,
          geminiApiKey,
          provider: aiProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler bei der Reste-Foto-Erkennung');

      setScanResult(data.result);

      // Auto-add recognized ingredients to selected staples
      if (Array.isArray(data.result?.detectedIngredients)) {
        setSelectedIngredients((prev) => {
          const combined = new Set([...prev, ...data.result.detectedIngredients]);
          return Array.from(combined);
        });
      }
    } catch (err: any) {
      console.error('Scan fridge error:', err);
      setScanError(err.message || 'Die Foto-Erkennung konnte nicht abgeschlossen werden.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleResetPhoto = () => {
    setPhotoPreview(null);
    setScanResult(null);
    setScanError('');
    setAddedToShopping(false);
    setPlanLoggedNotice(false);
  };

  // Convert AI generated fridge recipe to Nicole App Recipe structure
  const buildRecipeObject = (r: FridgeScanRecipe): Recipe => {
    return {
      id: `fridge_ai_${Date.now()}`,
      title: r.title,
      subtitle: 'Resteverwertung (Vision-KI)',
      mealType: r.category || 'lunch',
      category:
        r.category === 'breakfast'
          ? 'Frühstück 2.0'
          : r.category === 'snack'
          ? 'Snacks & Dessert'
          : 'Gesunder Teller',
      prepMins: r.prepTime || 15,
      kcal: r.calories,
      protein: r.protein,
      fat: r.fat,
      carbs: r.carbs,
      fiber: r.fiber || 6,
      whyNicole: scanResult?.nicoleVerdict || 'Ausgewogene Resteverwertung mit optimaler Makro-Bilanz.',
      ingredients: {
        'Bereits vorhanden (vom Foto)': r.ingredientsAvailable || [],
        'Das brauchst du noch': r.ingredientsNeeded || [],
      },
      instructions: r.instructions || [],
      tags: ['Resteverwerter', 'KI-Kreation'],
      isAiGenerated: true,
    };
  };

  const handleCookAiRecipe = () => {
    if (!scanResult?.recipe) return;
    const rec = buildRecipeObject(scanResult.recipe);
    onOpenCookMode(rec);
    onClose();
  };

  const handleAddShoppingItems = () => {
    if (!scanResult?.recipe) return;
    const itemsToAdd =
      scanResult.recipe.shoppingItems && scanResult.recipe.shoppingItems.length > 0
        ? scanResult.recipe.shoppingItems
        : scanResult.recipe.ingredientsNeeded;

    if (onAddMissingToShoppingList && itemsToAdd.length > 0) {
      onAddMissingToShoppingList(itemsToAdd);
      setAddedToShopping(true);
      setTimeout(() => setAddedToShopping(false), 3000);
    }
  };

  const handleLogToPlan = () => {
    if (!scanResult?.recipe || !onLogGeneratedRecipeToPlan) return;
    const rec = buildRecipeObject(scanResult.recipe);
    onLogGeneratedRecipeToPlan(rec, selectedPlanSlot);
    setPlanLoggedNotice(true);
    setTimeout(() => {
      setPlanLoggedNotice(false);
      onClose();
    }, 1200);
  };

  // Score recipes by matching ingredients
  const matchedRecipes = useMemo(() => {
    if (!isOpen || selectedIngredients.length === 0 || !Array.isArray(recipes)) return [];

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
  }, [isOpen, recipes, selectedIngredients]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-linear-to-r from-[#111C1E] to-[#1F3135] text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFD2C2]/20 text-[#FFD2C2] border border-[#FFD2C2]/30 flex items-center gap-1">
                <ChefHat className="w-3 h-3" /> Zero-Waste Chef &amp; Foto-Scanner
              </span>
              <span className="text-xs text-slate-300">
                160 Nicole-Rezepte + Live-Vision
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1.5 text-white">
              Kühlschrank-Resteverwerter
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Knipse deine Reste auf der Arbeitsplatte oder wähle Zutaten aus. Die KI erkennt Zutaten automatisch, trennt in <em>Vorhanden</em> vs. <em>Was du noch brauchst</em> und schlägt das perfekte Rezept vor!
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Hidden file inputs for Camera & Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && processImageFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={(e) => e.target.files?.[0] && processImageFile(e.target.files[0])}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Photo Capture Hero Box */}
          <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-50/70 via-teal-50/50 to-slate-50 border border-emerald-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Reste auf der Küchenplatte fotografieren
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Neu: Vision-KI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Leg deine Reste kurz zusammen und knipse 1 Foto. Die KI erkennt alles automatisch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isScanning}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Kamera
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#789A99]" />
                  Foto-Upload
                </button>
              </div>
            </div>

            {/* Scanning Progress */}
            {isScanning && (
              <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center gap-3 text-emerald-800 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">
                  Google Gemini analysiert deine Reste &amp; kreiert das perfekte Nicole-Rezept...
                </span>
              </div>
            )}

            {/* Scanning Error */}
            {scanError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}
          </div>

          {/* AI Recipe Card Result from Photo */}
          {scanResult && scanResult.recipe && (
            <div className="p-5 rounded-3xl bg-linear-to-b from-[#FAF5F2] to-white border-2 border-[#FFD2C2] shadow-md space-y-4 animate-in fade-in-50 duration-300">
              
              {/* Recipe Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-orange-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFD2C2] text-[#994931]">
                      ✨ KI-Reste-Rezept
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#789A99]" />
                      {scanResult.recipe.prepTime} Min.
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {scanResult.recipe.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {scanResult.recipe.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetPhoto}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 self-start cursor-pointer hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  Neu fotografieren
                </button>
              </div>

              {/* Macro Pills Grid */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Kalorien</span>
                  <span className="text-sm font-bold font-mono text-slate-900">{scanResult.recipe.calories}</span>
                  <span className="text-[9px] text-slate-400 block">kcal</span>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center shadow-xs">
                  <span className="text-[10px] text-emerald-800 block font-semibold">Protein</span>
                  <span className="text-sm font-bold font-mono text-emerald-700">{scanResult.recipe.protein}g</span>
                  <span className="text-[9px] text-emerald-600 block">Ziel: &gt;35g</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-center shadow-xs">
                  <span className="text-[10px] text-amber-900 block font-semibold">Fett</span>
                  <span className="text-sm font-bold font-mono text-[#994931]">{scanResult.recipe.fat}g</span>
                  <span className="text-[9px] text-slate-400 block">Max 44g/Tag</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Carbs</span>
                  <span className="text-sm font-bold font-mono text-slate-800">{scanResult.recipe.carbs}g</span>
                  <span className="text-[9px] text-slate-400 block">Vollwertig</span>
                </div>
              </div>

              {/* Nicole Verdict Box */}
              {scanResult.nicoleVerdict && (
                <div className="p-3 bg-white/80 rounded-xl border border-[#FFD2C2]/80 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#994931] block mb-0.5">Nicole-Bewertung:</strong>
                  {scanResult.nicoleVerdict}
                </div>
              )}

              {/* Dual Ingredients Comparison: Vorhanden vs. Das brauchst du noch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* Available from Photo */}
                <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bereits da (vom Foto erkannt):</span>
                  </div>
                  <ul className="space-y-1">
                    {scanResult.recipe.ingredientsAvailable.map((ing, idx) => (
                      <li key={idx} className="text-xs text-emerald-800 flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Needed from Pantry or Store */}
                <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <ShoppingCart className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Das brauchst du noch:</span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold">Vorrat / Einkauf</span>
                  </div>
                  <ul className="space-y-1">
                    {scanResult.recipe.ingredientsNeeded.map((ing, idx) => (
                      <li key={idx} className="text-xs text-amber-900 flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>

                  {/* 1-Click to Shopping List */}
                  {onAddMissingToShoppingList && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAddShoppingItems}
                        disabled={addedToShopping}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                          addedToShopping
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        {addedToShopping ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Fehlende Zutaten auf Einkaufsliste gesetzt!
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Fehlende Zutaten auf Einkaufsliste setzen (+{scanResult.recipe.shoppingItems?.length || scanResult.recipe.ingredientsNeeded.length})
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Buttons: Jetzt kochen & In Wochenplan eintragen */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-orange-100">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {onLogGeneratedRecipeToPlan && (
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <select
                        value={selectedPlanSlot}
                        onChange={(e) => setSelectedPlanSlot(e.target.value as MealType)}
                        className="text-xs p-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-[#789A99]"
                      >
                        <option value="lunch">Heute Mittag</option>
                        <option value="dinner">Heute Abend</option>
                        <option value="breakfast">Heute Frühstück</option>
                        <option value="snack">Heute Snack</option>
                      </select>

                      <button
                        type="button"
                        onClick={handleLogToPlan}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-[#789A99]" />
                        {planLoggedNotice ? 'Eingetragen ✓' : 'In Plan'}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCookAiRecipe}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#994931] hover:bg-[#803823] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <ChefHat className="w-4 h-4" />
                  Jetzt kochen (Kochmodus starten)
                </button>
              </div>

            </div>
          )}

          {/* Manual Staples & Custom Input */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Zutaten manuell auswählen oder ergänzen:
              </span>
              {selectedIngredients.length > 0 && (
                <button
                  onClick={() => setSelectedIngredients([])}
                  className="text-xs text-[#789A99] hover:underline cursor-pointer"
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
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-50 transition-colors cursor-pointer"
              >
                + Zutat
              </button>
            </form>
          </div>

          {/* AI Magic Generator CTA if ingredients selected and no photo card */}
          {selectedIngredients.length > 0 && !scanResult && onGenerateAiWithIngredients && (
            <div className="bg-linear-to-r from-[#FAF5F2] to-[#F5ECE8] p-4 rounded-2xl border border-[#FFD2C2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-white text-[#994931] border border-[#FFD2C2] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Rezept mit diesen Resten generieren?
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

          {/* Matched Recipes from 160 recipes pool */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Gefundene Treffer aus deinen 160 Original-Rezepten:
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {matchedRecipes.length} passende Rezepte
              </span>
            </div>

            {selectedIngredients.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60 text-slate-400 space-y-1">
                <Utensils className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                <p className="text-xs font-semibold text-slate-600">Fotografiere deine Reste oder wähle oben Zutaten aus</p>
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
