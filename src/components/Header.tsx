import React from 'react';
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
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E0EAE9]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-3">
          
          {/* Option B: All-in-One Brand Pill */}
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

          {/* Action CTAs: All Tools Accessible Directly in Header */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* 1. Barcode Scanner Button */}
            {onOpenProductScanner && (
              <button
                onClick={onOpenProductScanner}
                className="flex items-center justify-center gap-1 w-7 h-7 sm:w-8 sm:h-8 xl:w-auto xl:px-2.5 xl:py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="Supermarkt-Produkt & Barcode scannen"
              >
                <Barcode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" />
                <span className="hidden xl:inline">Supermarkt</span>
              </button>
            )}

            {/* 2. Teller-Scan (Primary Camera Tool) */}
            {onOpenFoodScanner && (
              <button
                onClick={onOpenFoodScanner}
                className="flex items-center justify-center gap-1 w-7 h-7 sm:w-8 sm:h-8 xl:w-auto xl:px-2.5 xl:py-1.5 rounded-xl text-xs font-semibold bg-[#FAF5F2] hover:bg-[#F5ECE8] text-[#994931] border border-[#FFD2C2] transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="Teller fotografieren & Nährwerte prüfen"
              >
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#994931] shrink-0" />
                <span className="hidden xl:inline">Teller-Scan</span>
              </button>
            )}

            {/* 3. KI Rezept Generator */}
            <button
              onClick={onOpenAiGenerator}
              className="flex items-center justify-center gap-1 w-7 h-7 sm:w-8 sm:h-8 xl:w-auto xl:px-2.5 xl:py-1.5 rounded-xl text-xs font-semibold bg-[#789A99] hover:bg-[#658584] text-white shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Neues Rezept mit KI generieren"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD2C2] shrink-0" />
              <span className="hidden xl:inline">KI-Rezept</span>
            </button>

            {/* 4. Resteverwerter (Now directly visible on all screens!) */}
            {onOpenFridgeLeftovers && (
              <button
                onClick={onOpenFridgeLeftovers}
                className="flex items-center justify-center gap-1 w-7 h-7 sm:w-8 sm:h-8 2xl:w-auto 2xl:px-2.5 2xl:py-1.5 rounded-xl text-xs font-semibold bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="Kühlschrank-Reste eingeben & passende Rezepte finden"
              >
                <Utensils className="w-3.5 h-3.5 text-[#789A99] shrink-0" />
                <span className="hidden 2xl:inline">Reste-Retter</span>
              </button>
            )}

            {/* 5. Druck-Studio (Now directly visible on all screens!) */}
            {onOpenPrintStudio && (
              <button
                onClick={onOpenPrintStudio}
                className="flex items-center justify-center gap-1 w-7 h-7 sm:w-8 sm:h-8 2xl:w-auto 2xl:px-2.5 2xl:py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="Wochenplan & Einkaufszettel drucken / PDF speichern"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="hidden 2xl:inline">Drucken / PDF</span>
              </button>
            )}

            {/* 6. Dokumentenanalyse Button (Now directly visible on all screens!) */}
            <button
              onClick={onOpenDocAnalyzer}
              className="flex items-center justify-center gap-1 w-7 h-7 sm:w-8 sm:h-8 2xl:w-auto 2xl:px-2.5 2xl:py-1.5 rounded-xl text-xs font-medium bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
              title="Ernährungsbericht / PDF hochladen & analysieren"
            >
              <FileText className="w-3.5 h-3.5 text-[#789A99] shrink-0" />
              <span className="hidden 2xl:inline">Plan-PDF</span>
            </button>

            {/* 7. Cloud Sync Status Badge */}
            {isCloudConnected && (
              <button
                onClick={onOpenSettings}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title="Firebase Cloud Echtzeit-Synchronisation aktiv"
              >
                <Cloud className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* 8. Dark Mode Toggle */}
            {onToggleDark && (
              <button
                onClick={onToggleDark}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[#586F73] hover:text-[#111C1E] hover:bg-[#F1F6F5] border border-slate-200/60 transition-colors cursor-pointer shadow-2xs active:scale-95 shrink-0"
                title={isDark ? 'Heller Modus aktivieren' : 'OLED Dark Mode aktivieren'}
              >
                {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
            )}

            {/* 9. Einstellungen Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[#586F73] hover:text-[#111C1E] hover:bg-[#F1F6F5] border border-slate-200/60 transition-colors cursor-pointer shadow-2xs active:scale-95 shrink-0"
              title="Einstellungen, Profile & Cloud-Sync"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* 10. Profile Avatar Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] text-[10px] sm:text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
              title={`Aktives Profil: ${activeProfileName || 'Nicole Keller'} (Klicken zum Verwalten)`}
            >
              {activeProfileName ? (
                <span>{activeProfileName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}</span>
              ) : (
                <User className="w-3.5 h-3.5 text-[#789A99]" />
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
