'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Briefcase, Coins, Users, Sparkles, Eye, Leaf, Cloud, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Markdown as ReactMarkdown, markdownComponents, creoleComponents } from '@/lib/markdown-components';
import { useDictionnaire } from '@/lib/use-dictionnaire';
import { signs } from '@/lib/signs-data';
import type { HoroscopeResponse } from '@/lib/horoscope-data';
import { formatDate } from '@/lib/horoscope-data';

interface HoroscopeCardProps {
  sign: ReturnType<typeof signs.find>;
  data: HoroscopeResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  preview?: boolean;
}

/* ── Sections config ───────────────────────────────────────────────────────── */

// Pour revenir au thème cosmique, décommentez les labels et couleurs ci-dessous
// const SECTIONS = [
//   { key: 'ouverture',  label: 'Message cosmique', Icon: Sparkles,  colorClass: 'text-violet-300' },
//   { key: 'amour',      label: 'Amour',            Icon: Heart,     colorClass: 'text-rose-300' },
//   ...
// ] as const;

const SECTIONS = [
  { key: 'ouverture',  label: 'Parole des ancêtres', Icon: Sparkles,  colorClass: 'text-ancestral-gold' },
  { key: 'amour',      label: 'Amour',              Icon: Heart,     colorClass: 'text-ancestral-terracotta' },
  { key: 'travail',    label: 'Travail',            Icon: Briefcase, colorClass: 'text-ancestral-forest' },
  { key: 'argent',     label: 'Argent',             Icon: Coins,     colorClass: 'text-ancestral-gold' },
  { key: 'amitie',     label: 'Lyannaj',            Icon: Users,     colorClass: 'text-ancestral-cream' },
  { key: 'prediction', label: 'Présage ancestral',  Icon: Eye,       colorClass: 'text-ancestral-gold' },
  { key: 'conseil',    label: 'Conseil de la plante', Icon: Leaf,      colorClass: 'text-ancestral-forest' },
] as const;

/* ── Skeleton ──────────────────────────────────────────────────────────────── */

function CardSkeleton({ sign }: { sign: ReturnType<typeof signs.find> }) {
  if (!sign) return null;
  return (
    <div
      className="animate-pulse"
      style={{ background: '#111e14', borderRadius: '18px', border: '0.5px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}
    >
      <div style={{ padding: '14px 16px 10px', borderBottom: '0.5px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ height: '10px', width: '100px', borderRadius: '4px', background: 'rgba(212,175,80,0.1)' }} />
        <div style={{ height: '10px', width: '60px', borderRadius: '4px', background: 'rgba(76,175,116,0.1)' }} />
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ height: '8px', width: '70px', borderRadius: '4px', background: 'rgba(200,216,192,0.06)' }} />
            <div style={{ height: '13px', width: '100%', borderRadius: '4px', background: 'rgba(200,216,192,0.04)' }} />
            <div style={{ height: '13px', width: '80%', borderRadius: '4px', background: 'rgba(200,216,192,0.04)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main card ─────────────────────────────────────────────────────────────── */

export default function HoroscopeCard({ sign, data, loading, error, onRetry, preview = false }: HoroscopeCardProps) {
  if (!sign) return null;

  const date = formatDate();

  return (
    <section className="px-4 pb-8 max-w-2xl mx-auto" style={{ minHeight: preview ? 'auto' : '420px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={sign.id + (loading ? '-loading' : data ? '-data' : '-error')}
          initial={{ opacity: 1, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {loading ? (
            <CardSkeleton sign={sign} />
          ) : error ? (
            <ErrorCard sign={sign} error={error} onRetry={onRetry} />
          ) : data ? (
            <FilledCard sign={sign} data={data} date={date} preview={preview} />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

/* ── Error card ────────────────────────────────────────────────────────────── */

function ErrorCard({
  sign,
  error,
  onRetry,
}: {
  sign: NonNullable<ReturnType<typeof signs.find>>;
  error: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="rounded-3xl p-8 text-center"
      style={{
        background: 'rgba(245,245,220,0.03)',
        border: `1px solid rgba(139,69,19,0.2)`,
      }}
    >
      <div className="text-4xl mb-4">{sign.emoji}</div>
      <p className="text-white text-sm mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white hover:text-white transition-colors"
        style={{ background: 'rgba(139,69,19,0.15)', border: '1px solid rgba(139,69,19,0.25)' }}
      >
        <RefreshCw size={14} />
        Réessayer
      </button>
    </div>
  );
}

/* ── Filled card ───────────────────────────────────────────────────────────── */

function FilledCard({
  sign,
  data,
  date,
  preview,
}: {
  sign: NonNullable<ReturnType<typeof signs.find>>;
  data: HoroscopeResponse;
  date: string;
  preview?: boolean;
}) {
  const dict = useDictionnaire();
  const mdComponents = Object.keys(dict).length > 0 ? creoleComponents(dict) : markdownComponents;

  const editionLabel: Record<string, string> = {
    nuit: 'Cette nuit', matin: 'Ce matin', midi: 'Ce midi', soir: 'Ce soir',
  };
  const badgeLabel = editionLabel[data.edition ?? 'matin'] ?? 'Ce matin';

  return (
    <Link
      href={`/horoscope/${sign.id}`}
      className="block relative overflow-hidden transition-shadow duration-300"
      style={{
        background: '#111e14',
        borderRadius: '18px',
        border: '0.5px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Watermark glyphe */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          fontSize: '80px',
          opacity: 0.04,
          lineHeight: 1,
          fontFamily: 'var(--font-display)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {sign.emoji}
      </span>

      {/* Header de card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px 10px',
          borderBottom: '0.5px solid rgba(255,255,255,0.05)',
        }}
      >
        <span
          className="font-ui"
          style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D4AF50', fontWeight: 500 }}
        >
          Maryse vous parle
        </span>
        <span
          className="font-ui"
          style={{
            fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em',
            color: '#4CAF74', background: 'rgba(76,175,116,0.12)',
            border: '1px solid rgba(76,175,116,0.2)', borderRadius: '6px',
            padding: '3px 7px', fontWeight: 500,
          }}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Sections horoscope */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
        {(preview ? SECTIONS.slice(0, 3) : SECTIONS).map(({ key, label, Icon, colorClass }) => {
          const text = data[key as keyof HoroscopeResponse] as string;
          if (!text) return null;
          const isPrediction = key === 'prediction';
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: SECTIONS.findIndex((s) => s.key === key) * 0.05, duration: 0.35 }}
            >
              <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                <Icon size={12} className={`${colorClass} flex-shrink-0`} />
                <span className={`font-ui font-semibold uppercase tracking-widest ${colorClass}`} style={{ fontSize: '12px', letterSpacing: '0.08em' }}>
                  {label}
                </span>
              </div>
              <ReactMarkdown
                components={{
                  ...mdComponents,
                  p: ({ children }) => (
                    <p
                      className={`font-ui ${isPrediction ? 'italic' : ''}`}
                      style={{
                        fontSize: '15px',
                        lineHeight: 1.8,
                        color: '#C8D8C0',
                        paddingLeft: '16px',
                        fontWeight: isPrediction ? 400 : 300,
                      }}
                    >
                      {children}
                    </p>
                  ),
                }}
              >
                {isPrediction ? `"${text}"` : text}
              </ReactMarkdown>
            </motion.div>
          );
        })}

        {/* Gradient fade + lien en mode preview */}
        {preview && (
          <>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
              background: 'linear-gradient(to bottom, transparent, #111e14)',
              pointerEvents: 'none',
            }} />
            <p style={{ fontSize: '14px', color: '#D4AF50', opacity: 0.75, textAlign: 'right', marginTop: '4px' }}>
              horoscope complet →
            </p>
          </>
        )}

        {/* Dimension spirituelle */}
        {!preview && (
          <motion.div
            style={{
              marginTop: '12px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(245,245,220,0.08)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(212,175,80,0.6)', lineHeight: 1 }}>✦</span>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(200,216,192,0.55)' }}>
                Dimension spirituelle
              </p>
              {data?.spirituelMensuel && (
                <span style={{
                  fontSize: '9px', letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: 'rgba(212,175,80,0.12)', border: '1px solid rgba(212,175,80,0.22)',
                  borderRadius: '4px', padding: '1px 5px', color: 'rgba(212,175,80,0.7)',
                }}>Mensuelle</span>
              )}
            </div>
            <p className="font-accent" style={{ fontSize: '16px', lineHeight: 1.65, color: '#C8D8C0', opacity: 0.75 }}>{data?.spirituelMensuel ?? sign?.spirituel}</p>
          </motion.div>
        )}

        {/* Contexte Vaudou */}
        {!preview && data.vaudou && (
          <motion.div
            style={{
              borderRadius: '12px',
              padding: '10px 12px',
              background: 'rgba(76,175,116,0.06)',
              border: '1px solid rgba(76,175,116,0.15)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48, duration: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px' }}>{data.vaudou.emoji}</span>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(200,216,192,0.65)' }}>Protection Vaudou</p>
            </div>
            <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#C8D8C0', opacity: 0.8 }}>
              <span style={{ fontWeight: 600, color: '#D4AF50' }}>{data.vaudou.loa}</span> ({data.vaudou.famille}) vous accompagne.
              Énergie : {data.vaudou.energie}. Couleurs : {data.vaudou.couleurs.join(', ')}.
            </p>
          </motion.div>
        )}

        {/* Météo */}
        {!preview && data.weather && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '4px' }}>
            <Cloud size={11} style={{ color: '#6B8A6E', flexShrink: 0 }} />
            <span style={{ fontSize: '15px', color: '#6B8A6E' }}>Pointe-à-Pitre · {data.weather}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
