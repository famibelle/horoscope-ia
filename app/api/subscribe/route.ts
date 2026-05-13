import { NextResponse } from 'next/server';
import { saveEmail, getSubscriberCount } from '@/lib/private/email-storage';

// Configuration CORS
type CorsHeaders = {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
};

const corsHeaders: CorsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://horoscope-guadeloupe.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Gérer les requêtes OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Gérer les inscriptions par email
export async function POST(req: Request) {
  try {
    // Vérifier la méthode
    if (req.method !== 'POST') {
      return NextResponse.json(
        { error: 'Méthode non autorisée' },
        { status: 405, headers: corsHeaders }
      );
    }

    // Récupérer les données
    const { email } = await req.json();

    // Validation basique
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Sauvegarder l'email
    const result = await saveEmail(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erreur lors de l\'inscription' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Compter les abonnés
    const subscriberCount = await getSubscriberCount();

    return NextResponse.json(
      {
        success: true,
        message: 'Inscription réussie !',
        subscribers: subscriberCount
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Erreur dans l\'API subscribe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Gérer les requêtes GET (pour obtenir le nombre d'abonnés)
export async function GET() {
  try {
    const subscriberCount = await getSubscriberCount();
    
    return NextResponse.json(
      { subscribers: subscriberCount },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500, headers: corsHeaders }
    );
  }
}