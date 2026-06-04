/**
 * Script pour envoyer une newsletter de test à une adresse email
 * Utilise Nodemailer pour l'envoi (nécessite une configuration SMTP)
 */

import nodemailer from 'nodemailer';
import { generateDailyNewsletter, generatePersonalizedNewsletter } from '../lib/newsletter-generator';

// Configuration du transporter Nodemailer
// Par défaut, configuration pour Gmail (à adapter selon votre fournisseur)
function createTransporter() {
  // Configuration de base - à personnaliser dans votre .env
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    console.warn('⚠️  Aucune configuration SMTP trouvée dans les variables d\'environnement.');
    console.warn('   Configurez SMTP_HOST, SMTP_PORT, SMTP_USER et SMTP_PASS dans votre .env');
    console.warn('   Ou utilisez la configuration par défaut pour Gmail.');
  }

  // Configuration pour Gmail (nécessite un "App Password" si 2FA activé)
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: user || '',
      pass: pass || ''
    },
    // Pour Gmail, il faut activer "Less secure app access" ou utiliser OAuth2
    // ou créer un "App Password" si vous avez la 2FA activée
    tls: {
      // Ne pas vérifier le certificat SSL (utile pour les tests locaux)
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
}

// Configuration pour SendGrid (alternative)
function createSendGridTransporter() {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    return null;
  }
  
  return nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: apiKey
    }
  });
}

// Configuration pour Mailchimp Transactional (anciennement Mandrill)
function createMailchimpTransporter() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  
  if (!apiKey) {
    return null;
  }
  
  return nodemailer.createTransport({
    host: 'smtp.mandrillapp.com',
    port: 587,
    secure: false,
    auth: {
      user: 'anything', // Mandrill ignore le username
      pass: apiKey
    }
  });
}

// Fonction principale pour envoyer un email de test
async function sendTestNewsletter(
  to: string,
  options: {
    type: 'daily' | 'personalized';
    signId?: string;
    date?: string;
    subscriberName?: string;
  } = { type: 'daily' }
) {
  try {
    console.log('📧 Préparation de l\'envoi de newsletter de test...\n');

    // 1. Générer la newsletter
    console.log('1️⃣ Génération de la newsletter...');
    let newsletter;
    
    if (options.type === 'personalized' && options.signId) {
      newsletter = await generatePersonalizedNewsletter(
        options.signId,
        options.date,
        {},
        options.subscriberName
      );
      console.log(`   ✅ Newsletter personnalisée pour ${options.signId} générée`);
    } else {
      newsletter = await generateDailyNewsletter(options.date, options.subscriberName);
      console.log('   ✅ Newsletter quotidienne complète générée');
    }

    console.log(`   - Sujet: ${newsletter.subject}`);
    console.log(`   - Date: ${newsletter.date}`);
    console.log(`   - Taille HTML: ${(newsletter.html.length / 1024).toFixed(2)} KB`);
    console.log(`   - Taille texte: ${(newsletter.text.length / 1024).toFixed(2)} KB\n`);

    // 2. Configurer le transporter
    console.log('2️⃣ Configuration du transporteur email...');
    let transporter = createSendGridTransporter() || createMailchimpTransporter();
    
    if (!transporter) {
      transporter = createTransporter();
    }
    
    console.log('   ✅ Transporteur configuré\n');

    // 3. Envoyer l'email
    console.log('3️⃣ Envoi de l\'email...');
    console.log(`   À: ${to}`);
    
    const info = await transporter.sendMail({
      from: {
        name: 'Horoscope Guadeloupéen',
        address: process.env.EMAIL_FROM || 'newsletter@zodyak-karukera.com'
      },
      to,
      subject: newsletter.subject,
      text: newsletter.text,
      html: newsletter.html,
      // Ajouter des en-têtes pour éviter le spam
      headers: {
        'X-Priority': '1',
        'Importance': 'high'
      }
    });

    console.log('   ✅ Email envoyé avec succès!\n');
    
    // 4. Afficher les informations d'envoi
    console.log('📋 Détails de l\'envoi:');
    console.log(`   - Message ID: ${info.messageId}`);
    console.log(`   - Accepté par: ${info.envelope.to.join(', ')}`);
    console.log(`   - Rejeté: ${info.rejected.join(', ') || 'Aucun'}`);
    console.log(`   - Temps de réponse: ${info.response?.split(' ')[1] || 'N/A'}\n`);

    // 5. URL de prévisualisation (si disponible)
    if (info.messageId) {
      // Pour SendGrid
      if (process.env.SENDGRID_API_KEY) {
        console.log('🔗 Prévisualiser dans SendGrid:');
        console.log(`   https://app.sendgrid.com/emails/${info.messageId}\n`);
      }
      // Pour Mailchimp
      else if (process.env.MAILCHIMP_API_KEY) {
        console.log('🔗 Prévisualiser dans Mailchimp Transactional:');
        console.log(`   https://mandrillapp.com/track/${info.messageId}\n`);
      }
    }

    console.log('✅ Envoi terminé avec succès!');
    console.log('   Vérifiez votre boîte mail (et le dossier spam) dans quelques minutes.');

    return {
      success: true,
      messageId: info.messageId,
      newsletter
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error);
    
    // Messages d'erreur spécifiques
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('authentication') || message.includes('auth')) {
        console.error('\n🔴 Erreur d\'authentification:');
        console.error('   - Vérifiez vos identifiants SMTP');
        console.error('   - Pour Gmail: activez "App Password" si 2FA est activé');
        console.error('   - Pour SendGrid/Mailchimp: vérifiez votre API key');
      } else if (message.includes('connection') || message.includes('socket')) {
        console.error('\n🔴 Erreur de connexion:');
        console.error('   - Vérifiez votre connexion internet');
        console.error('   - Vérifiez le nom d\'hôte (SMTP_HOST)');
        console.error('   - Vérifiez le port (SMTP_PORT)');
      } else if (message.includes('refused') || message.includes('reject')) {
        console.error('\n🔴 Connexion refusée:');
        console.error('   - Le serveur a refusé la connexion');
        console.error('   - Vérifiez que votre IP n\'est pas bloquée');
        console.error('   - Pour Gmail: autorisez les "Less secure apps"');
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Fonction utilitaire pour tester la configuration
async function testEmailConfig() {
  console.log('🔧 Test de la configuration email...\n');

  // Vérifier les variables d'environnement
  const configs = [
    { name: 'SMTP_HOST', value: process.env.SMTP_HOST, required: true },
    { name: 'SMTP_PORT', value: process.env.SMTP_PORT, required: false },
    { name: 'SMTP_USER', value: process.env.SMTP_USER, required: true },
    { name: 'SMTP_PASS', value: process.env.SMTP_PASS ? '***' : undefined, required: true },
    { name: 'SENDGRID_API_KEY', value: process.env.SENDGRID_API_KEY ? '***' : undefined, required: false },
    { name: 'MAILCHIMP_API_KEY', value: process.env.MAILCHIMP_API_KEY ? '***' : undefined, required: false },
    { name: 'EMAIL_FROM', value: process.env.EMAIL_FROM, required: false }
  ];

  console.log('Variables d\'environnement:');
  for (const config of configs) {
    const status = config.value !== undefined ? '✅' : '❌';
    const value = config.value === '***' ? '***' : (config.value || 'non défini');
    console.log(`   ${status} ${config.name}: ${value}`);
  }

  // Tester la connexion
  try {
    console.log('\n🔗 Test de connexion...');
    let transporter = createSendGridTransporter() || createMailchimpTransporter();
    
    if (!transporter) {
      transporter = createTransporter();
    }

    // Vérifier la connexion sans envoyer d'email
    await transporter.verify();
    console.log('   ✅ Connexion réussie!');
    return true;
  } catch (error) {
    console.log('   ❌ Échec de la connexion:');
    if (error instanceof Error) {
      console.log(`      ${error.message}`);
    }
    return false;
  }
}

// Interface CLI simple
async function main() {
  const args = process.argv.slice(2);

  // Afficher l'aide si pas d'arguments ou --help
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
📧 Script d'envoi de newsletter de test

Usage:
  npm run send-test-newsletter <email> [options]

Arguments:
  <email>           Adresse email du destinataire (requis)

Options:
  --daily           Envoyer la newsletter quotidienne complète (défaut)
  --personalized    Envoyer une newsletter personnalisée pour un signe
  --sign <signe>    Spécifier le signe (nécessaire avec --personalized)
  --name <nom>      Nom du destinataire pour la personnalisation
  --date <date>     Date de la newsletter (format: YYYY-MM-DD)
  --test-config     Tester la configuration email
  --help, -h       Afficher cette aide

Exemples:
  npm run send-test-newsletter test@example.com
  npm run send-test-newsletter test@example.com --personalized --sign lion --name "Jean Dupont"
  npm run send-test-newsletter test@example.com --date 2024-03-15

Configuration:
  Créez un fichier .env.local avec vos identifiants:
  
  # Pour SMTP (Gmail, etc.)
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=votre@gmail.com
  SMTP_PASS=votre-mot-de-passe
  EMAIL_FROM=votre@gmail.com
  
  # Pour SendGrid
  SENDGRID_API_KEY=votre-api-key
  EMAIL_FROM=newsletter@zodyak-karukera.com

Note:
  Pour Gmail, vous devrez peut-être:
  1. Activer "Less secure app access": https://myaccount.google.com/lesssecureapps
  2. Ou créer un "App Password": https://myaccount.google.com/apppasswords
    `);
    return;
  }

  // Option pour tester la configuration
  if (args.includes('--test-config')) {
    await testEmailConfig();
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
    console.error('❌ Veuillez spécifier une adresse email.');
    console.error('Exemple: npm run send-test-newsletter test@example.com');
    return;
  }

  if (type === 'personalized' && !signId) {
    console.error('❌ Pour une newsletter personnalisée, vous devez spécifier un signe avec --sign');
    console.error('Exemple: npm run send-test-newsletter test@example.com --personalized --sign lion');
    return;
  }

  // Valider le format de l'email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Adresse email invalide');
    return;
  }

  // Valider la date si fournie
  if (date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      console.error('❌ Format de date invalide. Utilisez YYYY-MM-DD');
      return;
    }
    
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.error('❌ Date invalide');
      return;
    }
  }

  // Valider le signe si fourni
  if (signId) {
    const validSigns = ['belier', 'taureau', 'gemeaux', 'cancer', 'lion', 'vierge', 
                       'balance', 'scorpion', 'sagittaire', 'capricorne', 'verseau', 'poissons'];
    
    if (!validSigns.includes(signId.toLowerCase())) {
      console.error(`❌ Signe invalide: ${signId}`);
      console.error(`Signes valides: ${validSigns.join(', ')}`);
      return;
    }
  }

  // Envoyer la newsletter
  await sendTestNewsletter(email, {
    type,
    signId,
    date,
    subscriberName
  });
}

// Exécuter si ce fichier est lancé directement
if (require.main === module) {
  main().catch(console.error);
}

export { sendTestNewsletter, testEmailConfig, createTransporter };
