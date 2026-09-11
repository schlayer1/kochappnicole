import React from 'react';
import { Sparkles, FileText, Settings, ChefHat, Cloud } from 'lucide-react';
import { NutritionProfile } from '@/lib/types';

interface HeaderProps {
  profile: NutritionProfile;
  activeTab: 'plan' | 'recipes' | 'shopping';
  setActiveTab: (tab: 'plan' | 'recipes' | 'shopping') => void;
  onOpenAiGenerator: () => void;
  onOpenDocAnalyzer: () => void;
  onOpenSettings: () => void;
  isCloudConnected?: boolean;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  setActiveTab,
  onOpenAiGenerator,
  onOpenDocAnalyzer,
  onOpenSettings,
  isCloudConnected = false,
  isSyncing = false,
}) => {
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
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#111C1E] text-base tracking-tight">fit und healthy</span>
              </div>
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

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {/* KI Rezept Generator Button */}
            <button
              onClick={onOpenAiGenerator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#789A99] hover:bg-[#658584] text-white shadow-sm transition-all active:scale-95"
              title="Neues Rezept mit KI nach Nicole-Vorgaben generieren"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFD2C2]" />
              <span className="hidden sm:inline">KI-Rezept</span>
            </button>

            {/* Dokumentenanalyse Button */}
            <button
              onClick={onOpenDocAnalyzer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EBF2F2] hover:bg-[#DEE9E8] text-[#3D5B5A] border border-[#C5D8D7] transition-all"
              title="Neues Ernährungsdokument / PDF analysieren"
            >
              <FileText className="w-3.5 h-3.5 text-[#789A99]" />
              <span className="hidden md:inline">Analyse-Update</span>
            </button>

            {/* Cloud Sync Status Badge */}
            {isCloudConnected && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-all cursor-pointer"
                title="Firebase Cloud Echtzeit-Synchronisation aktiv (Klicken für Details)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Cloud className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-[11px] font-semibold">{isSyncing ? 'Sync...' : 'Cloud Sync'}</span>
              </button>
            )}

            {/* Einstellungen Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-[#586F73] hover:text-[#111C1E] hover:bg-[#F1F6F5] transition-colors"
              title="Einstellungen & API-Key"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
