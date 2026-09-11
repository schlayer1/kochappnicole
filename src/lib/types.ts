export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MacroGoals {
  calories: number;   // 1508 kcal
  carbs: number;      // 165 g
  fat: number;        // 44 g (strikt limitiert)
  protein: number;    // 103 g (Priorität!)
  fiber: number;      // 25 g
}

export interface MacroBreakdown {
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  fiber: number;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle?: string;
  mealType: MealType | 'any';
  category: 'Frühstück 2.0' | 'Gesunder Teller' | 'High-Protein Bowl' | 'Express Pfanne' | 'Snacks & Dessert' | 'Salat & Leicht';
  prepMins: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  plateRatio?: {
    veggiesPercent: number; // e.g. 50
    proteinPercent: number; // e.g. 25
    carbsPercent: number;   // e.g. 25
  };
  tags: string[];
  whyNicole: string; // Exakte Begründung laut Ernährungsbericht
  ingredients: Record<string, string[]>;
  instructions: string[];
  isAiGenerated?: boolean;
  image?: string;
}

export interface DayPlan {
  dayName: 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag' | 'Samstag' | 'Sonntag';
  breakfast?: Recipe | null;
  lunch?: Recipe | null;
  dinner?: Recipe | null;
  snack?: Recipe | null;
  servings?: {
    breakfast?: number;
    lunch?: number;
    dinner?: number;
    snack?: number;
  };
  isFastDay?: boolean;
  fastingMode?: 'none' | '16:8' | 'full';
  notes?: string;
}

export interface ProductNutrition {
  barcode?: string;
  name: string;
  brand?: string;
  servingSize?: string;
  kcal: number;
  protein: number;
  fat: number;
  saturatedFat?: number;
  carbs: number;
  fiber?: number;
  imageUrl?: string;
  source: 'open-food-facts' | 'vision-ocr' | 'manual';
}

export interface NicoleProductEvaluation {
  suitability: 'great' | 'caution-fat' | 'fat-trap';
  fatVerdict: string;
  proteinVerdict: string;
  summary: string;
  dailyFatPercent: number; // % of 44g
  dailyProteinPercent: number; // % of 103g
}

export interface NutritionProfile {
  name: string;
  lastUpdated: string;
  sourceDocName: string;
  targetGoals: MacroGoals;
  principles: {
    rule: string;
    description: string;
  }[];
  allowedProteins: string[];
  avoidProteins: string[];
  allowedFats: string[];
  avoidFats: string[];
  allowedCarbs: string[];
  avoidCarbs: string[];
  substitutions: {
    original: string;
    alternative: string;
    reason: string;
  }[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount?: string;
  packAdvice?: string;
  category: 'Frischetheke & Obst' | 'Kühlregal' | 'Vorrat & Gewürze' | 'Geflügel & Fisch' | 'Tiefkühl' | 'Drogerie & Haushalt';
  checked: boolean;
  isPantry: boolean;
  isCustom?: boolean;
  recipeSource?: string;
  days?: string[];
  recipes?: string[];
}
