import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ARTICLES } from '@/lib/articles-data';

export const metadata: Metadata = {
  title: 'Articles, savoirs et culture de Guadeloupe | Zodyak Karukera',
  description:
    "Articles documentés sur la culture guadeloupéenne : gwoka, quimbois et médecine populaire, mangrove, langue créole, histoire de la canne et de Delgrès. Chaque article s'appuie sur des sources vérifiées.",
};

export default function ArticlesPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div
        aria-hidden
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      >
        <div
          className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,80,0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative z-10 px-4 py-12 max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/35 text-sm hover:text-white/70 transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Retour à l'accueil
        </Link>

        {/* En-tête */}
        <div className="mb-10">
          <p
            className="text-xs tracking-[4px] uppercase mb-4"
            style={{ color: 'var(--color-gold, #D4AF50)' }}
          >
            Savoirs de Karukera
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-snug mb-4">
            Les articles
          </h1>
          <p className="text-white/50 text-base leading-[1.75]">
            Culture, nature et histoire de la Guadeloupe : des articles documentés,
            appuyés sur des sources vérifiées, racontés par Fanchette.
          </p>
          <div
            className="h-px mt-6"
            style={{
              background: 'linear-gradient(90deg, rgba(212,175,80,0.6), transparent)',
            }}
          />
        </div>

        {/* Liste des articles */}
        <div className="flex flex-col gap-3">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="flex items-start gap-3.5 rounded-2xl p-4 transition-colors border border-white/[0.07] hover:border-white/20"
              style={{ background: '#111e14', textDecoration: 'none' }}
            >
              {/* Carré emoji */}
              <div
                className="flex items-center justify-center flex-shrink-0 rounded-xl"
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'rgba(255,255,255,0.04)',
                  fontSize: '22px',
                }}
              >
                {article.emoji}
              </div>

              {/* Centre : tag + titre + excerpt + durée */}
              <div className="flex-1 min-w-0">
                <span
                  className="font-ui text-[11px] uppercase tracking-[0.08em] font-semibold"
                  style={{ color: '#A88A3A' }}
                >
                  {article.tag}
                </span>
                <p className="font-display text-lg font-bold text-white/90 leading-snug mt-0.5">
                  {article.title}
                </p>
                <p className="text-white/40 text-sm leading-relaxed mt-1.5">
                  {article.excerpt}
                </p>
                <p
                  className="font-ui text-xs uppercase tracking-[0.04em] mt-2"
                  style={{ color: '#6B8A6E' }}
                >
                  {article.readTime}
                </p>
              </div>

              <ArrowRight size={14} className="flex-shrink-0 mt-4" style={{ color: '#4B6450' }} />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
