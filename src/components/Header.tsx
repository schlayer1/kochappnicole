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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Profile */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#789A99] flex items-center justify-center text-white shadow-sm shadow-[#789A99]/20">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#111C1E] text-base tracking-tight block">fit und healthy</span>
              <p className="text-xs text-[#586F73] hidden sm:block">
                Ziel: <span className="font-semibold text-[#111C1E]">{profile.targetGoals.calories} kcal</span> • Max. {profile.targetGoals.fat}g Fett • Min. {profile.targetGoals.protein}g Protein
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center p-1 bg-[#F1F6F5] rounded-xl border border-[#E0EAE9]">
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'plan'
                  ? 'bg-white text-[#111C1E] shadow-sm'
                  : 'text-[#586F73] hover:text-[#111C1E]'
              }`}
            >
              Wochenplan
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'recipes'
                  ? 'bg-white text-[#111C1E] shadow-sm'
                  : 'text-[#586F73] hover:text-[#111C1E]'
              }`}
            >
              Rezepte
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'shopping'
                  ? 'bg-white text-[#111C1E] shadow-sm'
                  : 'text-[#586F73] hover:text-[#111C1E]'
              }`}
            >
              Einkaufsliste
            </button>
          </nav>

          {/* Action CTAs: Smart Responsive Layout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* 1. Barcode Scanner Button (Always accessible) */}
            {onOpenProductScanner && (
              <button
                onClick={onOpenProductScanner}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Supermarkt-Produkt & Barcode scannen (Nicole-Ampel)"
              >
                <Barcode className="w-4 h-4 text-emerald-700" />
                <span className="hidden xl:inline">Supermarkt-Check</span>
              </button>
            )}

            {/* 2. Teller-Scan (Primary Camera Tool) */}
            {onOpenFoodScanner && (
              <button
                onClick={onOpenFoodScanner}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-[#FAF5F2] hover:bg-[#F5ECE8] text-[#994931] border border-[#FFD2C2] transition-all cursor-pointer shadow-xs active:scale-95"
                title="Teller fotografieren & Nährwerte prüfen"
              >
                <Camera className="w-4 h-4 text-[#994931]" />
                <span className="hidden xl:inline">Teller-Scan</span>
              </button>
            )}

            {/* 3. KI Rezept Generator */}
            <button
              onClick={onOpenAiGenerator}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-[#789A99] hover:bg-[#658584] text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Neues Rezept mit KI nach Nicole-Vorgaben generieren"
            >
              <Sparkles className="w-4 h-4 text-[#FFD2C2]" />
              <span className="hidden sm:inline">KI-Rezept</span>
            </button>

            {/* 4. Resteverwerter (Desktop & iPad) */}
            {onOpenFridgeLeftovers && (
              <button
                onClick={onOpenFridgeLeftovers}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] transition-all cursor-pointer"
                title="Kühlschrank-Reste eingeben & passende Rezepte finden"
              >
                <Utensils className="w-3.5 h-3.5 text-[#789A99]" />
                <span className="hidden xl:inline">Resteverwerter</span>
              </button>
            )}

            {/* 5. Druck-Studio (Desktop & iPad) */}
            {onOpenPrintStudio && (
              <button
                onClick={onOpenPrintStudio}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Wochenplan & Einkaufszettel drucken / PDF speichern"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden xl:inline">Drucken / PDF</span>
              </button>
            )}

            {/* 6. Dokumentenanalyse Button (Desktop & iPad) */}
            <button
              onClick={onOpenDocAnalyzer}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] transition-all cursor-pointer"
              title="Neues Ernährungsdokument / PDF analysieren"
            >
              <FileText className="w-3.5 h-3.5 text-[#789A99]" />
              <span className="hidden xl:inline">Analyse-Update</span>
            </button>

            {/* 7. Cloud Sync Status Badge */}
            {isCloudConnected && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-all cursor-pointer"
                title="Firebase Cloud Echtzeit-Synchronisation aktiv"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Cloud className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* 8. Dark Mode Toggle */}
            {onToggleDark && (
              <button
                onClick={onToggleDark}
                className="p-2 rounded-xl text-[#586F73] hover:text-[#111C1E] hover:bg-[#F1F6F5] transition-colors cursor-pointer"
                title={isDark ? 'Heller Modus aktivieren' : 'OLED Dark Mode aktivieren'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* 9. Profile Avatar Button (Always visible on all screens!) */}
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
              title={`Aktives Profil: ${activeProfileName || 'Nicole Keller'} (Klicken zum Wechseln)`}
            >
              {activeProfileName ? (
                <span>{activeProfileName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</span>
              ) : (
                <User className="w-4 h-4 text-[#789A99]" />
              )}
            </button>

            {/* 10. Mobile 'More Tools' Dropdown Toggle (shown on small screens) */}
            <button
              onClick={() => setShowMobileTools(!showMobileTools)}
              className="md:hidden p-2 rounded-xl text-[#586F73] hover:text-[#111C1E] hover:bg-[#F1F6F5] border border-slate-200 transition-colors cursor-pointer active:scale-95"
              title="Weitere Werkzeuge anzeigen"
            >
              {showMobileTools ? <X className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
            </button>

            {/* 11. Einstellungen Button (Desktop & iPad; on iPhone reachable via More Tools drawer) */}
            <button
              onClick={onOpenSettings}
              className="hidden md:block p-2 rounded-xl text-[#586F73] hover:text-[#111C1E] hover:bg-[#F1F6F5] transition-colors cursor-pointer"
              title="Einstellungen & API-Key"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Tools Drawer (Only on small screens when triggered) */}
      {showMobileTools && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-3 animate-in slide-in-from-top-2 duration-150 space-y-2.5">
          {/* Active Profile Quick Row */}
          <button
            onClick={() => {
              setShowMobileTools(false);
              onOpenSettings();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#EBF2F2] hover:bg-[#DEE9E8] border border-[#C5D8D7] transition-all cursor-pointer text-left shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#789A99] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                {activeProfileName ? activeProfileName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'NK'}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Aktives Profil</span>
                <span className="text-xs font-bold text-[#111C1E]">{activeProfileName || 'Nicole Keller'}</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#789A99]">Wechseln →</span>
          </button>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Weitere Schnell-Aktionen:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {onOpenFridgeLeftovers && (
              <button
                onClick={() => {
                  setShowMobileTools(false);
                  onOpenFridgeLeftovers();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#EBF2F2] text-[#3D5B5A] text-xs font-semibold border border-[#C5D8D7] active:scale-95 transition-all text-left"
              >
                <Utensils className="w-4 h-4 text-[#789A99] shrink-0" />
                <span>Resteverwerter</span>
              </button>
            )}

            {onOpenPrintStudio && (
              <button
                onClick={() => {
                  setShowMobileTools(false);
                  onOpenPrintStudio();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 active:scale-95 transition-all text-left"
              >
                <Printer className="w-4 h-4 text-slate-600 shrink-0" />
                <span>Drucken / PDF</span>
              </button>
            )}

            <button
              onClick={() => {
                setShowMobileTools(false);
                onOpenDocAnalyzer();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#EBF2F2] text-[#3D5B5A] text-xs font-semibold border border-[#C5D8D7] active:scale-95 transition-all text-left"
            >
              <FileText className="w-4 h-4 text-[#789A99] shrink-0" />
              <span>Analyse-Update</span>
            </button>

            <button
              onClick={() => {
                setShowMobileTools(false);
                onOpenSettings();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 active:scale-95 transition-all text-left"
            >
              <Settings className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Einstellungen</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
