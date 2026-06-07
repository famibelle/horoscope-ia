import { getNewsletter } from '@/lib/newsletter-storage';
import { generateEmailHtml } from '@/lib/generateEmailHtml';
import { sendEmailViaBrevo } from '@/lib/brevo-api';

export async function POST(req: Request) {
  try {
    const { id, recipients } = await req.json();

    if (!id || !Array.isArray(recipients) || recipients.length === 0) {
      return Response.json({ error: 'id et recipients[] requis' }, { status: 400 });
    }

    const newsletter = await getNewsletter(id);
    if (!newsletter) {
      return Response.json({ error: 'Newsletter introuvable' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://zodyak-karukera.com';
    const webUrl = `${baseUrl}/newsletter/${newsletter.id}`;

    for (const recipient of recipients) {
      const unsubUrl = `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(recipient)}`;
      const emailHtml = generateEmailHtml(newsletter, webUrl, unsubUrl);
      await sendEmailViaBrevo(recipient, newsletter.subject, emailHtml, newsletter.text);
    }

    return Response.json({ success: true, webUrl, sent: recipients.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}
