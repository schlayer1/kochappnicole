import { NutritionProfile } from './types';

export const NICOLE_NUTRITION_PROFILE: NutritionProfile = {
  name: 'Nicole Keller',
  lastUpdated: '08.09.2026',
  sourceDocName: 'Ernährungstagebuchanalyse-Nicole.pdf',
  targetGoals: {
    calories: 1508,
    carbs: 165,
    fat: 44,       // Drastisch gesenkt von ehemals 69g
    protein: 103,  // Stark erhöht von ehemals 65g
    fiber: 25,     // Erhöht von ehemals 19g
  },
  principles: [
    {
      rule: 'Der gesunde Teller',
      description: '½ des Tellers Gemüse (TK, Ofen, Pfanne, roh), ¼ magere Proteine, ¼ komplexe Kohlenhydrate, sparsam gesunde Fette.',
    },
    {
      rule: 'Frühstück 2.0',
      description: 'Entweder süße Skyr-Mandelmus-Bowl mit Obst & Haferflocken ODER herzhaftes Vollkornbrot mit körnigem Frischkäse/Quark, Putenbrust, Ei & reichlich Rohkost.',
    },
    {
      rule: '1–2 Proteinquellen pro Mahlzeit',
      description: 'Mindestens 103g Eiweiß pro Tag sichern den Muskelerhalt und verhindern Heißhunger.',
    },
    {
      rule: 'Fett-Disziplin (max. 44g/Tag)',
      description: 'Fette nicht streichen, aber punktgenau dosieren: Pesto, Leinsamen, Mandelmus, Olivenöl (nur teelöffelweise).',
    },
    {
      rule: 'Obst & Snack-Strategie',
      description: '1–2 Hände frisches Obst zum Frühstück oder nachmittags. Auf der Arbeit gezielt Obst/Nüsse statt Kuchen wählen.',
    },
  ],
  allowedProteins: [
    'Skyr & Magerquark',
    'Kräuterquark light',
    'Körniger Frischkäse & Hummus',
    'Mozzarella light & Feta light',
    'Hühnerei (Rührei, Spiegelei, gekocht)',
    'Hähnchenbrust & Putenbrust',
    'Lachs, Thunfisch (im eigenen Saft), Seelachs, Garnelen',
    'Rinderhackfleisch (mager / Tatar)',
    'Hülsenfrüchte (Kichererbsen, Linsen, rote Bohnen)',
  ],
  avoidProteins: [
    'Schweinefleisch (Kotelett, Schweinenacken, Bratwurst)',
    'Huhn im Tempurateig / Panade',
    'Bärchenstreich & Leberwurst',
    'Fetter Camembert & Gouda 45%+',
    'Gezuckerter Frucht-Sojajoghurt',
  ],
  allowedFats: [
    'Olivenöl (1 TL dosiert)',
    'Leinsamen geschrotet (1 TL)',
    'Mandelmus (1 TL)',
    'Basilikum-Pesto (1 TL)',
    'Avocado (in Maßen)',
  ],
  avoidFats: [
    'Schmand & Sour Cream',
    'Klassische Schlagsahne (30%+)',
    'Großzügige Butter',
  ],
  allowedCarbs: [
    'Vollkorn-Brötchen & Vollkorn-Toast',
    'Haferflocken & Haferkleie',
    'Kartoffeln & Süßkartoffeln',
    'Quinoa & Vollkornreis',
    'Protein-Pasta / Vollkorn-Nudeln',
    'Gemüse (Tomate, Gurke, Möhre, Blumenkohl, Brokkoli, Zucchini, Paprika)',
    'Obst (Apfel, Beeren, Banane, Kiwi, Pfirsich, Kaki, Melone)',
  ],
  avoidCarbs: [
    'Weizenbrötchen & Laugenbrioche',
    'Flatbread & weißes Baguette',
    'Windbeutel, Nussecken, Softeis, Kuchen',
    'Kinderriegel & Schokoriegel',
    'Zuckerhaltiger Orangensaft & süßer Cappuccino',
  ],
  substitutions: [
    {
      original: 'Sahne / Schmand / Sour Cream',
      alternative: 'Cremefine 7% oder Magerquark mit Mineralwasser glattgerührt',
      reason: 'Spart über 70% Fett pro Mahlzeit.',
    },
    {
      original: 'Cappuccino / Latte mit Sirup/Vollmilch',
      alternative: 'Kaffee mit fettarmer Milch (1,5%) oder ungesüßtem Mandeldrink',
      reason: 'Vermeidet flüssigen Zucker und überflüssige Kalorien.',
    },
    {
      original: 'Fette Wurst (Leberwurst, Salami)',
      alternative: 'Putenbrust, Hähnchenbrust, Kochschinken oder Lachsschinken',
      reason: 'Hoher Proteinanteil bei minimalem Fettgehalt.',
    },
    {
      original: 'Weißmehl-Nudeln / Weizenbrot',
      alternative: 'Protein-Pasta oder Vollkornbrot',
      reason: 'Hält den Blutzuckerspiegel stabil und liefert wertvolle Ballaststoffe.',
    },
  ],
};
