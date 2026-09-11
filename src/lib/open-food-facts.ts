import { ProductNutrition, NicoleProductEvaluation } from './types';

// Fetch product information by 8- or 13-digit EAN/Barcode from Open Food Facts
export async function fetchProductByBarcode(barcode: string): Promise<ProductNutrition | null> {
  const cleanBarcode = barcode.trim().replace(/\D/g, '');
  if (!cleanBarcode || cleanBarcode.length < 8) return null;

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json?fields=product_name,brands,nutriments,serving_size,image_url`,
      {
        headers: {
          'User-Agent': 'NicoleFitAndHealthyApp/2.0 (contact@nicolekeller.de)',
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    const p = data.product;
    const nutriments = p.nutriments || {};

    const kcal =
      Math.round(nutriments['energy-kcal_100g'] ?? (nutriments['energy-kcal'] ?? (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 0)));
    const protein = Math.round((nutriments.proteins_100g ?? (nutriments.proteins ?? 0)) * 10) / 10;
    const fat = Math.round((nutriments.fat_100g ?? (nutriments.fat ?? 0)) * 10) / 10;
    const saturatedFat = Math.round((nutriments['saturated-fat_100g'] ?? 0) * 10) / 10;
    const carbs = Math.round((nutriments.carbohydrates_100g ?? (nutriments.carbohydrates ?? 0)) * 10) / 10;
    const fiber = Math.round((nutriments.fiber_100g ?? 0) * 10) / 10;

    return {
      barcode: cleanBarcode,
      name: p.product_name || 'Unbekanntes Produkt',
      brand: p.brands || '',
      servingSize: p.serving_size || '100g',
      kcal,
      protein,
      fat,
      saturatedFat,
      carbs,
      fiber,
      imageUrl: p.image_url,
      source: 'open-food-facts',
    };
  } catch (err) {
    console.error('Error querying Open Food Facts by barcode:', err);
    return null;
  }
}

// Search Open Food Facts products by text query (e.g. "Exquisa Fitline", "Skyr")
export async function searchProductsByName(query: string): Promise<ProductNutrition[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return [];

  try {
    const res = await fetch(
      `https://de.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(clean)}&search_simple=1&action=process&json=1&page_size=10&fields=code,product_name,brands,nutriments,serving_size,image_url`,
      {
        headers: {
          'User-Agent': 'NicoleFitAndHealthyApp/2.0 (contact@nicolekeller.de)',
        },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.products)) return [];

    return data.products
      .filter((p: any) => p.product_name && p.nutriments)
      .map((p: any): ProductNutrition => {
        const nutriments = p.nutriments || {};
        const kcal = Math.round(
          nutriments['energy-kcal_100g'] ?? (nutriments['energy-kcal'] ?? 0)
        );
        const protein = Math.round((nutriments.proteins_100g ?? (nutriments.proteins ?? 0)) * 10) / 10;
        const fat = Math.round((nutriments.fat_100g ?? (nutriments.fat ?? 0)) * 10) / 10;
        const saturatedFat = Math.round((nutriments['saturated-fat_100g'] ?? 0) * 10) / 10;
        const carbs = Math.round((nutriments.carbohydrates_100g ?? 0) * 10) / 10;
        const fiber = Math.round((nutriments.fiber_100g ?? 0) * 10) / 10;

        return {
          barcode: p.code,
          name: p.product_name,
          brand: p.brands || '',
          servingSize: p.serving_size || '100g',
          kcal,
          protein,
          fat,
          saturatedFat,
          carbs,
          fiber,
          imageUrl: p.image_url,
          source: 'open-food-facts',
        };
      });
  } catch (err) {
    console.error('Error searching Open Food Facts:', err);
    return [];
  }
}

// Evaluate product nutrition strictly against Nicole's daily goals:
// Max 44g Fat/Day, Min 103g Protein/Day
export function evaluateNicoleMatch(item: ProductNutrition): NicoleProductEvaluation {
  const fat = item.fat;
  const protein = item.protein;
  const dailyFatPercent = Math.round((fat / 44) * 100);
  const dailyProteinPercent = Math.round((protein / 103) * 100);

  // Nicole Suitability Logic:
  // <= 3g Fat per 100g: "great"
  // 3.1g - 10g Fat: "caution-fat"
  // > 10g Fat: "fat-trap"
  let suitability: NicoleProductEvaluation['suitability'] = 'great';
  let fatVerdict = '';
  let proteinVerdict = '';
  let summary = '';

  if (fat <= 3.5) {
    suitability = 'great';
    fatVerdict = `Extrem fettarm (${fat}g / 100g). Schont dein 44g-Tagesbudget maximal!`;
  } else if (fat <= 10.0) {
    suitability = 'caution-fat';
    fatVerdict = `Moderater Fettgehalt (${fat}g / 100g). Bei normaler Portion verbrauchst du ca. ${dailyFatPercent}% deines Tageslimits.`;
  } else {
    suitability = 'fat-trap';
    fatVerdict = `Achtung Fettfalle! Mit ${fat}g Fett / 100g beansprucht dieses Produkt bereits ${dailyFatPercent}% deines gesamten 44g-Tagesbudgets.`;
  }

  if (protein >= 12.0) {
    proteinVerdict = `Hervorragende Proteinquelle (${protein}g / 100g). Trägt stark zu deinen 103g Mindest-Eiweiß bei!`;
  } else if (protein >= 6.0) {
    proteinVerdict = `Solider Eiweißbeitrag (${protein}g / 100g).`;
  } else {
    proteinVerdict = `Geringer Proteingehalt (${protein}g / 100g). Kombiniere am besten mit einer Eiweißquelle.`;
  }

  if (suitability === 'great') {
    summary = `🟢 Top Nicole-Match: Perfekt für den Alltag und deinen Ernährungsplan.`;
  } else if (suitability === 'caution-fat') {
    summary = `🟡 Bedingt geeignet: Auf die Portionsgröße achten, um unter 44g Fett zu bleiben.`;
  } else {
    summary = `🔴 Nicht empfohlen für Nicole: Hohes Risiko, dein 44g Fettlimit zu sprengen.`;
  }

  return {
    suitability,
    fatVerdict,
    proteinVerdict,
    summary,
    dailyFatPercent,
    dailyProteinPercent,
  };
}
