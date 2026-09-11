import { Recipe, MealType } from './types';

export interface SwapAlternative {
  recipe: Recipe;
  deltaKcal: number;
  deltaProtein: number;
  deltaFat: number;
  deltaCarbs: number;
  score: number;
  matchHighlight: string;
}

/**
 * Finds macro-identical or macro-compatible swap alternatives for a given recipe.
 * Prioritizes:
 * 1. Minimal fat difference (strict Nicole limit: 44g/day max)
 * 2. High/maintained protein (Nicole target: 103g/day)
 * 3. Similar meal type or compatible category
 */
export function findSmartSwapAlternatives(
  sourceRecipe: Recipe,
  allRecipes: Recipe[],
  options: {
    proteinCategory?: 'all' | 'geflügel' | 'fisch' | 'veggie';
    limit?: number;
  } = {}
): SwapAlternative[] {
  const { proteinCategory = 'all', limit = 6 } = options;

  const candidates = allRecipes.filter((r) => {
    // Exclude the recipe itself
    if (r.id === sourceRecipe.id) return false;

    // Filter by mealType compatibility:
    // breakfast swaps with breakfast; snacks with snacks; lunch/dinner are interchangeable
    if (sourceRecipe.mealType === 'breakfast' && r.mealType !== 'breakfast') return false;
    if (sourceRecipe.mealType === 'snack' && r.mealType !== 'snack') return false;
    if (
      (sourceRecipe.mealType === 'lunch' || sourceRecipe.mealType === 'dinner') &&
      r.mealType !== 'lunch' &&
      r.mealType !== 'dinner' &&
      r.mealType !== 'any'
    ) {
      return false;
    }

    // Filter by protein source preference
    if (proteinCategory !== 'all') {
      const titleLower = r.title.toLowerCase();
      const ingsLower = Object.values(r.ingredients || {})
        .flat()
        .join(' ')
        .toLowerCase();
      const combined = `${titleLower} ${ingsLower}`;

      if (proteinCategory === 'geflügel') {
        const isPoultry =
          combined.includes('hähnchen') ||
          combined.includes('pute') ||
          combined.includes('geflügel');
        if (!isPoultry) return false;
      } else if (proteinCategory === 'fisch') {
        const isFish =
          combined.includes('lachs') ||
          combined.includes('thunfisch') ||
          combined.includes('seelachs') ||
          combined.includes('garnelen') ||
          combined.includes('kabeljau');
        if (!isFish) return false;
      } else if (proteinCategory === 'veggie') {
        const isVeggie =
          combined.includes('feta') ||
          combined.includes('ei') ||
          combined.includes('eier') ||
          combined.includes('quark') ||
          combined.includes('skyr') ||
          combined.includes('tofu') ||
          combined.includes('kichererbsen');
        const hasMeat =
          combined.includes('hähnchen') ||
          combined.includes('pute') ||
          combined.includes('lachs') ||
          combined.includes('thunfisch') ||
          combined.includes('tatar');
        if (!isVeggie || hasMeat) return false;
      }
    }

    return true;
  });

  const scored: SwapAlternative[] = candidates.map((recipe) => {
    const deltaKcal = recipe.kcal - sourceRecipe.kcal;
    const deltaProtein = recipe.protein - sourceRecipe.protein;
    const deltaFat = recipe.fat - sourceRecipe.fat;
    const deltaCarbs = recipe.carbs - sourceRecipe.carbs;

    // Penalty scoring:
    // Severe penalty for extra fat: 25 points per gram of added fat
    const fatPenalty = deltaFat > 0 ? deltaFat * 25 : Math.abs(deltaFat) * 6;
    // Penalty for lost protein: 15 points per gram lost
    const proteinPenalty = deltaProtein < 0 ? Math.abs(deltaProtein) * 15 : 0;
    // Minor penalty for large calorie gap
    const kcalPenalty = Math.abs(deltaKcal) * 0.1;

    const totalScore = fatPenalty + proteinPenalty + kcalPenalty;

    let matchHighlight = 'Makro-Zwilling';
    if (Math.abs(deltaFat) <= 1 && Math.abs(deltaProtein) <= 2) {
      matchHighlight = 'Exakt gleiche Makros';
    } else if (deltaProtein > 0 && deltaFat <= 0) {
      matchHighlight = `+${deltaProtein}g Protein & weniger Fett!`;
    } else if (Math.abs(deltaFat) <= 2) {
      matchHighlight = 'Fettbilanz identisch';
    }

    return {
      recipe,
      deltaKcal,
      deltaProtein,
      deltaFat,
      deltaCarbs,
      score: totalScore,
      matchHighlight,
    };
  });

  return scored.sort((a, b) => a.score - b.score).slice(0, limit);
}
