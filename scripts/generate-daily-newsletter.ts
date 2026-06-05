import { config } from 'dotenv';
config();

import { generateDailyNewsletter, generatePersonalizedNewsletter } from '@/lib/newsletter-generator';
import { saveNewsletter, getTodaysNewsletter } from '@/lib/newsletter-storage';
import { getContactsFromList, sendEmailViaBrevo } from '@/lib/brevo-api';
import { signs } from '@/lib/signs-data';

const VALID_SIGN_IDS = new Set(signs.map(s => s.id));

async function sendPersonalized(newsletter: { subject: string; html: string; text: string }) {
  if (!process.env.BREVO_API_KEY) {
    console.log('\n⚠️  BREVO_API_KEY absent — envoi ignoré');
    return;
  }

  console.log('\n📋 Récupération des abonnés Brevo...');
  const contacts = await getContactsFromList();
  console.log(`   ${contacts.length} abonné(s) trouvé(s)`);

  // Grouper par signe
  const bySign = new Map<string, string[]>();
  const noSign: string[] = [];

  for (const { email, sign } of contacts) {
    if (sign && VALID_SIGN_IDS.has(sign)) {
      if (!bySign.has(sign)) bySign.set(sign, []);
      bySign.get(sign)!.push(email);
    } else {
      noSign.push(email);
    }
  }

  console.log(`   Avec signe : ${contacts.length - noSign.length} | Sans signe : ${noSign.length}`);

  // Envoi personnalisé par signe
  for (const [signId, emails] of bySign) {
    console.log(`\n📨 Génération + envoi pour ${signId} (${emails.length} abonné(s))...`);
    try {
      const personalized = await generatePersonalizedNewsletter(signId);
      await sendEmailViaBrevo(emails, personalized.subject, personalized.html, personalized.text);
      console.log(`   ✅ ${signId} envoyé`);
    } catch (err: any) {
      console.error(`   ❌ Erreur pour ${signId}:`, err?.message ?? err);
    }
  }

  // Abonnés sans signe → newsletter complète
  if (noSign.length > 0) {
    console.log(`\n📨 Envoi newsletter complète à ${noSign.length} abonné(s) sans signe...`);
    try {
      await sendEmailViaBrevo(noSign, newsletter.subject, newsletter.html, newsletter.text);
      console.log('   ✅ Newsletter complète envoyée');
    } catch (err: any) {
      console.error('   ❌ Erreur newsletter complète:', err?.message ?? err);
    }
  }

  console.log('\n✅ Envois terminés');
}

async function main() {
  const forceSend = process.argv.includes('--force-send');
  console.log('🌅 Génération de la newsletter du jour...\n');

  const existingToday = await getTodaysNewsletter();

  if (existingToday) {
    console.log('⚠️  Une newsletter a déjà été générée aujourd\'hui :');
    console.log(`   ID: ${existingToday.id}`);
    console.log(`   Sujet: ${existingToday.subject}`);
    console.log(`   Date: ${new Date(existingToday.date).toLocaleString('fr-FR')}\n`);
    if (forceSend) {
      console.log('🔁 --force-send : renvoi personnalisé...');
      await sendPersonalized(existingToday);
    }
    return;
  }

  const newsletter = await generateDailyNewsletter();

  console.log('✅ Newsletter générée avec succès !\n');
  console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
  console.log(`📝 Sujet: ${newsletter.subject}`);
  console.log(`📊 Taille HTML: ${(newsletter.html.length / 1024).toFixed(2)} KB`);
  console.log(`📄 Taille Texte: ${(newsletter.text.length / 1024).toFixed(2)} KB\n`);

  const saved = await saveNewsletter({
    subject: newsletter.subject,
    preview: newsletter.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200) + '...',
    htmlContent: newsletter.html,
    text: newsletter.text,
  });

  console.log('💾 Newsletter sauvegardée :');
  console.log(`   ID: ${saved.id}`);
  console.log(`   Date: ${new Date(saved.date).toLocaleString('fr-FR')}`);

  await sendPersonalized(newsletter);

  console.log('\n✨ Newsletter du jour générée et envoyée !');
}

main().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
