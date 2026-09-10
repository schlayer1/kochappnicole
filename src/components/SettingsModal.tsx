'use client';

import React, { useState } from 'react';
import { X, Key, Sliders, RotateCcw, Download, ExternalLink, Check, Zap, Sparkles } from 'lucide-react';
import { AppSettings } from '@/lib/storage';
import { NutritionProfile } from '@/lib/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (s: AppSettings) => void;
  profile: NutritionProfile;
  onSaveProfile: (p: NutritionProfile) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  profile,
  onSaveProfile,
  onResetAllData,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [localGoals, setLocalGoals] = useState(profile.targetGoals);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onSaveProfile({
      ...profile,
      targetGoals: localGoals,
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 700);
  };

  const handleExportJson = () => {
    const data = {
      profile,
      settings: localSettings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VeggiFit2-Backup-Nicole-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#789A99]/10 border border-[#789A99]/20 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-[#789A99]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight">Einstellungen & KI-Konfiguration</h3>
              <p className="text-xs text-slate-400">Kostenlose KI-Anbieter, Portionsgrößen & Makro-Ziele</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* KI Provider Selector */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#789A99]" />
              Kostenlosen KI-Provider wählen
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, aiProvider: 'groq' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  localSettings.aiProvider === 'groq'
                    ? 'bg-white border-[#789A99] ring-2 ring-[#789A99]/20 shadow-xs'
                    : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Groq (Llama 3.3)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FFD2C2] text-[#994931]">
                    Empfohlen
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">100% kostenlos, ultraschnell (&lt; 1 Sekunde)</p>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, aiProvider: 'gemini' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  localSettings.aiProvider === 'gemini'
                    ? 'bg-white border-[#789A99] ring-2 ring-[#789A99]/20 shadow-xs'
                    : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Google Gemini</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">100% kostenlos, liest auch PDF-Dateien</p>
              </button>
            </div>

            {/* Provider specific key input */}
            {localSettings.aiProvider === 'groq' ? (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Key className="w-3 h-3 text-[#789A99]" />
                    Groq API Key (gsk_...)
                  </label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#789A99] font-medium hover:underline flex items-center gap-1"
                  >
                    Kostenlos bei Groq holen <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={localSettings.groqApiKey || localSettings.apiKey}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      groqApiKey: e.target.value,
                      apiKey: e.target.value,
                    })
                  }
                  className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 font-mono focus:outline-none focus:border-[#789A99]"
                />
                <p className="text-[10px] text-slate-400">
                  Keine Kreditkarte erforderlich. Erstelle in 10 Sekunden einen Account via Google/GitHub.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Key className="w-3 h-3 text-[#789A99]" />
                    Gemini API Key (AIzaSy...)
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#789A99] font-medium hover:underline flex items-center gap-1"
                  >
                    Kostenlos bei Google holen <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={localSettings.geminiApiKey}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      geminiApiKey: e.target.value,
                    })
                  }
                  className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 font-mono focus:outline-none focus:border-[#789A99]"
                />
                <p className="text-[10px] text-slate-400">
                  Google AI Studio Free Tier (ohne Abrechnung oder Kreditkarte nutzbar).
                </p>
              </div>
            )}
          </div>

          {/* Portions Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-900 block">
              Standard-Portionen für Einkaufsliste
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, portions: num })}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 active:scale-[0.98] ${
                    localSettings.portions === num
                      ? 'bg-[#789A99] text-white border-[#789A99] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                  }`}
                >
                  {num} {num === 1 ? 'Portion' : 'Portionen'}
                </button>
              ))}
            </div>
          </div>

          {/* Target Macros Customization */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-900 block">
              Ziel-Makros anpassen (laut Nicole-Analyse)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Kalorien (kcal)</label>
                <input
                  type="number"
                  value={localGoals.calories}
                  onChange={(e) => setLocalGoals({ ...localGoals, calories: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Fett Limit (g)</label>
                <input
                  type="number"
                  value={localGoals.fat}
                  onChange={(e) => setLocalGoals({ ...localGoals, fat: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Protein Ziel (g)</label>
                <input
                  type="number"
                  value={localGoals.protein}
                  onChange={(e) => setLocalGoals({ ...localGoals, protein: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Kohlenhydrate (g)</label>
                <input
                  type="number"
                  value={localGoals.carbs}
                  onChange={(e) => setLocalGoals({ ...localGoals, carbs: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Ballaststoffe (g)</label>
                <input
                  type="number"
                  value={localGoals.fiber}
                  onChange={(e) => setLocalGoals({ ...localGoals, fiber: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Backup & Reset Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 text-[#789A99]" /> Backup Exportieren
            </button>

            <button
              onClick={onResetAllData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 rounded-xl transition-all duration-150 active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Auf PDF-Original zurücksetzen
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold bg-[#789A99] hover:bg-[#658584] text-white rounded-xl transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5 shadow-xs"
          >
            {savedNotice ? (
              <>
                <Check className="w-3.5 h-3.5" /> Gespeichert!
              </>
            ) : (
              'Einstellungen speichern'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
