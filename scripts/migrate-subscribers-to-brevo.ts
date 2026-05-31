/**
 * Migration one-shot : abonnés fichier chiffré → liste Brevo
 * Usage: EMAIL_ENCRYPTION_KEY=xxx BREVO_API_KEY=xxx npx tsx scripts/migrate-subscribers-to-brevo.ts
 */

import { config } from 'dotenv';
config();

import { getAllEmails } from '@/lib/private/email-storage';
import { addContactToBrevo } from '@/lib/brevo-api';

async function main() {
  const emails = await getAllEmails();

  if (emails.length === 0) {
    console.log('Aucun abonné dans le fichier local.');
    return;
  }

  console.log(`${emails.length} abonné(s) à migrer vers Brevo...\n`);

  let ok = 0;
  let errors = 0;

  for (const email of emails) {
    try {
      await addContactToBrevo(email);
      console.log(`  ✅ ${email}`);
      ok++;
    } catch (err: any) {
      // Brevo renvoie 400 si le contact existe déjà — on l'ignore
      if (err?.message?.includes('Contact already exist')) {
        console.log(`  ↩  ${email} (déjà dans Brevo)`);
        ok++;
      } else {
        console.error(`  ❌ ${email} — ${err?.message}`);
        errors++;
      }
    }
    // Pause pour respecter le rate limit Brevo
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nMigration terminée : ${ok} ok, ${errors} erreur(s).`);
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
