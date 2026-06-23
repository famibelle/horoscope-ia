/**
 * Génère une fiche culturelle statique (~700 mots) pour chacun des 12 signes.
 * Contenu éditorial encyclopédique (pas un horoscope) — indexé par Google.
 * Résultat dans lib/fiches-culturelles.json (versionné, aucun appel runtime).
 *
 * Usage :
 *   npx tsx scripts/generate-fiches-culturelles.ts [--signs=lion,belier]
 */
import 'dotenv/config';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { signs } from '@/lib/signs-data';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const OUT_PATH = resolve(process.cwd(), 'lib/fiches-culturelles.json');

const SYSTEM = `Tu es rédacteur encyclopédique spécialisé dans la culture guadeloupéenne et l'astrologie créole. Tu rédiges des fiches culturelles rigoureuses, engageantes et documentées pour un site web grand public.

Ta voix est celle d'un éditorialiste qui connaît intimement la Guadeloupe : ses plantes, ses animaux, ses lieux, ses traditions. Tu peux citer des faits historiques, des noms de lieux précis, des pratiques ancestrales. Tu n'inventes pas, tu transmets.

Format de réponse : un objet JSON avec ces 4 clés exactes :
{
  "symbolique": "...",
  "animal_totem": "...",
  "plante_sacree": "...",
  "lieu_ancestral": "..."
}

IMPÉRATIF : chaque section fait entre 180 et 250 mots. Ton encyclopédique mais accessible. Aucun markdown dans les valeurs JSON. Total : 700-900 mots.`;

function buildPrompt(sign: (typeof signs)[0]): string {
  return `Rédige la fiche culturelle du signe ${sign.name} (${sign.dateRange}) dans l'astrologie créole guadeloupéenne.

Données culturelles à intégrer :
- Élément : ${sign.element}, planète gouvernante : ${sign.planet}
- Nom créole du signe : "${sign.nomKreyol}"
- Animal totem : ${sign.faune.nom_creole} (${sign.faune.nom_commun}) — ${sign.faune.savoir}
- Plante sacrée : ${sign.flore.nom_creole} (${sign.flore.nom_commun}) — ${sign.flore.savoir}
- Lieu ancestral : ${sign.lieu} — ${sign.lieuDetails.description}. Symbolique : ${sign.lieuDetails.symbolique}

Rédige les 4 sections :

1. "symbolique" : La personnalité et la symbolique du signe ${sign.name} dans la culture créole guadeloupéenne. Comment ce signe est-il perçu dans la tradition populaire de l'île ? Quelles figures historiques ou mythologiques guadeloupéennes incarnent ses qualités ? Lien avec l'élément ${sign.element} et la planète ${sign.planet} dans la cosmologie caribéenne.

2. "animal_totem" : L'${sign.faune.nom_creole} (${sign.faune.nom_commun}) dans la nature et la culture guadeloupéenne. Son habitat, ses comportements remarquables, son rôle écologique. Ce que les anciens lui attribuaient comme pouvoirs ou présages. Comment cet animal reflète les qualités du signe ${sign.name}.

3. "plante_sacree" : Le ${sign.flore.nom_creole} (${sign.flore.nom_commun}) dans la pharmacopée et le jardin créoles. Ses usages médicinaux traditionnels, ses propriétés, la façon de le préparer selon les savoirs ancestraux. Son lien avec la spiritualité guadeloupéenne et le signe ${sign.name}.

4. "lieu_ancestral" : ${sign.lieu} en Guadeloupe — son histoire, sa géographie précise, ce qui le rend spirituellement significatif. Les pratiques ou rituels qui y sont associés. Pourquoi ce lieu résonne avec l'énergie du signe ${sign.name}.`;
}

async function generateFiche(sign: (typeof signs)[0], apiKey: string): Promise<Record<string, string>> {
  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: buildPrompt(sign) },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral ${res.status}: ${err}`);
  }

  const data = await res.json() as { choices: { message: { content: string } }[] };
  return JSON.parse(data.choices[0].message.content) as Record<string, string>;
}

async function main() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) { console.error('❌ MISTRAL_API_KEY manquant'); process.exit(1); }

  const signsArg = process.argv.find(a => a.startsWith('--signs='));
  const requested = signsArg ? signsArg.replace('--signs=', '').split(',') : null;
  const targets = requested ? signs.filter(s => requested.includes(s.id)) : signs;

  const existing: Record<string, Record<string, string>> = existsSync(OUT_PATH)
    ? JSON.parse(readFileSync(OUT_PATH, 'utf-8'))
    : {};

  const result = { ...existing };

  console.log(`\n🌿 Génération de ${targets.length} fiches culturelles…\n`);

  for (const sign of targets) {
    try {
      console.log(`  → ${sign.name}…`);
      result[sign.id] = await generateFiche(sign, apiKey);
      console.log(`  ✓ ${sign.name}`);
    } catch (e) {
      console.error(`  ✗ ${sign.name}:`, e);
      process.exit(1);
    }
    await new Promise(r => setTimeout(r, 1500));
  }

  writeFileSync(OUT_PATH, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n✅ Fiches écrites dans lib/fiches-culturelles.json\n`);
}

main();
