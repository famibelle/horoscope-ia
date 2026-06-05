/**
 * Intégration avec l'API Brevo (ex-Sendinblue)
 * Pour l'envoi de newsletters et la gestion des contacts
 */

const BREVO_API_URL = 'https://api.brevo.com/v3';

// Fonctions pour récupérer les variables d'environnement
function getBrevoApiKey(): string {
  const key = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  if (!key) {
    throw new Error('BREVO_API_KEY ou SENDINBLUE_API_KEY doit être défini dans les variables d\'environnement');
  }
  return key;
}

function getBrevoListId(): number {
  const listId = parseInt(process.env.BREVO_LIST_ID || '1');
  if (isNaN(listId)) {
    throw new Error('BREVO_LIST_ID doit être un nombre valide');
  }
  return listId;
}

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
  listId: number = getBrevoListId(),
  attributes: Record<string, any> = {}
): Promise<any> {
  const apiKey = getBrevoApiKey();

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        listIds: [listId],
        attributes: {
          SIGN: attributes.sign || '',
          NAME: attributes.name || '',
        },
        updateEnabled: true,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      throw new Error(`Erreur Brevo: ${errorData.message || response.statusText}`);
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    console.log('✅ Contact ajouté à Brevo:', email.toLowerCase().trim());
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
  const apiKey = getBrevoApiKey();

  const emailList = Array.isArray(to) ? to : [to];
  
  const request: SendEmailRequest = {
    sender: {
      email: senderEmail || process.env.EMAIL_FROM || 'newsletter@zodyak-karukera.com',
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
        'api-key': apiKey
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
export async function getContactsFromList(
  listId: number = getBrevoListId()
): Promise<{ email: string; sign: string }[]> {
  const apiKey = getBrevoApiKey();

  try {
    const response = await fetch(
      `${BREVO_API_URL}/contacts?listIds=${listId}&limit=500&attributes=SIGN`,
      { method: 'GET', headers: { 'api-key': apiKey } }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    const contacts = data.contacts || [];

    return contacts
      .filter((c: any) => c.email)
      .map((c: any) => ({
        email: c.email as string,
        sign: ((c.attributes?.SIGN as string) || '').toLowerCase().trim(),
      }));

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
  listId: number = getBrevoListId(),
  scheduledAt?: string
): Promise<any> {
  const apiKey = getBrevoApiKey();

  const requestBody = {
    name,
    subject,
    sender: {
      email: process.env.EMAIL_FROM || 'newsletter@zodyak-karukera.com',
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
        'api-key': apiKey
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
  const apiKey = getBrevoApiKey();

  try {
    const response = await fetch(`${BREVO_API_URL}/emailCampaigns/${campaignId}/sendNow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur: ${errorData.message || response.statusText}`);
    }

    // Brevo renvoie 204 No Content sur sendNow — corps vide
    const text = await response.text();
    return text ? JSON.parse(text) : {};

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la campagne:', error);
    throw error;
  }
}

/**
 * Vérifier l'état de l'API Brevo
 */
export async function testBrevoConnection(): Promise<boolean> {
  try {
    const apiKey = getBrevoApiKey();
    
    // Tester avec une requête simple
    const response = await fetch(`${BREVO_API_URL}/account`, {
      method: 'GET',
      headers: {
        'api-key': apiKey
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

export { BREVO_API_URL };
