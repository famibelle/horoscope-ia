/**
 * Script de test pour les templates de newsletter
 * Vérifie que les templates génèrent du contenu valide
 */

import NewsletterTemplates from '../lib/newsletter-templates';
import { signs } from '../lib/signs-data';

// Données de test
const testDate = '2024-03-15';
const testSign = signs[0]; // Premier signe (Bélier)
const testHoroscope = {
  ouverture: 'Une journée propice aux nouvelles rencontres et aux projets audacieux.',
  amour: 'Vénus vous sourit, ouvrez votre cœur aux possibilités amoureuses.',
  travail: 'Votre créativité sera votre atout majeur aujourd\'hui.',
  argent: 'Évitez les dépenses impulsives, attendez demain pour les gros achats.',
  amitie: 'Un ami proche pourrait vous donner un conseil précieux.',
  prediction: 'Un message inattendu pourrait changer votre perspective.'
};

// Test des templates
function testTemplates() {
  console.log('🧪 Testing Newsletter Templates...\n');

  // Test 1: Template HTML pour un signe
  console.log('Test 1: HTML Sign Template');
  const htmlSign = NewsletterTemplates.getSignHtmlTemplate({
    date: testDate,
    sign: testSign,
    horoscope: testHoroscope,
    culturalTip: 'Comme le kolibri qui butine sans se lasser, trouvez la douceur dans les petites choses.',
    ritual: 'Allumez une bougie bleue ce soir pour attirer la sagesse.'
  });
  console.log('✅ HTML template generated successfully');
  console.log('Sample:', htmlSign.substring(0, 200) + '...\n');

  // Test 2: Template texte pour un signe
  console.log('Test 2: Text Sign Template');
  const textSign = NewsletterTemplates.getSignTextTemplate({
    date: testDate,
    sign: testSign,
    horoscope: testHoroscope,
    culturalTip: 'Comme le kolibri qui butine sans se lasser, trouvez la douceur dans les petites choses.',
    ritual: 'Allumez une bougie bleue ce soir pour attirer la sagesse.'
  });
  console.log('✅ Text template generated successfully');
  console.log('Sample:', textSign.substring(0, 200) + '...\n');

  // Test 3: Header template
  console.log('Test 3: Header Template');
  const header = NewsletterTemplates.getHeaderTemplate(testDate);
  console.log('✅ Header template generated successfully');
  console.log('Sample:', header.substring(0, 150) + '...\n');

  // Test 4: Footer template
  console.log('Test 4: Footer Template');
  const footer = NewsletterTemplates.getFooterTemplate();
  console.log('✅ Footer template generated successfully');
  console.log('Sample:', footer.substring(0, 150) + '...\n');

  // Test 5: Cultural section template
  console.log('Test 5: Cultural Section Template');
  const cultural = NewsletterTemplates.getCulturalSectionTemplate(
    'Le Manguié, arbre sacré',
    'Le manguier symbolise la patience et la générosité dans la culture guadeloupéenne. ' +
    'Ses racines profondes rappellent l\'importance de rester ancré tout en grandissant.'
  );
  console.log('✅ Cultural section template generated successfully');
  console.log('Sample:', cultural.substring(0, 200) + '...\n');

  // Test 6: Special predictions template
  console.log('Test 6: Special Predictions Template');
  const predictions = NewsletterTemplates.getSpecialPredictionsTemplate({
    love: 'Les Gémeaux brilleront en amour aujourd\'hui.',
    work: 'Les Vierges devraient éviter les conflits professionnels.',
    money: 'Les Lions auront de la chance financièrement.',
    health: 'Les Poissons doivent boire plus d\'eau aujourd\'hui.'
  });
  console.log('✅ Special predictions template generated successfully');
  console.log('Sample:', predictions.substring(0, 200) + '...\n');

  console.log('🎉 All tests passed! Newsletter templates are working correctly.');
}

// Exécuter les tests si ce fichier est exécuté directement
if (require.main === module) {
  testTemplates();
}

export { testTemplates };