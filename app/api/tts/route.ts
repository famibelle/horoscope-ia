import { NextRequest, NextResponse } from 'next/server';

const TTS_URL   = 'https://api.mistral.ai/v1/audio/speech';
const TTS_MODEL = 'voxtral-mini-tts-2603';
const TTS_VOICE = 'fr_marie_curious';

export async function POST(req: NextRequest) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS non configuré' }, { status: 503 });
  }

  let text: string;
  try {
    const body = await req.json();
    text = (body.text ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: 'Texte vide' }, { status: 400 });
  }

  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: TTS_MODEL,
      response_format: 'mp3',
      voice_id: TTS_VOICE,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('TTS error', res.status, err);
    return NextResponse.json({ error: 'Génération audio échouée' }, { status: 502 });
  }

  const data = await res.json() as { audio_data?: string };
  if (!data.audio_data) {
    return NextResponse.json({ error: 'Réponse TTS invalide' }, { status: 502 });
  }

  const mp3 = Buffer.from(data.audio_data, 'base64');
  return new NextResponse(mp3, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': mp3.length.toString(),
      'Cache-Control': 'no-store',
    },
  });
}
