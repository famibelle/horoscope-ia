#!/usr/bin/env npx tsx
/**
 * Préflight Mistral — vérifie que la clé est acceptée AVANT de lancer une génération.
 * Évite de brûler ~50 min de runner en retries quand la clé est invalide ou le
 * quota mensuel épuisé (Mistral renvoie alors 401/403 sur tous les appels).
 *
 * Usage : npx tsx scripts/check-mistral.ts
 * Exit 0 : clé OK (ou erreur transitoire réseau/5xx — on laisse la génération tenter).
 * Exit 1 : clé refusée (401/403) ou MISTRAL_API_KEY absent.
 */

import { config } from 'dotenv';
config();

async function main() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error('❌ MISTRAL_API_KEY absent de l\'environnement');
    process.exit(1);
  }

  let res: Response;
  try {
    res = await fetch('https://api.mistral.ai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch (err) {
    // Erreur réseau : non bloquant, les scripts ont leurs propres retries
    console.warn(`⚠️  Préflight Mistral : erreur réseau (${err instanceof Error ? err.message : err}) — on continue`);
    return;
  }

  if (res.ok) {
    console.log('✅ Préflight Mistral : clé acceptée');
    return;
  }

  const body = await res.text().catch(() => '');
  console.error(`❌ Préflight Mistral : HTTP ${res.status} — ${body.substring(0, 200)}`);

  if (res.status === 401 || res.status === 403) {
    console.error('');
    console.error('🛑 Clé Mistral refusée — clé invalide/révoquée ou quota mensuel épuisé.');
    console.error('   → Vérifier console.mistral.ai (Usage / Limits / API Keys) avant de relancer.');
    // Annotation visible dans le résumé GitHub Actions
    console.error('::error::Clé Mistral refusée (HTTP ' + res.status + ') — clé invalide ou quota mensuel épuisé. Génération annulée.');
    process.exit(1);
  }

  // 429/5xx : transitoire — on laisse la génération tenter sa chance
  console.warn('⚠️  Erreur transitoire (rate limit ou serveur) — on continue, les retries feront le travail');
}

main();
