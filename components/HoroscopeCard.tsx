'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Briefcase, Coins, Users, Sparkles, Eye, Cloud, RefreshCw } from 'lucide-react';
import { signs } from '@/lib/signs-data';
import type { HoroscopeResponse } from '@/lib/horoscope-data';
import { formatDate, todayISO } from '@/lib/horoscope-data';

interface HoroscopeCardProps {
  signId: string;
}

/* ── Sections config ───────────────────────────────────────────────────────── */

const SECTIONS = [
  { key: 'ouverture',  label: 'Message cosmique', Icon: Sparkles,  colorClass: 'text-violet-300' },
  { key: 'amour',      label: 'Amour',            Icon: Heart,     colorClass: 'text-rose-300' },
  { key: 'travail',    label: 'Travail',           Icon: Briefcase, colorClass: 'text-blue-300' },
  { key: 'argent',     label: 'Argent',            Icon: Coins,     colorClass: 'text-amber-300' },
  { key: 'amitie',     label: 'Amitié',            Icon: Users,     colorClass: 'text-emerald-300' },
  { key: 'prediction', label: 'Présage',           Icon: Eye,       colorClass: 'text-purple-300' },
] as const;

/* ── Skeleton ──────────────────────────────────────────────────────────────── */

function CardSkeleton({ sign }: { sign: ReturnType<typeof signs.find> }) {
  if (!sign) return null;
  return (
    <div
      className="relative rounded-3xl overflow-hidden animate-pulse"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: `1px solid ${sign.gradientFrom}20`,
      }}
    >
      <div className="px-6 pt-8 pb-6 sm:px-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-5 w-24 rounded-lg bg-white/10" />
            <div className="h-3 w-16 rounded-lg bg-white/5" />
          </div>
        </div>
        <div className="h-3 w-36 rounded-lg bg-white/5 mt-2" />
      </div>
      <div className="px-6 sm:px-8 pb-8 space-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 rounded-lg bg-white/8" />
            <div className="h-4 w-full rounded-lg bg-white/5" />
            <div className="h-4 w-4/5 rounded-lg bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main card ─────────────────────────────────────────────────────────────── */

export default function HoroscopeCard({ signId }: HoroscopeCardProps) {
  const sign = signs.find((s) => s.id === signId);
  const [data, setData]       = useState<HoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchHoroscope = useCallback(async () => {
    if (!sign) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/horoscope/${signId}?date=${todayISO()}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setData(json as HoroscopeResponse);
    } catch (e) {
      setError("L'horoscope est temporairement indisponible.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [signId, sign]);

  useEffect(() => {
    setData(null);
    fetchHoroscope();
  }, [fetchHoroscope]);

  if (!sign) return null;

  const date = formatDate();

  return (
    <section className="px-4 pb-20 max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={signId}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {loading ? (
            <CardSkeleton sign={sign} />
          ) : error ? (
            <ErrorCard sign={sign} error={error} onRetry={fetchHoroscope} />
          ) : data ? (
            <FilledCard sign={sign} data={data} date={date} />
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
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${sign.gradientFrom}20`,
      }}
    >
      <div className="text-4xl mb-4">{sign.emoji}</div>
      <p className="text-white/40 text-sm mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white/60 hover:text-white/80 transition-colors"
        style={{ background: `${sign.gradientFrom}15`, border: `1px solid ${sign.gradientFrom}25` }}
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
}: {
  sign: NonNullable<ReturnType<typeof signs.find>>;
  data: HoroscopeResponse;
  date: string;
}) {
  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: `1px solid ${sign.gradientFrom}25`,
        boxShadow: `0 0 80px ${sign.glowColor}30, 0 20px 60px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Top glow bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${sign.gradientFrom}80, ${sign.gradientTo}60, transparent)`,
        }}
      />

      {/* Header */}
      <div className="px-6 pt-8 pb-5 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{sign.emoji}</span>
            <div>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold"
                style={{ color: sign.gradientFrom }}
              >
                {sign.name}
              </h2>
              <p className="text-white/30 text-xs uppercase tracking-widest mt-0.5">
                {sign.planet} · {sign.element}
              </p>
            </div>
          </div>

          {/* Totem badge */}
          <div
            className="flex-shrink-0 text-right px-3 py-2 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${sign.gradientFrom}18, ${sign.gradientTo}12)`,
              border: `1px solid ${sign.gradientFrom}28`,
            }}
          >
            <p className="text-xs font-semibold" style={{ color: sign.gradientFrom }}>
              {sign.nomKreyol}
            </p>
            <p className="text-white/25 text-[10px] uppercase tracking-wider mt-0.5">totem</p>
          </div>
        </div>

        <p className="text-white/35 text-sm capitalize mt-3">{date}</p>

        {/* Lieu + plante */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: sign.lieu,   emoji: '📍' },
            { label: sign.plante, emoji: '🌿' },
          ].map((tag) => (
            <span
              key={tag.label}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full text-white/40"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {tag.emoji} {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-6 sm:mx-8 h-px mb-6"
        style={{ background: `linear-gradient(90deg, ${sign.gradientFrom}30, transparent)` }}
      />

      {/* 6 sections */}
      <div className="px-6 sm:px-8 pb-8 space-y-5">
        {SECTIONS.map(({ key, label, Icon, colorClass }) => {
          const text = data[key as keyof HoroscopeResponse] as string;
          if (!text) return null;

          const isPrediction = key === 'prediction';

          return (
            <motion.div
              key={key}
              className="space-y-1.5"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: SECTIONS.findIndex((s) => s.key === key) * 0.06, duration: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <Icon size={13} className={`${colorClass} flex-shrink-0`} />
                <span className={`text-xs font-semibold uppercase tracking-widest ${colorClass}`}>
                  {label}
                </span>
              </div>
              <p
                className={`text-sm leading-relaxed pl-5 ${
                  isPrediction ? 'italic text-white/60' : 'text-white/70'
                }`}
              >
                {isPrediction ? `"${text}"` : text}
              </p>
            </motion.div>
          );
        })}

        {/* Dimension spirituelle */}
        <motion.div
          className="mt-2 rounded-2xl p-4"
          style={{
            background: `linear-gradient(135deg, ${sign.gradientFrom}10, ${sign.gradientTo}08)`,
            border: `1px solid ${sign.gradientFrom}18`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <p className="text-white/35 text-xs uppercase tracking-widest mb-1.5">
            Dimension spirituelle
          </p>
          <p className="text-white/45 text-xs leading-relaxed italic">{sign.spirituel}</p>
        </motion.div>

        {/* Météo + source */}
        {data.weather && (
          <div className="flex items-center gap-1.5 pt-2">
            <Cloud size={11} className="text-white/20 flex-shrink-0" />
            <span className="text-white/20 text-[10px]">
              Pointe-à-Pitre · {data.weather}
            </span>
          </div>
        )}
        {data.source === 'mistral' && (
          <p className="text-white/15 text-[10px] text-right -mt-1">
            Rédigé par Maryse · Mistral IA
          </p>
        )}
      </div>

      {/* Bottom glow bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${sign.gradientTo}40, transparent)`,
        }}
      />
    </div>
  );
}
