import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Settings,
  ChefHat,
  Cloud,
  Utensils,
  Camera,
  Barcode,
  Printer,
  Moon,
  Sun,
  MoreHorizontal,
  X,
  User
} from 'lucide-react';
import { NutritionProfile } from '@/lib/types';

interface HeaderProps {
  profile: NutritionProfile;
  activeTab: 'plan' | 'recipes' | 'shopping';
  setActiveTab: (tab: 'plan' | 'recipes' | 'shopping') => void;
  onOpenAiGenerator: () => void;
  onOpenDocAnalyzer: () => void;
  onOpenSettings: () => void;
  onOpenFridgeLeftovers?: () => void;
  onOpenFoodScanner?: () => void;
  onOpenProductScanner?: () => void;
  onOpenPrintStudio?: () => void;
  isCloudConnected?: boolean;
  isSyncing?: boolean;
  isDark?: boolean;
  onToggleDark?: () => void;
  activeProfileName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  setActiveTab,
  onOpenAiGenerator,
  onOpenDocAnalyzer,
  onOpenSettings,
  onOpenFridgeLeftovers,
  onOpenFoodScanner,
  onOpenProductScanner,
  onOpenPrintStudio,
  isCloudConnected = false,
  isSyncing = false,
  isDark = false,
  onToggleDark,
  activeProfileName,
}) => {
  const [showMobileTools, setShowMobileTools] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E0EAE9]">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          
          {/* Brand: Option B All-in-One Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF2F2] border border-[#C5D8D7] shadow-2xs hover:bg-[#DEE9E8] transition-colors">
              <div className="w-5 h-5 rounded-full bg-[#789A99] flex items-center justify-center text-white shrink-0 shadow-2xs">
                <ChefHat className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-[#111C1E] text-xs sm:text-sm tracking-tight whitespace-nowrap">
                <span className="hidden min-[380px]:inline">fit und healthy</span>
                <span className="min-[380px]:hidden">f&amp;h</span>
              </span>
            </div>
            <p className="text-[11px] text-[#586F73] hidden 2xl:block whitespace-nowrap">
              Ziel: <span className="font-semibold text-[#111C1E]">{profile.targetGoals.calories} kcal</span> • Max. {profile.targetGoals.fat}g Fett • Min. {profile.targetGoals.protein}g Protein
            </p>
          </div>

          {/* Navigation Tabs (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center p-1 bg-[#F1F6F5] rounded-xl border border-[#E0EAE9] shrink-0">
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'plan'
                  ? 'bg-white text-[#111C1E] shadow-xs'
                  : 'text-[#586F73] hover:text-[#111C1E]'
              }`}
            >
              Wochenplan
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'recipes'
                  ? 'bg-white text-[#111C1E] shadow-xs'
                  : 'text-[#586F73] hover:text-[#111C1E]'
              }`}
            >
              Rezepte
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                activeTab === 'shopping'
                  ? 'bg-white text-[#111C1E] shadow-xs'
                  : 'text-[#586F73] hover:text-[#111C1E]'
              }`}
            >
              Einkaufsliste
            </button>
          </nav>

          {/* Action CTAs: Comfortable Primary Icons & More Drawer */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* 1. Barcode Scanner (Primary - comfortably sized) */}
            {onOpenProductScanner && (
              <button
                onClick={onOpenProductScanner}
                className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="Supermarkt-Produkt & Barcode scannen"
              >
                <Barcode className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="hidden xl:inline">Supermarkt</span>
              </button>
            )}

            {/* 2. Teller-Scan (Primary - comfortably sized) */}
            {onOpenFoodScanner && (
              <button
                onClick={onOpenFoodScanner}
                className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-[#FAF5F2] hover:bg-[#F5ECE8] text-[#994931] border border-[#FFD2C2] transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="Teller fotografieren & Nährwerte prüfen"
              >
                <Camera className="w-4 h-4 text-[#994931] shrink-0" />
                <span className="hidden xl:inline">Teller-Scan</span>
              </button>
            )}

            {/* 3. KI Rezept Generator (Primary - comfortably sized) */}
            <button
              onClick={onOpenAiGenerator}
              className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-[#789A99] hover:bg-[#658584] text-white shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Neues Rezept mit KI generieren"
            >
              <Sparkles className="w-4 h-4 text-[#FFD2C2] shrink-0" />
              <span className="hidden sm:inline">KI-Rezept</span>
            </button>

            {/* 4. Resteverwerter (Desktop & iPad) */}
            {onOpenFridgeLeftovers && (
              <button
                onClick={onOpenFridgeLeftovers}
                className="hidden md:flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="Kühlschrank-Reste eingeben & passende Rezepte finden"
              >
                <Utensils className="w-3.5 h-3.5 text-[#789A99] shrink-0" />
                <span className="hidden 2xl:inline">Reste-Retter</span>
              </button>
            )}

            {/* 5. Druck-Studio (Desktop & iPad) */}
            {onOpenPrintStudio && (
              <button
                onClick={onOpenPrintStudio}
                className="hidden lg:flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="Wochenplan & Einkaufszettel drucken / PDF speichern"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="hidden 2xl:inline">Drucken / PDF</span>
              </button>
            )}

            {/* 6. Dokumentenanalyse Button (Desktop & iPad) */}
            <button
              onClick={onOpenDocAnalyzer}
              className="hidden lg:flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
              title="Ernährungsbericht / PDF hochladen & analysieren"
            >
              <FileText className="w-3.5 h-3.5 text-[#789A99] shrink-0" />
              <span className="hidden 2xl:inline">Plan-PDF</span>
            </button>

            {/* 7. Cloud Sync Status (Desktop) */}
            {isCloudConnected && (
              <button
                onClick={onOpenSettings}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="Firebase Cloud Echtzeit-Synchronisation aktiv"
              >
                <Cloud className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* 8. Dark Mode Toggle (Desktop) */}
            {onToggleDark && (
              <button
                onClick={onToggleDark}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl text-[#586F73] hover:text-[#111C1E] hover:bg-[#F1F6F5] border border-slate-200/60 transition-colors cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title={isDark ? 'Heller Modus aktivieren' : 'OLED Dark Mode aktivieren'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* 9. Profile Avatar Button (Always visible) */}
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
              title={`Aktives Profil: ${activeProfileName || 'Nicole Keller'} (Klicken zum Verwalten)`}
            >
              {activeProfileName ? (
                <span>{activeProfileName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</span>
              ) : (
                <User className="w-4 h-4 text-[#789A99]" />
              )}
            </button>

            {/* 10. Mobile "..." Dropdown Toggle (Opens secondary tools on smartphones) */}
            <button
              onClick={() => setShowMobileTools(!showMobileTools)}
              className={`md:hidden flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0 ${
                showMobileTools
                  ? 'bg-[#111C1E] text-white border-[#111C1E]'
                  : 'text-[#586F73] hover:text-[#111C1E] hover:bg-[#F1F6F5] border-slate-200'
              }`}
              title="Weitere Werkzeuge & Einstellungen anzeigen"
            >
              {showMobileTools ? <X className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
            </button>

            {/* 11. Einstellungen Button (Desktop & iPad) */}
            <button
              onClick={onOpenSettings}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl text-[#586F73] hover:text-[#111C1E] hover:bg-[#F1F6F5] border border-slate-200/60 transition-colors cursor-pointer shadow-2xs active:scale-95 shrink-0"
              title="Einstellungen & API-Key"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Tools Drawer (Sub-Menu triggered by "...") */}
      {showMobileTools && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-3.5 animate-in slide-in-from-top-2 duration-150 space-y-3 shadow-lg">
          
          {/* Active Profile Quick Row */}
          <button
            onClick={() => {
              setShowMobileTools(false);
              onOpenSettings();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-[#EBF2F2] hover:bg-[#DEE9E8] border border-[#C5D8D7] transition-all cursor-pointer text-left shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#789A99] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                {activeProfileName ? activeProfileName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'NK'}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Aktives Profil</span>
                <span className="text-xs font-bold text-[#111C1E]">{activeProfileName || 'Nicole Keller'}</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#789A99] bg-white px-2.5 py-1 rounded-lg border border-[#C5D8D7]">Wechseln →</span>
          </button>

          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
            Weitere Werkzeuge:
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* 1. Resteverwerter */}
            {onOpenFridgeLeftovers && (
              <button
                onClick={() => {
                  setShowMobileTools(false);
                  onOpenFridgeLeftovers();
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#EBF2F2]/80 hover:bg-[#DEE9E8] text-[#3D5B5A] text-xs font-semibold border border-[#C5D8D7] active:scale-95 transition-all text-left shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-[#C5D8D7] shrink-0">
                  <Utensils className="w-3.5 h-3.5 text-[#789A99]" />
                </div>
                <div>
                  <span className="block font-bold text-[#111C1E]">Reste-Retter</span>
                  <span className="text-[10px] text-[#586F73]">Kühlschrank</span>
                </div>
              </button>
            )}

            {/* 2. Drucken / PDF */}
            {onOpenPrintStudio && (
              <button
                onClick={() => {
                  setShowMobileTools(false);
                  onOpenPrintStudio();
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 active:scale-95 transition-all text-left shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-slate-200 shrink-0">
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div>
                  <span className="block font-bold text-[#111C1E]">Drucken / PDF</span>
                  <span className="text-[10px] text-slate-500">Wochenplan</span>
                </div>
              </button>
            )}

            {/* 3. Analyse-Update (Plan-PDF) */}
            <button
              onClick={() => {
                setShowMobileTools(false);
                onOpenDocAnalyzer();
              }}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#EBF2F2]/80 hover:bg-[#DEE9E8] text-[#3D5B5A] text-xs font-semibold border border-[#C5D8D7] active:scale-95 transition-all text-left shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-[#C5D8D7] shrink-0">
                <FileText className="w-3.5 h-3.5 text-[#789A99]" />
              </div>
              <div>
                <span className="block font-bold text-[#111C1E]">Plan-PDF</span>
                <span className="text-[10px] text-[#586F73]">Analyse</span>
              </div>
            </button>

            {/* 4. Einstellungen */}
            <button
              onClick={() => {
                setShowMobileTools(false);
                onOpenSettings();
              }}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 active:scale-95 transition-all text-left shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-slate-200 shrink-0">
                <Settings className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <div>
                <span className="block font-bold text-[#111C1E]">Einstellungen</span>
                <span className="text-[10px] text-slate-500">API & Cloud</span>
              </div>
            </button>
          </div>

          {/* Bottom Utility Bar in Drawer: Dark Mode & Cloud Status */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            {onToggleDark && (
              <button
                onClick={onToggleDark}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Heller Modus</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-600" />
                    <span>Dunkelmodus</span>
                  </>
                )}
              </button>
            )}

            {isCloudConnected && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Cloud aktiv</span>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
