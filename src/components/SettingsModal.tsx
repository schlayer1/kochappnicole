'use client';

import React, { useState } from 'react';
import { X, Key, Sliders, RotateCcw, Download, ExternalLink, Check, Zap, Sparkles, Cloud, Database, User, Plus, Trash2, Users } from 'lucide-react';
import {
  AppSettings,
  getSavedProfiles,
  saveProfileEntry,
  deleteProfileEntry,
  getActiveProfileId,
  setActiveProfileId,
  DEFAULT_PROFILE,
} from '@/lib/storage';
import { NutritionProfile, UserProfileEntry } from '@/lib/types';
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
  activeProfile?: UserProfileEntry;
  onSwitchProfile?: (profile: UserProfileEntry) => void;
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
  activeProfile,
  onSwitchProfile,
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

  // Dynamic profiles state
  const [savedProfiles, setSavedProfiles] = useState<UserProfileEntry[]>(getSavedProfiles());
  const [activeProfileId, setActiveId] = useState<string>(activeProfile?.id || getActiveProfileId());
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newHouseholdKey, setNewHouseholdKey] = useState('');
  const [showNewMacros, setShowNewMacros] = useState(false);
  const [newCalories, setNewCalories] = useState('1800');
  const [newFat, setNewFat] = useState('50');
  const [newProtein, setNewProtein] = useState('110');
  const [profileError, setProfileError] = useState('');

  if (!isOpen) return null;

  const generateCleanKey = (raw: string) => {
    return raw
      .trim()
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSelectProfile = (p: UserProfileEntry) => {
    setActiveId(p.id);
    setActiveProfileId(p.id);
    setHouseholdKey(p.householdKey);
    setLocalGoals(p.targetGoals);
    saveHouseholdKey(p.householdKey);
    onSwitchProfile?.(p);
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === DEFAULT_PROFILE.id) return;
    if (confirm('Möchtest du dieses Profil wirklich entfernen? Lokale Daten für diesen Haushalt bleiben erhalten.')) {
      deleteProfileEntry(id);
      const updated = getSavedProfiles();
      setSavedProfiles(updated);
      if (activeProfileId === id) {
        const fallback = updated[0] || DEFAULT_PROFILE;
        handleSelectProfile(fallback);
      }
    }
  };

  const handleCreateNewProfile = (skipMacros = false) => {
    const cleanName = newProfileName.trim();
    if (!cleanName) {
      setProfileError('Bitte gib einen Profilnamen ein.');
      return;
    }
    const cleanKey = (newHouseholdKey.trim() || generateCleanKey(cleanName)) || `user-${Date.now().toString().slice(-4)}`;
    
    const created: UserProfileEntry = {
      id: cleanKey,
      name: cleanName,
      householdKey: cleanKey,
      targetGoals: skipMacros
        ? { calories: 1800, fat: 50, protein: 110, carbs: 180, fiber: 25 }
        : {
            calories: parseInt(newCalories) || 1800,
            fat: parseInt(newFat) || 50,
            protein: parseInt(newProtein) || 110,
            carbs: 180,
            fiber: 25,
          },
      createdAt: new Date().toISOString().slice(0, 10),
    };

    saveProfileEntry(created);
    const updatedList = getSavedProfiles();
    setSavedProfiles(updatedList);
    handleSelectProfile(created);
    
    // Reset form
    setIsCreatingProfile(false);
    setNewProfileName('');
    setNewHouseholdKey('');
    setShowNewMacros(false);
    setProfileError('');
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onSaveProfile({
      ...profile,
      targetGoals: localGoals,
    });
    saveHouseholdKey(householdKey);

    // Sync updated goals/key to active profile entry
    const currentActive = savedProfiles.find((p) => p.id === activeProfileId);
    if (currentActive) {
      const updatedActive: UserProfileEntry = {
        ...currentActive,
        householdKey: householdKey.trim().toLowerCase(),
        targetGoals: localGoals,
      };
      saveProfileEntry(updatedActive);
      setSavedProfiles(getSavedProfiles());
      onSwitchProfile?.(updatedActive);
    }

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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-700 font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#789A99]" />
                  Profile &amp; getrennte Datenbanken:
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                  {savedProfiles.length} {savedProfiles.length === 1 ? 'Profil' : 'Profile'}
                </span>
              </div>

              {/* Dynamic Profiles List */}
              <div className="space-y-2">
                {savedProfiles.map((p) => {
                  const isActive = p.id === activeProfileId;
                  const isNicole = p.id === DEFAULT_PROFILE.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProfile(p)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-white border-[#789A99] ring-2 ring-[#789A99]/20 shadow-xs'
                          : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isActive
                              ? 'bg-[#789A99] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {p.name}
                            </span>
                            {isNicole && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-[#EBF2F2] text-[#3D5B5A]">
                                Nicole
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Aktiv
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            Key: <code className="font-mono text-slate-600">{p.householdKey}</code> • {p.targetGoals.calories} kcal • {p.targetGoals.fat}g Fett • {p.targetGoals.protein}g Prot.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProfile(p);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-[#789A99] hover:text-white text-slate-700 transition-colors cursor-pointer"
                          >
                            Wechseln
                          </button>
                        )}
                        {!isNicole && savedProfiles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteProfile(p.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Profil löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inline Form to Create a New Profile */}
              {!isCreatingProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingProfile(true);
                    setProfileError('');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#789A99]/50 hover:border-[#789A99] hover:bg-[#789A99]/5 text-[#3D5B5A] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#789A99]" />
                  <span>Neues Profil / Haushalt anlegen</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white border border-[#789A99] ring-2 ring-[#789A99]/15 space-y-3 animate-in slide-in-from-top-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Neues Profil anlegen</span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingProfile(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      Abbrechen
                    </button>
                  </div>

                  {profileError && (
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 font-medium">
                      {profileError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        Name:
                      </label>
                      <input
                        type="text"
                        value={newProfileName}
                        onChange={(e) => {
                          setNewProfileName(e.target.value);
                          if (!newHouseholdKey || newHouseholdKey === generateCleanKey(newProfileName)) {
                            setNewHouseholdKey(generateCleanKey(e.target.value));
                          }
                        }}
                        placeholder="z. B. Markus oder Sarah"
                        className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#789A99]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        Haushalts-Schlüssel (Cloud-Sync):
                      </label>
                      <input
                        type="text"
                        value={newHouseholdKey}
                        onChange={(e) => setNewHouseholdKey(generateCleanKey(e.target.value))}
                        placeholder="z. B. markus-keller"
                        className="w-full p-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900 focus:outline-none focus:border-[#789A99]"
                      />
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        Eindeutiger Schlüssel für deine eigene, getrennte Datenbank.
                      </span>
                    </div>

                    {/* Optional custom macros */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowNewMacros(!showNewMacros)}
                        className="text-[10px] font-semibold text-[#789A99] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sliders className="w-3 h-3" />
                        {showNewMacros ? 'Makro-Ziele verbergen' : 'Individuelle Makro-Ziele festlegen (optional)'}
                      </button>

                      {showNewMacros && (
                        <div className="grid grid-cols-3 gap-2 mt-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                          <div>
                            <label className="text-[9px] font-bold text-slate-600 block">Kalorien</label>
                            <input
                              type="number"
                              value={newCalories}
                              onChange={(e) => setNewCalories(e.target.value)}
                              className="w-full p-1 text-xs rounded bg-white border border-slate-200 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-600 block">Fett (g)</label>
                            <input
                              type="number"
                              value={newFat}
                              onChange={(e) => setNewFat(e.target.value)}
                              className="w-full p-1 text-xs rounded bg-white border border-slate-200 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-600 block">Protein (g)</label>
                            <input
                              type="number"
                              value={newProtein}
                              onChange={(e) => setNewProtein(e.target.value)}
                              className="w-full p-1 text-xs rounded bg-white border border-slate-200 font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleCreateNewProfile(true)}
                        className="flex-1 py-2 px-2.5 rounded-xl text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-center"
                      >
                        Überspringen &amp; erstellen
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateNewProfile(false)}
                        className="flex-1 py-2 px-2.5 rounded-xl text-[11px] font-bold bg-[#789A99] hover:bg-[#658584] text-white transition-colors cursor-pointer text-center shadow-xs"
                      >
                        Profil anlegen
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200/60">
                <label className="text-[10px] text-slate-500 block mb-1">
                  Aktueller Cloud-Haushaltsschlüssel (manuell bearbeiten):
                </label>
                <input
                  type="text"
                  value={householdKey}
                  onChange={(e) => setHouseholdKey(e.target.value)}
                  placeholder="z. B. familie-keller"
                  className="w-full p-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-[#789A99]"
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  💡 Alle Geräte mit demselben Haushalts-Schlüssel teilen sich in Echtzeit denselben Wochenplan &amp; dieselbe Einkaufsliste.
                </p>
              </div>
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
