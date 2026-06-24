import { NextResponse } from 'next/server';
import { sendEmailViaBrevo } from '@/lib/brevo-api';

export async function POST(req: Request) {
  try {
    const { nom, email, signe, sujet, message } = await req.json();
    if (!nom || !email || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const html = `<p><strong>Nom :</strong> ${nom}</p>
<p><strong>Email :</strong> ${email}</p>
<p><strong>Signe :</strong> ${signe || '—'}</p>
<p><strong>Sujet :</strong> ${sujet || '—'}</p>
<p><strong>Message :</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>`;

    await sendEmailViaBrevo(
      process.env.CONTACT_EMAIL || 'medhi.famibelle@gmail.com',
      `[Contact] ${sujet || 'Message'} — ${nom}`,
      html,
      `${nom} (${email}) a envoyé : ${message}`,
      process.env.EMAIL_FROM || 'newsletter@zodyak-karukera.com',
      'Zodyak Karukera — Formulaire contact',
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur contact:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
