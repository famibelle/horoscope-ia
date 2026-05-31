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
        <p className="text-ancestral-gold/45 text-xs uppercase tracking-[0.35em] mb-4">
          Savoir ancestral
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-ancestral-cream mb-4">
          📜 Contes et sagesse de Karukera
        </h2>
        <p className="text-ancestral-cream/35 text-sm sm:text-base max-w-sm mx-auto">
          Histoires et enseignements transmises par Maryse CondAI
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ARTICLES.map((article, index) => (
          <motion.div
            key={article.slug}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, duration: 0.5 }}
          >
            <Link
              href={`/articles/${article.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#111e14',
                borderRadius: '14px',
                padding: '12px 14px',
                border: '0.5px solid rgba(255,255,255,0.07)',
                textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Carré emoji */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {article.emoji}
              </div>

              {/* Centre : tag + titre + durée */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#D4AF50',
                    fontWeight: 600,
                  }}
                >
                  {article.tag}
                </span>
                <p
                  className="font-display"
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#C8D8C0',
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    marginTop: '2px',
                  }}
                >
                  {article.title}
                </p>
                <p style={{ fontSize: '8px', color: '#6B8A6E', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {article.readTime}
                </p>
              </div>

              {/* Chevron */}
              <ArrowRight size={14} style={{ color: '#4B6450', flexShrink: 0 }} />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
