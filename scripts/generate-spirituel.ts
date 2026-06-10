import { config } from 'dotenv';
config();

import { signs } from '@/lib/signs-data';
import { fauneData } from '@/lib/private/faune-data';
import { floreData } from '@/lib/private/flore-data';
import { lieuxData } from '@/lib/private/lieux-data';
import { kreyolData } from '@/lib/private/kreyol-data';
import { histoireData } from '@/lib/private/histoire-data';
import { MARYSE_AME, MARYSE_IDENTITE, INSTRUCTIONS_GENERALES } from '@/lib/private/maryse-prompt';
import { SIGN_TO_LOA, SIGN_TO_VAUDOU_CONTEXT, getVaudouContextForSign } from '@/lib/private/vaudou-mappings';
import { loasData } from '@/lib/private/vaudou-data';
import * as fs from 'fs/promises';
import * as path from 'path';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

const SYSTEM = `${MARYSE_AME}

${MARYSE_IDENTITE}

${INSTRUCTIONS_GENERALES}

Tu rédiges la "Dimension spirituelle" d'un signe zodiacal pour Horoscope Karukera.

LANGUE OBLIGATOIRE : Français. Quelques mots créoles essentiels peuvent être intégrés (noms d'animaux, de plantes, de lieux) mais jamais plus d'un mot créole par phrase. JAMAIS de texte entièrement en créole.

FORMAT DE SORTIE : texte brut, 3 à 4 phrases, 60 à 80 mots. Pas de guillemets, pas de titre, pas de formule introductive.

RÈGLES ABSOLUES :
- Cite le nom créole de l'animal ET de la plante/arbre du signe (une fois chacun)
- Ancre dans la culture locale : Arawaks, Kalinagos, quimbois, résistance, mémoire des ancêtres
- Intègre le loa du signe de façon subtile (une seule fois)
- JAMAIS de référence temporelle (mois, saison, "mensuel", "annuel")
- INTERDIT comme métaphores génériques : mer, vent, chemin, racines, danse, vague
- Pas d'astrologie occidentale
- Ton oral direct, phrases courtes, parle à l'auditeur avec "tu"
- Réponds UNIQUEMENT avec le texte final`;

function splitTokens(...parts: (string | undefined)[]): string[] {
  return parts
    .flatMap(s => (s || '').split(/[/()\[\]]/g).map(t => t.trim().toLowerCase()))
    .filter(t => t.length >= 3);
}

function currentMonth(): string {
  const arg = process.argv.find(a => a.startsWith('--month='));
  return arg ? arg.slice('--month='.length) : new Date().toISOString().slice(0, 7);
}

async function generateSpirituel(signData: {
  id: string; name: string;
  animal: string; nomKreyol: string;
  plante: string; arbre: string; lieu: string;
  spirituelActuel: string;
  fauneDimension: string; floreDimension: string;
  lieuDimension: string;
  loa: string; famille: string; energie: string; couleurs: string[];
  loaDimension: string;
  kreyolSymbols: string;
  histoireFait: string;
}): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY manquant');

  const userPrompt = `SIGNE : ${signData.name}
Animal créole : ${signData.animal} (${signData.nomKreyol})${signData.fauneDimension ? ` — ${signData.fauneDimension}` : ''}
Plante : ${signData.plante}${signData.floreDimension ? ` — ${signData.floreDimension}` : ''}
Arbre : ${signData.arbre}
Lieu sacré : ${signData.lieu}${signData.lieuDimension ? ` — ${signData.lieuDimension}` : ''}
Loa vaudou : ${signData.loa} (${signData.famille}) — Énergie : ${signData.energie}${signData.loaDimension ? ` — ${signData.loaDimension}` : ''}
Couleurs sacrées : ${signData.couleurs.join(', ')}
Symboles de résistance : ${signData.kreyolSymbols}
${signData.histoireFait ? `Résonance historique : ${signData.histoireFait}` : ''}
Texte de référence (style uniquement) : ${signData.spirituelActuel}

Rédige la "Dimension spirituelle" en français dans la voix de Maryse CondAI.`;

  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      temperature: 0.7,
      max_tokens: 180,
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
  const month = currentMonth();
  const outPath = path.join(process.cwd(), 'public', 'data', 'spirituels', `${month}.json`);

  let existing: Record<string, string> = {};
  try {
    existing = JSON.parse(await fs.readFile(outPath, 'utf-8'));
  } catch {}

  const results: Record<string, string> = { ...existing };

  for (const sign of signs) {
    if (results[sign.id] && results[sign.id] !== 'ERREUR') {
      console.log(`⏭️  ${sign.name} — déjà généré`);
      continue;
    }

    const animalTokens = splitTokens(sign.animal, sign.nomKreyol);
    const planteTokens = splitTokens(sign.plante);

    const faune = fauneData.filter(f => {
      const nom = f.nomCreole.toLowerCase();
      const fr = (f.nomFrancais || '').toLowerCase();
      return animalTokens.some(t => nom.includes(t) || fr.includes(t));
    }).slice(0, 1);

    const flore = floreData.filter(f => {
      const nom = f.nomCreole.toLowerCase();
      const fr = f.nomFrancais.toLowerCase();
      return planteTokens.some(t => nom.includes(t) || fr.includes(t));
    }).slice(0, 1);

    const lieu = lieuxData.filter(l =>
      l.nom.toLowerCase().includes(sign.lieu.toLowerCase()) ||
      sign.lieu.toLowerCase().includes(l.nom.toLowerCase())
    ).slice(0, 1);

    const loaName = SIGN_TO_LOA[sign.id] || '';
    const vaudouCtx = SIGN_TO_VAUDOU_CONTEXT[sign.id];
    const loaEntry = loasData.filter(l =>
      l.nomCreole.toLowerCase().includes(loaName.toLowerCase())
    ).slice(0, 1)[0];

    const kreyolMatches = kreyolData.filter(k => {
      const nom = k.nomCreole.toLowerCase();
      return animalTokens.some(t => nom.includes(t)) || planteTokens.some(t => nom.includes(t));
    }).slice(0, 2);
    const kreyolFallback = kreyolData.filter(k =>
      k.typeResistance && !kreyolMatches.some(m => m.id === k.id)
    ).slice(0, 2);
    const kreyolPool = kreyolMatches.length > 0 ? kreyolMatches : kreyolFallback;

    const histoireEntry = histoireData.filter(h =>
      h.tags?.some(t => t.toLowerCase().includes('résistance') || t.toLowerCase().includes('arawak') || t.toLowerCase().includes('kalinago'))
    ).slice(0, 1)[0];

    const signData = {
      id: sign.id, name: sign.name,
      animal: sign.animal, nomKreyol: sign.nomKreyol,
      plante: sign.plante, arbre: sign.arbre, lieu: sign.lieu,
      spirituelActuel: sign.spirituel,
      fauneDimension: faune[0]?.dimensionCulturelle || '',
      floreDimension: flore[0]?.dimensionCulturelle || '',
      lieuDimension: lieu[0]?.dimensionCulturelle || '',
      loa: loaName,
      famille: getVaudouContextForSign(sign.id).famille,
      energie: vaudouCtx?.energie || '',
      couleurs: vaudouCtx?.couleurs || [],
      loaDimension: loaEntry?.dimensionCulturelle?.split('.')[0] || '',
      kreyolSymbols: kreyolPool.map(k => `${k.nomCreole} (${k.nomFrancais})`).join(', '),
      histoireFait: histoireEntry?.faitHistorique?.split('.')[0] || '',
    };

    console.log(`🔄 Génération ${sign.name}...`);
    await new Promise(r => setTimeout(r, 8000));

    try {
      const draft = await generateSpirituel(signData);
      results[sign.id] = draft;
      console.log(`✅ ${sign.name}: "${draft.substring(0, 80)}..."`);
    } catch (e) {
      console.error(`❌ ${sign.name}:`, e);
      results[sign.id] = 'ERREUR';
    }

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(results, null, 2), 'utf-8');
  }

  console.log(`\n✅ Dimension spirituelle ${month} écrite dans public/data/spirituels/${month}.json`);
}

main().catch(console.error);
