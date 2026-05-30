import { config } from 'dotenv';
config();

import { signs } from '@/lib/signs-data';
import { fauneData } from '@/lib/private/faune-data';
import { floreData } from '@/lib/private/flore-data';
import * as fs from 'fs/promises';
import * as path from 'path';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

const CREOLE_VARIANTS: Record<string, string> = {
  'balizié': 'balisié', 'balizier': 'balisier',
};

function splitTokens(...parts: (string | undefined)[]): string[] {
  return parts
    .flatMap(s => (s || '').split(/[/()\[\]]/g).map(t => t.trim().toLowerCase()))
    .filter(t => t.length >= 3)
    .map(t => CREOLE_VARIANTS[t] ?? t);
}

const SYSTEM = `Tu es un expert de la culture créole guadeloupéenne, de la cosmovision arawak-kalinago et du quimbois.

Tu rédiges la "Dimension spirituelle" d'un signe zodiacal adapté à la Guadeloupe.

RÈGLES ABSOLUES :
- 3 à 4 phrases courtes, ton oral direct, registre spirituel et symbolique
- JAMAIS de référence temporelle : aucun mois, aucune saison, aucun "annuel", "au printemps", "en juillet"
- Cite le nom créole de l'animal ET de la plante/arbre du signe
- Ancre dans la culture locale : Arawaks, Kalinagos, quimbois, résistance, mémoire des ancêtres
- Pas d'astrologie occidentale, pas de métaphores génériques (mer, vent, chemin, racines)
- Cohérence de style avec les autres signes : même densité, même registre
- Maximum 80 mots
- Réponds UNIQUEMENT avec le texte final, sans guillemets ni explication`;

async function generateSpirituel(signData: {
  id: string; name: string;
  animal: string; nomKreyol: string;
  plante: string; arbre: string; lieu: string;
  spirituelActuel: string;
  fauneDimension: string; floreDimension: string;
}): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY manquant');

  const userPrompt = `Signe : ${signData.name}
Animal créole : ${signData.animal} (${signData.nomKreyol})
Plante : ${signData.plante}
Arbre : ${signData.arbre}
Lieu sacré : ${signData.lieu}
Dimension culturelle faune : ${signData.fauneDimension || 'non disponible'}
Dimension culturelle flore : ${signData.floreDimension || 'non disponible'}
Texte actuel (à améliorer) : ${signData.spirituelActuel}

Rédige la nouvelle "Dimension spirituelle" pour ce signe.`;

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      temperature: 0.7,
      max_tokens: 150,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Mistral error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

async function main() {
  const results: Record<string, { actuel: string; draft: string }> = {};

  // Charger le draft existant pour ne pas régénérer les succès
  let existing: Record<string, any> = {};
  try {
    const outPath = path.join(process.cwd(), 'scripts', 'spirituel-draft.json');
    existing = JSON.parse(await fs.readFile(outPath, 'utf-8'));
  } catch {}

  for (const sign of signs) {
    if (existing[sign.id]?.draft && existing[sign.id].draft !== 'ERREUR') {
      console.log(`⏭️  ${sign.name} — déjà généré`);
      results[sign.id] = existing[sign.id];
      continue;
    }
    const animalTokens = splitTokens(sign.animal, sign.nomKreyol);
    const planteTokens = splitTokens(sign.plante);

    const faune = fauneData.filter(f => {
      const nom = f.nomCreole.toLowerCase();
      const fr = (f.nomFrancais || '').toLowerCase();
      return animalTokens.some(t => nom.includes(t) || fr.includes(t));
    }).slice(0, 2);

    const flore = floreData.filter(f => {
      const nom = f.nomCreole.toLowerCase();
      const fr = f.nomFrancais.toLowerCase();
      return planteTokens.some(t => nom.includes(t) || fr.includes(t));
    }).slice(0, 2);

    const signData = {
      id: sign.id, name: sign.name,
      animal: sign.animal, nomKreyol: sign.nomKreyol,
      plante: sign.plante, arbre: sign.arbre, lieu: sign.lieu,
      spirituelActuel: sign.spirituel,
      fauneDimension: faune.map(f => f.dimensionCulturelle).join(' | '),
      floreDimension: flore.map(f => f.dimensionCulturelle).join(' | '),
    };

    console.log(`🔄 Génération ${sign.name}...`);
    await new Promise(r => setTimeout(r, 8000));

    try {
      const draft = await generateSpirituel(signData);
      results[sign.id] = { actuel: sign.spirituel, draft };
      console.log(`✅ ${sign.name}: "${draft.substring(0, 80)}..."`);
    } catch (e) {
      console.error(`❌ ${sign.name}:`, e);
      results[sign.id] = { actuel: sign.spirituel, draft: 'ERREUR' };
    }
  }

  const outPath = path.join(process.cwd(), 'scripts', 'spirituel-draft.json');
  await fs.writeFile(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n📄 Draft écrit dans scripts/spirituel-draft.json`);
}

main().catch(console.error);
