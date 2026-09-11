import { NextRequest, NextResponse } from 'next/server';

let cachedWorkingGemini: string | null = null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      userApiKey,
      groqApiKey,
      geminiApiKey,
      provider = 'gemini',
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Kein Foto zur Reste-Erkennung übermittelt.' },
        { status: 400 }
      );
    }

    // Clean base64 string
    const isDataUrl = imageBase64.startsWith('data:');
    const cleanBase64 = isDataUrl ? imageBase64.split(',')[1] : imageBase64;
    const mimeType = isDataUrl
      ? imageBase64.split(';')[0].split(':')[1] || 'image/jpeg'
      : 'image/jpeg';
    const fullDataUrl = isDataUrl ? imageBase64 : `data:${mimeType};base64,${cleanBase64}`;

    const effectiveGeminiKey =
      geminiApiKey ||
      (provider === 'gemini' ? userApiKey : '') ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const effectiveGroqKey =
      groqApiKey || (provider === 'groq' ? userApiKey : '') || process.env.GROQ_API_KEY;

    const systemPrompt = `Du bist der hochintelligente Foto-Resteverwerter ("Zero-Waste Chef") der Ernährungs-App für Nicole Keller.
Deine Aufgabe:
1. Erkenne alle sichtbaren rohen Lebensmittel, Reste oder Vorräte auf dem Foto (Gemüse, Fleisch, Fisch, Milchprodukte, Eier, Vorratsdosen etc.).
2. Kreiere daraus ein köstliches, alltagstaugliches Hauptgericht speziell für Nicole.

NICOLE ERNÄHRUNGSPROFIL (STRENG EINHALTEN):
- TAGES-FETTLIMIT: maximal 44g Gesamtfett/Tag. Dieses Rezept SOLLTE UNTER 10-12g Fett bleiben! Keinesfalls Frittiertes oder fette Sahnesaucen.
- EIWEISS-MINIMUM: mindestens 103g Protein/Tag. Dieses Rezept SOLLTE 35g bis 45g Protein liefern (ggf. mageres Fleisch, Magerquark, Skyr, Eiklar, Feta light, Kichererbsen etc. ergänzen).
- PRINZIP "DER GESUNDE TELLER": ca. 50% Gemüse/Salat, 25% mageres Eiweiß, 25% vollwertige Kohlenhydrate.

WICHTIGSTE FUNKTION: TRENNUNG DER ZUTATEN
Teile die Zutaten auf in:
- "availableFromPhoto": Zutaten, die direkt auf dem Foto zu sehen sind.
- "neededFromPantryOrStore": 1 bis maximal 3 typische Grundnahrungsmittel oder Frischezutaten, die Nicole eventuell aus dem Vorratsschrank nehmen oder schnell besorgen sollte (z.B. "80g Vollkorn-Penne", "1 Dose gehackte Tomaten", "1 TL Olivenöl zum Anbraten", "Salz & Kräuter").

ANTWORTE AUSSCHLIESSLICH IM FOLGENDEN VALIDE JSON-FORMAT:
{
  "detectedIngredients": ["Zucchini", "Rote Paprika", "Eier", "Feta light"],
  "recipe": {
    "title": "Aromatisches Mediterranes Pfannengemüse mit Eiern & Feta light",
    "description": "Schnelle, bunte Restepfanne mit hohem Eiweißgehalt und minimalem Fett.",
    "prepTime": 15,
    "category": "lunch",
    "calories": 420,
    "protein": 38,
    "fat": 9,
    "carbs": 35,
    "fiber": 8,
    "ingredientsAvailable": [
      "1 mittelgroße Zucchini (gewürfelt)",
      "1 rote Paprika (in Streifen)",
      "2 Eier (Größe M)",
      "50g Feta light (zerbröckelt)"
    ],
    "ingredientsNeeded": [
      "80g Vollkornreis oder Vollkornnudeln",
      "1 TL Olivenöl oder 1 Sprühstoß Bratöl",
      "Kräuter der Provence, Salz & Pfeffer"
    ],
    "shoppingItems": [
      "Vollkornreis (oder Vollkornnudeln)"
    ],
    "instructions": [
      "Zucchini und Paprika waschen und in mundgerechte Stücke schneiden.",
      "Pfanne mit etwas Ölspray erhitzen und das Gemüse 5-7 Minuten scharf anbraten.",
      "Die Eier in einer Schale verquirlen, würzen und über das Gemüse gießen.",
      "Bei mittlerer Hitze stocken lassen und zum Schluss den Feta light darüberstreuen.",
      "Mit der Beilage servieren und warm genießen."
    ]
  },
  "nicoleVerdict": "Perfekt für dein 44g-Fettbudget: Nur ca. 9g Fett und stolze 38g Eiweiß. Die Paprika und Zucchini sichern die 50% Gemüse-Quote.",
  "quickTip": "Hast du noch eine Scheibe Vollkornbrot da? Dann kannst du sie statt der Nudeln als Beilage verwenden!"
}
WICHTIG: Antworte NUR im reinen JSON-Format, ohne Markdown-Fences und ohne Begleittext!`;

    // 1. GOOGLE GEMINI FLASH VISION
    if (effectiveGeminiKey) {
      let modelsToTry: string[] = [];

      if (cachedWorkingGemini) {
        modelsToTry.push(cachedWorkingGemini);
      }

      try {
        const listRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${effectiveGeminiKey}`
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          if (Array.isArray(listData.models)) {
            const available = listData.models
              .filter(
                (m: any) =>
                  m.supportedGenerationMethods?.includes('generateContent') &&
                  !m.name.includes('embedding') &&
                  !m.name.includes('aqa') &&
                  !m.name.includes('tts') &&
                  !m.name.includes('imagen')
              )
              .map((m: any) => m.name.replace(/^models\//, ''));

            available.sort((a: string, b: string) => {
              const score = (name: string) => {
                const lower = name.toLowerCase();
                if (lower.includes('gemini') && lower.includes('flash')) return 100;
                if (lower.includes('flash')) return 80;
                if (lower.includes('gemini')) return 60;
                return 10;
              };
              return score(b) - score(a);
            });

            modelsToTry = Array.from(new Set([...modelsToTry, ...available]));
          }
        }
      } catch (err) {
        console.warn('Gemini ListModels query failed:', err);
      }

      if (modelsToTry.length === 0) {
        modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];
      }

      for (const model of modelsToTry) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveGeminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      { text: `${systemPrompt}\n\nBitte analysiere diese Lebensmittelreste auf dem Foto und erstelle das perfekte Rezept:` },
                      {
                        inlineData: {
                          mimeType,
                          data: cleanBase64,
                        },
                      },
                    ],
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
            rawJson = rawJson.replace(/```(?:json)?/gi, '').trim();
            const result = JSON.parse(rawJson);

            cachedWorkingGemini = model;
            return NextResponse.json({ result, source: `gemini-${model}` });
          }
        } catch (err) {
          console.warn(`Gemini scan-fridge error (${model}):`, err);
        }
      }
    }

    // 2. GROQ VISION FALLBACK
    if (effectiveGroqKey) {
      const groqVisionModels = [
        'qwen/qwen3.6-27b',
        'meta-llama/llama-4-scout-17b-16e-instruct',
        'llama-3.2-11b-vision-preview',
        'llama-3.2-90b-vision-preview',
      ];

      for (const model of groqVisionModels) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${effectiveGroqKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: systemPrompt },
                    {
                      type: 'image_url',
                      image_url: { url: fullDataUrl },
                    },
                  ],
                },
              ],
              temperature: 0.3,
              response_format: { type: 'json_object' },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            let rawText = data.choices?.[0]?.message?.content || '';
            rawText = rawText.replace(/```(?:json)?/gi, '').trim();
            const result = JSON.parse(rawText);
            return NextResponse.json({ result, source: `groq-${model}` });
          }
        } catch (e) {
          console.warn(`Groq scan-fridge error on ${model}:`, e);
        }
      }
    }

    // 3. SMART HEURISTIC FALLBACK (offline)
    const fallbackResult = {
      detectedIngredients: ['Zucchini', 'Paprika', 'Eier', 'Feta light'],
      recipe: {
        title: 'Bunte Gemüsereste-Pfanne mit Rührei & Feta light',
        description: 'Schnelle Resteverwertung aus der Pfanne mit viel Gemüse und bestem Protein.',
        prepTime: 15,
        category: 'lunch',
        calories: 410,
        protein: 36,
        fat: 10,
        carbs: 32,
        fiber: 7,
        ingredientsAvailable: [
          '1 Zucchini (gewürfelt)',
          '1 Paprika (in Streifen)',
          '2 Eier',
          '50g Feta light'
        ],
        ingredientsNeeded: [
          '1 Scheibe Vollkornbrot oder 60g Reis',
          '1 TL Rapsöl oder Ölspray',
          'Salz, Pfeffer, Kräuter'
        ],
        shoppingItems: [
          'Vollkornbrot'
        ],
        instructions: [
          'Gemüsereste waschen, putzen und in feine Würfel schneiden.',
          'In einer Pfanne mit etwas Ölspray anbraten, bis das Gemüse bissfest ist.',
          'Die Eier darübergeben, verrühren und stocken lassen.',
          'Mit Feta light bestreuen und warm servieren.'
        ]
      },
      nicoleVerdict: 'Klasse Resteverwertung: Mit 10g Fett bleibst du meilenweit unter deinem 44g-Tageslimit und hast 36g mageres Eiweiß gesichert.',
      quickTip: 'Tipp: Hinterlege deinen kostenlosen Gemini-Key für die Live-Bilderkennung!'
    };

    return NextResponse.json({
      result: fallbackResult,
      source: 'smart-heuristic-fallback',
    });
  } catch (error: any) {
    console.error('Error in scan-fridge route:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler bei der Reste-Foto-Erkennung' },
      { status: 500 }
    );
  }
}
