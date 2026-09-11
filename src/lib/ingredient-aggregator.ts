import { ShoppingItem } from './types';

export interface CanonicalDefinition {
  id: string;
  name: string;
  category: ShoppingItem['category'];
  patterns: RegExp[];
  unit: 'g' | 'ml' | 'stk' | 'dose' | 'tl';
  packSize?: number;
  packUnitName?: string;
  isPantryStaple?: boolean;
}

export const CANONICAL_REGISTRY: CanonicalDefinition[] = [
  // --- KÜHLREGAL ---
  {
    id: 'skyr_magerquark',
    name: 'Skyr natur (oder Magerquark)',
    category: 'Kühlregal',
    patterns: [/skyr/i, /bioskyr/i, /naturskyr/i, /magerquark/i, /speisequark\s*mager/i, /quark\s*mager/i, /\bmagerer\s*quark\b/i],
    unit: 'g',
    packSize: 500,
    packUnitName: 'Becher à 500g',
  },
  {
    id: 'kraeuterquark',
    name: 'Kräuterquark light',
    category: 'Kühlregal',
    patterns: [/kräuterquark/i, /kraeuterquark/i],
    unit: 'g',
    packSize: 200,
    packUnitName: 'Becher à 200g',
  },
  {
    id: 'koerniger_frischkaese',
    name: 'Körniger Frischkäse light (Hüttenkäse)',
    category: 'Kühlregal',
    patterns: [/körnig.*frischkäse/i, /koernig.*frischkaese/i, /hüttenkäse/i, /huettenkaese/i],
    unit: 'g',
    packSize: 200,
    packUnitName: 'Becher à 200g',
  },
  {
    id: 'eier',
    name: 'Frische Eier (Bio / Freiland)',
    category: 'Kühlregal',
    patterns: [/\b(eier?|ei)\b/i, /bio-ei/i, /freilandei/i, /gekochte.*ei/i],
    unit: 'stk',
    packSize: 10,
    packUnitName: '10er Packung',
  },
  {
    id: 'cremefine',
    name: 'Rama Cremefine 7% (zum Kochen)',
    category: 'Kühlregal',
    patterns: [/cremefine/i, /rama\s*cremefine/i],
    unit: 'ml',
    packSize: 250,
    packUnitName: 'Flasche à 250ml',
  },
  {
    id: 'feta_light',
    name: 'Feta light (ca. 9% Fett)',
    category: 'Kühlregal',
    patterns: [/feta/i, /hirtenkäse\s*light/i, /hirtenkaese/i],
    unit: 'g',
    packSize: 150,
    packUnitName: 'Packung à 150–200g',
  },
  {
    id: 'mozzarella_light',
    name: 'Mozzarella light (ca. 8,5% Fett)',
    category: 'Kühlregal',
    patterns: [/mozzarella/i, /gratinkäse\s*light/i, /streukäse\s*light/i],
    unit: 'g',
    packSize: 125,
    packUnitName: 'Kugel/Packung à 125g',
  },
  {
    id: 'milch',
    name: 'Fettarme Milch 1,5% (oder Mandelmilch)',
    category: 'Kühlregal',
    patterns: [/\bmilch\b/i, /mandelmilch/i, /mandeldrink/i, /hafermilch/i, /haferdrink/i],
    unit: 'ml',
    packSize: 1000,
    packUnitName: '1-Liter-Packung',
  },
  {
    id: 'hummus',
    name: 'Kichererbsen-Hummus natur',
    category: 'Kühlregal',
    patterns: [/hummus/i],
    unit: 'g',
    packSize: 200,
    packUnitName: 'Becher à 200g',
  },
  {
    id: 'gefluegel_aufschnitt',
    name: 'Putenbrust / Hähnchenbrust (Aufschnitt mager)',
    category: 'Kühlregal',
    patterns: [/putenbrust.*aufschnitt/i, /hähnchenbrust.*aufschnitt/i, /putenbrustaufschnitt/i, /hähnchenaufschnitt/i, /geflügel.*aufschnitt/i],
    unit: 'g',
    packSize: 100,
    packUnitName: 'Packung à 100–150g',
  },
  {
    id: 'lachsschinken',
    name: 'Lachsschinken / Kochschinken (unter 3% Fett)',
    category: 'Kühlregal',
    patterns: [/lachsschinken/i, /kochschinken/i],
    unit: 'g',
    packSize: 100,
    packUnitName: 'Packung à 100g',
  },

  // --- GEFLÜGEL & FISCH ---
  {
    id: 'haehnchen_filet',
    name: 'Hähnchenbrustfilet (Frischetheke)',
    category: 'Geflügel & Fisch',
    patterns: [/hähnchenbrust/i, /haehnchenbrust/i, /hähnchenfilet/i, /hähnchen/i, /haehnchen/i, /huhn/i],
    unit: 'g',
    packSize: 400,
    packUnitName: 'Packung à 400–600g',
  },
  {
    id: 'puten_filet',
    name: 'Putenbrustfilet / Putenstreifen',
    category: 'Geflügel & Fisch',
    patterns: [/putenbrust/i, /putenfilet/i, /putenstreifen/i, /putenfleisch/i, /\bpute\b/i],
    unit: 'g',
    packSize: 400,
    packUnitName: 'Packung à 400–500g',
  },
  {
    id: 'rinder_tatar',
    name: 'Mageres Rinder-Tatar / Hack (<5% Fett)',
    category: 'Geflügel & Fisch',
    patterns: [/tatar/i, /rinder-tatar/i, /rinderhack/i, /hackfleisch.*5%/i],
    unit: 'g',
    packSize: 400,
    packUnitName: 'Packung à 400g',
  },
  {
    id: 'lachs_filet',
    name: 'Lachsfilet (frisch oder TK)',
    category: 'Geflügel & Fisch',
    patterns: [/lachsfilet/i, /\blachs\b/i],
    unit: 'g',
    packSize: 250,
    packUnitName: '2er-Pack (250g)',
  },
  {
    id: 'seelachs_filet',
    name: 'Seelachsfilet (frisch oder TK)',
    category: 'Geflügel & Fisch',
    patterns: [/seelachs/i, /kabeljau/i, /weißfisch/i],
    unit: 'g',
    packSize: 450,
    packUnitName: 'TK-Packung à 450g',
  },
  {
    id: 'thunfisch_dose',
    name: 'Thunfisch im eigenen Saft (Dose)',
    category: 'Geflügel & Fisch',
    patterns: [/thunfisch/i],
    unit: 'dose',
    packSize: 1,
    packUnitName: 'Dose à 140g',
  },
  {
    id: 'garnelen',
    name: 'Garnelen (küchenfertig / TK)',
    category: 'Geflügel & Fisch',
    patterns: [/garnele/i, /shrimps/i, /prawns/i],
    unit: 'g',
    packSize: 200,
    packUnitName: 'Packung à 200g',
  },

  // --- FRISCHETHEKE & OBST ---
  {
    id: 'zucchini',
    name: 'Zucchini (mittelgroß)',
    category: 'Frischetheke & Obst',
    patterns: [/zucchini/i],
    unit: 'stk',
  },
  {
    id: 'paprika',
    name: 'Paprika (bunt / Ampel)',
    category: 'Frischetheke & Obst',
    patterns: [/paprika/i],
    unit: 'stk',
    packSize: 3,
    packUnitName: '3er-Ampel',
  },
  {
    id: 'brokkoli_frisch',
    name: 'Brokkoli (frisch)',
    category: 'Frischetheke & Obst',
    patterns: [/brokkoli/i],
    unit: 'g',
    packSize: 500,
    packUnitName: 'Kopf à 500g',
  },
  {
    id: 'blumenkohl',
    name: 'Blumenkohl (frisch oder TK)',
    category: 'Frischetheke & Obst',
    patterns: [/blumenkohl/i],
    unit: 'g',
    packSize: 500,
    packUnitName: 'Kopf / Beutel',
  },
  {
    id: 'karotten',
    name: 'Möhren / Karotten',
    category: 'Frischetheke & Obst',
    patterns: [/möhre/i, /karotte/i],
    unit: 'stk',
    packSize: 8,
    packUnitName: '1kg Bund/Beutel',
  },
  {
    id: 'salatgurke',
    name: 'Salatgurke',
    category: 'Frischetheke & Obst',
    patterns: [/gurke/i, /salatgurke/i],
    unit: 'stk',
  },
  {
    id: 'cocktailtomaten',
    name: 'Cocktailtomaten / Kirschtomaten',
    category: 'Frischetheke & Obst',
    patterns: [/cocktailtomate/i, /kirschtomate/i, /rispentomate/i, /\btomate\b/i, /\btomaten\b/i],
    unit: 'stk',
    packSize: 15,
    packUnitName: 'Schale à 250–500g',
  },
  {
    id: 'champignons',
    name: 'Braune Champignons',
    category: 'Frischetheke & Obst',
    patterns: [/champignon/i, /pilz/i],
    unit: 'g',
    packSize: 400,
    packUnitName: 'Schale à 400g',
  },
  {
    id: 'kartoffeln',
    name: 'Kartoffeln (festkochend)',
    category: 'Frischetheke & Obst',
    patterns: [/kartoffel/i, /süßkartoffel/i],
    unit: 'g',
    packSize: 1500,
    packUnitName: '1.5kg / 2kg Beutel',
  },
  {
    id: 'zwiebeln_knoblauch',
    name: 'Zwiebeln & Knoblauch (Grundvorrat)',
    category: 'Frischetheke & Obst',
    patterns: [/zwiebel/i, /knoblauch/i, /lauch/i, /frühlingszwiebel/i],
    unit: 'stk',
    isPantryStaple: true,
  },
  {
    id: 'blattsalat',
    name: 'Gemischter Blattsalat / Rucola',
    category: 'Frischetheke & Obst',
    patterns: [/blattsalat/i, /salat\b/i, /rucola/i, /feldsalat/i, /kopfsalat/i],
    unit: 'g',
    packSize: 150,
    packUnitName: 'Beutel à 150g',
  },
  {
    id: 'aepfel',
    name: 'Äpfel (frisch / knackig)',
    category: 'Frischetheke & Obst',
    patterns: [/apfel/i, /äpfel/i],
    unit: 'stk',
    packSize: 6,
    packUnitName: '1kg Beutel / lose',
  },
  {
    id: 'bananen',
    name: 'Bananen',
    category: 'Frischetheke & Obst',
    patterns: [/banane/i],
    unit: 'stk',
  },
  {
    id: 'birnen',
    name: 'Birnen',
    category: 'Frischetheke & Obst',
    patterns: [/birne/i],
    unit: 'stk',
  },
  {
    id: 'pfirsiche',
    name: 'Pfirsiche / Nektarinen',
    category: 'Frischetheke & Obst',
    patterns: [/pfirsich/i, /nektarine/i],
    unit: 'stk',
  },
  {
    id: 'weintrauben',
    name: 'Weintrauben (kernlos)',
    category: 'Frischetheke & Obst',
    patterns: [/traube/i, /weintraube/i],
    unit: 'g',
    packSize: 500,
    packUnitName: 'Schale à 500g',
  },
  {
    id: 'radieschen_kohlrabi',
    name: 'Radieschen & Kohlrabi',
    category: 'Frischetheke & Obst',
    patterns: [/radieschen/i, /kohlrabi/i],
    unit: 'stk',
  },
  {
    id: 'orange',
    name: 'Orangen / Mandarinen',
    category: 'Frischetheke & Obst',
    patterns: [/orange/i, /mandarine/i, /clementine/i],
    unit: 'stk',
    packSize: 4,
    packUnitName: 'Netz / 4 Stück',
  },
  {
    id: 'zitrone',
    name: 'Zitrone / Limette (Bio)',
    category: 'Frischetheke & Obst',
    patterns: [/zitrone/i, /limette/i, /zitronensaft/i],
    unit: 'stk',
    packSize: 2,
    packUnitName: '2er-Pack / lose',
  },

  // --- TIEFKÜHL ---
  {
    id: 'tk_beeren',
    name: 'TK-Beerenmischung / Himbeeren (ungesüßt)',
    category: 'Tiefkühl',
    patterns: [/beere/i, /himbeere/i, /heidelbeere/i, /blaubeere/i, /waldbeere/i, /erdbeere/i],
    unit: 'g',
    packSize: 500,
    packUnitName: 'TK-Beutel à 500g',
  },
  {
    id: 'tk_spinat',
    name: 'TK-Blattspinat (ungewürzt, ohne Sahne)',
    category: 'Tiefkühl',
    patterns: [/tk-spinat/i, /tk-blattspinat/i, /blattspinat/i, /\bspinat\b/i],
    unit: 'g',
    packSize: 450,
    packUnitName: 'Packung à 450g',
  },
  {
    id: 'tk_erbsen',
    name: 'TK-Erbsen (sehr zart)',
    category: 'Tiefkühl',
    patterns: [/tk-erbsen/i, /\berbsen\b/i, /zuckerschoten/i],
    unit: 'g',
    packSize: 450,
    packUnitName: 'Beutel à 450g',
  },
  {
    id: 'tk_asia_gemuese',
    name: 'TK-Asia-Gemüsemischung',
    category: 'Tiefkühl',
    patterns: [/asia-gemüse/i, /wok-gemüse/i],
    unit: 'g',
    packSize: 500,
    packUnitName: 'Beutel à 500g',
  },

  // --- VORRAT & GEWÜRZE ---
  {
    id: 'haferflocken',
    name: 'Zarte Haferflocken',
    category: 'Vorrat & Gewürze',
    patterns: [/haferflocken/i, /oats/i],
    unit: 'g',
    packSize: 500,
    packUnitName: 'Packung à 500g',
  },
  {
    id: 'vollkornbrot',
    name: 'Vollkornbrot / Vollkornbrötchen / Vollkorntoast',
    category: 'Vorrat & Gewürze',
    patterns: [/vollkornbrot/i, /vollkornbrötchen/i, /vollkorntoast/i, /toast/i, /vollkorn-wrap/i, /wrap/i],
    unit: 'stk',
  },
  {
    id: 'vollkornreis',
    name: 'Vollkornreis (Naturreis / Basmati)',
    category: 'Vorrat & Gewürze',
    patterns: [/vollkornreis/i, /\breis\b/i, /basmatireis/i],
    unit: 'g',
    packSize: 500,
    packUnitName: '500g Packung',
  },
  {
    id: 'vollkornpasta',
    name: 'Protein-Pasta / Vollkorn-Penne',
    category: 'Vorrat & Gewürze',
    patterns: [/protein-pasta/i, /vollkorn-penne/i, /vollkorn-wok-nudeln/i, /vollkornnudeln/i, /nudeln/i, /pasta/i],
    unit: 'g',
    packSize: 500,
    packUnitName: '500g Packung',
  },
  {
    id: 'quinoa',
    name: 'Quinoa (hell oder bunt)',
    category: 'Vorrat & Gewürze',
    patterns: [/quinoa/i, /couscous/i, /bulgur/i],
    unit: 'g',
    packSize: 500,
    packUnitName: '500g Packung',
  },
  {
    id: 'kichererbsen_linsen_dose',
    name: 'Kichererbsen & Rote Linsen (Dose/Vorrat)',
    category: 'Vorrat & Gewürze',
    patterns: [/kichererbsen/i, /rote linsen/i, /linsen/i, /kidneybohnen/i, /bohnen/i],
    unit: 'g',
    packSize: 400,
    packUnitName: 'Dose / 500g Beutel',
  },
  {
    id: 'mandelmus_erdnussmus',
    name: 'Mandelmus / Erdnussmus (100% Nuss)',
    category: 'Vorrat & Gewürze',
    patterns: [/mandelmus/i, /erdnussmus/i, /nussmus/i],
    unit: 'tl',
    isPantryStaple: true,
  },
  {
    id: 'leinsamen',
    name: 'Geschrotete Leinsamen / Chiasamen',
    category: 'Vorrat & Gewürze',
    patterns: [/leinsamen/i, /chiasamen/i, /flohsamenschalen/i],
    unit: 'tl',
    isPantryStaple: true,
  },
  {
    id: 'nuesse_mandeln',
    name: 'Mandeln, Walnüsse & Cashews',
    category: 'Vorrat & Gewürze',
    patterns: [/mandel/i, /walnuss/i, /cashew/i, /nüsse/i, /nuß/i, /kerne/i, /haselnuss/i, /sonnenblumenkerne/i, /kürbiskerne/i],
    unit: 'g',
    packSize: 200,
    packUnitName: 'Beutel à 200g',
  },
  {
    id: 'passierte_tomaten',
    name: 'Passierte / Gehackte Tomaten',
    category: 'Vorrat & Gewürze',
    patterns: [/passierte tomaten/i, /gehackte tomaten/i, /stückige tomaten/i, /tomatenmark/i],
    unit: 'ml',
    packSize: 400,
    packUnitName: 'Dose/Tetrapack à 400ml',
  },
  {
    id: 'grund_gewuerze',
    name: 'Gewürze, Kräuter & Öl (Haushaltsvorrat)',
    category: 'Vorrat & Gewürze',
    patterns: [/gewürz/i, /gewuerz/i, /curry/i, /fajita/i, /muskat/i, /dill/i, /petersilie/i, /schnittlauch/i, /basilikum/i, /rosmarin/i, /thymian/i, /olivenöl/i, /öl\b/i, /senf/i, /brühe/i, /zimt/i, /pfeffer/i, /salz/i, /sojasauce/i, /sesamöl/i, /honig/i, /kräuter/i, /kraeuter/i, /oregano/i, /paprikapulver/i, /kreuzkümmel/i, /kurkuma/i, /chili/i, /kümmel/i],
    unit: 'tl',
    isPantryStaple: true,
  },
];

export function parseIngredientAmount(str: string): { amount: number; unit: string; cleanName: string } {
  const s = str
    .replace('¼', '0.25')
    .replace('½', '0.5')
    .replace('¾', '0.75')
    .trim();

  // Pattern: e.g. "1 Dose Thunfisch im eigenen Saft (140g)"
  const mDose = s.match(/^(\d+(?:\.\d+)?)\s*(?:dose|dosen)\b/i);
  if (mDose) {
    const clean = s.replace(/^\d+(?:\.\d+)?\s*(?:dose|dosen)\b/i, '').trim();
    return { amount: parseFloat(mDose[1]), unit: 'Dose', cleanName: clean };
  }

  // Pattern: e.g. "170g Putenbrust" or "200 g Skyr"
  const mG = s.match(/(\d+(?:\.\d+)?)\s*g\b/i);
  if (mG) {
    const clean = s.replace(/\b\d+(?:\.\d+)?\s*g\b/i, '').trim();
    return { amount: parseFloat(mG[1]), unit: 'g', cleanName: clean };
  }

  // Pattern: e.g. "250ml Rama Cremefine"
  const mMl = s.match(/(\d+(?:\.\d+)?)\s*ml\b/i);
  if (mMl) {
    const clean = s.replace(/\b\d+(?:\.\d+)?\s*ml\b/i, '').trim();
    return { amount: parseFloat(mMl[1]), unit: 'ml', cleanName: clean };
  }

  // Pattern: e.g. "2 TL Mandelmus" or "1 EL Olivenöl"
  const mTl = s.match(/(\d+(?:\.\d+)?)\s*(?:tl|el)\b/i);
  if (mTl) {
    const multiplier = /el\b/i.test(s) ? 3 : 1;
    const clean = s.replace(/\b\d+(?:\.\d+)?\s*(?:tl|el)\b/i, '').trim();
    return { amount: parseFloat(mTl[1]) * multiplier, unit: 'TL', cleanName: clean };
  }

  // Pattern: e.g. "2 Scheiben Vollkornbrot" or "1 Ei (Größe M)" or "8 Cocktailtomaten"
  const mStk = s.match(/^(\d+(?:\.\d+)?)\s*(?:stück|stk|scheiben|becher|köpfe|portionen|portion|zehen|kugeln)?\b/i);
  if (mStk && mStk[1]) {
    const clean = s.replace(/^\d+(?:\.\d+)?\s*(?:stück|stk|scheiben|becher|köpfe|portionen|portion|zehen|kugeln)?\b/i, '').trim();
    return { amount: parseFloat(mStk[1]), unit: 'Stück', cleanName: clean };
  }

  return { amount: 1, unit: 'Stück', cleanName: s };
}

export interface RawIngredientInput {
  name: string;
  recipeSource?: string;
  dayName?: string;
}

export function groupAndAggregateIngredients(
  rawList: RawIngredientInput[]
): ShoppingItem[] {
  const groups = new Map<
    string,
    {
      def: CanonicalDefinition;
      totalAmount: number;
      sources: Set<string>;
      days: Set<string>;
      rawExamples: string[];
    }
  >();

  const fallbackGroups = new Map<
    string,
    {
      cleanName: string;
      totalAmount: number;
      unit: string;
      sources: Set<string>;
      days: Set<string>;
    }
  >();

  rawList.forEach((raw) => {
    const text = raw.name.trim();
    if (!text) return;

    let matchedDef: CanonicalDefinition | null = null;
    for (const def of CANONICAL_REGISTRY) {
      if (def.patterns.some((p) => p.test(text))) {
        matchedDef = def;
        break;
      }
    }

    const parsed = parseIngredientAmount(text);

    if (matchedDef) {
      if (!groups.has(matchedDef.id)) {
        groups.set(matchedDef.id, {
          def: matchedDef,
          totalAmount: 0,
          sources: new Set<string>(),
          days: new Set<string>(),
          rawExamples: [],
        });
      }

      const g = groups.get(matchedDef.id)!;
      g.totalAmount += parsed.amount;
      if (raw.recipeSource) g.sources.add(raw.recipeSource);
      if (raw.dayName) g.days.add(raw.dayName);
      if (g.rawExamples.length < 2) g.rawExamples.push(text);
    } else {
      // Robust fallback grouping: normalizes name so duplicates merge automatically
      const clean = parsed.cleanName.replace(/[()]/g, '').trim();
      const normKey = clean.toLowerCase().replace(/[^a-zäöüß0-9]/g, '');
      const key = normKey || text.toLowerCase();

      if (!fallbackGroups.has(key)) {
        fallbackGroups.set(key, {
          cleanName: clean || text,
          totalAmount: 0,
          unit: parsed.unit,
          sources: new Set<string>(),
          days: new Set<string>(),
        });
      }

      const fg = fallbackGroups.get(key)!;
      fg.totalAmount += parsed.amount;
      if (raw.recipeSource) fg.sources.add(raw.recipeSource);
      if (raw.dayName) fg.days.add(raw.dayName);
    }
  });

  const result: ShoppingItem[] = [];

  // 1. Process Canonical Groups
  groups.forEach((g) => {
    const { def, totalAmount } = g;

    let formattedAmount = '';
    if (def.unit === 'g') {
      formattedAmount = `${Math.round(totalAmount)}g`;
    } else if (def.unit === 'ml') {
      formattedAmount = `${Math.round(totalAmount)}ml`;
    } else if (def.unit === 'stk') {
      formattedAmount = `${Math.ceil(totalAmount)} Stück`;
    } else if (def.unit === 'tl') {
      formattedAmount = `${Math.round(totalAmount)} TL`;
    } else if (def.unit === 'dose') {
      formattedAmount = `${Math.ceil(totalAmount)} Dose${Math.ceil(totalAmount) > 1 ? 'n' : ''}`;
    }

    let packAdvice = '';
    if (def.packSize && def.packUnitName) {
      const numPacks = Math.ceil(totalAmount / def.packSize);
      if (numPacks > 0) {
        packAdvice = `ca. ${numPacks}x ${def.packUnitName}`;
      }
    }

    result.push({
      id: `shop_canonical_${def.id}`,
      name: def.name,
      amount: formattedAmount,
      packAdvice: packAdvice || undefined,
      category: def.category,
      checked: false,
      isPantry: Boolean(def.isPantryStaple),
      recipeSource: Array.from(g.sources).slice(0, 3).join(', ') + (g.sources.size > 3 ? ` (+${g.sources.size - 3} weitere)` : ''),
      days: Array.from(g.days),
      recipes: Array.from(g.sources),
    });
  });

  // 2. Process Fallback Groups (deduplicated!)
  fallbackGroups.forEach((fg, key) => {
    let formattedAmount = '';
    if (fg.unit === 'g') {
      formattedAmount = `${Math.round(fg.totalAmount)}g`;
    } else if (fg.unit === 'ml') {
      formattedAmount = `${Math.round(fg.totalAmount)}ml`;
    } else if (fg.unit === 'TL') {
      formattedAmount = `${Math.round(fg.totalAmount)} TL`;
    } else {
      formattedAmount = `${Math.ceil(fg.totalAmount)} Stück`;
    }

    // Capitalize first letter of fallback name
    const displayName = fg.cleanName.charAt(0).toUpperCase() + fg.cleanName.slice(1);

    result.push({
      id: `shop_fallback_${key}`,
      name: displayName,
      amount: formattedAmount,
      category: 'Vorrat & Gewürze',
      checked: false,
      isPantry: false,
      recipeSource: Array.from(fg.sources).slice(0, 3).join(', ') + (fg.sources.size > 3 ? ` (+${fg.sources.size - 3} weitere)` : ''),
      days: Array.from(fg.days),
      recipes: Array.from(fg.sources),
    });
  });

  // Sort logically: Supermarket active purchases first, then pantry
  return result.sort((a, b) => {
    if (a.isPantry === b.isPantry) return a.name.localeCompare(b.name, 'de');
    return a.isPantry ? 1 : -1;
  });
}
