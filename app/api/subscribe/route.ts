import { NextResponse } from 'next/server';
import { addContactToBrevo, sendEmailViaBrevo } from '@/lib/brevo-api';

const BASE_URL = 'https://zodyak-karukera.com';

function buildWelcomeEmail(email: string): { html: string; text: string } {
  const unsubUrl = `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}`;
  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;background:#0d0d1a;">
    <div style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #1a1a2e;">
      <p style="margin:0 0 8px;font-size:13px;color:#4B6450;letter-spacing:0.3em;text-transform:uppercase;">Zodyak Karukera</p>
      <h1 style="margin:0;font-size:28px;color:#D4AF50;font-weight:700;">Bienvenue 🌿</h1>
    </div>
    <div style="padding:32px;">
      <p style="font-size:16px;line-height:1.8;color:#C8D8C0;margin:0 0 20px;">
        Bienvenue dans l'univers de <strong style="color:#D4AF50;">Maryse CondAI</strong>,
        la voix ancestrale de Karukera.
      </p>
      <p style="font-size:15px;line-height:1.8;color:rgba(200,216,192,0.75);margin:0 0 20px;">
        Chaque matin, vous recevrez votre horoscope personnalisé ancré dans la sagesse
        guadeloupéenne — présages de la faune, de la flore et des esprits de l'île.
      </p>
      <p style="font-size:15px;line-height:1.8;color:rgba(200,216,192,0.75);margin:0 0 32px;">
        Votre premier horoscope vous sera transmis dès demain matin. ✨
      </p>
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${BASE_URL}" style="display:inline-block;padding:14px 32px;background:#D4AF50;color:#0d0d1a;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;">
          Découvrir le site
        </a>
      </div>
    </div>
    <div style="padding:20px 32px;background:#080810;text-align:center;border-top:1px solid #1a1a2e;">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;color:#4B6450;font-style:italic;">
        Transmis depuis Karukera avec amour
      </p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#333355;">
        <a href="${unsubUrl}" style="color:#4B6450;text-decoration:none;">Se désabonner</a>
        &nbsp;·&nbsp;
        <span style="color:#333355;">Horoscope Karukera · Guadeloupe, 971, France</span>
      </p>
    </div>
  </div>
</body>
</html>`;
  const text = `Bienvenue chez Zodyak Karukera !\n\nMaryse CondAI, la voix ancestrale de Karukera, vous accueille.\nVotre premier horoscope vous sera transmis dès demain matin.\n\nDécouvrir : ${BASE_URL}\n\nSe désabonner : ${unsubUrl}`;
  return { html, text };
}

// Configuration CORS
type CorsHeaders = {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
};

const corsHeaders: CorsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://zodyak-karukera.com',
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
    const { email, sign } = await req.json();

    // Validation basique
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    await addContactToBrevo(normalizedEmail, undefined, { sign: sign || '' });

    // Email de bienvenue — échec silencieux pour ne pas bloquer l'inscription
    try {
      const { html, text } = buildWelcomeEmail(normalizedEmail);
      await sendEmailViaBrevo(
        normalizedEmail,
        'Bienvenue chez Zodyak Karukera 🌿',
        html,
        text,
        process.env.EMAIL_FROM || 'newsletter@zodyak-karukera.com',
        'Maryse CondAI — Zodyak Karukera',
      );
    } catch (err) {
      console.error('Email de bienvenue non envoyé:', err);
    }

    return NextResponse.json(
      { success: true, message: 'Inscription réussie !' },
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
  return NextResponse.json({ subscribers: 0 }, { status: 200, headers: corsHeaders });
}