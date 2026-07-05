import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ARTICLES, getArticle } from '@/lib/articles-data';
import articlesContent from '@/lib/articles-content.json';

interface Section {
  titre: string;
  corps: string;
}

interface Source {
  auteur: string;
  titre: string;
  editeur?: string;
  annee: string;
  url?: string;
}

interface ArticleContent {
  introduction: string;
  sections: Section[];
  conclusion: string;
  sources?: Source[];
  generatedAt?: string;
}

type ArticlesContent = Record<string, ArticleContent>;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title}, Horoscope Karukera`,
    description: article.excerpt,
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const meta    = getArticle(slug);
  const content = (articlesContent as ArticlesContent)[slug];

  if (!meta || !content) notFound();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.excerpt,
    datePublished: content.generatedAt ?? '2025-01-01T00:00:00Z',
    inLanguage: 'fr-FR',
    publisher: {
      '@type': 'Organization',
      name: 'Zodyak Karukera',
      url: 'https://zodyak-karukera.com',
    },
    author: {
      '@type': 'Organization',
      name: 'Zodyak Karukera',
    },
    url: `https://zodyak-karukera.com/articles/${slug}`,
    mainEntityOfPage: `https://zodyak-karukera.com/articles/${slug}`,
    ...(content.sources?.length && {
      citation: content.sources.map((s) => ({
        '@type': 'CreativeWork',
        name: s.titre,
        author: s.auteur,
        datePublished: s.annee,
        ...(s.url && { url: s.url }),
      })),
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      >
        <div
          className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative z-10 px-4 py-12 max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/#articles"
          className="inline-flex items-center gap-2 text-white/35 text-sm hover:text-white/70 transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Retour
        </Link>

        {/* Tag + read time + date */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-white text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r ${meta.tagColor}`}
          >
            {meta.tag}
          </span>
          <span className="text-white/25 text-xs uppercase tracking-wider">
            {meta.readTime}
          </span>
          {content.generatedAt && (
            <time
              dateTime={content.generatedAt}
              className="text-white/30 text-xs"
            >
              Publié le{' '}
              {new Date(content.generatedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          )}
        </div>

        {/* Emoji + Title */}
        <div className="text-5xl mb-5">{meta.emoji}</div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-snug mb-8">
          {meta.title}
        </h1>

        {/* Divider */}
        <div
          className="h-px mb-10"
          style={{
            background:
              'linear-gradient(90deg, rgba(124,58,237,0.5), rgba(59,130,246,0.3), transparent)',
          }}
        />

        {/* Introduction */}
        <p className="text-white/75 text-lg sm:text-xl leading-[1.75] mb-12 font-display italic">
          {content.introduction}
        </p>

        {/* Sections */}
        <div className="space-y-12">
          {content.sections.map((section, i) => (
            <section key={i}>
              <h2
                className="text-xl sm:text-2xl font-display font-bold mb-5"
                style={{
                  background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {section.titre}
              </h2>
              <p className="text-white/65 text-base sm:text-lg leading-[1.75] whitespace-pre-line">
                {section.corps}
              </p>
            </section>
          ))}
        </div>

        {/* Conclusion */}
        <div
          className="mt-14 rounded-2xl p-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.06))',
            border: '1px solid rgba(124,58,237,0.2)',
          }}
        >
          <p className="text-violet-300/80 text-base sm:text-lg leading-[1.75] italic font-display">
            &ldquo;{content.conclusion}&rdquo;
          </p>
          <p className="text-white/20 text-xs mt-3 text-right">
           , Fanchette
            {content.generatedAt && (
              <span className="block mt-0.5">
                Généré le{' '}
                {new Date(content.generatedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </p>
        </div>

        {/* Sources */}
        {content.sources && content.sources.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">
              Sources
            </h2>
            <ul className="space-y-2 border-l border-white/10 pl-4">
              {content.sources.map((source, i) => (
                <li key={i} className="text-white/45 text-sm leading-relaxed">
                  {source.auteur},{' '}
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-300/70 hover:text-violet-200 underline underline-offset-2 transition-colors"
                    >
                      <em>{source.titre}</em>
                    </a>
                  ) : (
                    <em>{source.titre}</em>
                  )}
                  {source.editeur && <>, {source.editeur}</>}
                  , {source.annee}.
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Back to home */}
        <div className="text-center mt-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm text-white/50 hover:text-white/80 transition-colors border border-white/10 hover:border-violet-400/30"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            ← Voir mon horoscope du jour
          </Link>
        </div>
      </div>
    </main>
    </>
  );
}
