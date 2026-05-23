import { NextRequest, NextResponse } from 'next/server';
import { normalizeForTTS } from '@/lib/tts-utils';
import { todayGuadeloupe } from '@/lib/edition';
import { getEditionFromDate } from '@/lib/private/tts-prompt';
import type { HoroscopeResponse } from '@/lib/horoscope-data';

const TTS_URL = 'https://api.mistral.ai/v1/audio/speech';
const TTS_MODEL = 'voxtral-mini-tts-2603';
const TTS_VOICE = 'fr_marie_curious';

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

/* ── Route principale ─────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS non configuré' }, { status: 503 });
  }

  let horoscope: HoroscopeResponse | null = null;
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
      const dateWithUserHour = new Date(userDate);
      dateWithUserHour.setHours(parseInt(userHour));
      edition = getEditionFromDate(dateWithUserHour.toISOString());
    } else {
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
    console.log('[TTS] Cache hit pour:', cacheKey);
    const mp3 = Buffer.from(cached.audio, 'base64');
    return new NextResponse(mp3, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': mp3.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // 2. Construire le texte complet à partir de l'horoscope
  // Le texte est déjà généré par LLM1 (mistral-large) en français optimisé pour TTS
  const sections = ['ouverture', 'amour', 'travail', 'argent', 'amitie', 'prediction', 'conseil'];
  const horoscopeText = sections
    .map(key => horoscope[key as keyof HoroscopeResponse])
    .filter(Boolean)
    .join(' ');

  // Ajouter l'intro Maryse avec la date et l'heure
  const now = new Date(userDate);
  const formattedDate = now.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const formattedHour = userHour ? userHour.replace(':', 'h') : '';
  const momentLabel = edition === 'matin' ? 'ce matin'
    : edition === 'midi' ? 'cet après-midi'
    : edition === 'soir' ? 'ce soir'
    : 'cette nuit';
  
  const intro = `Bonjour, c'est Maryse. ${momentLabel}, nous sommes le ${formattedDate}${formattedHour ? `, il est ${formattedHour}` : ''} à Karukera.`;
  
  const fullText = `${intro} ${horoscopeText}`;

  // Normaliser le texte pour TTS
  const finalText = normalizeForTTS(fullText);

  console.log('[TTS] Texte final envoyé à Mistral TTS:', finalText);

  // 3. Générer l'audio via Mistral TTS
  const ttsRes = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: finalText,
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

  // 4. Mettre en cache le MP3 et le texte
  await setTtsCached(cacheKey, ttsData.audio_data, finalText);

  // 5. Retourner le MP3
  return new NextResponse(mp3, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': mp3.length.toString(),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
