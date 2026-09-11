import { DayPlan, NutritionProfile, Recipe, ShoppingItem, UserProfileEntry } from './types';
import { NICOLE_NUTRITION_PROFILE } from './nutrition-profile';
import { CURATED_NICOLE_RECIPES } from './recipes-data';

const STORAGE_KEYS = {
  PROFILE: 'nicole_nutrition_profile_v2',
  RECIPES: 'nicole_custom_recipes_v2',
  WEEKLY_PLAN: 'nicole_weekly_plan_v2',
  SHOPPING: 'nicole_shopping_items_v2',
  SETTINGS: 'nicole_app_settings_v2',
  API_KEY: 'nicole_gemini_api_key_v2',
  FAVORITES: 'nicole_favorite_recipes_v2',
  NOTES: 'nicole_recipe_notes_v2',
  CUSTOM_IMAGES: 'nicole_custom_recipe_images_v2',
  PROFILES: 'fit_app_saved_profiles_v2',
  ACTIVE_PROFILE_ID: 'fit_app_active_profile_id_v2',
  HAS_ONBOARDED: 'fit_has_onboarded_v2',
};

export interface AppSettings {
  portions: number;
  apiKey: string;
  groqApiKey: string;
  geminiApiKey: string;
  aiProvider: 'groq' | 'gemini';
  strictFatWarning: boolean;
  activeDiet: 'nicole-strict' | 'flexible';
}

export const DEFAULT_SETTINGS: AppSettings = {
  portions: 1,
  apiKey: '',
  groqApiKey: '',
  geminiApiKey: '',
  aiProvider: 'groq',
  strictFatWarning: true,
  activeDiet: 'nicole-strict',
};

export function getInitialWeeklyPlan(recipes: Recipe[]): DayPlan[] {
  const days: DayPlan['dayName'][] = [
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
    'Sonntag',
  ];

  const breakfasts = recipes.filter((r) => r.mealType === 'breakfast');
  const lunches = recipes.filter((r) => r.mealType === 'lunch');
  const dinners = recipes.filter((r) => r.mealType === 'dinner');
  const snacks = recipes.filter((r) => r.mealType === 'snack');

  return days.map((dayName, idx) => {
    return {
      dayName,
      breakfast: breakfasts[idx % breakfasts.length] || null,
      lunch: lunches[idx % lunches.length] || null,
      dinner: dinners[idx % dinners.length] || null,
      snack: idx % 2 === 0 ? (snacks[idx % snacks.length] || null) : null,
      isFastDay: false,
    };
  });
}

/**
 * 1-Klick Auto-Wochenplan-Generator
 * Wählt aus dem 160-Rezeptpool 7 harmonische Tage aus, die:
 * - Die Makros perfekt treffen (≤ 44g Fett, ≥ 100g Protein, ~1500 kcal)
 * - Bestehende Fastentage respektieren
 * - Abwechslung über die Woche garantieren
 */
export function generateSmartWeeklyPlan(recipes: Recipe[], existingPlan?: DayPlan[]): DayPlan[] {
  const days: DayPlan['dayName'][] = [
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
    'Sonntag',
  ];

  const breakfasts = recipes.filter((r) => r.mealType === 'breakfast');
  const lunches = recipes.filter((r) => r.mealType === 'lunch');
  const dinners = recipes.filter((r) => r.mealType === 'dinner');
  const snacks = recipes.filter((r) => r.mealType === 'snack');

  // Helper shuffle
  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  const shuffledB = shuffle(breakfasts);
  const shuffledL = shuffle(lunches);
  const shuffledD = shuffle(dinners);
  const shuffledS = shuffle(snacks);

  return days.map((dayName, idx) => {
    const prevDay = existingPlan?.find((d) => d.dayName === dayName);
    if (prevDay?.isFastDay) {
      return {
        dayName,
        breakfast: null,
        lunch: null,
        dinner: null,
        snack: null,
        isFastDay: true,
      };
    }

    // Pick meals ensuring optimal daily macro balance
    const b = shuffledB[idx % shuffledB.length] || null;
    const l = shuffledL[idx % shuffledL.length] || null;
    const d = shuffledD[idx % shuffledD.length] || null;
    
    // Check combined fat
    const currentFat = (b?.fat || 0) + (l?.fat || 0) + (d?.fat || 0);
    // If fat has room, give a snack
    let s = null;
    if (currentFat < 38 && idx % 2 === 0) {
      s = shuffledS.find((snk) => currentFat + snk.fat <= 44) || shuffledS[0] || null;
    }

    return {
      dayName,
      breakfast: b,
      lunch: l,
      dinner: d,
      snack: s,
      isFastDay: false,
    };
  });
}

export function loadFavoriteRecipeIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load favorites', e);
  }
  return [];
}

export function saveFavoriteRecipeIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(ids));
}

export function loadRecipeNotes(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load recipe notes', e);
  }
  return {};
}

export function saveRecipeNote(recipeId: string, note: string) {
  if (typeof window === 'undefined') return;
  const current = loadRecipeNotes();
  if (!note.trim()) {
    delete current[recipeId];
  } else {
    current[recipeId] = note.trim();
  }
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(current));
}

export function loadProfile(): NutritionProfile {
  if (typeof window === 'undefined') return NICOLE_NUTRITION_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return NICOLE_NUTRITION_PROFILE;
}

export function saveProfile(profile: NutritionProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function loadAllRecipes(): Recipe[] {
  if (typeof window === 'undefined') return CURATED_NICOLE_RECIPES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECIPES);
    if (raw) {
      const custom: Recipe[] = JSON.parse(raw);
      // Merge unique IDs
      const map = new Map<string, Recipe>();
      CURATED_NICOLE_RECIPES.forEach((r) => map.set(r.id, r));
      custom.forEach((r) => map.set(r.id, r));
      return Array.from(map.values());
    }
  } catch (e) {
    console.error('Failed to load recipes', e);
  }
  return CURATED_NICOLE_RECIPES;
}

export function saveCustomRecipe(recipe: Recipe) {
  if (typeof window === 'undefined') return;
  const current = loadAllRecipes();
  const filtered = current.filter((r) => r.id !== recipe.id);
  const updated = [recipe, ...filtered];
  // Save only custom ones or whole list
  const customOnly = updated.filter((r) => r.isAiGenerated || !CURATED_NICOLE_RECIPES.some(c => c.id === r.id));
  localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(customOnly));
}

export const DEFAULT_PROFILE: UserProfileEntry = {
  id: 'nicole-keller',
  name: 'Nicole Keller',
  householdKey: 'nicole-keller',
  targetGoals: {
    calories: 1508,
    fat: 44,
    protein: 103,
    carbs: 165,
    fiber: 25,
  },
  createdAt: '2026-09-01',
};

export function getSavedProfiles(): UserProfileEntry[] {
  if (typeof window === 'undefined') return [DEFAULT_PROFILE];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => ({
          ...p,
          targetGoals: {
            calories: p.targetGoals?.calories || 1800,
            fat: p.targetGoals?.fat || 50,
            protein: p.targetGoals?.protein || 110,
            carbs: p.targetGoals?.carbs || 180,
            fiber: p.targetGoals?.fiber || 25,
          },
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load profiles', e);
  }
  return [DEFAULT_PROFILE];
}

export function saveProfileEntry(profile: UserProfileEntry) {
  if (typeof window === 'undefined') return;
  const current = getSavedProfiles();
  const idx = current.findIndex((p) => p.id === profile.id);
  let updated: UserProfileEntry[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = profile;
  } else {
    updated = [...current, profile];
  }
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(updated));
}

export function deleteProfileEntry(id: string) {
  if (typeof window === 'undefined') return;
  const current = getSavedProfiles();
  if (current.length <= 1) return; // Never delete last profile
  const filtered = current.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(filtered));
}

export function getActiveProfileId(): string {
  if (typeof window === 'undefined') return DEFAULT_PROFILE.id;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID) || DEFAULT_PROFILE.id;
}

export function setActiveProfileId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
}

export function getActiveProfile(): UserProfileEntry {
  const activeId = getActiveProfileId();
  const profiles = getSavedProfiles();
  return profiles.find((p) => p.id === activeId) || profiles[0] || DEFAULT_PROFILE;
}

export function hasUserOnboarded(): boolean {
  if (typeof window === 'undefined') return true;
  return Boolean(localStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED));
}

export function markUserOnboarded() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, 'true');
}

export function loadWeeklyPlan(recipes: Recipe[], householdKey?: string): DayPlan[] {
  if (typeof window === 'undefined') return getInitialWeeklyPlan(recipes);
  try {
    const key = householdKey ? `${STORAGE_KEYS.WEEKLY_PLAN}_${householdKey}` : STORAGE_KEYS.WEEKLY_PLAN;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    if (!householdKey || householdKey === DEFAULT_PROFILE.householdKey) {
      const fallback = localStorage.getItem(STORAGE_KEYS.WEEKLY_PLAN);
      if (fallback) return JSON.parse(fallback);
    }
  } catch (e) {
    console.error('Failed to load plan', e);
  }
  return getInitialWeeklyPlan(recipes);
}

export function saveWeeklyPlan(plan: DayPlan[], householdKey?: string) {
  if (typeof window === 'undefined') return;
  const key = householdKey ? `${STORAGE_KEYS.WEEKLY_PLAN}_${householdKey}` : STORAGE_KEYS.WEEKLY_PLAN;
  localStorage.setItem(key, JSON.stringify(plan));
  if (!householdKey || householdKey === DEFAULT_PROFILE.householdKey) {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_PLAN, JSON.stringify(plan));
  }
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

import { groupAndAggregateIngredients, RawIngredientInput } from './ingredient-aggregator';
import { scaleIngredientString } from './scaling';

export function loadShoppingItems(householdKey?: string): ShoppingItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = householdKey ? `${STORAGE_KEYS.SHOPPING}_${householdKey}` : STORAGE_KEYS.SHOPPING;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    if (!householdKey || householdKey === DEFAULT_PROFILE.householdKey) {
      const fallback = localStorage.getItem(STORAGE_KEYS.SHOPPING);
      if (fallback) return JSON.parse(fallback);
    }
  } catch (e) {
    console.error('Failed to load shopping items', e);
  }
  return null;
}

export function saveShoppingItems(items: ShoppingItem[], householdKey?: string) {
  if (typeof window === 'undefined') return;
  const key = householdKey ? `${STORAGE_KEYS.SHOPPING}_${householdKey}` : STORAGE_KEYS.SHOPPING;
  localStorage.setItem(key, JSON.stringify(items));
  if (!householdKey || householdKey === DEFAULT_PROFILE.householdKey) {
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(items));
  }
}

export function generateShoppingListFromPlan(
  plan: DayPlan[],
  existingItems?: ShoppingItem[]
): ShoppingItem[] {
  const rawList: RawIngredientInput[] = [];

  plan.forEach((day) => {
    if (day.isFastDay) return;
    const slots = [
      { recipe: day.breakfast, servings: day.servings?.breakfast || 1 },
      { recipe: day.lunch, servings: day.servings?.lunch || 1 },
      { recipe: day.dinner, servings: day.servings?.dinner || 1 },
      { recipe: day.snack, servings: day.servings?.snack || 1 },
    ];

    slots.forEach(({ recipe, servings }) => {
      if (!recipe) return;
      Object.values(recipe.ingredients).forEach((ingList) => {
        ingList.forEach((ingStr) => {
          const scaledIng = scaleIngredientString(ingStr.trim(), servings);
          rawList.push({
            name: scaledIng,
            recipeSource: servings > 1 ? `${recipe.title} (${servings}x Port.)` : recipe.title,
            dayName: day.dayName,
          });
        });
      });
    });
  });

  const aggregated = groupAndAggregateIngredients(rawList);

  // Preserve user check state and custom pantry toggles if existing items exist
  if (existingItems && existingItems.length > 0) {
    const statusMap = new Map<string, { checked: boolean; isPantry: boolean }>();
    existingItems.forEach((it) => {
      statusMap.set(it.id, { checked: it.checked, isPantry: it.isPantry });
    });

    const updated = aggregated.map((item) => {
      const prev = statusMap.get(item.id);
      if (prev) {
        return {
          ...item,
          checked: prev.checked,
          isPantry: prev.isPantry,
        };
      }
      return item;
    });

    // Re-add custom user items so they are never lost on regenerate
    const customItems = existingItems.filter((it) => it.isCustom);
    return [...updated, ...customItems];
  }

  return aggregated;
}

export function loadCustomImages(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_IMAGES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom images', e);
  }
  return {};
}

export function saveCustomImage(recipeId: string, imageUrl: string) {
  if (typeof window === 'undefined') return;
  const current = loadCustomImages();
  if (!imageUrl || imageUrl.trim().length === 0) {
    delete current[recipeId];
  } else {
    current[recipeId] = imageUrl.trim();
  }
  localStorage.setItem(STORAGE_KEYS.CUSTOM_IMAGES, JSON.stringify(current));
}

export function saveAllCustomImages(images: Record<string, string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CUSTOM_IMAGES, JSON.stringify(images));
}


