/**
 * Intégration avec l'API Brevo (ex-Sendinblue)
 * Pour l'envoi de newsletters et la gestion des contacts
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

// ID de la liste par défaut (à modifier dans votre .env)
const DEFAULT_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '1');

interface BrevoContact {
  email: string;
  attributes?: Record<string, string | number | boolean>;
  listIds?: number[];
}

interface SendEmailRequest {
  sender: {
    email: string;
    name?: string;
  };
  to: Array<{
    email: string;
    name?: string;
  }>;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: number;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

/**
 * Ajouter un contact à une liste Brevo
 */
export async function addContactToBrevo(
  email: string,
  listId: number = DEFAULT_LIST_ID,
  attributes: Record<string, any> = {}
): Promise<any> {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY non configurée dans les variables d\'environnement');
  }

  const contact: BrevoContact = {
    email: email.toLowerCase().trim(),
    listIds: [listId],
    attributes: {
      SIGN: attributes.sign || '',
      NAME: attributes.name || '',
      ...attributes
    }
  };

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({ contacts: [contact] })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      throw new Error(`Erreur Brevo: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Contact ajouté à Brevo:', data.contacts?.[0]?.email);
    return data;

  } catch (error) {
    console.error('Erreur lors de l\'ajout du contact:', error);
    throw error;
  }
}

/**
 * Envoyer un email via l'API SMTP de Brevo
 */
export async function sendEmailViaBrevo(
  to: string | string[],
  subject: string,
  html: string,
  text: string,
  senderEmail?: string,
  senderName?: string
): Promise<any> {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY non configurée');
  }

  const emailList = Array.isArray(to) ? to : [to];
  
  const request: SendEmailRequest = {
    sender: {
      email: senderEmail || process.env.EMAIL_FROM || 'newsletter@horoscope-guadeloupe.com',
      name: senderName || 'Horoscope Guadeloupéen'
    },
    to: emailList.map(email => ({ email })),
    subject,
    htmlContent: html,
    textContent: text,
    headers: {
      'X-Mailin-Custom': JSON.stringify({
        newsletter_type: 'horoscope',
        generated_at: new Date().toISOString()
      })
    }
  };

  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo Send Error:', errorData);
      throw new Error(`Erreur envoi: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Email envoyé via Brevo:', data.messageId);
    return data;

  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error);
    throw error;
  }
}

/**
 * Récupérer tous les contacts d'une liste
 */
export async function getContactsFromList(listId: number = DEFAULT_LIST_ID): Promise<string[]> {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY non configurée');
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts?listIds=${listId}&limit=500`, {
      method: 'GET',
      headers: {
        'api-key': BREVO_API_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    const contacts = data.contacts || [];
    
    return contacts.map((c: any) => c.email).filter(Boolean);

  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    throw error;
  }
}

/**
 * Créer une campagne email (pour les envois en masse)
 */
export async function createEmailCampaign(
  name: string,
  subject: string,
  html: string,
  text: string,
  listId: number = DEFAULT_LIST_ID,
  scheduledAt?: string
): Promise<any> {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY non configurée');
  }

  const requestBody = {
    name,
    subject,
    sender: {
      email: process.env.EMAIL_FROM || 'newsletter@horoscope-guadeloupe.com',
      name: 'Horoscope Guadeloupéen'
    },
    type: 'classic',
    recipients: {
      listIds: [listId]
    },
    htmlContent: html,
    textContent: text,
    status: scheduledAt ? 'scheduled' : 'draft',
    scheduledAt
  };

  try {
    const response = await fetch(`${BREVO_API_URL}/emailCampaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur: ${errorData.message || response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Erreur lors de la création de la campagne:', error);
    throw error;
  }
}

/**
 * Envoyer une campagne immédiatement
 */
export async function sendCampaignNow(campaignId: number): Promise<any> {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY non configurée');
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/emailCampaigns/${campaignId}/sendNow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur: ${errorData.message || response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la campagne:', error);
    throw error;
  }
}

/**
 * Vérifier l'état de l'API Brevo
 */
export async function testBrevoConnection(): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn('⚠️ BREVO_API_KEY non définie');
    return false;
  }

  try {
    // Tester avec une requête simple
    const response = await fetch(`${BREVO_API_URL}/account`, {
      method: 'GET',
      headers: {
        'api-key': BREVO_API_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo Connection Test Failed:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('✅ Connexion à Brevo réussie!');
    console.log(`   - Compte: ${data.email}`);
    console.log(`   - Statut: ${data.plan_type}`);
    return true;

  } catch (error) {
    console.error('❌ Erreur de connexion à Brevo:', error);
    return false;
  }
}

export {
  BREVO_API_KEY,
  BREVO_API_URL,
  DEFAULT_LIST_ID
};
