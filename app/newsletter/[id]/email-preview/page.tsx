import { notFound } from 'next/navigation';
import { getNewsletter } from '@/lib/newsletter-storage';
import { generateEmailHtml } from '@/lib/generateEmailHtml';

export default async function EmailPreviewPage(props: any) {
  const params = props.params;
  const resolvedParams = params
    ? typeof params === 'object' && 'then' in params
      ? await params
      : params
    : { id: '' };

  const newsletter = await getNewsletter(resolvedParams.id);
  if (!newsletter) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const webUrl = `${baseUrl}/newsletter/${newsletter.id}`;
  const emailHtml = generateEmailHtml(newsletter, webUrl);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 rounded-xl px-5 py-4 text-sm font-medium" style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)', color: '#D4AF37' }}>
        Ceci est un aperçu du rendu email. Il peut différer légèrement selon le client email.
      </div>

      <iframe
        srcDoc={emailHtml}
        className="w-full border-0 rounded-xl overflow-hidden"
        style={{ minHeight: '900px' }}
        title={`Aperçu email — ${newsletter.subject}`}
        loading="lazy"
      />
    </main>
  );
}
