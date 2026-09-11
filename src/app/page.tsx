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
import { ImagePickerModal } from '@/components/ImagePickerModal';
import { FridgeLeftoversModal } from '@/components/FridgeLeftoversModal';
import { MealSwapModal } from '@/components/MealSwapModal';
import { FoodScannerModal } from '@/components/FoodScannerModal';
import { ProductScannerModal } from '@/components/ProductScannerModal';
import { PrintExportModal } from '@/components/PrintExportModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { BottomNav } from '@/components/BottomNav';

import { DayPlan, MealType, NutritionProfile, Recipe, ShoppingItem, UserProfileEntry } from '@/lib/types';
import {
  AppSettings,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  generateShoppingListFromPlan,
  generateSmartWeeklyPlan,
  getActiveProfile,
  hasUserOnboarded,
  loadAllRecipes,
  loadFavoriteRecipeIds,
  loadProfile,
  loadRecipeNotes,
  loadCustomImages,
  saveCustomImage,
  saveAllCustomImages,
  loadSettings,
  loadShoppingItems,
  loadWeeklyPlan,
  saveCustomRecipe,
  saveFavoriteRecipeIds,
  saveProfile,
  saveProfileEntry,
  saveRecipeNote,
  saveSettings,
  saveShoppingItems,
  saveWeeklyPlan,
} from '@/lib/storage';
import { getRecipeImageUrl } from '@/lib/recipe-images';
import { NICOLE_NUTRITION_PROFILE } from '@/lib/nutrition-profile';
import { CURATED_NICOLE_RECIPES } from '@/lib/recipes-data';
import {
  getSavedHouseholdKey,
  saveHouseholdKey,
  isFirebaseConfigured,
  pushDataToCloud,
  subscribeToCloudSync,
} from '@/lib/firebase';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'recipes' | 'shopping'>('plan');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Profile & User State
  const [activeProfile, setActiveProfile] = useState<UserProfileEntry>(DEFAULT_PROFILE);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // App State
  const [profile, setProfile] = useState<NutritionProfile>(NICOLE_NUTRITION_PROFILE);
  const [recipes, setRecipes] = useState<Recipe[]>(CURATED_NICOLE_RECIPES);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recipeNotes, setRecipeNotes] = useState<Record<string, string>>({});
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [isCloudActive, setIsCloudActive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSlotTarget, setAiSlotTarget] = useState<{ dayIdx?: number; mealType?: MealType }>({});
  const [isDocAnalyzerOpen, setIsDocAnalyzerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cookModeRecipe, setCookModeRecipe] = useState<Recipe | null>(null);
  const [imagePickerRecipe, setImagePickerRecipe] = useState<Recipe | null>(null);
  const [isFridgeModalOpen, setIsFridgeModalOpen] = useState(false);
  const [isFoodScannerOpen, setIsFoodScannerOpen] = useState(false);
  const [isProductScannerOpen, setIsProductScannerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [swapState, setSwapState] = useState<{
    isOpen: boolean;
    dayIdx: number;
    slot: MealType;
    recipe: Recipe | null;
  }>({
    isOpen: false,
    dayIdx: 0,
    slot: 'lunch',
    recipe: null,
  });
  const [aiInitialFridgeIngredients, setAiInitialFridgeIngredients] = useState('');
  const [pickerState, setPickerState] = useState<{ isOpen: boolean; dayIdx: number; mealType: MealType }>({
    isOpen: false,
    dayIdx: 0,
    mealType: 'lunch',
  });

  // Load state on mount
  useEffect(() => {
    const activeP = getActiveProfile();
    setActiveProfile(activeP);
    if (!hasUserOnboarded()) {
      setIsOnboardingOpen(true);
    }

    const loadedProf = loadProfile();
    const currentProf: NutritionProfile = {
      ...loadedProf,
      targetGoals: activeP.targetGoals,
    };
    const loadedRecs = loadAllRecipes();
    const loadedPlan = loadWeeklyPlan(loadedRecs, activeP.householdKey);
    const loadedSet = loadSettings();
    const savedShop = loadShoppingItems(activeP.householdKey);
    const initialShop = generateShoppingListFromPlan(loadedPlan, savedShop || undefined);
    const loadedFavs = loadFavoriteRecipeIds();
    const loadedNotes = loadRecipeNotes();
    const loadedCustomImgs = loadCustomImages();

    setProfile(currentProf);
    setRecipes(loadedRecs);
    setWeeklyPlan(loadedPlan);
    setSettings(loadedSet);
    setShoppingItems(initialShop);
    saveShoppingItems(initialShop, activeP.householdKey);
    setFavorites(loadedFavs);
    setRecipeNotes(loadedNotes);
    setCustomImages(loadedCustomImgs);

    // Restore saved OLED Dark Mode
    if (typeof window !== 'undefined') {
      const savedDark = localStorage.getItem('nicole_dark_mode') === 'true';
      setIsDark(savedDark);
      if (savedDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    setMounted(true);
  }, []);

  // Realtime synchronization if Firebase is configured
  useEffect(() => {
    if (!mounted || !isFirebaseConfigured()) return;

    setIsCloudActive(true);
    const household = activeProfile.householdKey;
    const unsub = subscribeToCloudSync(household, (remoteData, isFromRemote) => {
      // If Firestore has a weekly plan, adopt it
      if (remoteData.weeklyPlan && Array.isArray(remoteData.weeklyPlan) && remoteData.weeklyPlan.length > 0) {
        if (isFromRemote) {
          setWeeklyPlan(remoteData.weeklyPlan);
          saveWeeklyPlan(remoteData.weeklyPlan, household);
        }
      } else {
        // Cloud is empty: Initial seed from this device!
        setIsSyncing(true);
        pushDataToCloud(household, {
          weeklyPlan,
          shoppingItems,
          favorites,
          recipeNotes,
          customImages,
        }).finally(() => setIsSyncing(false));
      }

      if (remoteData.shoppingItems && Array.isArray(remoteData.shoppingItems)) {
        if (isFromRemote) {
          setShoppingItems(remoteData.shoppingItems);
          saveShoppingItems(remoteData.shoppingItems, household);
        }
      }
      if (remoteData.favorites && Array.isArray(remoteData.favorites)) {
        if (isFromRemote) {
          setFavorites(remoteData.favorites);
          saveFavoriteRecipeIds(remoteData.favorites);
        }
      }
      if (remoteData.recipeNotes) {
        if (isFromRemote) {
          setRecipeNotes(remoteData.recipeNotes);
        }
      }
      if (remoteData.customImages) {
        if (isFromRemote) {
          setCustomImages(remoteData.customImages);
          saveAllCustomImages(remoteData.customImages);
        }
      }
      if (remoteData.customRecipes && Array.isArray(remoteData.customRecipes)) {
        if (isFromRemote) {
          remoteData.customRecipes.forEach((cr: Recipe) => saveCustomRecipe(cr));
          setRecipes(loadAllRecipes());
        }
      }
    });
    return () => unsub();
  }, [mounted, activeProfile.householdKey]);

  // Profile switch & creation handler
  const handleSwitchProfile = (newProfile: UserProfileEntry) => {
    setActiveProfile(newProfile);
    setProfile((prev) => ({
      ...prev,
      targetGoals: newProfile.targetGoals,
    }));
    saveHouseholdKey(newProfile.householdKey);

    const loadedPlan = loadWeeklyPlan(recipes, newProfile.householdKey);
    setWeeklyPlan(loadedPlan);

    const savedShop = loadShoppingItems(newProfile.householdKey);
    const updatedShop = generateShoppingListFromPlan(loadedPlan, savedShop || undefined);
    setShoppingItems(updatedShop);
    saveShoppingItems(updatedShop, newProfile.householdKey);
  };

  // Save weekly plan updates & push to Cloud
  const updateWeeklyPlan = (newPlan: DayPlan[]) => {
    setWeeklyPlan(newPlan);
    saveWeeklyPlan(newPlan, activeProfile.householdKey);
    const updatedShop = generateShoppingListFromPlan(newPlan, shoppingItems);
    setShoppingItems(updatedShop);
    saveShoppingItems(updatedShop, activeProfile.householdKey);

    if (isFirebaseConfigured()) {
      setIsSyncing(true);
      pushDataToCloud(activeProfile.householdKey, {
        weeklyPlan: newPlan,
        shoppingItems: updatedShop,
      }).finally(() => setIsSyncing(false));
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
        setIsSyncing(true);
        pushDataToCloud(getSavedHouseholdKey(), { favorites: updated })
          .finally(() => setIsSyncing(false));
      }
      return updated;
    });
  };

  const handleSaveRecipeNote = (recipeId: string, note: string) => {
    setRecipeNotes((prev) => {
      const updated = { ...prev, [recipeId]: note };
      saveRecipeNote(recipeId, note);
      if (isFirebaseConfigured()) {
        setIsSyncing(true);
        pushDataToCloud(getSavedHouseholdKey(), { recipeNotes: updated })
          .finally(() => setIsSyncing(false));
      }
      return updated;
    });
  };

  const handleSaveCustomImage = (recipeId: string, imageUrl: string) => {
    setCustomImages((prev) => {
      const updated = { ...prev, [recipeId]: imageUrl };
      saveCustomImage(recipeId, imageUrl);
      if (isFirebaseConfigured()) {
        setIsSyncing(true);
        pushDataToCloud(getSavedHouseholdKey(), { customImages: updated })
          .finally(() => setIsSyncing(false));
      }
      return updated;
    });
  };

  const handleResetCustomImage = (recipeId: string) => {
    setCustomImages((prev) => {
      const updated = { ...prev };
      delete updated[recipeId];
      saveCustomImage(recipeId, '');
      if (isFirebaseConfigured()) {
        setIsSyncing(true);
        pushDataToCloud(getSavedHouseholdKey(), { customImages: updated })
          .finally(() => setIsSyncing(false));
      }
      return updated;
    });
  };

  const handleUpdateServings = (dayIdx: number, slot: MealType, servings: number) => {
    const updated = [...weeklyPlan];
    if (updated[dayIdx]) {
      const cur = updated[dayIdx].servings || {};
      updated[dayIdx] = {
        ...updated[dayIdx],
        servings: {
          ...cur,
          [slot]: servings,
        },
      };
      updateWeeklyPlan(updated);
    }
  };

  const handleAddCustomShoppingItem = (name: string, amount: string, category: ShoppingItem['category']) => {
    const newItem: ShoppingItem = {
      id: `custom_item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      amount: amount || undefined,
      category,
      checked: false,
      isPantry: false,
      isCustom: true,
    };
    setShoppingItems((prev) => {
      const updated = [newItem, ...prev];
      saveShoppingItems(updated);
      if (isFirebaseConfigured()) {
        setIsSyncing(true);
        pushDataToCloud(getSavedHouseholdKey(), { shoppingItems: updated })
          .finally(() => setIsSyncing(false));
      }
      return updated;
    });
  };

  const handleDeleteCustomShoppingItem = (id: string) => {
    setShoppingItems((prev) => {
      const updated = prev.filter((it) => it.id !== id);
      saveShoppingItems(updated);
      if (isFirebaseConfigured()) {
        setIsSyncing(true);
        pushDataToCloud(getSavedHouseholdKey(), { shoppingItems: updated })
          .finally(() => setIsSyncing(false));
      }
      return updated;
    });
  };

  const handleGenerateAiWithIngredients = (ingredients: string[]) => {
    setAiInitialFridgeIngredients(ingredients.join(', '));
    setAiSlotTarget({});
    setIsAiModalOpen(true);
  };

  const handleManualCloudSync = async () => {
    if (!isFirebaseConfigured()) return false;
    setIsSyncing(true);
    try {
      return await pushDataToCloud(getSavedHouseholdKey(), {
        weeklyPlan,
        shoppingItems,
        favorites,
        recipeNotes,
        customImages,
      });
    } finally {
      setIsSyncing(false);
    }
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

  const handleExecuteSwap = (newRecipe: Recipe) => {
    handleAssignMeal(swapState.dayIdx, swapState.slot, newRecipe);
  };

  const handleLogScannedFood = (scannedRecipe: Recipe, slot: MealType) => {
    saveCustomRecipe(scannedRecipe);
    const updatedRecipes = [scannedRecipe, ...recipes.filter((r) => r.id !== scannedRecipe.id)];
    setRecipes(updatedRecipes);
    handleAssignMeal(selectedDayIdx, slot, scannedRecipe);
    setActiveTab('plan');

    if (isFirebaseConfigured()) {
      setIsSyncing(true);
      pushDataToCloud(getSavedHouseholdKey(), {
        customRecipes: updatedRecipes.filter((r) => r.isAiGenerated),
      }).finally(() => setIsSyncing(false));
    }
  };

  const handleAddFridgeMissingItemsToShopping = (items: string[]) => {
    const newItems: ShoppingItem[] = items.map((name, idx) => ({
      id: `fridge_missing_${Date.now()}_${idx}`,
      name,
      category: 'Vorrat & Gewürze',
      checked: false,
      isPantry: false,
      isCustom: true,
    }));
    setShoppingItems((prev) => {
      const updated = [...newItems, ...prev];
      saveShoppingItems(updated);
      if (isFirebaseConfigured()) {
        setIsSyncing(true);
        pushDataToCloud(getSavedHouseholdKey(), { shoppingItems: updated })
          .finally(() => setIsSyncing(false));
      }
      return updated;
    });
  };

  const handleLogFridgeRecipeToPlan = (recipe: Recipe, slot: MealType) => {
    saveCustomRecipe(recipe);
    const updatedRecipes = [recipe, ...recipes.filter((r) => r.id !== recipe.id)];
    setRecipes(updatedRecipes);
    handleAssignMeal(selectedDayIdx, slot, recipe);
    setActiveTab('plan');

    if (isFirebaseConfigured()) {
      setIsSyncing(true);
      pushDataToCloud(getSavedHouseholdKey(), {
        customRecipes: updatedRecipes.filter((r) => r.isAiGenerated),
      }).finally(() => setIsSyncing(false));
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
        fastingMode: !updated[dayIdx].isFastDay ? 'full' : 'none',
      };
      updateWeeklyPlan(updated);
    }
  };

  const handleSetFastingMode = (dayIdx: number, mode: 'none' | '16:8' | 'full') => {
    const updated = [...weeklyPlan];
    if (updated[dayIdx]) {
      updated[dayIdx] = {
        ...updated[dayIdx],
        fastingMode: mode,
        isFastDay: mode === 'full' || mode === '16:8',
      };
      updateWeeklyPlan(updated);
    }
  };

  const handleAddProductToShopping = (name: string, amount?: string) => {
    handleAddCustomShoppingItem(name, amount || '', 'Vorrat & Gewürze');
  };

  const handleSaveAiRecipe = (newRecipe: Recipe) => {
    saveCustomRecipe(newRecipe);
    setRecipes((prev) => {
      const updatedRecipes = [newRecipe, ...prev.filter((r) => r.id !== newRecipe.id)];
      if (isFirebaseConfigured()) {
        setIsSyncing(true);
        pushDataToCloud(getSavedHouseholdKey(), {
          customRecipes: updatedRecipes.filter((r) => r.isAiGenerated),
        }).finally(() => setIsSyncing(false));
      }
      return updatedRecipes;
    });

    // If generated specifically for a slot
    if (aiSlotTarget.dayIdx !== undefined && aiSlotTarget.mealType) {
      handleAssignMeal(aiSlotTarget.dayIdx, aiSlotTarget.mealType, newRecipe);
      setAiSlotTarget({});
    }
  };

  const handleUpdateProfile = (newProfile: NutritionProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
    if (activeProfile) {
      const updatedActive: UserProfileEntry = {
        ...activeProfile,
        targetGoals: newProfile.targetGoals,
      };
      setActiveProfile(updatedActive);
      saveProfileEntry(updatedActive);
    }
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

      if (isFirebaseConfigured()) {
        setIsSyncing(true);
        pushDataToCloud(getSavedHouseholdKey(), {
          weeklyPlan: resetPlan,
          shoppingItems: resetShop,
          favorites: [],
          recipeNotes: {},
        }).finally(() => setIsSyncing(false));
      }
    }
  };

  // Shopping handlers
  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems((prev) => {
      const updated = prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it));
      saveShoppingItems(updated);
      if (isFirebaseConfigured()) {
        setIsSyncing(true);
        pushDataToCloud(getSavedHouseholdKey(), { shoppingItems: updated })
          .finally(() => setIsSyncing(false));
      }
      return updated;
    });
  };

  const handleToggleShoppingPantry = (id: string) => {
    setShoppingItems((prev) => {
      const updated = prev.map((it) => (it.id === id ? { ...it, isPantry: !it.isPantry } : it));
      saveShoppingItems(updated);
      if (isFirebaseConfigured()) {
        setIsSyncing(true);
        pushDataToCloud(getSavedHouseholdKey(), { shoppingItems: updated })
          .finally(() => setIsSyncing(false));
      }
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

  const handleToggleDark = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nicole_dark_mode', String(nextDark));
      if (nextDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9F9] text-[#111C1E] flex flex-col pb-24 md:pb-12 font-sans selection:bg-[#FFD2C2] selection:text-[#994931]">
      
      {/* SaaS Header */}
      <Header
        profile={profile}
        activeProfileName={activeProfile.name}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiGenerator={() => {
          setAiSlotTarget({});
          setIsAiModalOpen(true);
        }}
        onOpenDocAnalyzer={() => setIsDocAnalyzerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFridgeLeftovers={() => setIsFridgeModalOpen(true)}
        onOpenFoodScanner={() => setIsFoodScannerOpen(true)}
        onOpenProductScanner={() => setIsProductScannerOpen(true)}
        onOpenPrintStudio={() => setIsPrintModalOpen(true)}
        isCloudConnected={isCloudActive}
        isSyncing={isSyncing}
        isDark={isDark}
        onToggleDark={handleToggleDark}
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
              weeklyPlan={weeklyPlan}
            />

            {/* Meal Slots Plan */}
            <MealPlanner
              weeklyPlan={weeklyPlan}
              selectedDayIdx={selectedDayIdx}
              setSelectedDayIdx={setSelectedDayIdx}
              customImages={customImages}
              onOpenImagePicker={(recipe) => setImagePickerRecipe(recipe)}
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
              onUpdateServings={handleUpdateServings}
              onOpenSwapModal={(dayIdx, slot, recipe) =>
                setSwapState({ isOpen: true, dayIdx, slot, recipe })
              }
              onSetFastingMode={handleSetFastingMode}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
            />
          </div>
        )}

        {/* Active Tab: Rezepte */}
        {activeTab === 'recipes' && (
          <RecipeCatalog
            recipes={recipes}
            favorites={favorites}
            customImages={customImages}
            onOpenImagePicker={(recipe) => setImagePickerRecipe(recipe)}
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
            weeklyPlan={weeklyPlan}
            onToggleItem={handleToggleShoppingItem}
            onTogglePantry={handleToggleShoppingPantry}
            onAddCustomItem={handleAddCustomShoppingItem}
            onDeleteCustomItem={handleDeleteCustomShoppingItem}
            onRegenerateFromPlan={() => {
              const fresh = generateShoppingListFromPlan(weeklyPlan, shoppingItems);
              setShoppingItems(fresh);
              saveShoppingItems(fresh);
              if (isFirebaseConfigured()) {
                setIsSyncing(true);
                pushDataToCloud(getSavedHouseholdKey(), { shoppingItems: fresh })
                  .finally(() => setIsSyncing(false));
              }
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
        customImages={customImages}
        onOpenImagePicker={(recipe) => setImagePickerRecipe(recipe)}
      />

      <ImagePickerModal
        isOpen={!!imagePickerRecipe}
        onClose={() => setImagePickerRecipe(null)}
        recipe={imagePickerRecipe}
        currentImageUrl={imagePickerRecipe ? getRecipeImageUrl(imagePickerRecipe, customImages) : ''}
        onSaveImage={handleSaveCustomImage}
        onResetImage={handleResetCustomImage}
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
        initialFridgeIngredients={aiInitialFridgeIngredients}
        profileGoals={profile.targetGoals}
        profileName={activeProfile?.name}
      />

      <FridgeLeftoversModal
        isOpen={isFridgeModalOpen}
        onClose={() => setIsFridgeModalOpen(false)}
        recipes={recipes}
        customImages={customImages}
        onOpenCookMode={(r) => {
          saveCustomRecipe(r);
          setRecipes(loadAllRecipes());
          setCookModeRecipe(r);
        }}
        onGenerateAiWithIngredients={handleGenerateAiWithIngredients}
        userApiKey={settings.apiKey}
        groqApiKey={settings.groqApiKey}
        geminiApiKey={settings.geminiApiKey}
        aiProvider={settings.aiProvider}
        onAddMissingToShoppingList={handleAddFridgeMissingItemsToShopping}
        onLogGeneratedRecipeToPlan={handleLogFridgeRecipeToPlan}
      />

      <MealSwapModal
        isOpen={swapState.isOpen}
        onClose={() => setSwapState((prev) => ({ ...prev, isOpen: false }))}
        sourceRecipe={swapState.recipe}
        dayName={weeklyPlan[swapState.dayIdx]?.dayName || 'Ausgewählter Tag'}
        slotTitle={
          swapState.slot === 'breakfast'
            ? 'Frühstück'
            : swapState.slot === 'lunch'
            ? 'Mittagessen'
            : swapState.slot === 'dinner'
            ? 'Abendessen'
            : 'Snack'
        }
        allRecipes={recipes}
        customImages={customImages}
        onExecuteSwap={handleExecuteSwap}
      />

      <FoodScannerModal
        isOpen={isFoodScannerOpen}
        onClose={() => setIsFoodScannerOpen(false)}
        userApiKey={settings.apiKey}
        groqApiKey={settings.groqApiKey}
        geminiApiKey={settings.geminiApiKey}
        aiProvider={settings.aiProvider}
        onLogMeal={handleLogScannedFood}
        onOpenSettings={() => {
          setIsFoodScannerOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <ProductScannerModal
        isOpen={isProductScannerOpen}
        onClose={() => setIsProductScannerOpen(false)}
        onAddToShoppingList={handleAddProductToShopping}
        onLogAsMeal={(recipe, slot) => {
          handleLogScannedFood(recipe, slot);
        }}
        userApiKey={settings.apiKey}
        groqApiKey={settings.groqApiKey}
        geminiApiKey={settings.geminiApiKey}
        aiProvider={settings.aiProvider}
      />

      <PrintExportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        weeklyPlan={weeklyPlan}
        shoppingItems={shoppingItems}
      />

      <DocAnalyzerModal
        isOpen={isDocAnalyzerOpen}
        onClose={() => setIsDocAnalyzerOpen(false)}
        currentProfile={profile}
        onUpdateProfile={handleUpdateProfile}
        userApiKey={settings.apiKey}
        profileName={activeProfile?.name}
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
        activeProfile={activeProfile}
        onSwitchProfile={handleSwitchProfile}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={(newP) => {
          setIsOnboardingOpen(false);
          handleSwitchProfile(newP);
        }}
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
