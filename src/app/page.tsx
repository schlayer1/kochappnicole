'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MacroCockpit } from '@/components/MacroCockpit';
import { MealPlanner } from '@/components/MealPlanner';
import { RecipeCatalog } from '@/components/RecipeCatalog';
import { ShoppingList } from '@/components/ShoppingList';
import { CookModeModal } from '@/components/CookModeModal';
import { AiRecipeGeneratorModal } from '@/components/AiRecipeGeneratorModal';
import { DocAnalyzerModal } from '@/components/DocAnalyzerModal';
import { SettingsModal } from '@/components/SettingsModal';
import { MealPickerModal } from '@/components/MealPickerModal';
import { BottomNav } from '@/components/BottomNav';

import { DayPlan, MealType, NutritionProfile, Recipe, ShoppingItem } from '@/lib/types';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  generateShoppingListFromPlan,
  generateSmartWeeklyPlan,
  loadAllRecipes,
  loadFavoriteRecipeIds,
  loadProfile,
  loadRecipeNotes,
  loadSettings,
  loadShoppingItems,
  loadWeeklyPlan,
  saveCustomRecipe,
  saveFavoriteRecipeIds,
  saveProfile,
  saveRecipeNote,
  saveSettings,
  saveShoppingItems,
  saveWeeklyPlan,
} from '@/lib/storage';
import { NICOLE_NUTRITION_PROFILE } from '@/lib/nutrition-profile';
import { CURATED_NICOLE_RECIPES } from '@/lib/recipes-data';
import {
  getSavedHouseholdKey,
  isFirebaseConfigured,
  pushDataToCloud,
  subscribeToCloudSync,
} from '@/lib/firebase';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'recipes' | 'shopping'>('plan');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // App State
  const [profile, setProfile] = useState<NutritionProfile>(NICOLE_NUTRITION_PROFILE);
  const [recipes, setRecipes] = useState<Recipe[]>(CURATED_NICOLE_RECIPES);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recipeNotes, setRecipeNotes] = useState<Record<string, string>>({});

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSlotTarget, setAiSlotTarget] = useState<{ dayIdx?: number; mealType?: MealType }>({});
  const [isDocAnalyzerOpen, setIsDocAnalyzerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cookModeRecipe, setCookModeRecipe] = useState<Recipe | null>(null);
  const [pickerState, setPickerState] = useState<{ isOpen: boolean; dayIdx: number; mealType: MealType }>({
    isOpen: false,
    dayIdx: 0,
    mealType: 'lunch',
  });

  // Load state on mount & connect realtime Firebase listener
  useEffect(() => {
    const loadedProf = loadProfile();
    const loadedRecs = loadAllRecipes();
    const loadedPlan = loadWeeklyPlan(loadedRecs);
    const loadedSet = loadSettings();
    const savedShop = loadShoppingItems();
    const initialShop = generateShoppingListFromPlan(loadedPlan, savedShop || undefined);
    const loadedFavs = loadFavoriteRecipeIds();
    const loadedNotes = loadRecipeNotes();

    setProfile(loadedProf);
    setRecipes(loadedRecs);
    setWeeklyPlan(loadedPlan);
    setSettings(loadedSet);
    setShoppingItems(initialShop);
    saveShoppingItems(initialShop);
    setFavorites(loadedFavs);
    setRecipeNotes(loadedNotes);
    setMounted(true);

    // Realtime synchronization if Firebase is configured
    if (isFirebaseConfigured()) {
      const household = getSavedHouseholdKey();
      const unsub = subscribeToCloudSync(household, (remoteData) => {
        if (remoteData.weeklyPlan && Array.isArray(remoteData.weeklyPlan)) {
          setWeeklyPlan(remoteData.weeklyPlan);
          saveWeeklyPlan(remoteData.weeklyPlan);
        }
        if (remoteData.shoppingItems && Array.isArray(remoteData.shoppingItems)) {
          setShoppingItems(remoteData.shoppingItems);
          saveShoppingItems(remoteData.shoppingItems);
        }
        if (remoteData.favorites && Array.isArray(remoteData.favorites)) {
          setFavorites(remoteData.favorites);
          saveFavoriteRecipeIds(remoteData.favorites);
        }
        if (remoteData.recipeNotes) {
          setRecipeNotes(remoteData.recipeNotes);
        }
      });
      return () => unsub();
    }
  }, []);

  // Save weekly plan updates & push to Cloud
  const updateWeeklyPlan = (newPlan: DayPlan[]) => {
    setWeeklyPlan(newPlan);
    saveWeeklyPlan(newPlan);
    const updatedShop = generateShoppingListFromPlan(newPlan, shoppingItems);
    setShoppingItems(updatedShop);
    saveShoppingItems(updatedShop);

    if (isFirebaseConfigured()) {
      pushDataToCloud(getSavedHouseholdKey(), {
        weeklyPlan: newPlan,
        shoppingItems: updatedShop,
      });
    }
  };

  const handleAutoGeneratePlan = () => {
    const smartPlan = generateSmartWeeklyPlan(recipes, weeklyPlan);
    updateWeeklyPlan(smartPlan);
  };

  const handleMealPrepTomorrow = (dayIdx: number, recipe: Recipe) => {
    const nextDayIdx = (dayIdx + 1) % 7;
    handleAssignMeal(nextDayIdx, 'lunch', recipe);
  };

  const handleToggleFavorite = (recipeId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId];
      saveFavoriteRecipeIds(updated);
      if (isFirebaseConfigured()) {
        pushDataToCloud(getSavedHouseholdKey(), { favorites: updated });
      }
      return updated;
    });
  };

  const handleSaveRecipeNote = (recipeId: string, note: string) => {
    setRecipeNotes((prev) => {
      const updated = { ...prev, [recipeId]: note };
      saveRecipeNote(recipeId, note);
      if (isFirebaseConfigured()) {
        pushDataToCloud(getSavedHouseholdKey(), { recipeNotes: updated });
      }
      return updated;
    });
  };

  const handleManualCloudSync = async () => {
    if (!isFirebaseConfigured()) return;
    await pushDataToCloud(getSavedHouseholdKey(), {
      weeklyPlan,
      shoppingItems,
      favorites,
      recipeNotes,
    });
  };

  const handleAssignMeal = (dayIdx: number, mealType: MealType, recipe: Recipe) => {
    const updated = [...weeklyPlan];
    if (updated[dayIdx]) {
      updated[dayIdx] = {
        ...updated[dayIdx],
        [mealType]: recipe,
      };
      updateWeeklyPlan(updated);
    }
  };

  const handleRemoveMeal = (dayIdx: number, mealType: MealType) => {
    const updated = [...weeklyPlan];
    if (updated[dayIdx]) {
      updated[dayIdx] = {
        ...updated[dayIdx],
        [mealType]: null,
      };
      updateWeeklyPlan(updated);
    }
  };

  const handleToggleFastDay = (dayIdx: number) => {
    const updated = [...weeklyPlan];
    if (updated[dayIdx]) {
      updated[dayIdx] = {
        ...updated[dayIdx],
        isFastDay: !updated[dayIdx].isFastDay,
      };
      updateWeeklyPlan(updated);
    }
  };

  const handleSaveAiRecipe = (newRecipe: Recipe) => {
    saveCustomRecipe(newRecipe);
    const updatedRecipes = [newRecipe, ...recipes.filter((r) => r.id !== newRecipe.id)];
    setRecipes(updatedRecipes);

    // If generated specifically for a slot
    if (aiSlotTarget.dayIdx !== undefined && aiSlotTarget.mealType) {
      handleAssignMeal(aiSlotTarget.dayIdx, aiSlotTarget.mealType, newRecipe);
      setAiSlotTarget({});
    }
  };

  const handleUpdateProfile = (newProfile: NutritionProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetAll = () => {
    if (window.confirm('Möchtest du die App wirklich auf die Original-Werte der PDF-Analyse zurücksetzen?')) {
      localStorage.clear();
      setProfile(NICOLE_NUTRITION_PROFILE);
      setRecipes(CURATED_NICOLE_RECIPES);
      const resetPlan = loadWeeklyPlan(CURATED_NICOLE_RECIPES);
      setWeeklyPlan(resetPlan);
      const resetShop = generateShoppingListFromPlan(resetPlan);
      setShoppingItems(resetShop);
      saveShoppingItems(resetShop);
      setSettings(DEFAULT_SETTINGS);
      setIsSettingsOpen(false);
    }
  };

  // Shopping handlers
  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems((prev) => {
      const updated = prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it));
      saveShoppingItems(updated);
      return updated;
    });
  };

  const handleToggleShoppingPantry = (id: string) => {
    setShoppingItems((prev) => {
      const updated = prev.map((it) => (it.id === id ? { ...it, isPantry: !it.isPantry } : it));
      saveShoppingItems(updated);
      return updated;
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F6F9F9] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#789A99] border-t-transparent animate-spin" />
      </div>
    );
  }

  const currentDayPlan = weeklyPlan[selectedDayIdx] || weeklyPlan[0];

  return (
    <div className="min-h-screen bg-[#F6F9F9] text-[#111C1E] flex flex-col pb-24 md:pb-12 font-sans selection:bg-[#FFD2C2] selection:text-[#994931]">
      
      {/* SaaS Header */}
      <Header
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiGenerator={() => {
          setAiSlotTarget({});
          setIsAiModalOpen(true);
        }}
        onOpenDocAnalyzer={() => setIsDocAnalyzerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1 w-full space-y-6">
        
        {/* Active Tab: Wochenplan */}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            {/* Live Macro Cockpit */}
            <MacroCockpit
              dayPlan={currentDayPlan}
              targetGoals={profile.targetGoals}
            />

            {/* Meal Slots Plan */}
            <MealPlanner
              weeklyPlan={weeklyPlan}
              selectedDayIdx={selectedDayIdx}
              setSelectedDayIdx={setSelectedDayIdx}
              onOpenMealPicker={(dayIdx, mealType) => {
                setPickerState({ isOpen: true, dayIdx, mealType });
              }}
              onOpenAiForSlot={(dayIdx, mealType) => {
                setAiSlotTarget({ dayIdx, mealType });
                setIsAiModalOpen(true);
              }}
              onOpenCookMode={(recipe) => setCookModeRecipe(recipe)}
              onRemoveMeal={handleRemoveMeal}
              onToggleFastDay={handleToggleFastDay}
              onAutoGeneratePlan={handleAutoGeneratePlan}
              onMealPrepTomorrow={handleMealPrepTomorrow}
            />
          </div>
        )}

        {/* Active Tab: Rezepte */}
        {activeTab === 'recipes' && (
          <RecipeCatalog
            recipes={recipes}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenCookMode={(recipe) => setCookModeRecipe(recipe)}
            onAssignRecipeToDay={(recipe, dayIdx, slot) => {
              handleAssignMeal(dayIdx, slot, recipe);
              setActiveTab('plan');
              setSelectedDayIdx(dayIdx);
            }}
            onOpenAiGenerator={() => {
              setAiSlotTarget({});
              setIsAiModalOpen(true);
            }}
          />
        )}

        {/* Active Tab: Einkaufsliste */}
        {activeTab === 'shopping' && (
          <ShoppingList
            items={shoppingItems}
            onToggleItem={handleToggleShoppingItem}
            onTogglePantry={handleToggleShoppingPantry}
            onRegenerateFromPlan={() => {
              const fresh = generateShoppingListFromPlan(weeklyPlan, shoppingItems);
              setShoppingItems(fresh);
              saveShoppingItems(fresh);
            }}
          />
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shoppingBadgeCount={shoppingItems.filter((i) => !i.checked && !i.isPantry).length}
      />

      {/* Modals */}
      <CookModeModal
        recipe={cookModeRecipe}
        onClose={() => setCookModeRecipe(null)}
        recipeNote={cookModeRecipe ? recipeNotes[cookModeRecipe.id] || '' : ''}
        onSaveNote={handleSaveRecipeNote}
      />

      <AiRecipeGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setAiSlotTarget({});
        }}
        onSaveRecipe={handleSaveAiRecipe}
        userApiKey={settings.apiKey}
        groqApiKey={settings.groqApiKey}
        geminiApiKey={settings.geminiApiKey}
        aiProvider={settings.aiProvider}
        initialMealType={aiSlotTarget.mealType || 'lunch'}
      />

      <DocAnalyzerModal
        isOpen={isDocAnalyzerOpen}
        onClose={() => setIsDocAnalyzerOpen(false)}
        currentProfile={profile}
        onUpdateProfile={handleUpdateProfile}
        userApiKey={settings.apiKey}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        profile={profile}
        onSaveProfile={handleUpdateProfile}
        onResetAllData={handleResetAll}
        onManualCloudSync={handleManualCloudSync}
      />

      <MealPickerModal
        isOpen={pickerState.isOpen}
        onClose={() => setPickerState({ ...pickerState, isOpen: false })}
        mealType={pickerState.mealType}
        dayName={weeklyPlan[pickerState.dayIdx]?.dayName || 'Ausgewählter Tag'}
        recipes={recipes}
        onSelectRecipe={(recipe) => {
          handleAssignMeal(pickerState.dayIdx, pickerState.mealType, recipe);
        }}
        onOpenAiGenerator={() => {
          setAiSlotTarget({ dayIdx: pickerState.dayIdx, mealType: pickerState.mealType });
          setIsAiModalOpen(true);
        }}
      />

    </div>
  );
}
