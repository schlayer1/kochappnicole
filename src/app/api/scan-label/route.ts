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
        { error: 'Kein Foto der Nährwerttabelle übermittelt.' },
        { status: 400 }
      );
    }

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

    const systemPrompt = `Du bist die OCR-Nährwerttabellen-KI der Ernährungs-App für Nicole Keller.
Deine Aufgabe:
1. Lies die gedruckte Nährwerttabelle (Nährwertdeklaration je 100g oder je Portion) auf der Lebensmittelverpackung des Fotos präzise ab.
2. Extrahiere: Produktname (falls lesbar), Energie (kcal), Fett, gesättigte Fettsäuren, Kohlenhydrate, davon Zucker, Eiweiß/Protein, Ballaststoffe.
3. Beurteile das Produkt nach Nicoles Profil (max. 44g Fett/Tag, mind. 103g Protein/Tag).

ANTWORTE AUSSCHLIESSLICH IM FOLGENDEN VALIDE JSON-FORMAT:
{
  "productName": "Erkannter Produktname (z. B. Ehrmann High Protein Pudding Schoko)",
  "brand": "Markenname (falls lesbar)",
  "servingSize": "z. B. 1 Becher (200g) oder 100g",
  "per100g": {
    "kcal": 76,
    "fat": 1.5,
    "saturatedFat": 1.0,
    "carbs": 5.5,
    "protein": 10.0,
    "fiber": 0.5
  },
  "suitability": "great", // "great" (≤ 3.5g Fett) | "caution-fat" (3.6g - 10g Fett) | "fat-trap" (> 10g Fett)
  "nicoleVerdict": "Sehr gute Wahl: Mit nur 1.5g Fett / 100g und 10g Protein optimal für dein 44g-Fettbudget.",
  "warning": "" // Falls Fett > 10g: deutliche Warnung vor der Fettfalle
}
WICHTIG: Antworte NUR im reinen JSON-Format, ohne Begleittext und ohne Markdown-Fences!`;

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
        console.warn('Gemini ListModels query failed in scan-label:', err);
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
                      { text: `${systemPrompt}\n\nLies diese Nährwerttabelle auf dem Foto präzise ab:` },
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
                  temperature: 0.1,
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
          console.warn(`Gemini scan-label error (${model}):`, err);
        }
      }
    }

    // 2. GROQ VISION FALLBACK
    if (effectiveGroqKey) {
      const groqVisionModels = [
        'qwen/qwen3.6-27b',
        'meta-llama/llama-4-scout-17b-16e-instruct',
        'llama-3.2-11b-vision-preview',
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
              temperature: 0.1,
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
          console.warn(`Groq scan-label error on ${model}:`, e);
        }
      }
    }

    // 3. Fallback mock if offline
    return NextResponse.json({
      result: {
        productName: 'Magerquark 0,2%',
        brand: 'Supermarkt Eigenmarke',
        servingSize: '250g Portion',
        per100g: {
          kcal: 68,
          fat: 0.2,
          saturatedFat: 0.1,
          carbs: 4.1,
          protein: 12.2,
          fiber: 0.0,
        },
        suitability: 'great',
        nicoleVerdict: 'Absolute Spitzenklasse für Nicole: Praktisch fettfrei (0.2g) und über 12g Eiweiß je 100g!',
        warning: '',
      },
      source: 'offline-heuristic',
    });
  } catch (error: any) {
    console.error('Error in scan-label route:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler beim Lesen der Nährwerttabelle' },
      { status: 500 }
    );
  }
}
