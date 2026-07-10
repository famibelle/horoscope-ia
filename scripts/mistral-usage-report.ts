#!/usr/bin/env npx tsx
/**
 * Rapport de consommation Mistral — lit la table mistral_usage (Supabase).
 * Usage : npx tsx scripts/mistral-usage-report.ts [--days=30]
 */

import { config } from 'dotenv';
config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const days = Number(process.argv.find(a => a.startsWith('--days='))?.split('=')[1] ?? 30);

interface UsageRow {
  created_at: string;
  source: string;
  model: string;
  endpoint: string;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  success: boolean;
}

async function fetchUsage(sinceISO: string): Promise<UsageRow[]> {
  const url = `${SUPABASE_URL}/rest/v1/mistral_usage?select=created_at,source,model,endpoint,prompt_tokens,completion_tokens,total_tokens,success&created_at=gte.${sinceISO}&order=created_at.asc&limit=50000`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY },
  });
  if (!res.ok) throw new Error(`Supabase mistral_usage ${res.status}: ${await res.text()}`);
  return res.json();
}

function fmt(n: number): string {
  return n.toLocaleString('fr-FR');
}

function printTable(headers: string[], rows: (string | number)[][]): void {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => String(r[i]).length))
  );
  const line = (cells: (string | number)[]) =>
    cells.map((c, i) => String(c).padEnd(widths[i])).join('  ');
  console.log(line(headers));
  console.log(widths.map(w => '-'.repeat(w)).join('  '));
  for (const r of rows) console.log(line(r));
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_KEY manquants');
    process.exit(1);
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  console.log(`📊 Rapport de consommation Mistral — depuis le ${since.toISOString().split('T')[0]} (${days} jours)\n`);

  const rows = await fetchUsage(since.toISOString());

  if (rows.length === 0) {
    console.log('Aucune donnée. La table mistral_usage est-elle bien créée et alimentée ?');
    return;
  }

  const totalRequests = rows.length;
  const successCount = rows.filter(r => r.success).length;
  const failureCount = totalRequests - successCount;
  const totalPromptTokens = rows.reduce((s, r) => s + (r.prompt_tokens ?? 0), 0);
  const totalCompletionTokens = rows.reduce((s, r) => s + (r.completion_tokens ?? 0), 0);
  const totalTokens = totalPromptTokens + totalCompletionTokens;
  const audioCount = rows.filter(r => r.endpoint === 'audio').length;

  console.log(`Requêtes totales     : ${fmt(totalRequests)} (${fmt(successCount)} ok / ${fmt(failureCount)} échecs)`);
  console.log(`Dont audio (Voxtral) : ${fmt(audioCount)} — non comptabilisé en tokens (facturation différente)`);
  console.log(`Tokens input         : ${fmt(totalPromptTokens)}`);
  console.log(`Tokens output        : ${fmt(totalCompletionTokens)}`);
  console.log(`Tokens total         : ${fmt(totalTokens)}`);
  console.log(`Moyenne / jour       : ${fmt(Math.round(totalRequests / days))} requêtes, ${fmt(Math.round(totalTokens / days))} tokens\n`);

  // ── Par source ──
  const bySource = new Map<string, { count: number; fail: number; prompt: number; completion: number }>();
  for (const r of rows) {
    const e = bySource.get(r.source) ?? { count: 0, fail: 0, prompt: 0, completion: 0 };
    e.count++;
    if (!r.success) e.fail++;
    e.prompt += r.prompt_tokens ?? 0;
    e.completion += r.completion_tokens ?? 0;
    bySource.set(r.source, e);
  }
  console.log('── Par source ──');
  printTable(
    ['Source', 'Requêtes', 'Échecs', 'Tokens in', 'Tokens out'],
    [...bySource.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([source, e]) => [source, fmt(e.count), fmt(e.fail), fmt(e.prompt), fmt(e.completion)])
  );

  // ── Par modèle ──
  const byModel = new Map<string, { count: number; prompt: number; completion: number }>();
  for (const r of rows) {
    const e = byModel.get(r.model) ?? { count: 0, prompt: 0, completion: 0 };
    e.count++;
    e.prompt += r.prompt_tokens ?? 0;
    e.completion += r.completion_tokens ?? 0;
    byModel.set(r.model, e);
  }
  console.log('\n── Par modèle ──');
  printTable(
    ['Modèle', 'Requêtes', 'Tokens in', 'Tokens out'],
    [...byModel.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([model, e]) => [model, fmt(e.count), fmt(e.prompt), fmt(e.completion)])
  );

  // ── Par jour ──
  const byDay = new Map<string, number>();
  for (const r of rows) {
    const day = r.created_at.split('T')[0];
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  console.log('\n── Par jour ──');
  printTable(
    ['Date', 'Requêtes'],
    [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([day, count]) => [day, fmt(count)])
  );
}

main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
