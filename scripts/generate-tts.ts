import { config } from 'dotenv';
config();

import { signs as allSigns } from '@/lib/signs-data';
import { buildTTSPrompt } from '@/lib/private/tts-prompt';
import { MARYSE_AME } from '@/lib/private/maryse-prompt';
import { normalizeForTTS } from '@/lib/tts-utils';
import type { Edition } from '@/lib/private/maryse-prompt';
import { logMistralUsage, usageFromMistralResponse } from '@/lib/mistral-usage';

const EDITIONS: Edition[] = ['nuit', 'matin', 'midi', 'soir'];
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const TTS_URL = 'https://api.mistral.ai/v1/audio/speech';
const LLM_MODEL = 'mistral-large-latest';
const TTS_MODEL = 'voxtral-mini-tts-2603';
const TTS_VOICE = 'fr_marie_curious';
const BUCKET = 'tts-audio';

const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  date: args.find(a => a.startsWith('--date='))?.split('=')[1],
  signs: args.find(a => a.startsWith('--signs='))?.split('=')[1]?.split(','),
};

const targetDate = options.date ?? new Date().toISOString().split('T')[0];
const targetSigns = options.signs ? allSigns.filter(s => options.signs!.includes(s.id)) : allSigns;

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const MISTRAL_KEY = process.env.MISTRAL_API_KEY!;

/* ── Supabase Storage ───────────────────────────────────────────────────── */

async function ensureBucket(): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
  });
  if (res.ok) return;
  await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
}

function publicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function storageExists(path: string): Promise<boolean> {
  const res = await fetch(publicUrl(path), { method: 'HEAD' });
  return res.ok;
}

async function storageUpload(path: string, mp3: Buffer): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'Content-Type': 'audio/mpeg',
      'x-upsert': 'true',
    },
    body: mp3,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storage upload ${res.status}: ${text}`);
  }
}

/* ── Supabase horoscope fetch ───────────────────────────────────────────── */

async function fetchHoroscope(signId: string, date: string, edition: Edition) {
  const url = `${SUPABASE_URL}/rest/v1/horoscopes?date=eq.${date}&sign_id=eq.${signId}&edition=eq.${edition}&select=*&limit=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] ?? null;
}

/* ── Mistral LLM — optimisation texte pour TTS ─────────────────────────── */

async function optimizeText(sign: (typeof allSigns)[0], horoscope: any, date: string, edition: Edition): Promise<string | null> {
  const prompt = buildTTSPrompt(sign, horoscope, date, edition);
  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MISTRAL_KEY}`, 'Content-Type': 'application/json' },
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
    logMistralUsage({ source: 'generate-tts:optimize', model: LLM_MODEL, success: false, httpStatus: res.status });
    return null;
  }
  const data = await res.json();
  logMistralUsage({
    source: 'generate-tts:optimize',
    model: LLM_MODEL,
    success: true,
    httpStatus: res.status,
    ...usageFromMistralResponse(data),
  });
  const content = data.choices?.[0]?.message?.content?.trim();
  return content ? normalizeForTTS(content) : null;
}

/* ── Mistral TTS — génération MP3 ──────────────────────────────────────── */

async function generateMp3(text: string): Promise<Buffer | null> {
  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MISTRAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text, model: TTS_MODEL, response_format: 'mp3', voice_id: TTS_VOICE }),
  });
  if (!res.ok) {
    logMistralUsage({ source: 'generate-tts:audio', model: TTS_MODEL, endpoint: 'audio', success: false, httpStatus: res.status });
    return null;
  }
  const data = await res.json() as { audio_data?: string };
  logMistralUsage({ source: 'generate-tts:audio', model: TTS_MODEL, endpoint: 'audio', success: !!data.audio_data, httpStatus: res.status });
  if (!data.audio_data) return null;
  return Buffer.from(data.audio_data, 'base64');
}

/* ── Main ───────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`🎙️  Génération TTS — date: ${targetDate}, ${targetSigns.length} signes × ${EDITIONS.length} éditions`);

  await ensureBucket();

  let generated = 0, skipped = 0, failed = 0;

  for (const sign of targetSigns) {
    for (const edition of EDITIONS) {
      const path = `${targetDate}/${sign.id}/${edition}.mp3`;

      if (!options.force && await storageExists(path)) {
        console.log(`⏭️  ${sign.id}/${edition} — déjà présent`);
        skipped++;
        continue;
      }

      const row = await fetchHoroscope(sign.id, targetDate, edition);
      if (!row) {
        console.warn(`⚠️  ${sign.id}/${edition} — horoscope absent de Supabase`);
        failed++;
        continue;
      }

      const horoscope = {
        ouverture: row.ouverture, amour: row.amour, travail: row.travail,
        argent: row.argent, amitie: row.amitie, prediction: row.prediction,
        conseil: row.conseil, teaser: row.teaser,
        signFr: row.sign_fr, weather: row.weather, edition: row.edition,
      };

      let text = await optimizeText(sign, horoscope, targetDate, edition);
      if (!text) {
        const fallback = [horoscope.ouverture, horoscope.amour, horoscope.travail, horoscope.argent, horoscope.amitie, horoscope.prediction].filter(Boolean).join(' ');
        text = normalizeForTTS(fallback);
      }

      const mp3 = await generateMp3(text);
      if (!mp3) {
        console.error(`❌ ${sign.id}/${edition} — échec Mistral TTS`);
        failed++;
        continue;
      }

      try {
        await storageUpload(path, mp3);
        console.log(`✅ ${sign.id}/${edition} — ${(mp3.length / 1024).toFixed(0)} KB uploadés`);
        generated++;
      } catch (err) {
        console.error(`❌ ${sign.id}/${edition} — échec upload:`, err);
        failed++;
      }
    }
  }

  console.log(`\n📊 ${generated} générés  ${skipped} ignorés  ${failed} échoués`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
