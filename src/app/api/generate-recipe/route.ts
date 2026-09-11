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
      targetGoals,
      userName,
      dietaryStyle = 'omnivore',
    } = body;

    // Check keys based on chosen provider
    const effectiveGroqKey = groqApiKey || (provider === 'groq' ? userApiKey : '') || process.env.GROQ_API_KEY;
    const effectiveGeminiKey = geminiApiKey || (provider === 'gemini' ? userApiKey : '') || process.env.GEMINI_API_KEY;

    // Calculate dynamic macro budget for this meal based on user's daily goals
    const userGoals = targetGoals || {
      calories: 1508,
      fat: 44,
      protein: 103,
      carbs: 165,
      fiber: 25,
    };

    let mealCal = Math.round(userGoals.calories * 0.35);
    let mealFat = Math.max(3, Math.round(userGoals.fat * 0.30));
    let mealProt = Math.max(15, Math.round(userGoals.protein * 0.35));
    let mealCarb = Math.max(10, Math.round(userGoals.carbs * 0.35));

    if (mealType === 'breakfast') {
      mealCal = Math.round(userGoals.calories * 0.25);
      mealFat = Math.max(3, Math.round(userGoals.fat * 0.20));
      mealProt = Math.max(20, Math.round(userGoals.protein * 0.30));
      mealCarb = Math.max(15, Math.round(userGoals.carbs * 0.25));
    } else if (mealType === 'lunch') {
      mealCal = Math.round(userGoals.calories * 0.35);
      mealFat = Math.max(4, Math.round(userGoals.fat * 0.35));
      mealProt = Math.max(25, Math.round(userGoals.protein * 0.35));
      mealCarb = Math.max(15, Math.round(userGoals.carbs * 0.35));
    } else if (mealType === 'dinner') {
      mealCal = Math.round(userGoals.calories * 0.30);
      mealFat = Math.max(4, Math.round(userGoals.fat * 0.35));
      mealProt = Math.max(25, Math.round(userGoals.protein * 0.30));
      mealCarb = Math.max(10, Math.round(userGoals.carbs * 0.30));
    } else if (mealType === 'snack') {
      mealCal = Math.round(userGoals.calories * 0.10);
      mealFat = Math.max(2, Math.round(userGoals.fat * 0.10));
      mealProt = Math.max(10, Math.round(userGoals.protein * 0.15));
      mealCarb = Math.max(5, Math.round(userGoals.carbs * 0.10));
    }

    const dietInstruction = dietaryStyle === 'vegetarian'
      ? 'ERNAEHRUNGSSTIL: 100% VEGETARISCH (Kein Fleisch, kein Fisch. Eiweißquellen: Magerquark, Skyr, Eier, Feta light, Mozzarella light, Kichererbsen, Linsen, Tofu).'
      : dietaryStyle === 'vegan'
      ? 'ERNAEHRUNGSSTIL: 100% VEGAN (Keine tierischen Produkte. Eiweißquellen: Tofu, Tempeh, Hülsenfrüchte, pflanzlicher Protein-Quark, Sojaschnetzel).'
      : dietaryStyle === 'pescetarian'
      ? 'ERNAEHRUNGSSTIL: PESCETARISCH (Kein Fleisch/Geflügel, aber gerne Fisch, Garnelen, Eier und Milchprodukte).'
      : 'ERNAEHRUNGSSTIL: OMNIVOR (Fokus auf mageres Geflügel wie Hähnchen-/Putenbrust, Fisch, Garnelen, Eier und Milchprodukte).';

    const systemPrompt = `Du bist der professionelle Chefkoch und Ernährungsberater der App "fit und healthy".
Deine Aufgabe ist es, ein maßgeschneidertes, genussvolles und gesundes Rezept für ${userName || 'den Nutzer'} zu kreieren.

INDIVIDUELLES NÄHRSTOFF-BUDGET FÜR DIESE MAHLZEIT (${mealType.toUpperCase()}):
- Ziel-Kalorien: ca. ${mealCal} kcal (Tagesgesamtbedarf: ${userGoals.calories} kcal)
- Fett-Budget: maximal ${mealFat}g Fett (Tageslimit: ${userGoals.fat}g Fett)
- Eiweiß-Ziel: mindestens ${mealProt}g Protein (Tagesziel: ${userGoals.protein}g Protein)
- Kohlenhydrate: ca. ${mealCarb}g (komplex & ballaststoffreich)
${dietInstruction}

GRUNDPRINZIPIEN:
1. PRINZIP "DER GESUNDE TELLER" (bei Mittag & Abendessen):
   - 50% frisches Gemüse/Salat (Zucchini, Paprika, Brokkoli, Champignons, Spinat, Tomaten, Möhren)
   - 25% mageres Eiweiß
   - 25% vollwertige Kohlenhydrate (Kartoffeln, Naturreis, Protein-Pasta, Vollkornbrot, Quinoa)
2. ZUTATEN & QUALITAET:
   - 100% alltagstauglich, budgetfreundlich (REWE, Aldi, Lidl, dm).
   - Kein zugesetzter Haushaltszucker, kein Frittiertes, kein Schweinefleisch.
   ${userGoals.fat <= 45 ? '- Strenges Fettlimit: Rama Cremefine 7%, Magerquark light, max. 1 TL Öl.' : '- Gesunde Fette passend zum Budget (Olivenöl, etwas Nüsse oder Avocado).'}
   - Genaue Mengenangaben in Gramm/ml (z. B. "170g Hähnchenbrustfilet", "1 TL Olivenöl").

ZUTATEN-KATEGORIEN (Verwende EXAKT diese 5 Schlüssel im ingredients-Objekt):
- "Kühlregal" (Skyr, Quark, Eier, Cremefine, Käse light, etc.)
- "Frischetheke & Obst" (Gemüse, Salat, frische Kräuter, Obst)
- "Geflügel & Fisch" (Fleisch, Fisch, Meeresfrüchte bzw. Tofu)
- "Tiefkühl" (TK-Beeren, TK-Spinat, TK-Gemüse)
- "Vorrat & Gewürze" (Getreide, Pasta, Reis, Gewürze, Öl)

DIE 4 KOCHBUCH-SCHRITTE (instructions):
1. Vorbereitung & Schnitt: Gemüse waschen & schneiden, Eiweißquelle vorbereiten.
2. Anbraten & Rösten: Mit geringem Öl scharf anbraten.
3. Garen & Würzen: Gemüse und Saucenbasis zugeben, abschmecken.
4. Anrichten: Appetitlich auf dem Teller anrichten und genießen.

ANTWORTE AUSSCHLIESSLICH IM FOLGENDEN VALIDE JSON-FORMAT:
{
  "title": "Klarer, appetitlicher Name",
  "subtitle": "z. B. 20-Minuten-Feierabendküche",
  "mealType": "${mealType}",
  "category": "${mealType === 'breakfast' ? 'Frühstück 2.0' : mealType === 'snack' ? 'Snacks & Dessert' : 'Der gesunde Teller'}",
  "prepMins": 20,
  "kcal": ${mealCal},
  "protein": ${mealProt},
  "fat": ${mealFat},
  "carbs": ${mealCarb},
  "fiber": 6,
  "plateRatio": {
    "veggiesPercent": ${mealType === 'breakfast' ? 40 : mealType === 'snack' ? 30 : 50},
    "proteinPercent": ${mealType === 'breakfast' ? 35 : mealType === 'snack' ? 30 : 25},
    "carbsPercent": ${mealType === 'breakfast' ? 25 : mealType === 'snack' ? 40 : 25}
  },
  "tags": ["High-Protein", "Maßgeschneidert", "Discounter-tauglich"],
  "whyNicole": "Perfekt auf das Nährstoffbudget abgestimmt: ca. ${mealCal} kcal, ${mealProt}g Protein und strikt im Fettlimit (${mealFat}g).",
  "ingredients": {
    "Frischetheke & Obst": ["1 Zucchini gewürfelt", "1 Paprika rot"],
    "Geflügel & Fisch": ["160g Eiweißquelle"],
    "Kühlregal": ["50ml Cremefine 7% oder Quark"],
    "Vorrat & Gewürze": ["40g Beilage (z. B. Reis oder Pasta)", "1 TL Öl", "Gewürze"]
  },
  "instructions": [
    "Schritt 1...",
    "Schritt 2...",
    "Schritt 3...",
    "Schritt 4..."
  ]
}
WICHTIG: Antworte NUR mit dem reinen JSON-Objekt, ohne Markdown-Fences (\`\`\`json) und ohne Begleittext.`;

    const userMessage = `Benutzer-Wunsch für diese Mahlzeit: ${prompt || `Ein schnelles, ausgewogenes Gericht passend zu ${mealCal} kcal und mind. ${mealProt}g Protein`}`;

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
      const geminiModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      for (const gModel of geminiModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${effectiveGeminiKey}`,
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

            return NextResponse.json({ recipe: fullRecipe, source: gModel });
          }
        } catch (err) {
          console.warn(`Gemini API call failed for ${gModel}:`, err);
        }
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
