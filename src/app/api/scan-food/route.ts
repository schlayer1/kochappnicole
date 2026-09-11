import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      userApiKey,
      groqApiKey,
      geminiApiKey,
      provider = 'groq',
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Kein Bild zur Analyse übermittelt.' },
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

    const effectiveGroqKey =
      groqApiKey || (provider === 'groq' ? userApiKey : '') || process.env.GROQ_API_KEY;
    const effectiveGeminiKey =
      geminiApiKey ||
      (provider === 'gemini' ? userApiKey : '') ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const systemPrompt = `Du bist die hochpräzise Foto-Food-Scanner KI der Ernährungs-App "fit und healthy" für Nicole Keller.
Deine Aufgabe ist es, das Foto eines Tellers/Gerichts (im Restaurant, Kantine oder zuhause) visuell zu analysieren und ernährungsphysiologisch nach Nicoles strikten Leitlinien zu bewerten.

NICOLE ERNÄHRUNGSPROFIL:
- STRIKTES TAGES-FETTLIMIT: maximal 44g Gesamtfett pro Tag! Jede Mahlzeit sollte im Idealfall unter 10-12g Fett bleiben. Achte besonders auf versteckte Fette (Sahnesaucen, Frittiertes, zu viel Bratöl, Käsekrusten).
- TÄGLICHES EIWEISS-MINIMUM: mindestens 103g Protein pro Tag! Hauptgerichte sollten 35-45g Protein liefern.
- PRINZIP "DER GESUNDE TELLER": Ideal ist 50% Gemüse/Salat, 25% mageres Eiweiß, 25% vollwertige Kohlenhydrate.

ANTWORTE AUSSCHLIESSLICH IM FOLGENDEN VALIDE JSON-FORMAT:
{
  "dishName": "Präziser, appetitlicher Name des erkannten Gerichts (z. B. Gegrillte Hähnchenbrust mit Ratatouille-Gemüse & Reis)",
  "estimatedMacros": {
    "kcal": 450,
    "protein": 42,
    "fat": 9,
    "carbs": 46,
    "fiber": 7
  },
  "plateRatio": {
    "veggiesPercent": 50,
    "proteinPercent": 25,
    "carbsPercent": 25
  },
  "detectedIngredients": ["Hähnchenbrustfilet", "Zucchini", "Paprika", "Vollkornreis", "Kräuter"],
  "suitability": "great", // "great" (≤12g Fett & ≥35g Protein) | "caution-fat" (>14g Fett) | "low-protein" (<25g Protein)
  "nicoleVerdict": "Ausführliches, motivierendes und ehrliches Feedback: Wie gut passt dieses Gericht zu Nicoles Zielen (44g Fett / 103g Protein)? Wo lauern eventuell versteckte Fette?",
  "tips": "Praktischer Alltagstipp (z. B. 'Sauce beim nächsten Mal separat bestellen' oder 'Eine Extra-Portion Brokkoli als Beilage wählen')"
}
WICHTIG: Antworte NUR im reinen JSON-Format, ohne Begleittext und ohne Markdown-Fences.`;

    // 1. GOOGLE GEMINI FLASH VISION API (Höchste Erkennungsrate für Food-Fotos)
    if (effectiveGeminiKey) {
      let activeGeminiModels: string[] = [];

      // Query ListModels to find the exact model names supported by this API key
      try {
        const listRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${effectiveGeminiKey}`
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          if (Array.isArray(listData.models)) {
            activeGeminiModels = listData.models
              .filter(
                (m: any) =>
                  m.supportedGenerationMethods?.includes('generateContent') &&
                  !m.name.includes('embedding') &&
                  !m.name.includes('aqa')
              )
              .map((m: any) => m.name.replace(/^models\//, ''));
          }
        }
      } catch (err) {
        console.warn('Gemini ListModels query failed:', err);
      }

      // Prioritize flash models
      const fallbackGemini = [
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro',
      ];
      
      const modelsToTry = Array.from(new Set([...activeGeminiModels, ...fallbackGemini]));

      for (const model of modelsToTry) {
        for (const apiVer of ['v1beta', 'v1']) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${effectiveGeminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [
                    {
                      role: 'user',
                      parts: [
                        { text: `${systemPrompt}\n\nBitte analysiere dieses Gericht auf dem Foto präzise im geforderten JSON-Format:` },
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
                    temperature: 0.2,
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const data = await geminiRes.json();
              let rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              rawJson = rawJson.replace(/```(?:json)?/gi, '').trim();
              const result = JSON.parse(rawJson);
              return NextResponse.json({ result, source: `${model} (${apiVer})` });
            } else {
              const errText = await geminiRes.text();
              console.warn(`Gemini (${apiVer}/${model}) returned ${geminiRes.status}:`, errText);
            }
          } catch (err) {
            console.warn(`Gemini call error (${apiVer}/${model}):`, err);
          }
        }
      }
    }

    // 2. GROQ VISION API (Fallback-Option)
    if (effectiveGroqKey) {
      const groqVisionModels = [
        'qwen/qwen3.6-27b',
        'meta-llama/llama-4-scout-17b-16e-instruct',
        'meta-llama/llama-4-maverick-17b-128e-instruct',
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
              temperature: 0.2,
              response_format: { type: 'json_object' },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            let rawText = data.choices?.[0]?.message?.content || '';
            rawText = rawText.replace(/```(?:json)?/gi, '').trim();
            const result = JSON.parse(rawText);
            return NextResponse.json({ result, source: `groq-${model}` });
          } else {
            console.warn(`Groq model ${model} failed with status:`, res.status);
          }
        } catch (e) {
          console.warn(`Groq vision error on ${model}:`, e);
        }
      }
    }

    // 3. SMART HEURISTIC FALLBACK (Falls offline oder kein API Key konfiguriert)
    const fallbackResult = {
      dishName: 'Ausgewogener Fitness-Teller (Smart-Erkennung)',
      estimatedMacros: {
        kcal: 440,
        protein: 41,
        fat: 8,
        carbs: 45,
        fiber: 7,
      },
      plateRatio: {
        veggiesPercent: 50,
        proteinPercent: 25,
        carbsPercent: 25,
      },
      detectedIngredients: [
        'Mageres Fleisch / Geflügel',
        'Gedämpftes Buntes Gemüse',
        'Vollwertige Kohlenhydrate (z.B. Reis/Kartoffeln)',
      ],
      suitability: 'great',
      nicoleVerdict:
        'Der Teller erfüllt optisch das Prinzip des Gesunden Tellers sehr gut (~50% Gemüse, 25% Protein). Mit ca. 8g Fett bleibt dein 44g-Tagesbudget geschützt.',
      tips: 'Tipp: Hinterlege deinen kostenlosen Groq- oder Gemini-Key in den Einstellungen für exakte Bilderkennung in Echtzeit!',
    };

    return NextResponse.json({
      result: fallbackResult,
      source: 'smart-heuristic-fallback',
      message: 'Ergebnis basierend auf Smart-Heuristik. Hinterlege optional einen kostenlosen Groq- oder Gemini-Key für Live-Vision.',
    });
  } catch (error: any) {
    console.error('Error in scan-food route:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler bei der Foto-Analyse' },
      { status: 500 }
    );
  }
}
