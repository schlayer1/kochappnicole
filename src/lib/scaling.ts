/**
 * Utility functions for scaling recipe ingredients and nutrition
 */

export function scaleIngredientString(text: string, factor: number): string {
  if (factor === 1) return text;

  // Handle fractions like "1/2"
  const fractionMatch = text.match(/^(\d+)\/(\d+)\s*(.*)/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    const total = (num / den) * factor;
    const rest = fractionMatch[3];
    const formatted = total % 1 === 0 ? total.toString() : total.toFixed(1).replace('.0', '');
    return `${formatted} ${rest}`.trim();
  }

  // Handle standard number + unit or item (e.g., "200g", "150 ml", "2 Eier", "1 Scheibe", "1 EL")
  const standardMatch = text.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-ZäöüÄÖÜß%]+)?\s*(.*)/);
  if (standardMatch) {
    const rawVal = parseFloat(standardMatch[1].replace(',', '.'));
    const unit = standardMatch[2] || '';
    const rest = standardMatch[3] || '';

    const scaledVal = rawVal * factor;

    // Format nicely: round grams and ml, keep 1 decimal for small units if needed
    let formattedVal = '';
    if (unit.toLowerCase() === 'g' || unit.toLowerCase() === 'ml') {
      formattedVal = Math.round(scaledVal).toString();
    } else if (scaledVal % 1 === 0) {
      formattedVal = scaledVal.toString();
    } else {
      formattedVal = scaledVal.toFixed(1).replace('.0', '');
    }

    // Handle plurals if unit is "Scheibe" -> "Scheiben", "Dose" -> "Dosen", "Ei" -> "Eier", "Zehe" -> "Zehen"
    let adjustedUnit = unit;
    if (scaledVal > 1) {
      if (unit.toLowerCase() === 'scheibe') adjustedUnit = 'Scheiben';
      if (unit.toLowerCase() === 'dose') adjustedUnit = 'Dosen';
      if (unit.toLowerCase() === 'becher') adjustedUnit = 'Becher';
      if (unit.toLowerCase() === 'ei') adjustedUnit = 'Eier';
      if (unit.toLowerCase() === 'zehe') adjustedUnit = 'Zehen';
      if (unit.toLowerCase() === 'stange') adjustedUnit = 'Stangen';
      if (unit.toLowerCase() === 'karotte') adjustedUnit = 'Karotten';
      if (unit.toLowerCase() === 'zwiebel') adjustedUnit = 'Zwiebeln';
      if (unit.toLowerCase() === 'tomate') adjustedUnit = 'Tomaten';
    }

    const unitPart = adjustedUnit ? ` ${adjustedUnit}` : '';
    const restPart = rest ? ` ${rest}` : '';
    return `${formattedVal}${unitPart}${restPart}`.trim();
  }

  return text;
}

export function scaleRecipeIngredients(
  ingredients: Record<string, string[]> | undefined | null,
  factor: number
): Record<string, string[]> {
  if (!ingredients || typeof ingredients !== 'object') return {};
  if (factor === 1) return ingredients;

  const scaled: Record<string, string[]> = {};
  for (const [category, list] of Object.entries(ingredients)) {
    if (Array.isArray(list)) {
      scaled[category] = list.map((item) => scaleIngredientString(String(item), factor));
    }
  }
  return scaled;
}
