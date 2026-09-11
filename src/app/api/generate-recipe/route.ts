import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      mealType = 'lunch',
      userApiKey,
      groqApiKey,
      geminiApiKey,
      provider = 'groq',
    } = body;

    // Check keys based on chosen provider
    const effectiveGroqKey = groqApiKey || (provider === 'groq' ? userApiKey : '') || process.env.GROQ_API_KEY;
    const effectiveGeminiKey = geminiApiKey || (provider === 'gemini' ? userApiKey : '') || process.env.GEMINI_API_KEY;

    const systemPrompt = `Du bist der professionelle Chefkoch und Ernährungsberater der App "fit und healthy".
Deine Aufgabe ist es, exklusive Rezepte für Nicole Keller zu kreieren, die in Stil, Nährwerten, Zutaten-Struktur und Zubereitungsschritten EXAKT dem festen Kochbuch der App (160 kuratierte Rezepte) entsprechen.

STRIKTE ERNÄHRUNGS-LEITPLANKEN (aus der Ernährungstagebuch-Analyse):
1. FETTOBERGRENZE (Höchste Priorität - Tagesbudget max. 44g!):
   - Frühstück: max. 7–9g Fett
   - Mittag- & Abendessen: max. 9–12g Fett (Streng maximal 1 TL Olivenöl zum Anbraten!)
   - Snack: max. 3–5g Fett
2. EIWEISSZIEL: Mind. 103g pro Tag!
   - Jedes Hauptgericht MUSS 38–48g mageres Protein liefern.
   - Frühstück: 30–35g Protein.
   - Snacks: 15–20g Protein.
3. PRINZIP "DER GESUNDE TELLER" (bei Mittag & Abendessen):
   - 50% Gemüse (Zucchini, Paprika, Brokkoli, Champignons, Spinat, Tomaten, Möhren, Blumenkohl)
   - 25% mageres Eiweiß (Hähnchenbrust, Putenbrust, Lachs, Seelachs, mageres Rinder-Tatar <5%, Eier, Garnelen, Thunfisch im eigenen Saft)
   - 25% vollwertige Kohlenhydrate (Kartoffeln, Naturreis, Protein-Pasta, Vollkornpenne, Quinoa)
4. STRIKTE ZUTATEN-REGELN:
   - 100% Sahne-/Schmand-Verbot -> IMMER "Rama Cremefine 7%" (50–80ml) oder Magerquark/Kräuterquark light!
   - KEIN Schweinefleisch, kein Frittiertes, kein Weißmehl, kein zugesetzter Haushaltszucker.
   - 100% REWE & Discounter-tauglich (Aldi/Lidl), budgetfreundliche Standardpackungen, keine teuren Exoten.
   - Mengenangaben IMMER mit präzisen Einheiten: z. B. "170g Hähnchenbrustfilet", "60ml Rama Cremefine 7%", "1 TL Olivenöl", "8 Cocktailtomaten".

ZUTATEN-KATEGORIEN (Verwende EXAKT diese 5 Schlüssel im ingredients-Objekt, damit der Einkaufslisten-Aggregator sie bündeln kann):
- "Kühlregal" (Skyr, Magerquark, Eier, Cremefine 7%, Feta light, Mozzarella light, Geflügelaufschnitt, Körniger Frischkäse light)
- "Frischetheke & Obst" (Zucchini, Paprika, Brokkoli, Champignons, Möhren, Gurke, Tomaten, Kartoffeln, Äpfel, Zwiebeln & Knoblauch)
- "Geflügel & Fisch" (Hähnchenbrustfilet, Putenbrustfilet, Lachsfilet, Seelachsfilet, Tatar <5%, Garnelen, Thunfisch)
- "Tiefkühl" (TK-Beeren, TK-Blattspinat, TK-Erbsen, TK-Asia-Gemüse)
- "Vorrat & Gewürze" (Haferflocken, Vollkornreis, Vollkornpasta, Vollkornbrot, Quinoa, Kichererbsen, Mandelmus, Leinsamen, Nüsse, Gewürze & Kräuter, 1 TL Olivenöl)

DIE 4 KOCHBUCH-SCHRITTE (instructions):
1. Vorbereitung & Schnitt: Gemüse waschen und mundgerecht schneiden, Fleisch/Fisch tupfen und würfeln.
2. Anbraten & Rösten: Pfanne mit maximal 1 TL Olivenöl erhitzen, Eiweißquelle rundum scharf anbraten.
3. Gemüse garen & Sauce: Gemüse zugeben, kurz andünsten, mit Cremefine 7% (oder Brühe) ablöschen und würzen.
4. Anrichten & Servieren: Auf einem großen Teller anrichten (50% Gemüse, 25% Protein, 25% Carbs) und warm genießen.

ANTWORTE AUSSCHLIESSLICH IM FOLGENDEN VALIDE JSON-FORMAT:
{
  "title": "Klarer, appetitlicher Name (z. B. Hähnchenbrust auf Zucchini-Paprika-Gemüse mit Cremefine 7%)",
  "subtitle": "z. B. 20-Minuten-Feierabendküche",
  "mealType": "${mealType}",
  "category": "${mealType === 'breakfast' ? 'Frühstück 2.0' : mealType === 'snack' ? 'Snacks & Dessert' : 'Der gesunde Teller'}",
  "prepMins": 20,
  "kcal": 440,
  "protein": 44,
  "fat": 9,
  "carbs": 42,
  "fiber": 7,
  "plateRatio": {
    "veggiesPercent": ${mealType === 'breakfast' ? 40 : mealType === 'snack' ? 30 : 50},
    "proteinPercent": ${mealType === 'breakfast' ? 35 : mealType === 'snack' ? 30 : 25},
    "carbsPercent": ${mealType === 'breakfast' ? 25 : mealType === 'snack' ? 40 : 25}
  },
  "tags": ["High-Protein", "Unter 10g Fett", "Budget-Friendly", "REWE/Discounter"],
  "whyNicole": "Erfüllt exakt den gesunden Teller: 50% Gemüseanteil, 44g mageres Eiweiß und dank Cremefine 7% & nur 1 TL Öl streng unter 10g Fett.",
  "ingredients": {
    "Frischetheke & Obst": ["1 Zucchini gewürfelt", "1 Paprika rot in Streifen"],
    "Geflügel & Fisch": ["170g Hähnchenbrustfilet"],
    "Kühlregal": ["60ml Rama Cremefine 7%"],
    "Vorrat & Gewürze": ["45g Vollkornreis (ungekocht)", "1 TL Olivenöl", "Kräuter der Provence, Salz & Pfeffer"]
  },
  "instructions": [
    "Gemüse waschen und in mundgerechte Stücke schneiden. Hähnchenbrust trocken tupfen und in Streifen schneiden.",
    "1 TL Olivenöl in einer beschichteten Pfanne erhitzen. Hähnchenstreifen 4–5 Min. anbraten, dann herausnehmen.",
    "Gemüse in die gleiche Pfanne geben, 5 Min. bissfest dünsten. Mit Cremefine 7% ablöschen und mit Salz, Pfeffer und Kräutern abschmecken.",
    "Hähnchen wieder zugeben, kurz durchschwenken und mit gekochtem Vollkornreis auf einem Teller anrichten."
  ]
}
WICHTIG: Antworte NUR mit dem reinen JSON-Objekt, ohne Markdown-Fences (\`\`\`json) und ohne Begleittext.`;

    const userMessage = `Benutzer-Wunsch für diese Mahlzeit: ${prompt || 'Ein ausgewogenes, budgetfreundliches Gericht nach Nicoles Vorgaben'}`;

    // 1. GROQ CLOUD API (Dynamische Modellerkennung & Fallback - Ultraschnell & 100% Free)
    if (provider === 'groq' && effectiveGroqKey) {
      let groqModels = [
        'openai/gpt-oss-20b',
        'openai/gpt-oss-120b',
        'qwen/qwen3.6-27b',
        'meta-llama/llama-4-scout-17b-16e-instruct',
        'meta-llama/llama-4-maverick-17b-128e-instruct',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
      ];

      // Frage in Echtzeit die genau für diesen Key aktiven Modelle bei Groq ab
      try {
        const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${effectiveGroqKey}` },
        });
        if (modelsRes.ok) {
          const listData = await modelsRes.json();
          if (Array.isArray(listData.data) && listData.data.length > 0) {
            const activeIds = listData.data
              .map((m: any) => m.id)
              .filter(
                (id: string) =>
                  !id.toLowerCase().includes('guard') &&
                  !id.toLowerCase().includes('whisper') &&
                  !id.toLowerCase().includes('audio')
              );
            if (activeIds.length > 0) {
              groqModels = Array.from(new Set([...activeIds, ...groqModels]));
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch Groq models list:', err);
      }

      let lastErr = '';

      for (const model of groqModels) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${effectiveGroqKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
              ],
              temperature: 0.2,
              response_format: { type: 'json_object' },
            }),
          });

          if (!groqRes.ok) {
            const errText = await groqRes.text();
            lastErr = `${model}: ${errText}`;
            continue; // Try next available model
          }

          const groqData = await groqRes.json();
          let rawText = groqData.choices?.[0]?.message?.content || '';
          // Strip any accidental markdown formatting
          rawText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
          const recipeData = JSON.parse(rawText);

          const fullRecipe: Recipe = {
            ...recipeData,
            id: 'ai-recipe-groq-' + Date.now(),
            isAiGenerated: true,
            plateRatio: recipeData.plateRatio || { veggiesPercent: 50, proteinPercent: 25, carbsPercent: 25 },
          };

          return NextResponse.json({ recipe: fullRecipe, source: `groq-${model}` });
        } catch (e: any) {
          lastErr = e.message;
        }
      }

      console.warn(`Groq API models failed: ${lastErr}. Falling back to Smart Engine / Gemini.`);
    }

    // 2. GOOGLE GEMINI FLASH API
    if ((provider === 'gemini' || !effectiveGroqKey) && effectiveGeminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveGeminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: systemPrompt }, { text: userMessage }],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          let rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          rawJson = rawJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
          const recipeData = JSON.parse(rawJson);

          const fullRecipe: Recipe = {
            ...recipeData,
            id: 'ai-recipe-gemini-' + Date.now(),
            isAiGenerated: true,
            plateRatio: recipeData.plateRatio || { veggiesPercent: 50, proteinPercent: 25, carbsPercent: 25 },
          };

          return NextResponse.json({ recipe: fullRecipe, source: 'gemini-1.5-flash' });
        }
      } catch (err) {
        console.warn('Gemini API call failed:', err);
      }
    }

    // 3. SMART TEMPLATE FALLBACK (Falls API-Limits erreicht oder kein Key vorhanden)
    // Extrahiere Zutaten aus dem Prompt, falls Resteverwerter genutzt wurde
    let cleanTitle = 'Zarte Hähnchen-Brokkoli-Pfanne mit Cremefine 7%';
    let dynamicVeggies = ['1 Zucchini', '1 bunte Paprika', '150g Brokkoli'];

    if (prompt) {
      if (prompt.includes('[Kühlschrank-Reste-Verwertung]')) {
        const match = prompt.match(/vorhandene Reste:\s*([^.]+)/i);
        const leftovers = match ? match[1].trim() : 'Bunte Gemüse-Reste';
        cleanTitle = `Zero-Waste Pfanne mit ${leftovers.slice(0, 35)}`;
        dynamicVeggies = leftovers.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else {
        cleanTitle = `Nicole-Pfanne: ${prompt.slice(0, 32)}`;
      }
    }

    const fallbackRecipe: Recipe = {
      id: 'ai-recipe-template-' + Date.now(),
      title: cleanTitle,
      subtitle: '100% abgestimmt auf 44g Fett-Limit & 103g Protein',
      mealType: mealType as any,
      category: mealType === 'breakfast' ? 'Frühstück 2.0' : 'Gesunder Teller',
      prepMins: 15,
      kcal: 420,
      protein: 46,
      fat: 7,
      carbs: 42,
      fiber: 8,
      tags: ['KI-Kreation', 'Gesunder Teller', 'High-Protein', 'Zero-Waste'],
      whyNicole: 'Erfüllt präzise die Makroverteilung: Mageres Geflügel (46g Protein), 1 TL Olivenöl (max. 7g Gesamtfett) und reichlich gedünstetes Gemüse.',
      ingredients: {
        'Frischetheke & Obst': dynamicVeggies.length > 0 ? dynamicVeggies : ['1 Zucchini gewürfelt', '150g Brokkoli'],
        'Geflügel & Fisch': ['180g Hähnchenbrustfilet (oder Eier/Feta)'],
        'Vorrat & Gewürze': ['1 TL Olivenöl', '1 TL Kräuter der Provence, Meersalz, Pfeffer'],
        'Kühlregal': ['50ml Rama Cremefine 7% zum Kochen'],
      },
      instructions: [
        'Zutaten waschen und in mundgerechte Stücke schneiden. Eiweißquelle trocken tupfen.',
        '1 TL Olivenöl in einer beschichteten Pfanne erhitzen. Eiweißquelle 3–4 Min. scharf anbraten.',
        'Gemüse & Vorrats-Reste dazugeben und 5 Min. bissfest dünsten.',
        'Mit 50ml Rama Cremefine 7% ablöschen, mit Kräutern und Meersalz würzen und kurz einköcheln lassen.',
        'Heiß anrichten nach dem Prinzip des Gesunden Tellers (50% Gemüse, 25% Protein, 25% Carbs).'
      ],
      plateRatio: { veggiesPercent: 50, proteinPercent: 25, carbsPercent: 25 },
      isAiGenerated: true,
    };

    return NextResponse.json({
      recipe: fallbackRecipe,
      source: 'smart-template-engine',
      message: 'Rezept erfolgreich generiert! (Tipp: Hinterlege optional einen kostenlosen Groq- oder Gemini-Key in den Einstellungen für unbegrenzte Echtzeit-KI).',
    });
  } catch (error: any) {
    console.error('Error in recipe generation:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler bei der Rezeptgenerierung' },
      { status: 500 }
    );
  }
}
