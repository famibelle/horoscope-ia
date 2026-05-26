import { config } from 'dotenv';
config(); // Charger les variables d'environnement depuis .env

// Importer les bases de données culturelles
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

// Parser les arguments
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('-v') || args.includes('--verbose'),
  force: args.includes('-f') || args.includes('--force'),
  date: args.find(arg => arg.startsWith('--date='))?.split('=')[1],
};

function logVerbose(message: string, data?: any) {
  if (options.verbose) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`   [${timestamp}] ℹ️  ${message}`, data !== undefined ? data : '');
  }
}

async function fetchRawHoroscope(signEn: string): Promise<string> {
  const res = await fetch(`https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=${signEn}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.horoscope || data.description || '';
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
      max_tokens: 1200,
      messages: [
        { role: 'system', content: MARYSE_SYSTEM },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function saveToLocalFile(today: string, data: Record<string, any>) {
  const fs = await import('fs/promises');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'public', 'data', 'horoscopes');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${today}.json`), JSON.stringify(data, null, 2));
}

export async function generateAllHoroscopes() {
  const today = options.date || todayGuadeloupe();
  const weather = "Temps tropical"; // Météo simplifiée pour le test
  
  console.log(`\n📅 ========== GÉNÉRATION DES HOROSCOPES POUR LE ${today} ==========`);

  const editions: Edition[] = ['nuit', 'matin', 'midi', 'soir'];
  const results: Record<string, any> = {};
  const total = signs.length * editions.length;
  let generated = 0;

  for (const sign of signs) {
    for (const edition of editions) {
      const blobKey = `${today}|${sign.id}|${edition}`;
      console.log(`🔄 [${generated + 1}/${total}] ${sign.id} (${edition})...`);

      const rawText = await fetchRawHoroscope(SIGN_EN[sign.id]);
      const content = await generateWithMistral(sign.id, rawText, weather, edition);

      if (content) {
        results[blobKey] = content;
        generated++;
        console.log(`   ✓ Mistral: OK`);
      } else {
        console.log(`   ❌ Mistral: ÉCHEC`);
      }
    }
  }

  await saveToLocalFile(today, results);
  console.log(`\n✨ ========== TERMINÉ ==========`);
  console.log(`   Générés: ${generated}/${total}\n`);
}

generateAllHoroscopes()
  .then(() => console.log('🎉 Terminé avec succès'))
  .catch(err => console.error('❌ Erreur fatale:', err));
