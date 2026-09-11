import { Recipe } from './types';

// High-Resolution Curated Food Photography via Unsplash CDN
// w=800&auto=format&fit=crop&q=80 provides retina sharpness with tiny file size
export const FOOD_IMAGE_COLLECTION = {
  // Breakfast & Bowls
  skyrBerryBowl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
  chiaPudding: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  oatPorridge: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
  proteinPancakes: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
  wholegrainSandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  hamSandwich: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
  avocadoEggToast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
  omeletteHerbs: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80',

  // Fish & Seafood
  salmonVeggies: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
  salmonBowl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  whiteFishPlate: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
  shrimpWok: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=800&q=80',
  tunaSalad: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',

  // Chicken & Poultry
  chickenBroccoli: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
  grilledChickenPlate: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
  chickenCurry: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  chickenSalad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  turkeyStirFry: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',

  // Vegetarian & Mediterranean
  fetaShakshuka: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
  zucchiniFeta: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
  mediterraneanOvenVeggies: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=800&q=80',
  greekSalad: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  quinoaVeggieBowl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  cottageCheesePlate: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  lentilCurry: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  chickpeaEggSalad: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=800&q=80',

  // Lean Meat & Hearty Dishes
  beefTatarBowl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  mincedMeatBowl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  healthyWrap: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
  zucchiniNoodlesPasta: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',

  // Soups & Stews
  broccoliSoupCrunch: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  veggieSoup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  tomatoSoupBasil: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',

  // Snacks & Light Bites
  applePeanutButter: 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=800&q=80',
  veggieSticksHummus: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  boiledEggPlate: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
  berryQuarkDip: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
  nutsAndGrapes: 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=800&q=80',
  appleCinnamonQuark: 'https://images.unsplash.com/photo-1505253758473-96b46deae2cd?auto=format&fit=crop&w=800&q=80',
  proteinSmoothie: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
  mugcake: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
};

// Category defaults
export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  'Frühstück 2.0': FOOD_IMAGE_COLLECTION.skyrBerryBowl,
  'Gesunder Teller': FOOD_IMAGE_COLLECTION.grilledChickenPlate,
  'High-Protein Bowl': FOOD_IMAGE_COLLECTION.quinoaVeggieBowl,
  'Express Pfanne': FOOD_IMAGE_COLLECTION.chickenBroccoli,
  'Snacks & Dessert': FOOD_IMAGE_COLLECTION.berryQuarkDip,
  'Salat & Leicht': FOOD_IMAGE_COLLECTION.greekSalad,
};

// Preset gallery for manual image switcher
export const PRESET_FOOD_GALLERY = [
  { label: 'Skyr & Beeren Bowl', url: FOOD_IMAGE_COLLECTION.skyrBerryBowl, category: 'Frühstück' },
  { label: 'Vollkorn-Stulle mit Schinken', url: FOOD_IMAGE_COLLECTION.hamSandwich, category: 'Frühstück' },
  { label: 'Vollkorn-Brot mit Pute/Käse', url: FOOD_IMAGE_COLLECTION.wholegrainSandwich, category: 'Frühstück' },
  { label: 'Avocado-Ei Toast', url: FOOD_IMAGE_COLLECTION.avocadoEggToast, category: 'Frühstück' },
  { label: 'Kräuter-Omelett', url: FOOD_IMAGE_COLLECTION.omeletteHerbs, category: 'Frühstück' },
  { label: 'Norwegischer Lachs mit Gemüse', url: FOOD_IMAGE_COLLECTION.salmonVeggies, category: 'Fisch' },
  { label: 'Seelachs / Weißer Fisch', url: FOOD_IMAGE_COLLECTION.whiteFishPlate, category: 'Fisch' },
  { label: 'Lachs-Bowl', url: FOOD_IMAGE_COLLECTION.salmonBowl, category: 'Fisch' },
  { label: 'Hähnchen-Brokkoli Pfanne', url: FOOD_IMAGE_COLLECTION.chickenBroccoli, category: 'Geflügel' },
  { label: 'Gegrilltes Hähnchen mit Reis', url: FOOD_IMAGE_COLLECTION.grilledChickenPlate, category: 'Geflügel' },
  { label: 'Hähnchen-Curry', url: FOOD_IMAGE_COLLECTION.chickenCurry, category: 'Geflügel' },
  { label: 'Zucchini-Feta Pfanne', url: FOOD_IMAGE_COLLECTION.zucchiniFeta, category: 'Vegetarisch' },
  { label: 'Shakshuka mit Ei & Feta', url: FOOD_IMAGE_COLLECTION.fetaShakshuka, category: 'Vegetarisch' },
  { label: 'Mediterranes Ofengemüse', url: FOOD_IMAGE_COLLECTION.mediterraneanOvenVeggies, category: 'Vegetarisch' },
  { label: 'Kichererbsen & Ei Bowl', url: FOOD_IMAGE_COLLECTION.chickpeaEggSalad, category: 'Bowls' },
  { label: 'Quinoa-Gemüse Bowl', url: FOOD_IMAGE_COLLECTION.quinoaVeggieBowl, category: 'Bowls' },
  { label: 'Rinder-Tatar / Mageres Hack', url: FOOD_IMAGE_COLLECTION.beefTatarBowl, category: 'Fleisch' },
  { label: 'Gesunder Wrap', url: FOOD_IMAGE_COLLECTION.healthyWrap, category: 'Express' },
  { label: 'Brokkoli-Suppe mit Crunch', url: FOOD_IMAGE_COLLECTION.broccoliSoupCrunch, category: 'Suppen' },
  { label: 'Apfelspalten mit Erdnussmus', url: FOOD_IMAGE_COLLECTION.applePeanutButter, category: 'Snacks' },
  { label: 'Gemüsesticks mit Hummus', url: FOOD_IMAGE_COLLECTION.veggieSticksHummus, category: 'Snacks' },
  { label: 'Gekochtes Ei & Tomaten', url: FOOD_IMAGE_COLLECTION.boiledEggPlate, category: 'Snacks' },
  { label: 'Magerquark mit Beeren', url: FOOD_IMAGE_COLLECTION.berryQuarkDip, category: 'Snacks' },
  { label: 'Nüsse & Trauben', url: FOOD_IMAGE_COLLECTION.nutsAndGrapes, category: 'Snacks' },
];

/**
 * Intelligenter Matcher:
 * Ermittelt anhand des Titels, der Zutaten und der Kategorie das passendste
 * hochauflösende Food-Foto – mit strikter sprachlicher Ausschlusslogik.
 */
export function getRecipeImageUrl(
  recipe: Partial<Recipe>,
  customImages?: Record<string, string>
): string {
  // 0. Benutzer-individuelles Bild für dieses Rezept
  if (recipe.id && customImages && customImages[recipe.id]) {
    return customImages[recipe.id];
  }

  // 1. Explizit am Rezept hinterlegtes Bild
  if (recipe.image && recipe.image.trim().length > 0) {
    return recipe.image;
  }

  const titleLower = (recipe.title || '').toLowerCase();
  const categoryLower = (recipe.category || '').toLowerCase();
  const tagsLower = (recipe.tags || []).join(' ').toLowerCase();

  // Alle Zutaten als Suchtext zusammenfassen
  let ingredientsText = '';
  if (recipe.ingredients) {
    ingredientsText = Object.values(recipe.ingredients)
      .flat()
      .join(' ')
      .toLowerCase();
  }

  const fullSearchText = `${titleLower} ${categoryLower} ${tagsLower} ${ingredientsText}`;

  // =========================================================================
  // 2. Präzise thematische Zuordnungen (Priorität von spezifisch nach allgemein)
  // =========================================================================

  // A. LACHSSCHINKEN & SCHINKEN (Unbedingt VOR Lachs prüfen!)
  if (
    fullSearchText.includes('lachsschinken') ||
    fullSearchText.includes('schinken') ||
    fullSearchText.includes('prosciutto')
  ) {
    if (fullSearchText.includes('suppe') || fullSearchText.includes('crunch')) {
      return FOOD_IMAGE_COLLECTION.broccoliSoupCrunch;
    }
    return FOOD_IMAGE_COLLECTION.hamSandwich;
  }

  // B. SEELACHS & WEISSER FISCH (Kabeljau, Seelachs, Zander, etc.)
  if (
    fullSearchText.includes('seelachs') ||
    fullSearchText.includes('kabeljau') ||
    fullSearchText.includes('weißfisch') ||
    fullSearchText.includes('zander')
  ) {
    return FOOD_IMAGE_COLLECTION.whiteFishPlate;
  }

  // C. ECHTER LACHS & FORELLE (Rosa Lachsfilet / Steak)
  if (
    (fullSearchText.includes('lachs') && !fullSearchText.includes('seelachs') && !fullSearchText.includes('lachsschinken')) ||
    fullSearchText.includes('forelle')
  ) {
    if (fullSearchText.includes('bowl')) return FOOD_IMAGE_COLLECTION.salmonBowl;
    return FOOD_IMAGE_COLLECTION.salmonVeggies;
  }

  // D. MEERESFRÜCHTE & THUNFISCH
  if (fullSearchText.includes('thunfisch')) return FOOD_IMAGE_COLLECTION.tunaSalad;
  if (fullSearchText.includes('garnele') || fullSearchText.includes('shrimp')) return FOOD_IMAGE_COLLECTION.shrimpWok;

  // E. SNACKS & DESSERTS
  if (recipe.category === 'Snacks & Dessert' || titleLower.startsWith('snack') || fullSearchText.includes('snack')) {
    if (fullSearchText.includes('apfel') && (fullSearchText.includes('erdnuss') || fullSearchText.includes('mus'))) {
      return FOOD_IMAGE_COLLECTION.applePeanutButter;
    }
    if (fullSearchText.includes('hummus') || fullSearchText.includes('gemüsestick') || fullSearchText.includes('sticks')) {
      return FOOD_IMAGE_COLLECTION.veggieSticksHummus;
    }
    if (fullSearchText.includes('gekochtes ei') || (fullSearchText.includes('ei') && fullSearchText.includes('tomate'))) {
      return FOOD_IMAGE_COLLECTION.boiledEggPlate;
    }
    if (fullSearchText.includes('magerquark') || fullSearchText.includes('dip') || fullSearchText.includes('heidelbeer') || fullSearchText.includes('beeren-quark')) {
      return FOOD_IMAGE_COLLECTION.berryQuarkDip;
    }
    if (fullSearchText.includes('mandel') || fullSearchText.includes('traube') || fullSearchText.includes('weintrauben') || fullSearchText.includes('walnuss') || fullSearchText.includes('cashew')) {
      return FOOD_IMAGE_COLLECTION.nutsAndGrapes;
    }
    if (fullSearchText.includes('quarkriegel') || fullSearchText.includes('togo') || fullSearchText.includes('riegel')) {
      return FOOD_IMAGE_COLLECTION.berryQuarkDip;
    }
    if (fullSearchText.includes('smoothie') || fullSearchText.includes('shake')) {
      return FOOD_IMAGE_COLLECTION.proteinSmoothie;
    }
    if (fullSearchText.includes('mugcake') || fullSearchText.includes('tassenkuchen')) {
      return FOOD_IMAGE_COLLECTION.mugcake;
    }
  }

  // F. SHAKSHUKA
  if (fullSearchText.includes('shakshuka')) {
    return FOOD_IMAGE_COLLECTION.fetaShakshuka;
  }

  // G. RINDER-TATAR & MAGERES HACKFLEISCH
  if (fullSearchText.includes('tatar') || fullSearchText.includes('rinder-tatar')) {
    return FOOD_IMAGE_COLLECTION.beefTatarBowl;
  }
  if (fullSearchText.includes('hack') || fullSearchText.includes('bolognese')) {
    return FOOD_IMAGE_COLLECTION.mincedMeatBowl;
  }
  if (fullSearchText.includes('rind') || fullSearchText.includes('steak')) {
    return FOOD_IMAGE_COLLECTION.beefTatarBowl;
  }

  // H. KICHERERBSEN & EIER
  if (fullSearchText.includes('kichererbse') && fullSearchText.includes('ei')) {
    return FOOD_IMAGE_COLLECTION.chickpeaEggSalad;
  }

  // I. FRÜHSTÜCK & STULLEN
  if (fullSearchText.includes('skyr') && (fullSearchText.includes('beere') || fullSearchText.includes('himbeer') || fullSearchText.includes('blaubeer') || fullSearchText.includes('heidelbeer'))) {
    return FOOD_IMAGE_COLLECTION.skyrBerryBowl;
  }
  if (fullSearchText.includes('chia') || fullSearchText.includes('overnight')) {
    return FOOD_IMAGE_COLLECTION.chiaPudding;
  }
  if (fullSearchText.includes('porridge') || fullSearchText.includes('haferflocken')) {
    return FOOD_IMAGE_COLLECTION.oatPorridge;
  }
  if (fullSearchText.includes('pancake') || fullSearchText.includes('pfannkuchen')) {
    return FOOD_IMAGE_COLLECTION.proteinPancakes;
  }
  if (fullSearchText.includes('stulle') || fullSearchText.includes('brot') || fullSearchText.includes('toast') || fullSearchText.includes('sandwich')) {
    if (fullSearchText.includes('avocado') || fullSearchText.includes('ei')) {
      return FOOD_IMAGE_COLLECTION.avocadoEggToast;
    }
    return FOOD_IMAGE_COLLECTION.wholegrainSandwich;
  }
  if (fullSearchText.includes('rührei') || fullSearchText.includes('omelett') || fullSearchText.includes('spiegelei')) {
    return FOOD_IMAGE_COLLECTION.omeletteHerbs;
  }

  // J. PFANNENGERICHTE & GEFLÜGEL
  if (fullSearchText.includes('hähnchen') || fullSearchText.includes('huhn') || fullSearchText.includes('pute') || fullSearchText.includes('geflügel')) {
    if (fullSearchText.includes('curry')) return FOOD_IMAGE_COLLECTION.chickenCurry;
    if (fullSearchText.includes('salat')) return FOOD_IMAGE_COLLECTION.chickenSalad;
    if (fullSearchText.includes('brokkoli') || fullSearchText.includes('pfanne') || fullSearchText.includes('wok')) {
      return FOOD_IMAGE_COLLECTION.chickenBroccoli;
    }
    return FOOD_IMAGE_COLLECTION.grilledChickenPlate;
  }

  // K. FETA & ZUCCHINI / MEDITERRAN
  if (fullSearchText.includes('feta') || fullSearchText.includes('zucchini')) {
    return FOOD_IMAGE_COLLECTION.zucchiniFeta;
  }

  // L. WRAPS
  if (fullSearchText.includes('wrap') || fullSearchText.includes('burrito') || fullSearchText.includes('fajita')) {
    return FOOD_IMAGE_COLLECTION.healthyWrap;
  }

  // M. PASTA & ZOODLES
  if (fullSearchText.includes('pasta') || fullSearchText.includes('nudel') || fullSearchText.includes('zoodles') || fullSearchText.includes('penne')) {
    return FOOD_IMAGE_COLLECTION.zucchiniNoodlesPasta;
  }

  // N. SUPPEN
  if (fullSearchText.includes('suppe') || fullSearchText.includes('eintopf')) {
    if (fullSearchText.includes('tomate')) return FOOD_IMAGE_COLLECTION.tomatoSoupBasil;
    if (fullSearchText.includes('brokkoli')) return FOOD_IMAGE_COLLECTION.broccoliSoupCrunch;
    return FOOD_IMAGE_COLLECTION.veggieSoup;
  }

  // O. HÜLSENFRÜCHTE & BOWLS
  if (fullSearchText.includes('linse') || fullSearchText.includes('dal')) return FOOD_IMAGE_COLLECTION.lentilCurry;
  if (fullSearchText.includes('kichererbse')) return FOOD_IMAGE_COLLECTION.chickpeaEggSalad;
  if (fullSearchText.includes('quinoa') || fullSearchText.includes('bowl')) return FOOD_IMAGE_COLLECTION.quinoaVeggieBowl;
  if (fullSearchText.includes('hüttenkäse') || fullSearchText.includes('körniger frischkäse')) return FOOD_IMAGE_COLLECTION.cottageCheesePlate;

  // P. SALATE
  if (fullSearchText.includes('salat')) return FOOD_IMAGE_COLLECTION.greekSalad;

  // 3. Kategorie-Fallback
  if (recipe.category && CATEGORY_DEFAULT_IMAGES[recipe.category]) {
    return CATEGORY_DEFAULT_IMAGES[recipe.category];
  }

  // 4. Fallback
  return FOOD_IMAGE_COLLECTION.grilledChickenPlate;
}
