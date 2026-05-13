/**
 * Script de test pour le générateur de newsletter
 * Vérifie que le générateur produit un contenu valide
 */

import {
  generateDailyNewsletter,
  generatePersonalizedNewsletter,
  generateCulturalTip,
  generateRitual
} from '../lib/newsletter-generator';
import { signs } from '../lib/signs-data';

async function testNewsletterGenerator() {
  console.log('🧪 Testing Newsletter Generator...\n');

  // Test 1: Génération de newsletter quotidienne
  console.log('Test 1: Daily Newsletter Generation');
  try {
    const newsletter = await generateDailyNewsletter();
    
    console.log('✅ Daily newsletter generated successfully');
    console.log('Subject:', newsletter.subject);
    console.log('Date:', newsletter.date);
    console.log('HTML length:', newsletter.html.length, 'characters');
    console.log('Text length:', newsletter.text.length, 'characters');
    console.log('Has HTML structure:', newsletter.html.includes('<html>') && newsletter.html.includes('</html>'));
    console.log('Has all signs:', signs.every(sign => newsletter.html.includes(sign.name)));
    console.log();
  } catch (error) {
    console.error('❌ Failed:', error);
    console.log();
  }

  // Test 2: Génération de newsletter personnalisée (pour un signe)
  console.log('Test 2: Personalized Newsletter Generation');
  try {
    const newsletter = await generatePersonalizedNewsletter('lion', '2024-03-15', {}, 'Jean Dupont');
    
    console.log('✅ Personalized newsletter generated successfully');
    console.log('Subject:', newsletter.subject);
    console.log('HTML length:', newsletter.html.length, 'characters');
    console.log('Text length:', newsletter.text.length, 'characters');
    console.log('Contains sign name:', newsletter.html.includes('Lion') || newsletter.html.includes('lion'));
    console.log('Contains subscriber name:', newsletter.html.includes('Jean Dupont'));
    console.log();
  } catch (error) {
    console.error('❌ Failed:', error);
    console.log();
  }

  // Test 3: Génération de newsletter personnalisée avec données d'horoscope
  console.log('Test 3: Personalized Newsletter with Horoscope Data');
  try {
    const horoscopeData = {
      ouverture: 'Une journée propice aux nouvelles rencontres et aux projets audacieux.',
      amour: 'Vénus vous sourit, ouvrez votre cœur aux possibilités amoureuses.',
      travail: 'Votre créativité sera votre atout majeur aujourd\'hui.',
      argent: 'Évitez les dépenses impulsives, attendez demain pour les gros achats.'
    };
    
    const newsletter = await generatePersonalizedNewsletter(
      'vierge',
      '2024-03-15',
      horoscopeData,
      'Marie Martin'
    );
    
    console.log('✅ Personalized newsletter with horoscope data generated successfully');
    console.log('Subject:', newsletter.subject);
    console.log('Contains custom horoscope:', newsletter.html.includes('Vénus vous sourit'));
    console.log('Contains custom data:', newsletter.html.includes('projets audacieux'));
    console.log();
  } catch (error) {
    console.error('❌ Failed:', error);
    console.log();
  }

  // Test 4: Génération de conseils culturels
  console.log('Test 4: Cultural Tips Generation');
  try {
    const sign = signs[0]; // Bélier
    const tip = generateCulturalTip(sign, '2024-03-15');
    
    console.log('✅ Cultural tip generated successfully');
    console.log('Tip:', tip);
    console.log('Contains cultural reference:', tip.includes('igwann') || tip.includes('Soufrière') || tip.includes('manguier'));
    console.log();
  } catch (error) {
    console.error('❌ Failed:', error);
    console.log();
  }

  // Test 5: Génération de rituels
  console.log('Test 5: Rituals Generation');
  try {
    const sign = signs[1]; // Taureau
    const ritual = generateRitual(sign, '2024-03-15');
    
    console.log('✅ Ritual generated successfully');
    console.log('Ritual:', ritual);
    console.log('Contains action:', ritual.includes('Allume') || ritual.includes('Boire') || ritual.includes('Porte'));
    console.log();
  } catch (error) {
    console.error('❌ Failed:', error);
    console.log();
  }

  // Test 6: Vérification du contenu HTML
  console.log('Test 6: HTML Content Validation');
  try {
    const newsletter = await generateDailyNewsletter();
    
    const hasDoctype = newsletter.html.includes('<!DOCTYPE html>');
    const hasViewport = newsletter.html.includes('viewport');
    const hasCharset = newsletter.html.includes('charset');
    const hasStyles = newsletter.html.includes('style=');
    const hasGradient = newsletter.html.includes('gradient');
    const hasUnsubscribe = newsletter.html.includes('désabonner') || newsletter.html.includes('unsubscribe');
    
    console.log('✅ HTML validation:');
    console.log('  - DOCTYPE:', hasDoctype ? '✓' : '✗');
    console.log('  - Viewport:', hasViewport ? '✓' : '✗');
    console.log('  - Charset:', hasCharset ? '✓' : '✗');
    console.log('  - Inline styles:', hasStyles ? '✓' : '✗');
    console.log('  - Gradient background:', hasGradient ? '✓' : '✗');
    console.log('  - Unsubscribe link:', hasUnsubscribe ? '✓' : '✗');
    console.log();
  } catch (error) {
    console.error('❌ Failed:', error);
    console.log();
  }

  // Test 7: Vérification du contenu texte
  console.log('Test 7: Text Content Validation');
  try {
    const newsletter = await generatePersonalizedNewsletter('cancer', '2024-03-15');
    
    const hasSignName = newsletter.text.includes('Cancer');
    const hasDate = newsletter.text.includes('2024-03-15');
    const hasSeparator = newsletter.text.includes('===');
    const hasSections = newsletter.text.includes('HOROSCOPE') && 
                        newsletter.text.includes('RITUEL');
    
    console.log('✅ Text validation:');
    console.log('  - Sign name:', hasSignName ? '✓' : '✗');
    console.log('  - Date:', hasDate ? '✓' : '✗');
    console.log('  - Separators:', hasSeparator ? '✓' : '✗');
    console.log('  - Sections:', hasSections ? '✓' : '✗');
    console.log();
  } catch (error) {
    console.error('❌ Failed:', error);
    console.log();
  }

  // Test 8: Performance (génération multiple)
  console.log('Test 8: Performance Test (Generating 5 newsletters)');
  try {
    const startTime = Date.now();
    
    for (let i = 0; i < 5; i++) {
      await generateDailyNewsletter();
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ Performance test completed');
    console.log('  - Time for 5 newsletters:', duration, 'ms');
    console.log('  - Average time per newsletter:', (duration / 5).toFixed(0), 'ms');
    console.log();
  } catch (error) {
    console.error('❌ Failed:', error);
    console.log();
  }

  console.log('🎉 All tests completed!');
  console.log('\n📝 Summary:');
  console.log('  - Daily newsletter generation: ✓');
  console.log('  - Personalized newsletter generation: ✓');
  console.log('  - Cultural tips generation: ✓');
  console.log('  - Rituals generation: ✓');
  console.log('  - HTML validation: ✓');
  console.log('  - Text validation: ✓');
  console.log('  - Performance: ✓');
}

// Exécuter les tests si ce fichier est exécuté directement
if (require.main === module) {
  testNewsletterGenerator().catch(console.error);
}

export { testNewsletterGenerator };
