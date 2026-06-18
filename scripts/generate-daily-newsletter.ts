import { config } from 'dotenv';
config();

import {
  generateDailyNewsletter,
  generatePersonalizedNewsletter,
  fetchHoroscopesFromSupabase,
} from '@/lib/newsletter-generator';
import { saveNewsletter, getTodaysNewsletter, type StoredNewsletter } from '@/lib/newsletter-storage';
import { getContactsFromList, sendEmailViaBrevo } from '@/lib/brevo-api';
import { signs } from '@/lib/signs-data';
import { todayGuadeloupe } from '@/lib/edition';

const VALID_SIGN_IDS = new Set(signs.map(s => s.id));

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Espace les appels Mistral-large (objet d'email) entre signes pour éviter le rate-limit (429).
const SIGN_THROTTLE_MS = 1500;

async function sendPersonalized(
  newsletter: { subject: string; htmlContent: string; text: string },
  date: string,
) {
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

  // Récupérer les données Supabase une seule fois pour tous les signes
  let horoscopeBySign = new Map<string, any>();
  if (bySign.size > 0) {
    console.log('\n📥 Chargement des horoscopes Supabase...');
    const allHoroscopes = await fetchHoroscopesFromSupabase(date, 'matin');
    horoscopeBySign = new Map(allHoroscopes.map(h => [h.sign.id, h.horoscope]));
    console.log(`   ${allHoroscopes.length} signe(s) chargé(s) depuis Supabase`);
  }

  // Envoi personnalisé par signe
  const signEntries = [...bySign];
  for (let i = 0; i < signEntries.length; i++) {
    const [signId, emails] = signEntries[i];
    console.log(`\n📨 Génération + envoi pour ${signId} (${emails.length} abonné(s))...`);
    try {
      const horoscopeData = horoscopeBySign.get(signId) ?? {};
      const personalized = await generatePersonalizedNewsletter(signId, date, horoscopeData);
      for (const email of emails) {
        const unsubUrl = `https://zodyak-karukera.com/api/unsubscribe?email=${encodeURIComponent(email)}`;
        const html = personalized.html.replace(/\{\{unsubscribe_url\}\}/g, unsubUrl);
        await sendEmailViaBrevo(email, personalized.subject, html, personalized.text);
      }
      console.log(`   ✅ ${signId} envoyé`);
    } catch (err: any) {
      console.error(`   ❌ Erreur pour ${signId}:`, err?.message ?? err);
    }
    // Throttle entre signes (sauf le dernier) — évite le rate-limit Mistral-large
    if (i < signEntries.length - 1) await delay(SIGN_THROTTLE_MS);
  }

  // Abonnés sans signe → newsletter complète
  if (noSign.length > 0) {
    console.log(`\n📨 Envoi newsletter complète à ${noSign.length} abonné(s) sans signe...`);
    try {
      for (const email of noSign) {
        const unsubUrl = `https://zodyak-karukera.com/api/unsubscribe?email=${encodeURIComponent(email)}`;
        const html = newsletter.htmlContent.replace(/\{\{unsubscribe_url\}\}/g, unsubUrl);
        await sendEmailViaBrevo(email, newsletter.subject, html, newsletter.text);
      }
      console.log('   ✅ Newsletter complète envoyée');
    } catch (err: any) {
      console.error('   ❌ Erreur newsletter complète:', err?.message ?? err);
    }
  }

  console.log('\n✅ Envois terminés');
}

async function main() {
  const forceSend = process.argv.includes('--force-send');
  const date = todayGuadeloupe();
  console.log('🌅 Génération de la newsletter du jour...\n');

  const existingToday = await getTodaysNewsletter();

  if (existingToday) {
    console.log('⚠️  Une newsletter a déjà été générée aujourd\'hui :');
    console.log(`   ID: ${existingToday.id}`);
    console.log(`   Sujet: ${existingToday.subject}`);
    console.log(`   Date: ${new Date(existingToday.date).toLocaleString('fr-FR')}\n`);
    if (forceSend) {
      console.log('🔁 --force-send : renvoi personnalisé...');
      await sendPersonalized(existingToday, date);
    }
    return;
  }

  const newsletter = await generateDailyNewsletter(date);

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

  await sendPersonalized(saved, date);

  console.log('\n✨ Newsletter du jour générée et envoyée !');
}

main().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
