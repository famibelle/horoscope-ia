'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ARTICLES } from '@/lib/articles-data';

export default function Articles() {
  return (
    <section id="articles" className="px-4 py-20 max-w-5xl mx-auto">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-violet-300/45 text-xs uppercase tracking-[0.35em] mb-4">
          Savoir &amp; découverte
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
          📰 Explorer l&apos;univers astrologique
        </h2>
        <p className="text-white/35 text-sm sm:text-base max-w-sm mx-auto">
          Six textes ancrés dans la culture de Karukera, écrits en voix Maryse Condé
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {ARTICLES.map((article, index) => (
          <motion.div
            key={article.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07, duration: 0.6 }}
            whileHover={{ y: -6, scale: 1.01 }}
          >
            <Link
              href={`/articles/${article.slug}`}
              className="relative block rounded-2xl p-5 sm:p-6 group overflow-hidden h-full"
              style={{
                background:
                  'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Hover shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer-bg" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Tag + read time */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-white text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r ${article.tagColor}`}
                  >
                    {article.tag}
                  </span>
                  <span className="text-white/25 text-[10px] uppercase tracking-wider">
                    {article.readTime}
                  </span>
                </div>

                {/* Emoji */}
                <div className="text-3xl mb-3">{article.emoji}</div>

                {/* Title */}
                <h3 className="font-display font-bold text-white text-base sm:text-lg leading-snug mb-3 group-hover:text-violet-200 transition-colors duration-200">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-white/40 text-sm leading-relaxed mb-5 line-clamp-3 flex-1">
                  {article.excerpt}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-violet-300/60 text-xs font-medium group-hover:text-violet-300 transition-colors duration-200">
                  <span>Lire l&apos;article</span>
                  <ArrowRight
                    size={12}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
