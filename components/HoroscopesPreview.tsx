'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { signs } from '@/lib/signs-data';
import { detectEdition } from '@/lib/edition';

interface SignPreview {
  signId: string;
  name: string;
  emoji: string;
  ouverture: string;
}

const PREVIEW_LENGTH = 180;

function truncate(text: string) {
  if (text.length <= PREVIEW_LENGTH) return text;
  return text.slice(0, PREVIEW_LENGTH).trimEnd() + '…';
}


export default function HoroscopesPreview() {
  const [previews, setPreviews] = useState<SignPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const edition = detectEdition();

    fetch(`/api/horoscopes-preview?edition=${edition}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(async (data: SignPreview[]) => {
        if (data.length > 0) {
          // Prod : cache Blobs disponible, affichage immédiat
          setPreviews(data);
          setLoading(false);
        } else {
          // Dev local : pas de Blobs, chargement séquentiel pour ne pas saturer Mistral
          setLoading(false);
          for (const sign of signs) {
            try {
              const res = await fetch(`/api/horoscope/${sign.id}?edition=${edition}`);
              if (!res.ok) continue;
              const horoscope = await res.json();
              const text = horoscope.teaser || horoscope.ouverture;
              if (text && horoscope.source !== 'raw') {
                setPreviews((prev) => [
                  ...prev,
                  { signId: sign.id, name: sign.name, emoji: sign.emoji, ouverture: text },
                ]);
              }
            } catch { /* skip */ }
          }
        }
      })
      .catch(() => setLoading(false));
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
        <p className="text-violet-300/45 text-xs uppercase tracking-[0.35em] mb-3">
          Maryse CondAI
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          🔮 Votre horoscope en quelques lignes…
        </h2>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl p-5 space-y-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="h-4 w-24 rounded bg-white/8" />
              <div className="h-3 w-full rounded bg-white/5" />
              <div className="h-3 w-4/5 rounded bg-white/5" />
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
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <p className="text-white/80 text-sm font-semibold mb-2">
                {p.emoji} {p.name}
              </p>
              <p className="text-white/45 text-sm leading-relaxed mb-3">
                {truncate(p.ouverture)}
              </p>
              <Link
                href={`/horoscope/${p.signId}`}
                className="text-violet-400/70 hover:text-violet-300 text-xs font-medium transition-colors"
              >
                lire la suite →
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        className="mt-12 h-px mx-auto max-w-xs"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)',
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      />
    </section>
  );
}
