'use client';

import React from 'react';
import { Calendar, BookOpen, ShoppingBag } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'plan' | 'recipes' | 'shopping';
  setActiveTab: (tab: 'plan' | 'recipes' | 'shopping') => void;
  shoppingBadgeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  shoppingBadgeCount = 0,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0a0f10]/95 backdrop-blur-md border-t border-[#E0EAE9] dark:border-[#1e2c2f] px-4 pt-2 pb-5 sm:pb-3 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        <button
          onClick={() => setActiveTab('plan')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'plan' ? 'text-[#789A99]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Wochenplan</span>
        </button>

        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'recipes' ? 'text-[#789A99]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Rezepte</span>
        </button>

        <button
          onClick={() => setActiveTab('shopping')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors relative ${
            activeTab === 'shopping' ? 'text-[#789A99]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Einkaufen</span>
          {shoppingBadgeCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-[#FFD2C2]" />
          )}
        </button>

      </div>
    </div>
  );
};
