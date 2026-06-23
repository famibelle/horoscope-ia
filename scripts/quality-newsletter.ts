#!/usr/bin/env npx tsx
/**
 * Rapport qualité newsletter — 7 jours glissants
 * Pass 0 : couverture (jours manquants)
 * Pass 1 : analyse structurelle (sujets, previews)
 * Pass 2 : analyse sémantique Mistral (diversité, vocabulaire ancestral, hooks)
 */

import { config } from 'dotenv';
config();
config({ path: '.env.local', override: true });

import * as fs from 'fs/promises';
import * as path from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL    = process.env.SUPABASE_URL!;
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_KEY!;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY!;
const MISTRAL_URL     = 'https://api.mistral.ai/v1/chat/completions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsletterRow {
  id: string;
  date: string;
  subject: string;
  preview: string;
}

interface Alert {
  level: 'error' | 'warning' | 'info';
  message: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Retire les balises HTML et normalise les espaces, pour évaluer le texte réel
// du preview (le wrapper d'aperçu <div display:none> est légitime, pas une erreur).
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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
  for (const [k, v] of Object.entries(params)) url.searchParams.append(k, v);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY },
  });
  if (!res.ok) throw new Error(`Supabase [${table}] ${res.status}: ${await res.text()}`);
  return res.json();
}

async function callMistral(prompt: string): Promise<string> {
  const res = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MISTRAL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      temperature: 0.2,
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content:
            'Tu es un expert en email marketing et en culture guadeloupéenne. ' +
            'Tu analyses des objets et previews de newsletters horoscopiques générées par IA. ' +
            'Sois précis, cite les passages exacts, donne des suggestions concrètes.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Mistral ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ─── Pass 0 : Couverture ─────────────────────────────────────────────────────

function analyzeCoverage(rows: NewsletterRow[], dates: string[]): { alerts: Alert[]; md: string } {
  const alerts: Alert[] = [];
  const md: string[] = ['## 📅 Couverture\n'];

  md.push('| Date | Statut | Sujet |');
  md.push('|------|--------|-------|');

  const byDate = new Map(rows.map(r => [r.date.split('T')[0], r]));

  for (const date of dates) {
    const row = byDate.get(date);
    if (row) {
      md.push(`| ${date} | ✅ | ${row.subject.substring(0, 60)} |`);
    } else {
      md.push(`| ${date} | 🔴 manquant | — |`);
      alerts.push({ level: 'error', message: `Pas de newsletter le ${date}` });
    }
  }

  return { alerts, md: md.join('\n') };
}

// ─── Pass 1 : Analyse structurelle ───────────────────────────────────────────

function analyzeStructure(rows: NewsletterRow[]): { alerts: Alert[]; md: string } {
  const alerts: Alert[] = [];
  const md: string[] = ['## 🔬 Analyse structurelle\n'];

  // Longueur des sujets
  md.push('### Longueur des sujets (optimal : 50–70 chars)\n');
  md.push('| Date | Sujet | Longueur | Statut |');
  md.push('|------|-------|----------|--------|');

  for (const row of rows) {
    const len = row.subject.length;
    const date = row.date.split('T')[0];
    let status = '✅';
    if (len < 30) {
      status = '🔴 trop court';
      alerts.push({ level: 'warning', message: `Sujet trop court (${len} chars) le ${date} : "${row.subject}"` });
    } else if (len > 90) {
      status = '🟠 trop long';
      alerts.push({ level: 'warning', message: `Sujet trop long (${len} chars) le ${date} : "${row.subject}"` });
    } else if (len < 50 || len > 70) {
      status = '🟡 hors zone optimale';
    }
    md.push(`| ${date} | ${row.subject.substring(0, 55)} | ${len} | ${status} |`);
  }

  // Diversité des sujets (5 premiers mots)
  md.push('\n### Diversité des sujets (5 premiers mots)\n');
  const openings = new Map<string, string[]>();
  for (const row of rows) {
    const key = row.subject.split(/\s+/).slice(0, 5).join(' ').toLowerCase().replace(/[✦🌿🌟]/g, '').trim();
    if (!openings.has(key)) openings.set(key, []);
    openings.get(key)!.push(row.date.split('T')[0]);
  }
  let hasDuplicate = false;
  for (const [opening, dates] of openings) {
    if (dates.length >= 2) {
      md.push(`- 🔴 **"${opening}…"** répété les jours : ${dates.join(', ')}`);
      alerts.push({ level: 'warning', message: `Début de sujet répété : "${opening}" (${dates.join(', ')})` });
      hasDuplicate = true;
    }
  }
  if (!hasDuplicate) md.push('✅ Aucune répétition détectée sur 7 jours.');

  // Qualité du preview — on évalue le TEXTE réel (le wrapper <div display:none>
  // d'aperçu pour Gmail/Apple Mail est une technique légitime, pas une erreur).
  md.push('\n### Qualité du preview\n');
  md.push('| Date | Longueur | Problème |');
  md.push('|------|----------|----------|');
  for (const row of rows) {
    const date = row.date.split('T')[0];
    const text = stripHtml(row.preview || '');
    const len = text.length;
    const hadTags = /<[^>]+>/.test(row.preview || '');
    if (!text) {
      md.push(`| ${date} | ${len} | 🔴 preview vide |`);
      alerts.push({ level: 'error', message: `Preview vide le ${date}` });
    } else if (len < 80) {
      md.push(`| ${date} | ${len} | 🟠 trop court (<80) |`);
      alerts.push({ level: 'warning', message: `Preview trop court (${len} chars) le ${date}` });
    } else if (hadTags) {
      md.push(`| ${date} | ${len} | 🟡 contient des balises (format, non bloquant) |`);
    } else {
      md.push(`| ${date} | ${len} | ✅ |`);
    }
  }

  return { alerts, md: md.join('\n') };
}

// ─── Pass 2 : Analyse sémantique Mistral ─────────────────────────────────────

async function analyzeSemantic(rows: NewsletterRow[]): Promise<string> {
  if (!MISTRAL_API_KEY) return '> ⚠️ MISTRAL_API_KEY absent — analyse sémantique ignorée.';

  const lines: string[] = [];
  for (const row of rows) {
    const date = row.date.split('T')[0];
    lines.push(`📅 ${date}\nObjet : ${row.subject}\nPreview : ${stripHtml(row.preview || '').substring(0, 150)}`);
  }
  const excerpt = lines.join('\n\n');

  const prompt = `Voici les objets et previews des 7 dernières newsletters horoscopiques guadeloupéennes :\n\n${excerpt}\n\n
Analyse-les selon ces 4 critères :
1. **Diversité** : Les accroches sont-elles suffisamment variées ? Y a-t-il des formules répétitives ?
2. **Vocabulaire ancestral** : Retrouve-t-on des mots créoles, des références à Karukera, aux ancêtres, à la faune/flore guadeloupéenne ?
3. **Qualité des hooks** : Chaque objet donne-t-il vraiment envie d'ouvrir le mail ? Lequel est le plus fort ? Le plus faible ?
4. **Suggestions** : Donne 3 suggestions concrètes pour améliorer les prochains objets.

Réponds en markdown avec un tableau problèmes (colonnes : Date | Critère | Observation) et une section "Suggestions".
Termine par un score global /10.`;

  const result = await callMistral(prompt);
  return `## 🧠 Analyse sémantique (Mistral Small)\n\n${result}`;
}

// ─── Sauvegarde ───────────────────────────────────────────────────────────────

async function saveToSupabase(reportMd: string, periodStart: string, periodEnd: string, summary: object): Promise<void> {
  const { upsertRest } = await import('@/lib/supabase-rest');
  await upsertRest(
    'quality_reports',
    {
      generated_at: `newsletter-${new Date().toISOString()}`,
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
  console.log('📧 Rapport qualité newsletter — 7 jours glissants\n');

  const dates = last7Days();
  const periodStart = dates[0];
  const periodEnd   = dates[dates.length - 1];
  console.log(`📅 Période : ${periodStart} → ${periodEnd}\n`);

  console.log('📥 Chargement newsletters Supabase...');
  const rows = (await queryRest('newsletters', {
    date:   `gte.${periodStart}`,
    select: 'id,date,subject,preview',
    order:  'date.asc',
  })) as NewsletterRow[];
  console.log(`   ✅ ${rows.length} newsletter(s) trouvée(s)\n`);

  // Pass 0
  console.log('🔬 Pass 0 — Couverture...');
  const { alerts: a0, md: md0 } = analyzeCoverage(rows, dates);
  console.log(`   ✅ ${a0.length} alerte(s)\n`);

  // Pass 1
  console.log('🔬 Pass 1 — Analyse structurelle...');
  const { alerts: a1, md: md1 } = analyzeStructure(rows);
  console.log(`   ✅ ${a1.length} alerte(s)\n`);

  // Pass 2
  console.log('🔬 Pass 2 — Analyse sémantique Mistral...');
  const md2 = await analyzeSemantic(rows);
  console.log('   ✅ Terminée\n');

  const allAlerts = [...a0, ...a1];
  const errorCount   = allAlerts.filter(a => a.level === 'error').length;
  const warningCount = allAlerts.filter(a => a.level === 'warning').length;
  const statusIcon   = errorCount > 0 ? '🚨' : warningCount > 0 ? '⚠️' : '✅';

  const now = new Date().toISOString();
  const report = [
    `# ${statusIcon} Rapport Qualité Newsletter — ${periodStart} → ${periodEnd}`,
    `> Généré le ${now} · ${rows.length}/7 newsletters · ${errorCount} erreur(s) · ${warningCount} avertissement(s)`,
    '',
    '## 📋 Résumé',
    '',
    '| Métrique | Valeur |',
    '|----------|--------|',
    `| Newsletters analysées | ${rows.length}/7 |`,
    `| Jours manquants | ${7 - rows.length} |`,
    `| Erreurs structurelles | ${errorCount} |`,
    `| Avertissements | ${warningCount} |`,
    '',
    md0,
    '',
    md1,
    '',
    md2,
  ].join('\n');

  // Écriture artifacts
  const artifactsDir = path.join(process.cwd(), 'artifacts');
  await fs.mkdir(artifactsDir, { recursive: true });
  const filename = `quality-newsletter-${periodEnd}.md`;
  await fs.writeFile(path.join(artifactsDir, filename), report, 'utf8');
  await fs.writeFile(path.join(artifactsDir, 'quality-newsletter-latest.md'), report, 'utf8');
  console.log(`📄 Artefact : artifacts/${filename}`);

  // Sauvegarde Supabase
  try {
    const summary = {
      newsletters: rows.length,
      missing: 7 - rows.length,
      errors: errorCount,
      warnings: warningCount,
    };
    await saveToSupabase(report, periodStart, periodEnd, summary);
    console.log('☁️  Sauvegardé dans Supabase (quality_reports)');
  } catch (err: any) {
    console.warn('⚠️  Supabase indisponible :', err.message);
  }

  console.log(`\n${statusIcon} Rapport terminé : ${errorCount} erreur(s), ${warningCount} avertissement(s)`);
}

main().catch(err => {
  console.error('❌ Erreur :', err);
  process.exit(1);
});
