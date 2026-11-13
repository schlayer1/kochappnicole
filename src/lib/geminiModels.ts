export const CANDIDATE_FREE_TIER_GEMINI_MODELS = [
  'gemini-4-hydrogen',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

const EXCLUDED_MODEL_PATTERNS = [
  '1.0-',
  '1.5-',
  '2.0-',
  '2.5-',
  '3.7-flash',
  '3.1-flash-lite',
  '3-flash-preview',
  '3-pro-preview',
  '3.1-pro',
  'pro-latest',
  'argon',
  'carbon',
  '8b',
  'embedding',
  'aqa',
  'tts',
  'image',
  'native-audio',
  'transcribe',
  'computer-use',
  'robotics',
  'veo',
  'lyria',
  'omni',
  'live',
  'nano-banana',
  'deep-research',
  'antigravity',
];

/**
 * Queries Google's ListModels API and returns active Free-Tier-compatible text/multimodal models
 * sorted by our preferred cascade order, falling back to CANDIDATE_FREE_TIER_GEMINI_MODELS.
 */
export async function getGeminiCandidateModels(
  apiKey: string,
  cachedModel?: string | null
): Promise<string[]> {
  const ordered: string[] = [];
  if (cachedModel) ordered.push(cachedModel);

  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      if (Array.isArray(listData.models)) {
        const available: string[] = listData.models
          .filter((m: any) => {
            const shortName = String(m.name || '')
              .toLowerCase()
              .replace(/^models\//, '');
            const methods: string[] = m.supportedGenerationMethods || [];
            if (!methods.includes('generateContent')) return false;
            if (!shortName.startsWith('gemini-')) return false;
            if (shortName === 'gemini-3.5-flash') return false;
            return !EXCLUDED_MODEL_PATTERNS.some((p) => shortName.includes(p));
          })
          .map((m: any) => String(m.name || '').replace(/^models\//, ''));

        available.sort((a, b) => {
          const idxA = CANDIDATE_FREE_TIER_GEMINI_MODELS.indexOf(a);
          const idxB = CANDIDATE_FREE_TIER_GEMINI_MODELS.indexOf(b);
          if (idxA !== -1 || idxB !== -1) {
            return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
          }
          return b.localeCompare(a);
        });

        ordered.push(...available);
      }
    }
  } catch (err) {
    console.warn('Gemini ListModels query failed:', err);
  }

  return Array.from(new Set([...ordered, ...CANDIDATE_FREE_TIER_GEMINI_MODELS]));
}
