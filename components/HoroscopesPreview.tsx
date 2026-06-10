'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { signs } from '@/lib/signs-data';
import { detectEditionWithNight } from '@/lib/edition';
import { todayISO } from '@/lib/horoscope-data';
import { stripMarkdown } from '@/lib/markdown-components';

interface SignPreview {
  signId: string;
  name: string;
  emoji: string;
  ouverture: string;
}

const PREVIEW_LENGTH = 180;

function truncate(text: string) {
  const clean = stripMarkdown(text);
  if (clean.length <= PREVIEW_LENGTH) return clean;
  return clean.slice(0, PREVIEW_LENGTH).trimEnd() + '…';
}


export default function HoroscopesPreview() {
  const [previews, setPreviews] = useState<SignPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const edition = detectEditionWithNight();

    async function loadPreviews() {
      try {
        setLoading(true);
        
        // 1. Essayer le cache preview (Blobs)
        const previewRes = await fetch(`/api/horoscopes-preview?edition=${edition}`);
        const previewData: SignPreview[] = previewRes.ok ? await previewRes.json() : [];
        
        if (previewData.length > 0) {
          if (!cancelled) setPreviews(previewData);
        } else {
          // 2. Charger tous les signes en parallèle
          const hour = new Date().getHours();
          const results = await Promise.all(
            signs.map(async (sign) => {
              if (cancelled) return null;
              try {
                const res = await fetch(`/api/horoscope/${sign.id}?date=${todayISO()}&userHour=${hour}&edition=${edition}`);
                if (!res.ok) return null;
                const horoscope = await res.json();
                // Utiliser teaser si disponible, sinon ouverture (même si source est 'raw')
                const text = horoscope.teaser || horoscope.ouverture;
                if (text) {
                  return { signId: sign.id, name: sign.name, emoji: sign.emoji, ouverture: text };
                }
                return null;
              } catch {
                return null;
              }
            })
          );
          if (!cancelled) setPreviews(results.filter(Boolean) as SignPreview[]);
        }
      } catch {
        // Ignorer les erreurs
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPreviews();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="px-4 py-16 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        <p className="text-ancestral-gold/45 text-[12px] uppercase tracking-[0.35em] mb-3">
          Maryse CondAI
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ancestral-cream">
          🌿 Les totems de Karukera
        </h2>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl p-5 space-y-2"
              style={{ background: 'rgba(245,245,220,0.03)', border: '1px solid rgba(245,245,220,0.06)' }}
            >
              <div className="h-4 w-24 rounded bg-ancestral-cream/8" />
              <div className="h-3 w-full rounded bg-ancestral-cream/5" />
              <div className="h-3 w-4/5 rounded bg-ancestral-cream/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {previews.map((p, i) => (
            <motion.div
              key={p.signId}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              whileHover={{ y: -3, scale: 1.02 }}
            >
              <Link
                href={`/horoscope/${p.signId}`}
                className="block rounded-2xl p-5 h-full transition-colors"
                style={{
                  background: 'linear-gradient(145deg, rgba(245,245,220,0.05) 0%, rgba(139,69,19,0.02) 100%)',
                  border: '1px solid rgba(245,245,220,0.07)',
                }}
              >
                <p className="text-ancestral-cream/80 text-[15px] font-semibold mb-2">
                  {p.emoji} {p.name}
                </p>
                <p className="text-ancestral-cream/45 text-[15px] leading-relaxed mb-3">
                  {truncate(p.ouverture)}
                </p>
                <span className="text-ancestral-gold/70 text-[12px] font-medium">
                  lire la suite →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        className="mt-12 h-px mx-auto max-w-xs"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(210,105,30,0.4), transparent)',
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      />
    </section>
  );
}
