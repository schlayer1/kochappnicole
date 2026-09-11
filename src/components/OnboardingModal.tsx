'use client';

import React, { useState } from 'react';
import { ChefHat, User, Sparkles, Check, ArrowRight, Sliders, X } from 'lucide-react';
import { UserProfileEntry } from '@/lib/types';
import { DEFAULT_PROFILE, saveProfileEntry, setActiveProfileId, markUserOnboarded } from '@/lib/storage';
import { saveHouseholdKey } from '@/lib/firebase';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfileEntry) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [view, setView] = useState<'choose' | 'create'>('choose');
  const [name, setName] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [showMacros, setShowMacros] = useState(false);
  const [calories, setCalories] = useState('1800');
  const [fat, setFat] = useState('50');
  const [protein, setProtein] = useState('110');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectNicole = () => {
    saveProfileEntry(DEFAULT_PROFILE);
    setActiveProfileId(DEFAULT_PROFILE.id);
    saveHouseholdKey(DEFAULT_PROFILE.householdKey);
    markUserOnboarded();
    onComplete(DEFAULT_PROFILE);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!customKey || customKey === generateKey(name)) {
      setCustomKey(generateKey(val));
    }
  };

  const generateKey = (raw: string) => {
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

  const handleCreateProfile = (skipMacros = false) => {
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Bitte gib deinen Namen ein.');
      return;
    }

    const key = (customKey.trim() || generateKey(cleanName)) || `user-${Date.now().toString().slice(-4)}`;
    
    const newProfile: UserProfileEntry = {
      id: key,
      name: cleanName,
      householdKey: key,
      targetGoals: skipMacros
        ? { calories: 1800, fat: 50, protein: 110, carbs: 180, fiber: 25 }
        : {
            calories: parseInt(calories) || 1800,
            fat: parseInt(fat) || 50,
            protein: parseInt(protein) || 110,
            carbs: 180,
            fiber: 25,
          },
      createdAt: new Date().toISOString().slice(0, 10),
    };

    saveProfileEntry(newProfile);
    setActiveProfileId(newProfile.id);
    saveHouseholdKey(newProfile.householdKey);
    markUserOnboarded();
    onComplete(newProfile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111C1E]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-[#111C1E] to-[#1F3135] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#789A99] flex items-center justify-center text-white shadow-sm">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFD2C2]">
                Willkommen bei
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">fit und healthy</h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {view === 'choose' ? (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">Wer kocht heute?</h3>
                <p className="text-xs text-slate-500">
                  Wähle dein Profil oder erstelle deine eigene, getrennte Datenbank.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {/* Option 1: Nicole Keller */}
                <button
                  type="button"
                  onClick={handleSelectNicole}
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#789A99] hover:bg-[#F8FAF9] text-left transition-all group cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#789A99]/15 text-[#789A99] font-bold flex items-center justify-center text-sm">
                      NK
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">Ich bin Nicole Keller</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF2F2] text-[#3D5B5A]">
                          Hauptprofil
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        1.508 kcal • Max. 44g Fett • Min. 103g Protein
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#789A99] transition-transform group-hover:translate-x-1" />
                </button>

                {/* Option 2: Neues Profil */}
                <button
                  type="button"
                  onClick={() => setView('create')}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#789A99] hover:bg-[#F8FAF9] text-left transition-all group cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#789A99]" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">Neues Profil anlegen</span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Eigener Wochenplan, eigene Einkaufsliste &amp; eigene Datenbank
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#789A99] transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ) : (
            /* Create New Profile Form */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setView('choose')}
                  className="text-xs text-slate-400 hover:text-slate-700 font-medium"
                >
                  ← Zurück zur Auswahl
                </button>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                  Eigene Instanz
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">Dein neues Profil erstellen</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deine Daten bleiben 100% isoliert in deiner eigenen Datenbank.
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Dein Name:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="z. B. Markus, Sarah, Mama..."
                    autoFocus
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#789A99]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Dein Haushalts-Schlüssel (für Cloud-Sync):
                  </label>
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="z. B. markus-keller"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-[#789A99]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Tipp: Wenn jemand anderes denselben Wochenplan nutzen soll, tragt einfach denselben Schlüssel ein.
                  </span>
                </div>

                {/* Optional Custom Macros Toggle */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowMacros(!showMacros)}
                    className="text-xs font-semibold text-[#789A99] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    {showMacros ? 'Eigene Makro-Ziele verbergen' : 'Eigene Kalorien- & Makro-Ziele anpassen (optional)'}
                  </button>

                  {showMacros && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in slide-in-from-top-1">
                      <p className="text-[10px] text-slate-500">
                        Passe deine Tageswerte an oder lasse die voreingestellten Standardwerte stehen:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block">Kalorien (kcal)</label>
                          <input
                            type="number"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            className="w-full p-1.5 text-xs bg-white rounded-lg border border-slate-200 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block">Max. Fett (g)</label>
                          <input
                            type="number"
                            value={fat}
                            onChange={(e) => setFat(e.target.value)}
                            className="w-full p-1.5 text-xs bg-white rounded-lg border border-slate-200 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block">Min. Protein (g)</label>
                          <input
                            type="number"
                            value={protein}
                            onChange={(e) => setProtein(e.target.value)}
                            className="w-full p-1.5 text-xs bg-white rounded-lg border border-slate-200 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCreateProfile(true)}
                  disabled={!name.trim()}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer text-center"
                >
                  Überspringen &amp; starten
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateProfile(false)}
                  disabled={!name.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#789A99] hover:bg-[#658584] text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Profil erstellen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
