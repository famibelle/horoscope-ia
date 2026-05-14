import { NextRequest, NextResponse } from 'next/server';
import { normalizeForTTS } from '@/lib/tts-utils';
import { MARYSE_AME } from '@/lib/private/maryse-prompt';
import { buildTTSPrompt, getEditionFromDate } from '@/lib/private/tts-prompt';
import { todayGuadeloupe } from '@/lib/edition';
import { signs } from '@/lib/signs-data';
import type { Edition } from '@/lib/private/maryse-prompt';

const TTS_URL = 'https://api.mistral.ai/v1/audio/speech';
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
  const signData = signs.find(s => s.name.toLowerCase() === signName.toLowerCase());
  if (!signData) {
    console.error('[TTS] Sign non trouvé:', signName);
    return null;
  }

  console.log('[TTS] Génération du texte avec buildTTSPrompt');

  const prompt = buildTTSPrompt(signData, horoscope, userDate, edition as Edition);

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
        { role: 'system', content: MARYSE_AME },
        { role: 'user', content: prompt },
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
    
    // Si on a l'heure du navigateur, l'utiliser pour déterminer l'édition
    if (userHour) {
      // Créer une date avec l'heure du navigateur pour getEditionFromDate
      const dateWithUserHour = new Date(userDate);
      dateWithUserHour.setHours(parseInt(userHour));
      edition = getEditionFromDate(dateWithUserHour.toISOString());
    } else {
      // Sinon utiliser l'heure actuelle du serveur
      edition = getEditionFromDate(userDate);
    }
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
