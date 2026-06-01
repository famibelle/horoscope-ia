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
  const periodStart = dates[0];
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
