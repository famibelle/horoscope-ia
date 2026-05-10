'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Briefcase, Coins, Users, Sparkles, Eye } from 'lucide-react';
import { signs } from '@/lib/signs-data';
import { detectEdition, EDITION_LABELS } from '@/lib/edition';
import type { Edition } from '@/private/maryse-prompt';
import type { HoroscopeResponse } from '@/lib/horoscope-data';

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface AmbianceScores {
  amour: number; travail: number; bienetre: number; vieSociale: number; finances: number;
}
interface AmbianceLune {
  bienetre: string; beaute: string; esprit: string; maison: string; jardinage: string;
}
interface AmbianceData {
  ambiance: string;
  scores: AmbianceScores;
  chiffrePorteBonheur: number;
  compatibilite: string[];
  lune: AmbianceLune;
}

/* ── Constants ─────────────────────────────────────────────────────────────── */

const HOROSCOPE_SECTIONS = [
  { key: 'ouverture',  label: 'Message cosmique', Icon: Sparkles,  colorClass: 'text-violet-300' },
  { key: 'amour',      label: 'Amour',            Icon: Heart,     colorClass: 'text-rose-300' },
  { key: 'travail',    label: 'Travail',           Icon: Briefcase, colorClass: 'text-blue-300' },
  { key: 'argent',     label: 'Argent',            Icon: Coins,     colorClass: 'text-amber-300' },
  { key: 'amitie',     label: 'Amitié',            Icon: Users,     colorClass: 'text-emerald-300' },
  { key: 'prediction', label: 'Présage',           Icon: Eye,       colorClass: 'text-purple-300' },
] as const;

const SCORE_ITEMS = [
  { key: 'amour',      label: 'Amour',       color: '#f43f5e' },
  { key: 'travail',    label: 'Travail',     color: '#3b82f6' },
  { key: 'bienetre',   label: 'Bien-être',   color: '#10b981' },
  { key: 'vieSociale', label: 'Vie sociale', color: '#8b5cf6' },
  { key: 'finances',   label: 'Finances',    color: '#f59e0b' },
] as const;

const LUNE_ITEMS = [
  { key: 'bienetre',  label: 'Bien-être',  emoji: '🌿' },
  { key: 'beaute',    label: 'Beauté',     emoji: '✨' },
  { key: 'esprit',    label: 'Esprit',     emoji: '🧘' },
  { key: 'maison',    label: 'Maison',     emoji: '🏠' },
  { key: 'jardinage', label: 'Jardinage',  emoji: '🌱' },
] as const;

function lunarPhaseLabel(): string {
  const known = new Date('2000-01-06').getTime();
  const days = (Date.now() - known) / 86_400_000;
  const cycle = ((days % 29.53) + 29.53) % 29.53;
  const idx = Math.floor((cycle / 29.53) * 8) % 8;
  return [
    'Nouvelle lune', 'Croissant naissant', 'Premier quartier', 'Croissant gibbeuse',
    'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Croissant décroissant',
  ][idx];
}

/* ── Loading skeleton ──────────────────────────────────────────────────────── */

function Skeleton({ gradientFrom }: { gradientFrom: string }) {
  return (
    <div className="animate-pulse space-y-6">
      <div
        className="rounded-3xl p-6 space-y-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${gradientFrom}15` }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 rounded bg-white/8" />
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-4/5 rounded bg-white/5" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="h-4 w-full rounded bg-white/5" />
        <div className="h-4 w-3/4 rounded bg-white/5" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-3 w-20 rounded bg-white/5 flex-shrink-0" />
          <div className="flex-1 h-2 rounded-full bg-white/5" />
          <div className="h-3 w-8 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function HoroscopeSignPage() {
  const params = useParams<{ sign: string }>();
  const signId = params.sign;
  const sign = signs.find((s) => s.id === signId);

  const [edition, setEdition] = useState<Edition | null>(null);
  const [horoscope, setHoroscope] = useState<HoroscopeResponse | null>(null);
  const [ambiance, setAmbiance] = useState<AmbianceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setEdition(detectEdition()); }, []);

  useEffect(() => {
    if (!edition || !signId) return;
    setLoading(true);
    setHoroscope(null);
    setAmbiance(null);
    Promise.all([
      fetch(`/api/horoscope/${signId}?edition=${edition}`).then((r) => r.json()),
      fetch(`/api/ambiance/${signId}?edition=${edition}`).then((r) => r.json()),
    ])
      .then(([h, a]) => {
        setHoroscope(h as HoroscopeResponse);
        setAmbiance(a as AmbianceData);
      })
      .finally(() => setLoading(false));
  }, [signId, edition]);

  if (!sign) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">Signe inconnu</p>
      </main>
    );
  }

  const moonLabel = lunarPhaseLabel();

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Ambient glow */}
      <div aria-hidden className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${sign.glowColor}18 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative z-10 px-4 py-10 max-w-2xl mx-auto">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/35 text-sm hover:text-white/70 transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Retour
        </Link>

        {/* Sign header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-5 mb-8"
        >
          <span className="text-6xl sm:text-7xl">{sign.emoji}</span>
          <div>
            <h1
              className="font-display text-4xl sm:text-5xl font-bold leading-tight"
              style={{ color: sign.gradientFrom }}
            >
              {sign.name}
            </h1>
            <p className="text-white/30 text-sm uppercase tracking-widest mt-1">
              {sign.planet} · {sign.element}
            </p>
            <p className="text-xs mt-1 font-semibold" style={{ color: `${sign.gradientFrom}99` }}>
              {sign.nomKreyol}
            </p>
          </div>
        </motion.div>

        {/* Edition pills */}
        <div className="flex gap-2 mb-10">
          {(['matin', 'midi', 'soir'] as Edition[]).map((ed) => {
            const { label, emoji: edEmoji } = EDITION_LABELS[ed];
            const active = edition === ed;
            return (
              <motion.button
                key={ed}
                onClick={() => setEdition(ed)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(59,130,246,0.25))'
                    : 'rgba(255,255,255,0.05)',
                  border: active ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  color: active ? '#e2d9f3' : 'rgba(255,255,255,0.35)',
                }}
              >
                <span>{edEmoji}</span>
                <span>{label}</span>
              </motion.button>
            );
          })}
        </div>

        {loading ? (
          <Skeleton gradientFrom={sign.gradientFrom} />
        ) : (
          <>
            {/* ══ Horoscope Maryse ══════════════════════════════════════════ */}
            {horoscope && (
              <motion.section
                className="mb-14"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-violet-300/45 text-xs uppercase tracking-[0.35em] mb-1">Maryse CondAI</p>
                <h2 className="font-display text-xl font-bold text-white mb-6">Horoscope du jour</h2>

                <div
                  className="rounded-3xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                    border: `1px solid ${sign.gradientFrom}25`,
                    boxShadow: `0 0 60px ${sign.glowColor}20, 0 20px 60px rgba(0,0,0,0.3)`,
                  }}
                >
                  <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${sign.gradientFrom}80, transparent)` }} />
                  <div className="px-6 py-6 space-y-5">
                    {HOROSCOPE_SECTIONS.map(({ key, label, Icon, colorClass }) => {
                      const text = horoscope[key as keyof HoroscopeResponse] as string;
                      if (!text) return null;
                      const isPrediction = key === 'prediction';
                      return (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Icon size={13} className={`${colorClass} flex-shrink-0`} />
                            <span className={`text-xs font-semibold uppercase tracking-widest ${colorClass}`}>{label}</span>
                          </div>
                          <p className={`text-sm leading-relaxed pl-5 ${isPrediction ? 'italic text-white/60' : 'text-white/70'}`}>
                            {isPrediction ? `"${text}"` : text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${sign.gradientTo}40, transparent)` }} />
                </div>

                {/* Dimension spirituelle */}
                <div
                  className="mt-4 rounded-2xl p-4"
                  style={{
                    background: `linear-gradient(135deg, ${sign.gradientFrom}10, ${sign.gradientTo}08)`,
                    border: `1px solid ${sign.gradientFrom}18`,
                  }}
                >
                  <p className="text-white/35 text-xs uppercase tracking-widest mb-1.5">Dimension spirituelle</p>
                  <p className="text-white/45 text-xs leading-relaxed italic">{sign.spirituel}</p>
                </div>
              </motion.section>
            )}

            {/* ══ Ambiance Astrale ══════════════════════════════════════════ */}
            {ambiance && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <p className="text-violet-300/45 text-xs uppercase tracking-[0.35em] mb-1">Cosmologie du jour</p>
                <h2 className="font-display text-xl font-bold text-white mb-6">✦ Ambiance Astrale</h2>

                {/* Ambiance text */}
                <div
                  className="rounded-2xl p-5 mb-8"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.06))',
                    border: '1px solid rgba(124,58,237,0.18)',
                  }}
                >
                  <p className="text-white/65 text-sm sm:text-base leading-relaxed italic">
                    {ambiance.ambiance}
                  </p>
                </div>

                {/* Score bars */}
                <div className="space-y-3 mb-10">
                  {SCORE_ITEMS.map(({ key, label, color }, i) => {
                    const score = ambiance.scores?.[key as keyof AmbianceScores] ?? 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-white/40 text-xs w-24 flex-shrink-0">{label}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-white/50 text-xs w-9 text-right font-medium">{score}%</span>
                      </div>
                    );
                  })}
                </div>

                {/* Lucky number + Compatible signs */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div
                    className="rounded-2xl p-5 flex flex-col items-center justify-center text-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))',
                      border: '1px solid rgba(245,158,11,0.22)',
                    }}
                  >
                    <p className="text-amber-400/60 text-[10px] uppercase tracking-widest mb-2">
                      Chiffre porte-bonheur
                    </p>
                    <span className="font-display text-5xl font-bold text-amber-300">
                      {ambiance.chiffrePorteBonheur}
                    </span>
                  </div>

                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.06))',
                      border: '1px solid rgba(139,92,246,0.22)',
                    }}
                  >
                    <p className="text-violet-400/60 text-[10px] uppercase tracking-widest mb-3">
                      Compatibilité du jour
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {(ambiance.compatibilite ?? []).slice(0, 2).map((compId) => {
                        const compSign = signs.find((s) => s.id === compId);
                        if (!compSign) return null;
                        return (
                          <Link
                            key={compId}
                            href={`/horoscope/${compId}`}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <span className="text-xl">{compSign.emoji}</span>
                            <span className="text-white/65 text-sm">{compSign.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Lunar sections */}
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Phase lunaire</p>
                  <p className="text-white/50 text-sm mb-5">🌙 {moonLabel}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LUNE_ITEMS.map(({ key, label, emoji: luneEmoji }) => {
                      const text = ambiance.lune?.[key as keyof AmbianceLune];
                      if (!text) return null;
                      return (
                        <motion.div
                          key={key}
                          className="rounded-2xl p-4"
                          style={{
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                            border: '1px solid rgba(255,255,255,0.07)',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                            {luneEmoji} {label}
                          </p>
                          <p className="text-white/45 text-xs leading-relaxed">{text}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
            )}
          </>
        )}

        {/* Footer nav */}
        <div className="text-center mt-16 pt-8 border-t border-white/5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm text-white/50 hover:text-white/80 transition-colors border border-white/10 hover:border-violet-400/30"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
