'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { MealType, Recipe } from '@/lib/types';
import { RecipeImage } from './RecipeImage';
import { SpeechInputButton } from './SpeechInputButton';

interface AiRecipeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecipe: (recipe: Recipe) => void;
  userApiKey?: string;
  groqApiKey?: string;
  geminiApiKey?: string;
  aiProvider?: 'groq' | 'gemini';
  initialMealType?: MealType;
  initialFridgeIngredients?: string;
}

export const AiRecipeGeneratorModal: React.FC<AiRecipeGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSaveRecipe,
  userApiKey,
  groqApiKey,
  geminiApiKey,
  aiProvider = 'groq',
  initialMealType = 'lunch',
  initialFridgeIngredients = '',
}) => {
  const [prompt, setPrompt] = useState('');
  const [fridgeIngredients, setFridgeIngredients] = useState(initialFridgeIngredients);
  const [mode, setMode] = useState<'creative' | 'fridge'>(initialFridgeIngredients ? 'fridge' : 'fridge');
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (initialFridgeIngredients) {
      setFridgeIngredients(initialFridgeIngredients);
      setMode('fridge');
    }
  }, [initialFridgeIngredients, isOpen]);

  if (!isOpen) return null;

  const quickFridgeChips = [
    '½ Becher Skyr',
    '1 Zucchini',
    '2 Eier',
    '½ Feta light',
    'Brokkoli',
    'Champignons',
    'TK-Beeren',
    'Möhren',
    'Paprika',
    'Thunfisch Dose',
  ];

  const handleAddChip = (chip: string) => {
    setFridgeIngredients((prev) => (prev ? `${prev}, ${chip}` : chip));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg('');

    const effectivePrompt =
      mode === 'fridge'
        ? `[Kühlschrank-Reste-Verwertung]: Verwende vorrangig folgende vorhandene Reste: ${fridgeIngredients || 'Typische geöffnete Reste wie Zucchini, Skyr, Eier oder Gemüse'}. Ergänze nur Grundvorräte und halte streng die Nährwerte (max. 10g Fett) ein.`
        : prompt;

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: effectivePrompt,
          mealType,
          userApiKey,
          groqApiKey,
          geminiApiKey,
          provider: aiProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler bei der KI-Generierung');

      setGeneratedRecipe(data.recipe);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verbindung zur KI fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = () => {
    if (!generatedRecipe) return;
    onSaveRecipe(generatedRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E0EAE9] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#F0F5F4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF4F0] border border-[#FFD2C2] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#994931]" />
            </div>
            <div>
              <h3 className="font-bold text-[#111C1E] text-base">KI-Rezept-Generator</h3>
              <p className="text-xs text-[#586F73]">Strikt nach Deinen Makro-Grenzwerten & Ernährungstipps</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#111C1E] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {!generatedRecipe ? (
            <>
              {/* Mode Selector (Reste-Retter vs Kreativ) */}
              <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('fridge')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    mode === 'fridge'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🥫 Kühlschrank-Reste-Retter
                </button>
                <button
                  type="button"
                  onClick={() => setMode('creative')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    mode === 'creative'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ✨ Freie Rezeptidee
                </button>
              </div>

              {/* Slot Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#111C1E] mb-1.5">
                  Für welche Mahlzeit möchtest du das Rezept?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'breakfast', label: 'Frühstück' },
                    { id: 'lunch', label: 'Mittag' },
                    { id: 'dinner', label: 'Abend' },
                    { id: 'snack', label: 'Snack' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMealType(m.id as MealType)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                        mealType === m.id
                          ? 'bg-[#789A99] text-white border-[#789A99]'
                          : 'bg-[#F8FAFA] text-[#586F73] border-[#E0EAE9] hover:bg-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fridge Mode Input */}
              {mode === 'fridge' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#111C1E]">
                      Welche Reste liegen noch im Kühlschrank?
                    </label>
                    <div className="flex items-center gap-2">
                      <SpeechInputButton
                        size="sm"
                        onTranscript={(txt) => setFridgeIngredients(txt)}
                      />
                      <span className="text-[10px] text-[#3D5B5A] bg-[#EBF2F2] px-2 py-0.5 rounded-full border border-[#C5D8D7]">
                        Reste-Retter
                      </span>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={fridgeIngredients}
                    onChange={(e) => setFridgeIngredients(e.target.value)}
                    placeholder="z. B. halber Feta light, 1 Zucchini, 2 Eier, noch 100g Hähnchenbrust..."
                    className="w-full p-3 text-xs rounded-xl bg-[#F8FAFA] border border-[#E0EAE9] focus:outline-none focus:border-[#789A99] transition-colors"
                  />

                  {/* Quick-chips */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Schnell hinzufügen:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickFridgeChips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleAddChip(chip)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Creative Mode Input */
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#111C1E]">
                      Zutatenwünsche oder Idee (optional)
                    </label>
                    <SpeechInputButton
                      size="sm"
                      onTranscript={(txt) => setPrompt(txt)}
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="z.B. Schnelle Pasta unter 10g Fett fürs Büro oder warmes Pfannengericht..."
                    className="w-full p-3 text-xs rounded-xl bg-[#F8FAFA] border border-[#E0EAE9] focus:outline-none focus:border-[#789A99] transition-colors"
                  />
                </div>
              )}

              {/* Guardrails Notice */}
              <div className="p-3.5 rounded-xl bg-[#EBF2F2] border border-[#C5D8D7] text-xs text-[#3D5B5A] space-y-1">
                <span className="font-bold text-[#789A99] block">Automatische KI-Schutzregeln aktiv:</span>
                <p>• Max. 10–12g Fett pro Rezept (zur Einhaltung des 44g Tagesbudgets)</p>
                <p>• Mind. 35g mageres Eiweiß (Hähnchen, Lachs, Magerquark, Eier)</p>
                <p>• 100% Cremefine 7% statt Sahne • Kein Schweinefleisch • Viel Gemüse</p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-[#789A99] hover:bg-[#658584] text-white transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> KI generiert dein Rezept...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FFD2C2]" /> Rezept jetzt generieren
                  </>
                )}
              </button>
            </>
          ) : (
            /* Generated Result Preview */
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Erfolgreich nach Deinen Makro-Limits generiert!
              </div>

              {/* Recipe Photo Preview */}
              <div className="w-full h-36 rounded-2xl overflow-hidden border border-[#E0EAE9] shadow-xs bg-slate-100">
                <RecipeImage
                  recipe={generatedRecipe}
                  aspectRatio="banner"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#789A99]">
                  {generatedRecipe.category}
                </span>
                <h4 className="text-lg font-bold text-[#111C1E]">{generatedRecipe.title}</h4>
                {generatedRecipe.subtitle && (
                  <p className="text-xs text-[#586F73] mt-0.5">{generatedRecipe.subtitle}</p>
                )}
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-[#F8FAFA] border border-[#E0EAE9] text-center">
                <div>
                  <div className="text-[10px] text-[#586F73]">Kcal</div>
                  <div className="text-xs font-bold font-mono text-[#111C1E]">{generatedRecipe.kcal}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#586F73]">Protein</div>
                  <div className="text-xs font-bold font-mono text-emerald-700">{generatedRecipe.protein}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#586F73]">Fett</div>
                  <div className="text-xs font-bold font-mono text-[#789A99]">{generatedRecipe.fat}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#586F73]">Ballastst.</div>
                  <div className="text-xs font-bold font-mono text-[#111C1E]">{generatedRecipe.fiber}g</div>
                </div>
              </div>

              {/* Why Nicole */}
              <div className="text-xs text-[#3D5B5A] dark:text-slate-300 bg-[#EBF2F2]/60 dark:bg-[#182629] p-2.5 rounded-xl border border-[#C5D8D7]/60 dark:border-[#2D4348]">
                <span className="font-semibold text-[#789A99]">Warum es passt: </span>
                {generatedRecipe.whyNicole}
              </div>

              {/* Steps preview */}
              <div className="text-xs space-y-1">
                <span className="font-semibold text-[#111C1E]">Zubereitungsschritte:</span>
                <ol className="list-decimal list-inside text-[#586F73] space-y-1 pl-1">
                  {generatedRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="line-clamp-2">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setGeneratedRecipe(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#586F73] bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Neu formulieren
                </button>
                <button
                  onClick={handleAdopt}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#789A99] hover:bg-[#658584] text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  Übernehmen & Speichern <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
