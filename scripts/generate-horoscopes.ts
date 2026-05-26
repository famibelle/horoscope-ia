// This file was corrupted by the previous editing commands.
// Restoring with the raw LLM response approach as requested.
import { config } from 'dotenv';
config();
import { signs } from '@/lib/signs-data';
import { MARYSE_SYSTEM, buildHoroscopeUserPrompt, type Edition } from '@/lib/private/maryse-prompt';
import { todayGuadeloupe } from '@/lib/edition';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const SIGN_EN: Record<string, string> = {
  belier: 'aries',
  taureau: 'taurus',
  gemeaux: 'gemini',
  cancer: 'cancer',
  lion: 'leo',
  vierge: 'virgo',
  balance: 'libra',
  scorpion: 'scorpio',
  sagittaire: 'sagittarius',
  capricorne: 'capricorn',
  verseau: 'aquarius',
  poissons: 'pisces',
};

async function logRawData(filename: string, prompt: string, response: string) {
  const fs = await import('fs/promises');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'lib', 'private', 'logs');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${filename}_${new Date().toISOString().split('T')[0]}.log`);
  const content = `
--- PROMPT SENT ---
${prompt}
--- RAW RESPONSE ---
${response}
------------------
`;
  await fs.appendFile(filePath, content);
}

async function generateWithMistral(
  signId: string,
  rawText: string,
  weather: string,
  edition: Edition
): Promise<string | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;

  const sign = signs.find((s) => s.id === signId);
  if (!sign) return null;

  const userPrompt = buildHoroscopeUserPrompt(sign, rawText, weather, edition, undefined, undefined);

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      temperature: 0.75,
      max_tokens: 900,
      messages: [
        { role: 'system', content: MARYSE_SYSTEM },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? null;
  
  if (content) await logRawData('generate-horoscopes', userPrompt, content);
  return content;
}

export async function generateAllHoroscopes() {
  const today = todayGuadeloupe();
  const dir = 'public/data/horoscopes';
  const filePath = `${dir}/${today}.json`;
  const fs = await import('fs/promises');
  const path = await import('path');
  await fs.mkdir(path.join(process.cwd(), 'public', dir), { recursive: true });

  const results: Record<string, string> = {};
  const editions: Edition[] = ['nuit', 'matin', 'midi', 'soir'];

  for (const sign of signs) {
    for (const edition of editions) {
        console.log(`🔄 Génération: ${sign.id} (${edition})...`);
        const content = await generateWithMistral(sign.id, "Raw text", "Météo", edition);
        results[`${today}|${sign.id}|${edition}`] = content || "Échec de génération";
    }
  }
  
  await fs.writeFile(path.join(process.cwd(), 'public', filePath), JSON.stringify(results, null, 2));
  console.log('✅ Génération terminée.');
}
