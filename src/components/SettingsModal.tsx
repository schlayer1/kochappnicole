'use client';

import React, { useState } from 'react';
import { X, Key, Sliders, RotateCcw, Download, ExternalLink, Check, Zap, Sparkles, Cloud, Database } from 'lucide-react';
import { AppSettings } from '@/lib/storage';
import { NutritionProfile } from '@/lib/types';
import {
  getSavedHouseholdKey,
  saveHouseholdKey,
  isFirebaseConfigured,
  getSavedCustomFirebaseConfig,
  saveCustomFirebaseConfig,
  FirebaseClientConfig,
} from '@/lib/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (s: AppSettings) => void;
  profile: NutritionProfile;
  onSaveProfile: (p: NutritionProfile) => void;
  onResetAllData: () => void;
  onManualCloudSync?: () => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  profile,
  onSaveProfile,
  onResetAllData,
  onManualCloudSync,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [localGoals, setLocalGoals] = useState(profile.targetGoals);
  const [householdKey, setHouseholdKey] = useState(getSavedHouseholdKey());
  const [showAdvancedFirebase, setShowAdvancedFirebase] = useState(false);
  const [customFirebase, setCustomFirebase] = useState<FirebaseClientConfig>(
    getSavedCustomFirebaseConfig() || {}
  );
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onSaveProfile({
      ...profile,
      targetGoals: localGoals,
    });
    saveHouseholdKey(householdKey);
    if (customFirebase.apiKey && customFirebase.projectId) {
      saveCustomFirebaseConfig(customFirebase);
    }
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

          {/* Cloud Synchronisation (Firebase) */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-[#789A99]" />
                Geräte-Synchronisation (Firebase Cloud)
              </label>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                isFirebaseConfigured() ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {isFirebaseConfigured() ? 'Firestore Aktiv' : 'Lokaler Modus'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-700 font-bold block">
                  Aktives Profil / Haushalts-Schlüssel:
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                  Eigene Datenbank
                </span>
              </div>

              {/* Quick Profile Switcher */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setHouseholdKey('nicole-keller')}
                  className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                    householdKey.trim().toLowerCase() === 'nicole-keller'
                      ? 'bg-white border-[#789A99] ring-2 ring-[#789A99]/20 text-[#3D5B5A]'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <span className="block font-bold text-slate-900">Nicole Keller</span>
                  <span className="text-[10px] text-slate-400">Hauptprofil</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHouseholdKey('haushalt-2')}
                  className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                    householdKey.trim().toLowerCase() === 'haushalt-2'
                      ? 'bg-white border-[#789A99] ring-2 ring-[#789A99]/20 text-[#3D5B5A]'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  <span className="block font-bold text-slate-900">Zweites Profil</span>
                  <span className="text-[10px] text-slate-400">Eigener Wochenplan</span>
                </button>
              </div>

              <div className="pt-1">
                <label className="text-[10px] text-slate-500 block mb-1">
                  Oder individuellen Schlüssel eingeben:
                </label>
                <input
                  type="text"
                  value={householdKey}
                  onChange={(e) => setHouseholdKey(e.target.value)}
                  placeholder="z. B. familie-keller oder person-2"
                  className="w-full p-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-[#789A99]"
                />
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                💡 <strong>Multi-User Info:</strong> Jeder Schlüssel steuert eine völlig unabhängige Datenbank-Partition in Firebase. Trage denselben Schlüssel auf Handy &amp; iPad ein, um den Plan zu teilen – oder einen neuen Schlüssel, damit eine andere Person ihren eigenen Plan hat.
              </p>
            </div>

            {onManualCloudSync && isFirebaseConfigured() && (
              <button
                type="button"
                onClick={async () => {
                  setSyncingCloud(true);
                  const ok = await onManualCloudSync();
                  setSyncingCloud(false);
                  if (ok !== false) {
                    setSyncSuccess(true);
                    setTimeout(() => setSyncSuccess(false), 3500);
                  }
                }}
                disabled={syncingCloud}
                className={`flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                  syncSuccess
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs'
                    : 'bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7]'
                }`}
              >
                {syncSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Erfolgreich mit Cloud synchronisiert!</span>
                  </>
                ) : (
                  <>
                    <Cloud className={`w-3.5 h-3.5 text-[#789A99] ${syncingCloud ? 'animate-spin' : ''}`} />
                    <span>{syncingCloud ? 'Synchronisiere mit Cloud...' : 'Jetzt mit Cloud synchronisieren'}</span>
                  </>
                )}
              </button>
            )}

            {/* Optional: Firebase Web Config Eingabefelder (für manuelle Eingabe ohne .env) */}
            <div className="pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setShowAdvancedFirebase(!showAdvancedFirebase)}
                className="text-[11px] text-[#789A99] hover:underline font-medium flex items-center gap-1"
              >
                <Database className="w-3 h-3" />
                {showAdvancedFirebase ? 'Firebase-Keys ausblenden' : 'Firebase-Keys manuell im Browser eingeben (optional)'}
              </button>

              {showAdvancedFirebase && (
                <div className="mt-2 space-y-2 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                  <p className="text-[10px] text-slate-400">
                    Tipp: Wenn du die Variablen in <code>.env.local</code> oder Vercel eingetragen hast, brauchst du hier nichts auszufüllen.
                  </p>
                  <div>
                    <label className="text-[10px] text-slate-500 block">API Key (AIzaSy...):</label>
                    <input
                      type="password"
                      value={customFirebase.apiKey || ''}
                      onChange={(e) => setCustomFirebase({ ...customFirebase, apiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full p-1.5 text-xs rounded bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Project ID:</label>
                    <input
                      type="text"
                      value={customFirebase.projectId || ''}
                      onChange={(e) => setCustomFirebase({ ...customFirebase, projectId: e.target.value })}
                      placeholder="z. B. fit-und-healthy-nicole"
                      className="w-full p-1.5 text-xs rounded bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Auth Domain:</label>
                    <input
                      type="text"
                      value={customFirebase.authDomain || ''}
                      onChange={(e) => setCustomFirebase({ ...customFirebase, authDomain: e.target.value })}
                      placeholder="z. B. fit-und-healthy-nicole.firebaseapp.com"
                      className="w-full p-1.5 text-xs rounded bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

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
