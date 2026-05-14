/**
 * Script simplifié pour envoyer une newsletter de test via Brevo
 * 
 * Usage:
 *   npm run send-brevo-test votre@email.com
 *   npm run send-brevo-test votre@email.com --sign lion --name "Jean Dupont"
 */

// Charger les variables d'environnement AVANT les imports
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

// Vérifier que les clés sont bien chargées
if (!process.env.BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY non trouvée dans .env ou .env.local');
  console.error('   Ajoutez-la dans votre fichier .env :');
  console.error('   BREVO_API_KEY=votre_clé_api_brevo');
  console.error('   BREVO_LIST_ID=votre_id_de_liste');
  process.exit(1);
}

// Maintenant on peut importer (les variables sont chargées)
import { 
  sendEmailViaBrevo, 
  testBrevoConnection,
  getContactsFromList 
} from '../lib/brevo-api';
import {
  generateDailyNewsletter,
  generatePersonalizedNewsletter
} from '../lib/newsletter-generator';
import { saveNewsletter } from '../lib/newsletter-storage';
import { signs } from '../lib/signs-data';

// Couleurs pour les logs
type ColorKey = 'reset' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';

const colors: Record<ColorKey, string> = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message: string, color: ColorKey = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  const args = process.argv.slice(2);

  // Afficher l'aide
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    log(`
📧 Script d'envoi de newsletter via Brevo

Usage:
  npm run send-brevo-test <email> [options]

Arguments:
  <email>           Adresse email du destinataire (requis)

Options:
  --daily           Envoyer la newsletter quotidienne complète (défaut)
  --personalized    Envoyer une newsletter personnalisée pour un signe
  --sign <signe>    Spécifier le signe (nécessaire avec --personalized)
  --name <nom>      Nom du destinataire pour la personnalisation
  --date <date>     Date de la newsletter (format: YYYY-MM-DD)
  --test-connection Tester la connexion à Brevo
  --list-contacts  Lister tous les contacts de la liste
  --help, -h       Afficher cette aide

Exemples:
  npm run send-brevo-test test@example.com
  npm run send-brevo-test test@example.com --personalized --sign lion --name "Jean Dupont"
  npm run send-brevo-test test@example.com --test-connection
  npm run send-brevo-test --list-contacts

Configuration requise dans .env.local:
  BREVO_API_KEY=votre_clé_api_brevo
  BREVO_LIST_ID=1
  EMAIL_FROM="Horoscope Guadeloupéen" <votre@email.com>
`, 'cyan');
    return;
  }

  // Option pour tester la connexion
  if (args.includes('--test-connection')) {
    log('🔧 Test de la connexion à Brevo...\n', 'yellow');
    const success = await testBrevoConnection();
    if (success) {
      log('✅ Connexion réussie! Vous pouvez envoyer des newsletters.', 'green');
    } else {
      log('❌ Échec de la connexion. Vérifiez votre BREVO_API_KEY.', 'red');
    }
    return;
  }

  // Option pour lister les contacts
  if (args.includes('--list-contacts')) {
    log('📋 Récupération des contacts...\n', 'yellow');
    try {
      const contacts = await getContactsFromList();
      if (contacts.length === 0) {
        log('Aucun contact trouvé dans la liste.', 'yellow');
      } else {
        log(`✅ ${contacts.length} contact(s) trouvé(s):`, 'green');
        contacts.forEach((email, i) => {
          log(`   ${i + 1}. ${email}`, 'white');
        });
      }
    } catch (error) {
      log(`❌ Erreur: ${error instanceof Error ? error.message : String(error)}`, 'red');
    }
    return;
  }

  // Parser les arguments
  let email: string | undefined;
  let type: 'daily' | 'personalized' = 'daily';
  let signId: string | undefined;
  let subscriberName: string | undefined;
  let date: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      switch (arg) {
        case '--daily':
          type = 'daily';
          break;
        case '--personalized':
          type = 'personalized';
          break;
        case '--sign':
          signId = args[++i];
          break;
        case '--name':
          subscriberName = args[++i];
          break;
        case '--date':
          date = args[++i];
          break;
      }
    } else if (!email) {
      email = arg;
    }
  }

  // Vérifications
  if (!email) {
    log('❌ Veuillez spécifier une adresse email.', 'red');
    log('Exemple: npm run send-brevo-test test@example.com', 'yellow');
    return;
  }

  if (type === 'personalized' && !signId) {
    log('❌ Pour une newsletter personnalisée, spécifiez un signe avec --sign', 'red');
    log('Exemple: npm run send-brevo-test test@example.com --personalized --sign lion', 'yellow');
    return;
  }

  // Valider le format de l'email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    log('❌ Adresse email invalide', 'red');
    return;
  }

  // Valider le signe si fourni
  if (signId) {
    const validSigns = signs.map(s => s.id);
    if (!validSigns.includes(signId.toLowerCase())) {
      log(`❌ Signe invalide: ${signId}`, 'red');
      log(`Signes valides: ${validSigns.join(', ')}`, 'yellow');
      return;
    }
  }

  try {
    log('🚀 Envoi de newsletter via Brevo\n', 'magenta');

    // 1. Tester la connexion
    log('1️⃣ Vérification de la connexion à Brevo...', 'yellow');
    const connected = await testBrevoConnection();
    if (!connected) {
      log('❌ Impossible de se connecter à Brevo. Vérifiez votre configuration.', 'red');
      return;
    }
    log('');

    // 2. Générer la newsletter
    log('2️⃣ Génération de la newsletter...', 'yellow');
    let newsletter;
    
    if (type === 'personalized' && signId) {
      newsletter = await generatePersonalizedNewsletter(
        signId,
        date,
        {},
        subscriberName
      );
      log(`   ✅ Newsletter personnalisée pour ${signId} générée`, 'green');
    } else {
      newsletter = await generateDailyNewsletter(date, subscriberName);
      log('   ✅ Newsletter quotidienne complète générée', 'green');
    }

    log(`   - Sujet: ${newsletter.subject}`);
    log(`   - Taille HTML: ${(newsletter.html.length / 1024).toFixed(2)} KB`);
    log(`   - Taille texte: ${(newsletter.text.length / 1024).toFixed(2)} KB`);

    // 2.5. Sauvegarder la newsletter dans le stockage local
    log('2️⃣💾 Sauvegarde de la newsletter...', 'yellow');
    
    // Extraire un preview en texte pur (sans balises HTML)
    const cleanText = newsletter.text.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    const preview = cleanText.substring(0, 200) + '...';
    
    const saved = await saveNewsletter({
      subject: newsletter.subject,
      preview: preview,
      htmlContent: newsletter.html,
      textContent: newsletter.text,
      sign: type === 'personalized' ? signId : undefined,
      subscriberEmail: email,
    });
    log(`   ✅ Newsletter sauvegardée: ${saved.id}`, 'green');
    log(`   📁 Chemin: private_data/newsletters/${saved.id}.json\n`);

    // 3. Envoyer l'email
    log(`4️⃣ Envoi à ${email}...`, 'yellow');
    const result = await sendEmailViaBrevo(
      email,
      newsletter.subject,
      newsletter.html,
      newsletter.text
    );

    log('');
    log('✅ Newsletter envoyée avec succès!', 'green');
    log(`   - Message ID: ${result.messageId}`, 'white');
    log('');
    log('📧 Vérifiez votre boîte mail (et le dossier spam) dans quelques minutes.', 'cyan');
    
    return result;

  } catch (error) {
    log('');
    log('❌ Erreur lors de l\'envoi:', 'red');
    if (error instanceof Error) {
      log(`   ${error.message}`, 'red');
      
      // Messages d'erreur spécifiques
      const message = error.message.toLowerCase();
      if (message.includes('401') || message.includes('unauthorized')) {
        log('');
        log('🔴 Erreur d\'authentification:', 'red');
        log('   - Vérifiez que BREVO_API_KEY est correcte dans votre .env.local', 'yellow');
        log('   - Vous pouvez la trouver ici: https://app.brevo.com/settings/keys/api', 'yellow');
      } else if (message.includes('400') || message.includes('bad request')) {
        log('');
        log('🔴 Requête invalide:', 'red');
        log('   - Vérifiez le format de votre email', 'yellow');
        log('   - Vérifiez que EMAIL_FROM est correctement configuré', 'yellow');
      } else if (message.includes('429') || message.includes('rate limit')) {
        log('');
        log('🔴 Limite de requêtes atteinte:', 'red');
        log('   - Brevo gratuit: 300 emails/jour', 'yellow');
        log('   - Attendez demain ou passez à un plan payant', 'yellow');
      } else if (message.includes('404') || message.includes('not found')) {
        log('');
        log('🔴 Ressource non trouvée:', 'red');
        log('   - Vérifiez que BREVO_LIST_ID est correct', 'yellow');
      }
    }
    return null;
  }
}

// Exécuter si ce fichier est lancé directement
if (require.main === module) {
  main().catch(console.error);
}

export default main;
