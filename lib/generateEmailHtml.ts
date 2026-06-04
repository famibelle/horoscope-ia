import type { StoredNewsletter } from './newsletter-storage';

const DEFAULT_UNSUBSCRIBE_URL = 'https://app.brevo.com/contact/unsubscription/email/';

export function generateEmailHtml(
  newsletter: StoredNewsletter,
  webUrl: string,
  unsubscribeUrl: string = DEFAULT_UNSUBSCRIBE_URL,
): string {
  const viewInBrowserBanner = `<div style="padding:10px;text-align:center;font-family:Arial,sans-serif;font-size:11px;color:#4B6450;background:#0d0d1a;">
    Voir cette newsletter dans votre navigateur →
    <a href="${webUrl}" style="color:#D4AF50;text-decoration:none;">Cliquez ici</a>
  </div>`;

  const physicalAddress = `<p style="text-align:center;font-family:Arial,sans-serif;font-size:10px;color:#333344;margin:0;padding:0 32px 16px;">
    Horoscope Karukera · Guadeloupe, 971, France
  </p>`;

  let html = newsletter.htmlContent;

  // Inject "view in browser" banner right after <body ...>
  html = html.replace(/(<body[^>]*>)/i, `$1\n${viewInBrowserBanner}`);

  // Replace unsubscribe URL placeholder
  html = html.replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);

  // Inject physical address before </body>
  html = html.replace(/<\/body>/i, `${physicalAddress}\n</body>`);

  return html;
}
