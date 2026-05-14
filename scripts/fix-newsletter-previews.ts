/**
 * Script pour corriger les previews des newsletters existantes
 * qui contiennent du HTML au lieu de texte pur
 */

import { getAllNewsletters, updateNewsletter } from '@/lib/newsletter-storage';

async function main() {
  console.log('🔧 Correction des previews des newsletters...\n');

  const newsletters = await getAllNewsletters();
  console.log(`Trouvé ${newsletters.length} newsletter(s) à vérifier.\n`);

  let fixedCount = 0;
  let alreadyCleanCount = 0;

  for (const newsletter of newsletters) {
    // Vérifier si le preview contient du HTML
    if (newsletter.preview.includes('<') || newsletter.preview.includes('>')) {
      // Nettoyer le preview en extrayant le texte
      const cleanPreview = newsletter.textContent
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .substring(0, 200) + '...';

      await updateNewsletter(newsletter.id, { preview: cleanPreview });
      console.log(`✅ Fixé: ${newsletter.id} (subject: ${newsletter.subject})`);
      fixedCount++;
    } else {
      console.log(`✓ OK: ${newsletter.id} (subject: ${newsletter.subject})`);
      alreadyCleanCount++;
    }
  }

  console.log(`\n📊 Résumé:`);
  console.log(`   - Nettoyés: ${fixedCount}`);
  console.log(`   - Déjà propres: ${alreadyCleanCount}`);
  console.log(`\n✨ Tous les previews sont maintenant propres !`);
}

main().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
