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

    const systemPrompt = `Du bist ein hochqualifizierter Ernährungs- und Rezept-Assistent für Nicole Keller.
Ihre strikten Vorgaben aus der Ernährungsanalyse:
- Tägliches Ziel: 1508 kcal, max. 44g Fett (sehr strikt!), mind. 103g Protein, 25g Ballaststoffe, 165g KH.
- Mahlzeiten-Prinzip "Der gesunde Teller": 50% Gemüse, 25% mageres Eiweiß, 25% vollwertige Kohlenhydrate, sparsam gesunde Fette (nur 1 TL Olivenöl, Leinsamen, Mandelmus).
- Keine schweren Sahnen/Schmand -> stattdessen Cremefine 7% oder Magerquark.
- Absolutes No-Go: Schweinefleisch, Frittiertes, Zuckerbäckerei.
- Zutaten müssen in normalen Supermärkten (REWE) und Discountern (Aldi/Lidl) günstig erhältlich sein.
- Verpackungs-Synergien beachten (kein Wegwerfen angebrochener Packungen).

Generiere ein Rezept als valides JSON entsprechend dem folgenden Schema:
{
  "title": "string (Appetitlicher deutscher Name)",
  "subtitle": "string (Kurzer Untertitel)",
  "mealType": "${mealType}",
  "category": "${mealType === 'breakfast' ? 'Frühstück 2.0' : mealType === 'snack' ? 'Snacks & Dessert' : 'Gesunder Teller'}",
  "prepMins": 20,
  "kcal": 420,
  "protein": 45,
  "fat": 8,
  "carbs": 40,
  "fiber": 7,
  "tags": ["KI-Kreation", "High-Protein", "REWE/Discounter"],
  "whyNicole": "Begründung bezüglich Nicoles Nährwerten (Fettgrenze, Proteinziel, Gemüseanteil)",
  "ingredients": {
    "Frischetheke & Obst": ["..."],
    "Geflügel & Fisch": ["..."],
    "Kühlregal": ["..."],
    "Vorrat & Gewürze": ["..."]
  },
  "instructions": ["Schritt 1", "Schritt 2", "Schritt 3"]
}
WICHTIG: Antworte AUSSCHLIESSLICH mit dem reinen JSON-Objekt.`;

    const userMessage = `Benutzer-Wunsch: ${prompt || 'Ein ausgewogenes, budgetfreundliches Gericht nach Nicoles Vorgaben'}`;

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
              'Authorization': `Bearer ${effectiveGroqKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.3,
            }),
          });

          if (!groqRes.ok) {
            const err = await groqRes.text();
            lastErr = `${model}: ${err}`;
            continue; // Try next available model
          }

          const groqData = await groqRes.json();
          const content = groqData.choices?.[0]?.message?.content;
          const recipeData = JSON.parse(content);

          const fullRecipe: Recipe = {
            ...recipeData,
            id: 'ai-recipe-groq-' + Date.now(),
            isAiGenerated: true,
            plateRatio: { veggiesPercent: 50, proteinPercent: 25, carbsPercent: 25 },
          };

          return NextResponse.json({ recipe: fullRecipe, source: `groq-${model}` });
        } catch (e: any) {
          lastErr = e.message;
        }
      }

      throw new Error(`Groq API Fehler: ${lastErr}`);
    }

    // 2. GOOGLE GEMINI FLASH API
    if (provider === 'gemini' && effectiveGeminiKey) {
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

      if (!geminiRes.ok) {
        const err = await geminiRes.text();
        throw new Error(`Gemini API Fehler: ${geminiRes.status} - ${err}`);
      }

      const data = await geminiRes.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const recipeData = JSON.parse(rawJson);

      const fullRecipe: Recipe = {
        ...recipeData,
        id: 'ai-recipe-gemini-' + Date.now(),
        isAiGenerated: true,
        plateRatio: { veggiesPercent: 50, proteinPercent: 25, carbsPercent: 25 },
      };

      return NextResponse.json({ recipe: fullRecipe, source: 'gemini-1.5-flash' });
    }

    // 3. SMART TEMPLATE FALLBACK (Falls noch kein Key hinterlegt ist)
    const fallbackRecipe: Recipe = {
      id: 'ai-recipe-template-' + Date.now(),
      title: prompt ? `Nicole-Fitness: ${prompt.slice(0, 28)}` : 'Zarte Hähnchen-Brokkoli-Pfanne mit Cremefine 7%',
      subtitle: '100% abgestimmt auf 44g Fett-Limit & 103g Protein',
      mealType: mealType as any,
      category: mealType === 'breakfast' ? 'Frühstück 2.0' : 'Gesunder Teller',
      prepMins: 15,
      kcal: 420,
      protein: 46,
      fat: 7,
      carbs: 42,
      fiber: 8,
      tags: ['KI-Kreation', 'Gesunder Teller', 'High-Protein', 'REWE/Discounter'],
      whyNicole: 'Erfüllt präzise die Makroverteilung: Mageres Geflügel (46g Protein), 1 TL Olivenöl (max. 7g Gesamtfett) und reichlich gedünstetes Gemüse.',
      ingredients: {
        'Frischetheke & Obst': ['1 Zucchini', '1 bunte Paprika', '150g Brokkoli'],
        'Geflügel & Fisch': ['180g Hähnchenbrustfilet (REWE/Discounter)'],
        'Vorrat & Gewürze': ['1 TL Olivenöl', '1 TL Kräuter der Provence, Meersalz, Pfeffer'],
        'Kühlregal': ['50ml Rama Cremefine 7% zum Kochen'],
      },
      instructions: [
        'Hähnchenbrustfilet in mundgerechte Streifen schneiden und in einer beschichteten Pfanne mit 1 TL Olivenöl 3 Min scharf anbraten.',
        'Zucchini, Paprika und Brokkoliröschen dazugeben und 5 Min mitbraten.',
        'Mit 50ml Rama Cremefine 7% ablöschen, mit Kräutern und Meersalz würzen und kurz einköcheln lassen.',
        'Heiß servieren. (Tipp: Restliches Gemüse passt perfekt ins Abendessen von Tag 2).',
      ],
      plateRatio: { veggiesPercent: 50, proteinPercent: 25, carbsPercent: 25 },
      isAiGenerated: true,
    };

    return NextResponse.json({
      recipe: fallbackRecipe,
      source: 'smart-template-engine',
      message: 'Rezept generiert. Hinterlege deinen kostenlosen Groq- oder Gemini-Key in den Einstellungen für unbegrenzte Echtzeit-KI-Kreationen!',
    });
  } catch (error: any) {
    console.error('Error in recipe generation:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler bei der Rezeptgenerierung' },
      { status: 500 }
    );
  }
}
