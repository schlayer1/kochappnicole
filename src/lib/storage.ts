import { DayPlan, NutritionProfile, Recipe, ShoppingItem } from './types';
import { NICOLE_NUTRITION_PROFILE } from './nutrition-profile';
import { CURATED_NICOLE_RECIPES } from './recipes-data';

const STORAGE_KEYS = {
  PROFILE: 'nicole_nutrition_profile_v2',
  RECIPES: 'nicole_custom_recipes_v2',
  WEEKLY_PLAN: 'nicole_weekly_plan_v2',
  SHOPPING: 'nicole_shopping_items_v2',
  SETTINGS: 'nicole_app_settings_v2',
  API_KEY: 'nicole_gemini_api_key_v2',
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

export function loadWeeklyPlan(recipes: Recipe[]): DayPlan[] {
  if (typeof window === 'undefined') return getInitialWeeklyPlan(recipes);
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_PLAN);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load plan', e);
  }
  return getInitialWeeklyPlan(recipes);
}

export function saveWeeklyPlan(plan: DayPlan[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.WEEKLY_PLAN, JSON.stringify(plan));
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

import { groupAndAggregateIngredients } from './ingredient-aggregator';

export function loadShoppingItems(): ShoppingItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOPPING);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load shopping items', e);
  }
  return null;
}

export function saveShoppingItems(items: ShoppingItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(items));
}

export function generateShoppingListFromPlan(
  plan: DayPlan[],
  existingItems?: ShoppingItem[]
): ShoppingItem[] {
  const rawList: { name: string; recipeSource?: string }[] = [];

  plan.forEach((day) => {
    if (day.isFastDay) return;
    const meals = [day.breakfast, day.lunch, day.dinner, day.snack].filter(Boolean) as Recipe[];

    meals.forEach((recipe) => {
      Object.values(recipe.ingredients).forEach((ingList) => {
        ingList.forEach((ingStr) => {
          rawList.push({
            name: ingStr.trim(),
            recipeSource: recipe.title,
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

    return aggregated.map((item) => {
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
  }

  return aggregated;
}
