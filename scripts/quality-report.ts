#!/usr/bin/env npx tsx
/**
 * Rapport qualité 7 jours glissants
 * Pass 1 : analyse structurelle (répétitions faune/flore/lieux/histoires, champs vides)
 * Pass 2 : analyse sémantique Mistral (tournures, fautes, qualité créole)
 */

import * as fs from 'fs/promises';
import * as path from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL       = process.env.SUPABASE_URL!;
const SUPABASE_KEY       = process.env.SUPABASE_SERVICE_KEY!;
const MISTRAL_API_KEY    = process.env.MISTRAL_API_KEY!;
const MISTRAL_URL        = 'https://api.mistral.ai/v1/chat/completions';
const MIN_FIELD_LENGTH   = 80;
const OPENING_WORDS      = 10;
const SEMANTIC_SAMPLE    = 20;
const REP_THRESHOLD      = 3;  // ≥N signes = alerte répétition
const LOA_THRESHOLD      = 4;

// ─── Types ───────────────────────────────────────────────────────────────────

interface HoroscopeRow {
  date: string;
  sign_id: string;
  edition: string;
  ouverture: string;
  amour: string;
  travail: string;
  argent: string;
  amitie: string;
  prediction: string;
  conseil: string;
  teaser: string;
  loa: string | null;
  faune_enrichies: string[] | null;
  flore_enrichies: string[] | null;
  lieux_enrichis: string[] | null;
  histoire_enrichies: string[] | null;
}

interface AmbianceRow {
  date: string;
  sign_id: string;
  edition: string;
  ambiance: string;
  loa: string | null;
}

interface PresageRow {
  date: string;
  type: string;
  nom_creole: string;
}

interface Alert {
  level: 'warning' | 'info';
  category: string;
  message: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function last7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

async function queryRest(table: string, params: Record<string, string>): Promise<any[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.append(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase query [${table}] ${res.status}: ${text}`);
  }
  return res.json();
}

function firstWords(text: string, n: number): string {
  return (text ?? '').split(/\s+/).slice(0, n).join(' ').toLowerCase();
}

async function callMistral(prompt: string): Promise<string> {
  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MISTRAL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      temperature: 0.2,
      max_tokens: 2500,
      messages: [
        {
          role: 'system',
          content:
            'Tu es un relecteur expert en créole guadeloupéen et en français. ' +
            'Tu analyses des textes horoscopiques générés par IA pour détecter des problèmes de qualité. ' +
            'Sois précis, cite les passages exacts, et donne des suggestions concrètes.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Mistral ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ─── Pass 1 : Horoscopes ─────────────────────────────────────────────────────

function analyzeHoroscopes(rows: HoroscopeRow[]): { alerts: Alert[]; md: string } {
  const alerts: Alert[] = [];
  const md: string[] = ['## 🪐 Horoscopes\n'];

  // Grouper par date+édition pour détecter les répétitions inter-signes
  const byDateEdition = new Map<string, HoroscopeRow[]>();
  for (const row of rows) {
    const key = `${row.date}|${row.edition}`;
    if (!byDateEdition.has(key)) byDateEdition.set(key, []);
    byDateEdition.get(key)!.push(row);
  }

  const fauneRows: string[]    = [];
  const floreRows: string[]    = [];
  const lieuxRows: string[]    = [];
  const histoireRows: string[] = [];
  const loaRows: string[]      = [];
  const ouvertureRows: string[] = [];

  const TH4 = '| Date | Édition | Élément | Signes |';
  const SEP4 = '|------|---------|---------|--------|';

  for (const [key, group] of byDateEdition) {
    const [date, edition] = key.split('|');

    // Répétitions faune
    const fauneMap = new Map<string, string[]>();
    for (const r of group) {
      for (const f of r.faune_enrichies ?? []) {
        if (!fauneMap.has(f)) fauneMap.set(f, []);
        fauneMap.get(f)!.push(r.sign_id);
      }
    }
    for (const [animal, signs] of fauneMap) {
      if (signs.length >= REP_THRESHOLD) {
        fauneRows.push(`| ${date} | ${edition} | **${animal}** | ${signs.join(', ')} |`);
        alerts.push({ level: 'warning', category: 'Faune', message: `"${animal}" injecté chez ${signs.length} signes le ${date} (${edition})` });
      }
    }

    // Répétitions flore
    const floreMap = new Map<string, string[]>();
    for (const r of group) {
      for (const f of r.flore_enrichies ?? []) {
        if (!floreMap.has(f)) floreMap.set(f, []);
        floreMap.get(f)!.push(r.sign_id);
      }
    }
    for (const [plante, signs] of floreMap) {
      if (signs.length >= REP_THRESHOLD) {
        floreRows.push(`| ${date} | ${edition} | **${plante}** | ${signs.join(', ')} |`);
        alerts.push({ level: 'warning', category: 'Flore', message: `"${plante}" injectée chez ${signs.length} signes le ${date} (${edition})` });
      }
    }

    // Répétitions lieux sacrés
    const lieuxMap = new Map<string, string[]>();
    for (const r of group) {
      for (const l of r.lieux_enrichis ?? []) {
        if (!lieuxMap.has(l)) lieuxMap.set(l, []);
        lieuxMap.get(l)!.push(r.sign_id);
      }
    }
    for (const [lieu, signs] of lieuxMap) {
      if (signs.length >= REP_THRESHOLD) {
        lieuxRows.push(`| ${date} | ${edition} | **${lieu}** | ${signs.join(', ')} |`);
        alerts.push({ level: 'warning', category: 'Lieux', message: `"${lieu}" injecté chez ${signs.length} signes le ${date} (${edition})` });
      }
    }

    // Répétitions histoires
    const histoireMap = new Map<string, string[]>();
    for (const r of group) {
      for (const h of r.histoire_enrichies ?? []) {
        if (!histoireMap.has(h)) histoireMap.set(h, []);
        histoireMap.get(h)!.push(r.sign_id);
      }
    }
    for (const [h, signs] of histoireMap) {
      if (signs.length >= REP_THRESHOLD) {
        histoireRows.push(`| ${date} | ${edition} | **${h}** | ${signs.join(', ')} |`);
        alerts.push({ level: 'warning', category: 'Histoires', message: `Histoire "${h}" dans ${signs.length} signes le ${date} (${edition})` });
      }
    }

    // Répétitions loa
    const loaMap = new Map<string, string[]>();
    for (const r of group) {
      if (r.loa) {
        if (!loaMap.has(r.loa)) loaMap.set(r.loa, []);
        loaMap.get(r.loa)!.push(r.sign_id);
      }
    }
    for (const [loa, signs] of loaMap) {
      if (signs.length >= LOA_THRESHOLD) {
        loaRows.push(`| ${date} | ${edition} | **${loa}** | ${signs.join(', ')} |`);
        alerts.push({ level: 'warning', category: 'Loa', message: `Loa "${loa}" répété chez ${signs.length} signes le ${date} (${edition})` });
      }
    }

    // Phrases d'ouverture similaires (premiers 10 mots)
    const ouvertureMap = new Map<string, string[]>();
    for (const r of group) {
      const key2 = firstWords(r.ouverture, OPENING_WORDS);
      if (key2.length > 20) {
        if (!ouvertureMap.has(key2)) ouvertureMap.set(key2, []);
        ouvertureMap.get(key2)!.push(r.sign_id);
      }
    }
    for (const [phrase, signs] of ouvertureMap) {
      if (signs.length >= 2) {
        ouvertureRows.push(`| ${date} | ${edition} | "${phrase}…" | ${signs.join(', ')} |`);
        alerts.push({ level: 'warning', category: 'Ouverture', message: `Phrase d'ouverture similaire chez ${signs.length} signes le ${date} (${edition})` });
      }
    }
  }

  // Champs vides ou trop courts
  const shortRows: string[] = [];
  const FIELDS = ['ouverture', 'amour', 'travail', 'argent', 'amitie', 'prediction'] as const;
  for (const r of rows) {
    for (const field of FIELDS) {
      const val = r[field] ?? '';
      if (val.length < MIN_FIELD_LENGTH) {
        shortRows.push(`| ${r.date} | ${r.sign_id} | ${r.edition} | \`${field}\` | ${val.length} |`);
        alerts.push({ level: 'warning', category: 'Champ court', message: `\`${field}\` trop court (${val.length} chars) — ${r.sign_id} ${r.date} ${r.edition}` });
      }
    }
  }

  if (fauneRows.length) {
    md.push('### 🦎 Répétitions faune\n', TH4, SEP4, ...fauneRows, '');
  }
  if (floreRows.length) {
    md.push('### 🌿 Répétitions flore\n', TH4, SEP4, ...floreRows, '');
  }
  if (lieuxRows.length) {
    md.push('### 🏔️ Répétitions lieux sacrés\n', TH4, SEP4, ...lieuxRows, '');
  }
  if (histoireRows.length) {
    md.push('### 📜 Répétitions histoires\n', TH4, SEP4, ...histoireRows, '');
  }
  if (loaRows.length) {
    md.push('### 🌀 Répétitions loa\n', TH4, SEP4, ...loaRows, '');
  }
  if (ouvertureRows.length) {
    md.push(
      '### 📝 Phrases d\'ouverture similaires\n',
      '| Date | Édition | Début (10 mots) | Signes |',
      '|------|---------|-----------------|--------|',
      ...ouvertureRows, '',
    );
  }
  if (shortRows.length) {
    md.push(
      '### ⚠️ Champs vides ou trop courts\n',
      '| Date | Signe | Édition | Champ | Longueur |',
      '|------|-------|---------|-------|----------|',
      ...shortRows, '',
    );
  }

  const total = fauneRows.length + floreRows.length + lieuxRows.length +
    histoireRows.length + loaRows.length + ouvertureRows.length + shortRows.length;
  if (total === 0) md.push('✅ Aucune alerte structurelle détectée.\n');

  return { alerts, md: md.join('\n') };
}

// ─── Pass 1 : Ambiances ───────────────────────────────────────────────────────

function analyzeAmbiances(rows: AmbianceRow[]): { alerts: Alert[]; md: string } {
  const alerts: Alert[] = [];
  const md: string[] = ['## 🌈 Ambiances\n'];

  const byDateEdition = new Map<string, AmbianceRow[]>();
  for (const row of rows) {
    const key = `${row.date}|${row.edition}`;
    if (!byDateEdition.has(key)) byDateEdition.set(key, []);
    byDateEdition.get(key)!.push(row);
  }

  const loaRows: string[]      = [];
  const ambianceRows: string[] = [];

  const TH4  = '| Date | Édition | Élément | Signes |';
  const SEP4 = '|------|---------|---------|--------|';

  for (const [key, group] of byDateEdition) {
    const [date, edition] = key.split('|');

    // Loa répété
    const loaMap = new Map<string, string[]>();
    for (const r of group) {
      if (r.loa) {
        if (!loaMap.has(r.loa)) loaMap.set(r.loa, []);
        loaMap.get(r.loa)!.push(r.sign_id);
      }
    }
    for (const [loa, signs] of loaMap) {
      if (signs.length >= LOA_THRESHOLD) {
        loaRows.push(`| ${date} | ${edition} | **${loa}** | ${signs.join(', ')} |`);
        alerts.push({ level: 'warning', category: 'Ambiance Loa', message: `Loa "${loa}" répété chez ${signs.length} signes (ambiance) le ${date} (${edition})` });
      }
    }

    // Texte d'ambiance similaire (15 premiers mots)
    const ambiMap = new Map<string, string[]>();
    for (const r of group) {
      const key2 = firstWords(r.ambiance, 15);
      if (!ambiMap.has(key2)) ambiMap.set(key2, []);
      ambiMap.get(key2)!.push(r.sign_id);
    }
    for (const [phrase, signs] of ambiMap) {
      if (signs.length >= 2) {
        ambianceRows.push(`| ${date} | ${edition} | "${phrase}…" | ${signs.join(', ')} |`);
        alerts.push({ level: 'warning', category: 'Ambiance texte', message: `Ambiance similaire chez ${signs.length} signes le ${date} (${edition})` });
      }
    }
  }

  if (loaRows.length) md.push('### 🌀 Répétitions loa\n', TH4, SEP4, ...loaRows, '');
  if (ambianceRows.length) {
    md.push(
      '### 📝 Ambiances similaires\n',
      '| Date | Édition | Début (15 mots) | Signes |',
      '|------|---------|-----------------|--------|',
      ...ambianceRows, '',
    );
  }
  if (!loaRows.length && !ambianceRows.length) md.push('✅ Aucune alerte structurelle détectée.\n');

  return { alerts, md: md.join('\n') };
}

// ─── Pass 1 : Présages ────────────────────────────────────────────────────────

function analyzePresages(rows: PresageRow[]): { alerts: Alert[]; md: string } {
  const alerts: Alert[] = [];
  const md: string[] = ['## 🌱 Présages du jour\n'];

  // Répétition nom_creole sur 7 jours
  const nomMap = new Map<string, string[]>();
  const typeCount = new Map<string, number>();
  for (const r of rows) {
    if (!nomMap.has(r.nom_creole)) nomMap.set(r.nom_creole, []);
    nomMap.get(r.nom_creole)!.push(r.date);
    typeCount.set(r.type, (typeCount.get(r.type) ?? 0) + 1);
  }

  const nomRows: string[] = [];
  for (const [nom, dates] of nomMap) {
    if (dates.length >= 2) {
      nomRows.push(`| **${nom}** | ${dates.join(', ')} |`);
      alerts.push({ level: 'warning', category: 'Présage nom', message: `"${nom}" utilisé ${dates.length}× sur 7 jours` });
    }
  }

  if (nomRows.length) {
    md.push('### 🔁 Éléments répétés\n', '| Élément | Dates |', '|---------|-------|', ...nomRows, '');
  }

  const floreN = typeCount.get('flore') ?? 0;
  const fauneN = typeCount.get('faune') ?? 0;
  md.push(`### 📊 Distribution type\n\n- 🌿 Flore : ${floreN}/7\n- 🦎 Faune : ${fauneN}/7\n`);

  if (floreN === 0 || fauneN === 0) {
    alerts.push({ level: 'info', category: 'Présage type', message: `Déséquilibre flore/faune (${floreN}/${fauneN}) sur 7 jours` });
    md.push(`> ℹ️ Déséquilibre : ${floreN} flore / ${fauneN} faune sur 7 jours.\n`);
  }

  if (!nomRows.length && floreN > 0 && fauneN > 0) md.push('✅ Aucune alerte structurelle détectée.\n');

  return { alerts, md: md.join('\n') };
}

// ─── Pass 0 : Analyse du Prompt ──────────────────────────────────────────────

async function analyzePrompt(date: string): Promise<string> {
  const md: string[] = ['## 🔬 Analyse du Master Prompt\n'];

  try {
    const [year, month] = date.split('-');
    const moisNom = new Date(date).toLocaleString('fr-FR', { month: 'long' });

    const { SIGN_TO_LOA }    = await import('@/lib/private/vaudou-mappings');
    const { histoireData }   = await import('@/lib/private/histoire-data');
    const { fauneData }      = await import('@/lib/private/faune-data');
    const { floreData }      = await import('@/lib/private/flore-data');
    const { lieuxData }      = await import('@/lib/private/lieux-data');
    const { signs }          = await import('@/lib/signs-data');

    // ── 1. Loas partagés entre signes ─────────────────────────────────────
    const loaToSigns = new Map<string, string[]>();
    for (const [signId, loa] of Object.entries(SIGN_TO_LOA)) {
      if (!loaToSigns.has(loa)) loaToSigns.set(loa, []);
      loaToSigns.get(loa)!.push(signId);
    }
    const sharedLoas = [...loaToSigns.entries()]
      .filter(([, s]) => s.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    md.push('### 🌀 Loas partagés entre signes\n');
    md.push('> Un même loa injecté chez plusieurs signes le même jour garantit une répétition si le seuil est atteint.\n');
    md.push('| Loa | Nb signes | Signes |');
    md.push('|-----|-----------|--------|');
    for (const [loa, signIds] of sharedLoas) {
      const flag = signIds.length >= LOA_THRESHOLD ? '⚠️' : 'ℹ️';
      md.push(`| **${loa}** | ${flag} ${signIds.length} | ${signIds.join(', ')} |`);
    }
    md.push('');

    // ── 2. Pool histoire pour la période courante ─────────────────────────
    function isLongPeriod(p: string) { return /\b\d{4}\s*[-–—]\s*\d{4}\b/.test(p); }
    const histoirePool = histoireData.filter((h: any) =>
      !isLongPeriod(h.periode) && (
        h.periode.includes(year) ||
        h.periode.includes(moisNom) ||
        h.periode.includes(month)
      )
    );

    md.push('### 📜 Pool Histoire pour la période\n');
    md.push(`> \`histoireEnrichies\` est injecté **sans rotation par signe** (même 3 entrées pour les 12 signes).\n`);
    md.push(`**${histoirePool.length} entrée(s)** correspondent à la période ${moisNom} ${year} :\n`);
    if (histoirePool.length === 0) {
      md.push('> ⚠️ Aucune entrée histoire pour cette période — le champ sera vide pour tous les signes.\n');
    } else {
      md.push('| # | Période | Fait historique (début) |');
      md.push('|---|---------|------------------------|');
      histoirePool.slice(0, 10).forEach((h: any, i: number) => {
        const flag = i < 3 ? '🔴' : '⚪'; // Les 3 premières sont injectées (.slice(0,3))
        md.push(`| ${flag} ${i + 1} | ${h.periode} | ${h.faitHistorique.substring(0, 80)}… |`);
      });
      if (histoirePool.length > 3) {
        md.push(`\n> 🔴 = injectée chez **tous les signes** (les ${Math.min(3, histoirePool.length)} premières du slice)\n`);
      }
    }
    md.push('');

    // ── 3. Pool faune SACRÉ/EMBLÉMATIQUE ─────────────────────────────────
    const FAUNE_EXCLUES = new Set(['soukougnan-myt', 'rat-nw-rat']);
    const faunePool = fauneData.filter((f: any) => {
      if (FAUNE_EXCLUES.has(f.id)) return false;
      const sacre = (f.sacreSymbolique || '').toUpperCase();
      return sacre.includes('SACRÉ') || sacre.includes('EMBLÉMATIQUE') || sacre.includes('EMBLEMATIQUE');
    });

    // Calculer combien d'entrées distinctes sont disponibles par signe (pool après exclusion du totem)
    const poolPerSign = signs.map((sign: any) => {
      const animalTokens = (sign.animal || '').toLowerCase().split(/[\s\-\/()]+/).filter((t: string) => t.length >= 3);
      const kreyolTokens = (sign.nomKreyol || '').toLowerCase().split(/[\s\-\/()]+/).filter((t: string) => t.length >= 3);
      const allTokens = [...animalTokens, ...kreyolTokens];
      const pool = faunePool.filter((f: any) => {
        const nom = f.nomCreole.toLowerCase();
        const fr  = (f.nomFrancais || '').toLowerCase();
        return !allTokens.some((t: string) => nom.includes(t) || fr.includes(t));
      });
      return { sign: sign.id, poolSize: pool.length };
    });

    const minPool = Math.min(...poolPerSign.map((p: any) => p.poolSize));
    const smallPools = poolPerSign.filter((p: any) => p.poolSize < 8);

    md.push('### 🦎 Pool Faune (SACRÉ/EMBLÉMATIQUE)\n');
    md.push(`**${faunePool.length} entrées** dans le pool global (après exclusions).`);
    md.push(`Le prompt injecte **6 animaux** par signe via rotation déterministe.\n`);

    if (minPool < 8) {
      md.push('> ⚠️ Certains signes ont un pool réduit — collisions possibles entre signes :\n');
      md.push('| Signe | Pool dispo |');
      md.push('|-------|-----------|');
      for (const { sign, poolSize } of smallPools) {
        md.push(`| ${sign} | ${poolSize < 6 ? '🔴' : '⚠️'} ${poolSize} |`);
      }
    } else {
      md.push(`> ✅ Pool suffisant pour tous les signes (min = ${minPool} entrées après exclusion du totem).\n`);
    }
    md.push('');

    // ── 4. Taille des pools flore & lieux ────────────────────────────────
    md.push('### 🌿 Pools Flore & Lieux\n');
    md.push('| Pool | Taille totale | Injecté par signe |');
    md.push('|------|--------------|-------------------|');
    md.push(`| Flore | ${floreData.length} | jusqu'à 8 (filtre par plante du signe) |`);
    md.push(`| Lieux | ${lieuxData.length} | jusqu'à 5 (filtre par lieu du signe) |`);
    md.push('');

    // ── 5. Interdictions actives dans le prompt ────────────────────────
    md.push('### 🚫 Interdictions actives dans le prompt\n');
    md.push('| Catégorie | Interdiction |');
    md.push('|-----------|-------------|');
    md.push('| Sécurité | bougie, flamme, feu, encens |');
    md.push('| Créatures | soukougnan, zombi, loup-garou dans amour/amitie |');
    md.push('| Métaphores génériques | mer, vent, vague, racines, danse, chemin, "laisse-toi porter" |');
    md.push('| Usage créole | "le lajan", "la lajan", "l\'lajan" → "lajan" seul |');
    md.push('| Répétitions internes | totem du signe max 1×, lieu max 1×, loa max 1×, ka max 2× |');
    md.push('');

    // ── 6. Lacunes identifiées ────────────────────────────────────────
    md.push('### ⚠️ Lacunes structurelles identifiées\n');
    const lacunes: string[] = [];

    lacunes.push('**Pas de contrainte inter-signes** : le modèle génère chaque signe en isolation et ne sait pas ce que les autres signes ont reçu — impossibilité de se diversifier mutuellement.');

    if (histoirePool.length <= 3) {
      lacunes.push(`**Pool histoire trop petit** (${histoirePool.length} entrée(s) pour ${moisNom} ${year}) : tous les signes reçoivent les mêmes références historiques.`);
    } else {
      lacunes.push(`**histoireEnrichies sans rotation par signe** : les 3 premières entrées du pool (sur ${histoirePool.length}) sont injectées identiquement chez tous les signes — ajouter \`rotateBySignDate()\` comme pour faune.`);
    }

    const sharedLoaWarnings = sharedLoas.filter(([, s]) => s.length >= LOA_THRESHOLD);
    if (sharedLoaWarnings.length > 0) {
      lacunes.push(`**${sharedLoaWarnings.length} loa(s) partagé(s) entre ${LOA_THRESHOLD}+ signes** : ${sharedLoaWarnings.map(([l]) => l).join(', ')} — répétition structurellement inévitable dans les rapports.`);
    }

    lacunes.forEach(l => md.push(`- ${l}\n`));

  } catch (e) {
    md.push(`> ⚠️ Données privées indisponibles — analyse du prompt ignorée (${e instanceof Error ? e.message : e}).\n`);
  }

  return md.join('\n');
}

// ─── Pass 2 : Sémantique (Mistral) ───────────────────────────────────────────

async function semanticPass(horoscopes: HoroscopeRow[]): Promise<string> {
  if (!MISTRAL_API_KEY) return '> ⚠️ `MISTRAL_API_KEY` absent — analyse sémantique ignorée.\n';

  // Échantillon aléatoire
  const sample = [...horoscopes]
    .sort(() => Math.random() - 0.5)
    .slice(0, SEMANTIC_SAMPLE);

  const excerpts = sample
    .map(h => `[${h.sign_id} · ${h.edition} · ${h.date}]\nOuverture: ${h.ouverture}\nPrédiction: ${h.prediction}`)
    .join('\n\n---\n\n');

  const prompt = `Analyse ces ${sample.length} extraits d'horoscopes guadeloupéens générés par IA.
Porte une attention particulière aux :
- Répétitions de tournures narratives (même structure de phrase, même métaphore)
- Répétitions de faune, flore, lieux sacrés, histoires entre signes
- Métaphores trop génériques (pas assez caribéennes)
- Fautes d'orthographe et de grammaire française
- Qualité et authenticité du créole guadeloupéen

${excerpts}

Structure ta réponse en markdown :
1. Un tableau des problèmes trouvés (signe · édition · type · citation · suggestion)
2. Un **score qualité global /10**
3. Les 3 axes d'amélioration prioritaires`;

  return callMistral(prompt);
}

// ─── Sauvegarde Supabase ──────────────────────────────────────────────────────

async function saveToSupabase(
  reportMd: string,
  periodStart: string,
  periodEnd: string,
  summary: object,
): Promise<void> {
  const { upsertRest } = await import('@/lib/supabase-rest');
  await upsertRest(
    'quality_reports',
    {
      generated_at: new Date().toISOString(),
      period_start: periodStart,
      period_end: periodEnd,
      report_markdown: reportMd,
      summary,
    },
    'generated_at',
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Rapport qualité 7 jours glissants\n');

  const dates       = last7Days();
  const periodStart = dates[0] < '2026-06-01' ? '2026-06-01' : dates[0];
  const periodEnd   = dates[dates.length - 1];
  console.log(`📅 Période : ${periodStart} → ${periodEnd}\n`);

  // Chargement données
  console.log('📥 Chargement Supabase...');
  const [horoscopes, ambiances, presages] = await Promise.all([
    queryRest('horoscopes', {
      date:   `gte.${periodStart}`,
      select: 'date,sign_id,edition,ouverture,amour,travail,argent,amitie,prediction,conseil,teaser,loa,faune_enrichies,flore_enrichies,lieux_enrichis,histoire_enrichies',
      order:  'date.asc',
    }) as Promise<HoroscopeRow[]>,
    queryRest('ambiances', {
      date:   `gte.${periodStart}`,
      select: 'date,sign_id,edition,ambiance,loa',
      order:  'date.asc',
    }) as Promise<AmbianceRow[]>,
    queryRest('presages', {
      date:   `gte.${periodStart}`,
      select: 'date,type,nom_creole',
      order:  'date.asc',
    }) as Promise<PresageRow[]>,
  ]);
  console.log(`   ✅ ${horoscopes.length} horoscopes · ${ambiances.length} ambiances · ${presages.length} présages\n`);

  // Pass 0 : analyse du prompt
  console.log('🔬 Pass 0 — Analyse du master prompt...');
  const promptMd = await analyzePrompt(periodEnd);
  console.log('   ✅ Terminée\n');

  // Pass 1 : structurelle
  console.log('🔧 Pass 1 — Analyse structurelle...');
  const { alerts: horoAlerts, md: horoMd } = analyzeHoroscopes(horoscopes);
  const { alerts: ambAlerts,  md: ambMd  } = analyzeAmbiances(ambiances);
  const { alerts: presAlerts, md: presMd } = analyzePresages(presages);
  const allAlerts = [...horoAlerts, ...ambAlerts, ...presAlerts];
  const warnings  = allAlerts.filter(a => a.level === 'warning').length;
  const infos     = allAlerts.filter(a => a.level === 'info').length;
  console.log(`   ⚠️  ${warnings} alerte(s) · ℹ️  ${infos} info(s)\n`);

  // Pass 2 : sémantique
  console.log('🤖 Pass 2 — Analyse sémantique Mistral...');
  let semanticMd = '';
  try {
    semanticMd = await semanticPass(horoscopes);
    console.log('   ✅ Terminée\n');
  } catch (e) {
    semanticMd = `> ❌ Erreur : ${e instanceof Error ? e.message : e}\n`;
    console.error('   ❌', e);
  }

  // Construction rapport
  const now        = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const statusIcon = warnings === 0 ? '✅' : warnings < 5 ? '⚠️' : '🚨';
  const summary    = {
    horoscopes: horoscopes.length,
    ambiances:  ambiances.length,
    presages:   presages.length,
    alertes_structurelles: warnings,
    infos,
  };

  const report = [
    `# ${statusIcon} Rapport Qualité — 7 jours glissants`,
    `**Période :** ${periodStart} → ${periodEnd}  `,
    `**Généré le :** ${now} UTC`,
    '',
    '---',
    '',
    '## Résumé',
    '',
    '| Métrique | Valeur |',
    '|----------|--------|',
    `| Horoscopes analysés | ${horoscopes.length} |`,
    `| Ambiances analysées | ${ambiances.length} |`,
    `| Présages analysés | ${presages.length} |`,
    `| ⚠️ Alertes structurelles | ${warnings} |`,
    `| ℹ️ Informations | ${infos} |`,
    '',
    '---',
    '',
    '# Pass 0 — Analyse du Master Prompt',
    '',
    promptMd,
    '---',
    '',
    '# Pass 1 — Analyse Structurelle',
    '',
    horoMd,
    ambMd,
    presMd,
    '---',
    '',
    '# Pass 2 — Analyse Sémantique (Mistral)',
    '',
    `> Échantillon : ${Math.min(SEMANTIC_SAMPLE, horoscopes.length)} horoscopes analysés.`,
    '',
    semanticMd,
  ].join('\n');

  // Sauvegarde locale (artefact)
  const artifactsDir = path.join(process.cwd(), 'artifacts');
  await fs.mkdir(artifactsDir, { recursive: true });
  const filename = `quality-report-${periodEnd}.md`;
  await fs.writeFile(path.join(artifactsDir, filename), report, 'utf8');
  console.log(`📄 Artefact : artifacts/${filename}`);

  // Sauvegarde Supabase
  try {
    await saveToSupabase(report, periodStart, periodEnd, summary);
    console.log('☁️  Sauvegardé dans Supabase (quality_reports)');
  } catch (e) {
    console.error('⚠️  Sauvegarde Supabase échouée :', e);
  }

  console.log(`\n✅ Rapport terminé — ${warnings} alerte(s), ${infos} info(s)`);
}

main().catch(e => { console.error(e); process.exit(1); });
