'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  UploadCloud,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  PieChart,
  PlusCircle,
  RotateCcw,
  Utensils,
  Zap,
  Sliders
} from 'lucide-react';
import { MealType, Recipe } from '@/lib/types';

interface FoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userApiKey?: string;
  groqApiKey?: string;
  geminiApiKey?: string;
  aiProvider?: 'groq' | 'gemini';
  onLogMeal?: (recipe: Recipe, slot: MealType) => void;
  onOpenSettings?: () => void;
}

interface ScanResult {
  dishName: string;
  estimatedMacros: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  };
  plateRatio: {
    veggiesPercent: number;
    proteinPercent: number;
    carbsPercent: number;
  };
  detectedIngredients: string[];
  suitability: 'great' | 'caution-fat' | 'low-protein';
  nicoleVerdict: string;
  tips: string;
}

export const FoodScannerModal: React.FC<FoodScannerModalProps> = ({
  isOpen,
  onClose,
  userApiKey,
  groqApiKey,
  geminiApiKey,
  aiProvider = 'groq',
  onLogMeal,
  onOpenSettings,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanSource, setScanSource] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [targetSlot, setTargetSlot] = useState<MealType>('lunch');
  const [isLogged, setIsLogged] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Compress & downscale image via HTML5 Canvas (10MB -> ~150KB)
  const processImageFile = (file: File) => {
    setErrorMsg('');
    setResult(null);
    setIsLogged(false);

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
          setSelectedImage(compressedDataUrl);
          analyzeImage(compressedDataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/scan-food', {
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
      if (!res.ok) throw new Error(data.error || 'Fehler bei der Foto-Analyse');

      setResult(data.result);
      setScanSource(data.source || '');
    } catch (err: any) {
      setErrorMsg(err.message || 'Verbindung zum Food-Scanner fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setScanSource('');
    setErrorMsg('');
    setIsLogged(false);
  };

  const handleLogToDay = () => {
    if (!result || !onLogMeal) return;

    const loggedRecipe: Recipe = {
      id: `scanned-${Date.now()}`,
      title: result.dishName,
      subtitle: 'Foto-Scan Mahlzeit',
      mealType: targetSlot,
      category: targetSlot === 'breakfast' ? 'Frühstück 2.0' : targetSlot === 'snack' ? 'Snacks & Dessert' : 'Gesunder Teller',
      prepMins: 15,
      kcal: result.estimatedMacros.kcal,
      protein: result.estimatedMacros.protein,
      fat: result.estimatedMacros.fat,
      carbs: result.estimatedMacros.carbs,
      fiber: result.estimatedMacros.fiber || 5,
      plateRatio: result.plateRatio,
      tags: ['Foto-Scan', 'Getrackt', result.suitability === 'great' ? 'High-Protein' : 'Individuell'],
      whyNicole: result.nicoleVerdict,
      ingredients: {
        'Erkannte Komponenten': result.detectedIngredients || ['Zutaten per Foto-Scan erfasst'],
      },
      instructions: [
        'Dieses Gericht wurde per Foto-Food-Scanner erfasst und analysiert.',
        result.tips ? `Ernährungs-Tipp: ${result.tips}` : 'Passend zu Deinem Makro-Budget.',
      ],
      isAiGenerated: true,
      image: selectedImage || undefined,
    };

    onLogMeal(loggedRecipe, targetSlot);
    setIsLogged(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-linear-to-r from-[#111C1E] to-[#1F3135] text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFD2C2]/20 text-[#FFD2C2] border border-[#FFD2C2]/30 flex items-center gap-1">
                <Camera className="w-3 h-3" /> Smart Vision AI
              </span>
              <span className="text-xs text-slate-300">
                Groq Vision & Gemini
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1.5 text-white">
              Foto-Food-Scanner
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
              Fotografiere deinen Teller (z. B. im Restaurant, Kantine oder unterwegs). Die multimodale KI prüft sofort Fettlimit, Protein und den gesunden Teller.
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Hidden native file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Upload / Camera Hero when no image selected */}
          {!selectedImage && (
            <div className="border-2 border-dashed border-slate-300 hover:border-[#789A99] rounded-3xl p-8 text-center transition-all bg-slate-50/60 hover:bg-slate-50 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-[#789A99]">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Teller fotografieren oder Foto hochladen
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  JPG, PNG oder Live-Foto. Die KI erkennt Zutaten, schätzt Gramm-Mengen und Nährwerte.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#789A99] hover:bg-[#658584] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  Kamera öffnen
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <UploadCloud className="w-4 h-4 text-[#789A99]" />
                  Foto aus Galerie
                </button>
              </div>
            </div>
          )}

          {/* Image Preview & Scanning Laser */}
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 max-h-64 sm:max-h-72 flex items-center justify-center group">
                <img
                  src={selectedImage}
                  alt="Teller Foto"
                  className="w-full h-full object-cover max-h-64 sm:max-h-72"
                />

                {/* Laser scan animation when loading */}
                {loading && (
                  <div className="absolute inset-0 bg-emerald-950/20 pointer-events-none flex flex-col justify-between">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                      <div className="bg-white/95 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold text-slate-900 border border-emerald-200">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        Analysiere Teller & Nährwerte...
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset button */}
                {!loading && (
                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                    title="Neues Foto wählen"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Scan Results Dashboard */}
              {result && (
                <div className="space-y-4 animate-in fade-in-50 duration-300">
                  
                  {/* Engine Source Badge */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-100/80 border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      {scanSource.startsWith('groq') || scanSource.startsWith('gemini') ? (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Live-KI Vision ({scanSource.startsWith('groq') ? 'Groq Llama 3.2 Vision' : 'Gemini 1.5 Flash Vision'})
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1.5 shadow-xs">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          Smart-Heuristik Modus (Kein API-Key hinterlegt)
                        </span>
                      )}
                    </div>

                    {!scanSource.startsWith('groq') && !scanSource.startsWith('gemini') && onOpenSettings && (
                      <button
                        type="button"
                        onClick={onOpenSettings}
                        className="text-[11px] font-semibold text-[#789A99] hover:text-[#586F73] flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Sliders className="w-3 h-3" />
                        Kostenlosen Key hinterlegen für Live-KI &rarr;
                      </button>
                    )}
                  </div>

                  {/* Dish Title & Suitability Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#789A99] block">
                        Erkanntes Gericht:
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                        {result.dishName}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 self-start sm:self-center flex items-center gap-1.5 ${
                        result.suitability === 'great'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : result.suitability === 'caution-fat'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}
                    >
                      {result.suitability === 'great' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {result.suitability === 'caution-fat' && <AlertTriangle className="w-3.5 h-3.5" />}
                      {result.suitability === 'great'
                        ? 'Top Nicole-Match'
                        : result.suitability === 'caution-fat'
                        ? 'Fett-Limit beachten'
                        : 'Protein ergänzen'}
                    </span>
                  </div>

                  {/* Macro Cards Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                      <span className="text-[10px] text-slate-400 font-semibold block">Kalorien</span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                        {result.estimatedMacros.kcal}
                      </span>
                      <span className="text-[9px] text-slate-400 block">kcal</span>
                    </div>

                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center shadow-xs">
                      <span className="text-[10px] text-emerald-800 font-semibold block">Protein</span>
                      <span className="text-sm sm:text-base font-bold text-emerald-700 font-mono">
                        {result.estimatedMacros.protein}g
                      </span>
                      <span className="text-[9px] text-emerald-600 block">Ziel: &gt;35g</span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border text-center shadow-xs ${
                        result.estimatedMacros.fat <= 12
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-rose-50 border-rose-200'
                      }`}
                    >
                      <span className="text-[10px] text-slate-500 font-semibold block">Fett</span>
                      <span
                        className={`text-sm sm:text-base font-bold font-mono ${
                          result.estimatedMacros.fat <= 12 ? 'text-[#994931]' : 'text-rose-600'
                        }`}
                      >
                        {result.estimatedMacros.fat}g
                      </span>
                      <span className="text-[9px] text-slate-400 block">Limit: 44g/Tag</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                      <span className="text-[10px] text-slate-400 font-semibold block">Carbs</span>
                      <span className="text-sm sm:text-base font-bold text-slate-800 font-mono">
                        {result.estimatedMacros.carbs}g
                      </span>
                      <span className="text-[9px] text-slate-400 block">Vollwertig</span>
                    </div>
                  </div>

                  {/* "Der gesunde Teller" Ratio Bar */}
                  {result.plateRatio && (
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1">
                          <PieChart className="w-3.5 h-3.5 text-[#789A99]" />
                          Teller-Aufteilung ("Der gesunde Teller"):
                        </span>
                        <span className="text-[11px] text-slate-500">Ziel: 50% / 25% / 25%</span>
                      </div>

                      <div className="h-4 rounded-full overflow-hidden flex shadow-inner">
                        <div
                          style={{ width: `${result.plateRatio.veggiesPercent}%` }}
                          className="bg-emerald-500 h-full flex items-center justify-center text-[9px] text-white font-bold"
                          title={`Gemüse: ${result.plateRatio.veggiesPercent}%`}
                        >
                          {result.plateRatio.veggiesPercent}% Gemüse
                        </div>
                        <div
                          style={{ width: `${result.plateRatio.proteinPercent}%` }}
                          className="bg-sky-500 h-full flex items-center justify-center text-[9px] text-white font-bold"
                          title={`Protein: ${result.plateRatio.proteinPercent}%`}
                        >
                          {result.plateRatio.proteinPercent}% Prot
                        </div>
                        <div
                          style={{ width: `${result.plateRatio.carbsPercent}%` }}
                          className="bg-amber-400 h-full flex items-center justify-center text-[9px] text-amber-950 font-bold"
                          title={`Carbs: ${result.plateRatio.carbsPercent}%`}
                        >
                          {result.plateRatio.carbsPercent}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nicole Nutrition Feedback Verdict */}
                  <div className="p-4 rounded-2xl bg-linear-to-br from-[#FAF5F2] to-[#F5ECE8] border border-[#FFD2C2] space-y-2">
                    <span className="text-xs font-bold text-[#994931] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Nicole-Ernährungs-Check:
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {result.nicoleVerdict}
                    </p>
                    {result.tips && (
                      <p className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-[#FFD2C2]/60 mt-1">
                        💡 <span className="font-semibold text-slate-700">Tipp:</span> {result.tips}
                      </p>
                    )}
                  </div>

                  {/* Action: Log to today's plan */}
                  {onLogMeal && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="text-xs font-bold text-slate-800 block">
                        Als Mahlzeit in den heutigen Tag übernehmen:
                      </span>

                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <select
                          value={targetSlot}
                          onChange={(e) => setTargetSlot(e.target.value as MealType)}
                          className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#789A99]"
                        >
                          <option value="breakfast">🍳 Frühstück</option>
                          <option value="lunch">🥗 Mittagessen</option>
                          <option value="dinner">🍲 Abendessen</option>
                          <option value="snack">🍎 Snack</option>
                        </select>

                        <button
                          onClick={handleLogToDay}
                          disabled={isLogged}
                          className={`w-full sm:flex-1 py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                            isLogged
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-[#789A99] hover:bg-[#658584] text-white active:scale-95'
                          }`}
                        >
                          {isLogged ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> Im Wochenplan eingetragen!
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-4 h-4" /> In Plan eintragen
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
