/**
 * Script pour générer la newsletter quotidienne
 * Sauvegarde automatiquement dans private_data/newsletters/
 * et affiche le résultat
 */

import { config } from 'dotenv';
config();

import { generateDailyNewsletter } from '@/lib/newsletter-generator';
import { saveNewsletter } from '@/lib/newsletter-storage';
import { getTodaysNewsletter } from '@/lib/newsletter-storage';
import { createEmailCampaign, sendCampaignNow } from '@/lib/brevo-api';

async function main() {
  console.log('🌅 Génération de la newsletter du jour...\n');

  // Vérifier si une newsletter a déjà été générée aujourd'hui
  const existingToday = await getTodaysNewsletter();
  
  if (existingToday) {
    console.log('⚠️  Une newsletter a déjà été générée aujourd\'hui :');
    console.log(`   ID: ${existingToday.id}`);
    console.log(`   Sujet: ${existingToday.subject}`);
    console.log(`   Date: ${new Date(existingToday.date).toLocaleString('fr-FR')}\n`);
    return;
  }

  // Générer la newsletter du jour
  const newsletter = await generateDailyNewsletter();

  console.log('✅ Newsletter générée avec succès !\n');
  console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
  console.log(`📝 Sujet: ${newsletter.subject}`);
  console.log(`📊 Taille HTML: ${(newsletter.html.length / 1024).toFixed(2)} KB`);
  console.log(`📄 Taille Texte: ${(newsletter.text.length / 1024).toFixed(2)} KB\n`);

  // Sauvegarder dans le stockage
  const saved = await saveNewsletter({
    subject: newsletter.subject,
    preview: newsletter.html.substring(0, 200) + '...',
    htmlContent: newsletter.html,
    text: newsletter.text,
  });

  console.log('💾 Newsletter sauvegardée :');
  console.log(`   ID: ${saved.id}`);
  console.log(`   Date: ${new Date(saved.date).toLocaleString('fr-FR')}`);
  console.log(`\n📁 Chemin: private_data/newsletters/${saved.id}.json`);

  // Afficher un aperçu
  console.log('\n👇 Aperçu du contenu :');
  console.log('─'.repeat(60));
  console.log(newsletter.subject);
  console.log('─'.repeat(60));
  // Extraire les 5 premières lignes du HTML (sans les balises)
  const previewText = newsletter.html
    .replace(/<[^>]*>/g, '')
    .substring(0, 500) + '...';
  console.log(previewText);
  console.log('─'.repeat(60));

  // Envoi via Brevo (si BREVO_API_KEY est défini)
  if (process.env.BREVO_API_KEY) {
    console.log('\n📨 Envoi de la campagne Brevo...');
    try {
      const campaign = await createEmailCampaign(
        `Horoscope Guadeloupéen — ${saved.id}`,
        newsletter.subject,
        newsletter.html,
        newsletter.text,
      );
      await sendCampaignNow(campaign.id);
      console.log(`✅ Campagne Brevo envoyée (id: ${campaign.id})`);
    } catch (err: any) {
      console.error('❌ Erreur Brevo:', err?.message ?? err);
    }
  } else {
    console.log('\n⚠️  BREVO_API_KEY absent — envoi ignoré');
  }

  console.log('\n✨ Newsletter du jour générée et sauvegardée !');
}

main().catch((error) => {
  console.error('❌ Erreur lors de la génération de la newsletter :', error);
  process.exit(1);
});
