import { NextRequest, NextResponse } from 'next/server';
import { normalizeForTTS } from '@/lib/tts-utils';
import { MARYSE_AME } from '@/lib/private/maryse-prompt';
import { todayGuadeloupe } from '@/lib/edition';

const TTS_URL = 'https://api.mistral.ai/v1/audio/speech';

/* ── Helper : Formater la date en français (sans année) ──────────── */
function formatDateFr(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

/* ── Instructions TTS (variable, pas fichier) ───────────────────────── */
const TTS_INSTRUCTIONS_HOROSCOPE = `Tu lis cet horoscope avec la conscience que chez nous, les étoiles, les signes, les présages sont un fil tendu entre les vivants et les ancêtres. Chaque signe est un message qui vient de loin.

Tu reçois un JSON avec 6 clés : ouverture, amour, travail, argent, amitie, prediction.

Tu dois retourner UNIQUEMENT du texte brut (pas de JSON, pas de markdown, pas de balises) avec :

1. Une introduction FIXE à utiliser EXACTEMENT comme fourni : "Bonjour, c'est Maryse. Nous sommes le [DATE], et [INTRO]"
   Où [DATE] est déjà au format "mercredi 13 mai" (SANS année)
   Où [INTRO] est déjà au format "ce matin" / "cet après-midi" / "ce soir" / "cette nuit"
2. La fusion des 6 phrases dans l'ordre, séparées par " ;\n" pour les pauses naturelles
3. Suppression de toute mention temporelle dans le corps du texte

RÈGLES ABSOLUES (VIOLATION = ÉCHEC TOTAL) :
- NE JAMAIS modifier, ajouter ou supprimer quoi que ce soit dans l'introduction
- NE JAMAIS inclure : signe astro, année, heure, lieu, "pour les X", "Ce matin/soir..."
- NE JAMAIS utiliser : [ ], *, –, « », …, °C
- Remplace °C par "degrés Celsius"
- Retourne UNIQUEMENT le texte brut final
- 6 phrases exactement, style oral, ancrage culturel guadeloupéen`;
const TTS_MODEL = 'voxtral-mini-tts-2603';
const TTS_VOICE = 'fr_marie_curious';
const LLM_MODEL = 'mistral-large-latest';
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

/* ── Cache Netlify Blobs pour les MP3 ───────────────────────────────────── */

async function getTtsCached(key: string): Promise<{ audio: string; text: string } | null> {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('tts-audio');
    return await store.get(key, { type: 'json' });
  } catch {
    return null;
  }
}

async function setTtsCached(key: string, audioBase64: string, text: string): Promise<void> {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('tts-audio');
    await store.set(key, JSON.stringify({ audio: audioBase64, text, cachedAt: Date.now() }));
  } catch {
    // Silently fail in local dev or if Blobs unavailable
  }
}

/* ── Optimisation du texte pour TTS via LLM ──────────────────────────────── */

async function optimizeTextForTTS(
  horoscope: any,
  signName: string,
  edition: string,
  userDate: string,
  userHour: string,
  apiKey: string
): Promise<string | null> {
  // Construire le texte avec les noms des sections explicitement
  const fullText = `
- ouverture: ${horoscope.ouverture || ''}
- amour: ${horoscope.amour || ''}
- travail: ${horoscope.travail || ''}
- argent: ${horoscope.argent || ''}
- amitie: ${horoscope.amitie || ''}
- prediction: ${horoscope.prediction || ''}
  `.trim();

  console.log('[TTS] Horoscope reçu:', JSON.stringify(horoscope));

  const systemPrompt = `${MARYSE_AME}\n\n${TTS_INSTRUCTIONS_HOROSCOPE}\n\n` +
    `Ton rôle : transformer ce JSON horoscope en texte audio naturel. Respecte ABSOLUMENT toutes les contraintes ci-dessus.`;

  // Pré-calculer les valeurs pour l'intro (l'LLM doit les utiliser TEL QUEL)
  const dateFormatted = formatDateFr(userDate);
  const introPhraseMap: Record<string, string> = {
    matin: 'ce matin',
    midi: 'cet après-midi',
    soir: 'ce soir',
    nuit: 'cette nuit',
  };
  const introPhrase = introPhraseMap[edition] || 'ce matin';

  const userPrompt = `HOROSCOPE À OPTIMISER :
${fullText}

INTRODUCTION À UTILISER (COPIER-COLLER EXACTEMENT) :
"Bonjour, c'est Maryse. Nous sommes le ${dateFormatted}, et ${introPhrase}"

INSTRUCTIONS :
1. COMMENCE EXACTEMENT par l'introduction ci-dessus (copie-colle, ZÉRO modification)
2. Ajoute UN saut de ligne
3. Fusionne les 6 phrases dans l'ordre avec " ;\n" entre chaque
4. NE JAMAIS mentionner : signe, année, heure, lieu, "pour les X"
5. Retourne UNIQUEMENT le texte final
6. NE JAMAIS inclure l'année, l'heure ou "à Karukera" dans le texte final
7. Retourne UNIQUEMENT le texte final, sans JSON, sans markdown, sans balises.`;

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      temperature: 0.3,
      max_tokens: 800,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    console.error('[TTS] LLM failed:', res.status);
    return null;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    console.log('[TTS] LLM a retourné un contenu vide');
    return null;
  }

  console.log('[TTS] Texte optimisé par LLM:', content);
  return normalizeForTTS(content);
}

/* ── Route principale ─────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS non configuré' }, { status: 503 });
  }

  let horoscope: any = null;
  let signName: string = 'un signe';
  let edition: string = 'matin';
  let userDate: string = todayGuadeloupe();
  let userHour: string = '';

  try {
    const body = await req.json();
    horoscope = body.horoscope;
    signName = body.signName || 'un signe';
    edition = body.edition || 'matin';
    userDate = body.userDate || todayGuadeloupe();
    userHour = body.userHour || '';
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  if (!horoscope) {
    return NextResponse.json({ error: 'Horoscope vide' }, { status: 400 });
  }

  // Clé de cache pour le MP3
  const cacheKey = `tts|${userDate}|${signName.toLowerCase()}|${edition}|${userHour}`;

  // 1. Vérifier le cache TTS (MP3)
  const cached = await getTtsCached(cacheKey);
  if (cached?.audio) {
    console.log('[TTS] Cache hit pour:', cacheKey, '-> texte:', cached.text);
    const mp3 = Buffer.from(cached.audio, 'base64');
    return new NextResponse(mp3, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': mp3.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // 2. Optimiser le texte via LLM
  let optimizedText: string;
  try {
    const optimized = await optimizeTextForTTS(horoscope, signName, edition, userDate, userHour, apiKey);
    if (optimized) {
      optimizedText = optimized;
    } else {
      console.log('[TTS] Utilisation du fallback de normalisation simple');
      const fullText = Object.values(horoscope).filter(Boolean).join(' ');
      optimizedText = normalizeForTTS(fullText);
    }
  } catch (error) {
    console.error('[TTS] Erreur LLM:', error);
    const fullText = Object.values(horoscope).filter(Boolean).join(' ');
    optimizedText = normalizeForTTS(fullText);
  }

  // 3. Générer l'audio via Mistral TTS
  console.log('[TTS] Texte final envoyé à Mistral TTS:', optimizedText);
  const ttsRes = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: optimizedText,
      model: TTS_MODEL,
      response_format: 'mp3',
      voice_id: TTS_VOICE,
    }),
  });

  if (!ttsRes.ok) {
    const err = await ttsRes.text();
    console.error('[TTS] TTS synthesis error:', ttsRes.status, err);
    return NextResponse.json({ error: 'Génération audio échouée' }, { status: 502 });
  }

  const ttsData = await ttsRes.json() as { audio_data?: string };
  if (!ttsData.audio_data) {
    return NextResponse.json({ error: 'Réponse TTS invalide' }, { status: 502 });
  }

  const mp3 = Buffer.from(ttsData.audio_data, 'base64');

  // 4. Mettre en cache le MP3 et le texte optimisé
  await setTtsCached(cacheKey, ttsData.audio_data, optimizedText);

  // 5. Retourner le MP3
  return new NextResponse(mp3, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': mp3.length.toString(),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
