'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Briefcase, Coins, Users, Sparkles, Eye, Activity } from 'lucide-react';
import { signs } from '@/lib/signs-data';
import { detectEditionWithNight, getDynamicEditionLabels } from '@/lib/edition';
import AudioPlayer from '@/components/AudioPlayer';
import type { Edition } from '@/lib/private/maryse-prompt';
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
  { key: 'ouverture',  label: 'Parole des ancêtres', Icon: Sparkles,  colorClass: 'text-ancestral-gold' },
  { key: 'amour',      label: 'Amour',              Icon: Heart,     colorClass: 'text-ancestral-terracotta' },
  { key: 'travail',    label: 'Travail',            Icon: Briefcase, colorClass: 'text-ancestral-forest' },
  { key: 'argent',     label: 'Argent',             Icon: Coins,     colorClass: 'text-ancestral-gold' },
  { key: 'amitie',     label: 'Lyannaj',            Icon: Users,     colorClass: 'text-ancestral-cream' },
  { key: 'sante',      label: 'Santé',              Icon: Activity,  colorClass: 'text-ancestral-forest' },
  { key: 'prediction', label: 'Présage ancestral',  Icon: Eye,       colorClass: 'text-ancestral-gold' },
] as const;

const SCORE_ITEMS = [
  { key: 'amour',      label: 'Amour',       color: '#CD5C5C' },
  { key: 'travail',    label: 'Travail',     color: '#228B22' },
  { key: 'bienetre',   label: 'Bien-être',   color: '#FFD700' },
  { key: 'vieSociale', label: 'Vie sociale', color: '#8B4513' },
  { key: 'finances',   label: 'Finances',    color: '#D2691E' },
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
        style={{ background: 'rgba(245,245,220,0.03)', border: `1px solid rgba(210,105,30,0.15)` }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 rounded bg-ancestral-cream/8" />
            <div className="h-4 w-full rounded bg-ancestral-cream/5" />
            <div className="h-4 w-4/5 rounded bg-ancestral-cream/5" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(245,245,220,0.03)' }}>
        <div className="h-4 w-full rounded bg-ancestral-cream/5" />
        <div className="h-4 w-3/4 rounded bg-ancestral-cream/5" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-3 w-20 rounded bg-ancestral-cream/5 flex-shrink-0" />
          <div className="flex-1 h-2 rounded-full bg-ancestral-cream/5" />
          <div className="h-3 w-8 rounded bg-ancestral-cream/5" />
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

  useEffect(() => {
    // Détecter l'édition basée sur l'heure de Guadeloupe
    setEdition(detectEditionWithNight());
  }, []);

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
            background: `radial-gradient(circle, rgba(210,105,30,0.18) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative z-10 px-4 py-10 max-w-2xl mx-auto">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-ancestral-cream/35 text-sm hover:text-ancestral-cream/70 transition-colors mb-10"
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
              className="font-display text-4xl sm:text-5xl font-bold leading-tight text-ancestral-gold"
            >
              {sign.name}
            </h1>
            <p className="text-ancestral-cream/30 text-sm uppercase tracking-widest mt-1">
              {sign.planet} · {sign.element}
            </p>
            <p className="text-xs mt-1 font-semibold text-ancestral-gold/90">
              {sign.nomKreyol}
            </p>
          </div>
        </motion.div>

        {/* Edition pills */}
        <div className="flex gap-2 mb-10">
          {(['nuit', 'matin', 'midi', 'soir'] as const).map((ed) => {
            const dynamicLabels = getDynamicEditionLabels(edition || 'matin');
            const { label, emoji: edEmoji } = dynamicLabels[ed];
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
                    ? 'linear-gradient(135deg, rgba(210,105,30,0.35), rgba(255,215,0,0.25))'
                    : 'rgba(245,245,220,0.05)',
                  border: active ? '1px solid rgba(210,105,30,0.5)' : '1px solid rgba(245,245,220,0.08)',
                  color: active ? '#F5F5DC' : 'rgba(245,245,220,0.35)',
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
                <p className="text-ancestral-gold/45 text-xs uppercase tracking-[0.35em] mb-1">Paroles de Maryse CondAI</p>
                <h2 className="font-display text-xl font-bold text-ancestral-cream mb-6">Horoscope du jour</h2>

                <div
                  className="rounded-3xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(245,245,220,0.06) 0%, rgba(139,69,19,0.02) 100%)',
                    border: `1px solid rgba(210,105,30,0.25)`,
                    boxShadow: `0 0 60px rgba(210,105,30,0.2), 0 20px 60px rgba(0,0,0,0.3)`,
                  }}
                >
                  <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(210,105,30,0.8), transparent)` }} />
                  <div className="px-6 py-6 space-y-5">
                    {HOROSCOPE_SECTIONS.map(({ key, label, Icon, colorClass }) => {
                      const text = horoscope[key as keyof HoroscopeResponse] as string;
                      if (!text || key === 'sante') return null;  // Masquage forcé : santé est un sujet sensible
                      const isPrediction = key === 'prediction';
                      return (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Icon size={13} className={`${colorClass} flex-shrink-0`} />
                            <span className={`text-xs font-semibold uppercase tracking-widest ${colorClass}`}>{label}</span>
                          </div>
                          <p className={`text-sm leading-relaxed pl-5 ${isPrediction ? 'italic text-ancestral-cream/60' : 'text-ancestral-cream/70'}`}>
                            {isPrediction ? `"${text}"` : text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)` }} />
                </div>

                {/* Dimension spirituelle */}
                <div
                  className="mt-4 rounded-2xl p-4"
                  style={{
                    background: `linear-gradient(135deg, rgba(210,105,30,0.10), rgba(255,215,0,0.08))`,
                    border: `1px solid rgba(210,105,30,0.18)`,
                  }}
                >
                  <p className="text-ancestral-cream/35 text-xs uppercase tracking-widest mb-1.5">Dimension spirituelle</p>
                  <p className="text-ancestral-cream/45 text-xs leading-relaxed italic">{sign.spirituel}</p>
                </div>
              </motion.section>
            )}

            {/* ══ Carte Culturelle Karukera ════════════════════════════════════════ */}
            {horoscope?.culturalData && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-14"
              >
                <p className="text-ancestral-gold/45 text-xs uppercase tracking-[0.35em] mb-1">Savoirs de Karukera</p>
                <h2 className="font-display text-xl font-bold text-ancestral-cream mb-6">🌿 Totems et symboles</h2>
                
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(46,72,44,0.08) 0%, rgba(139,69,19,0.04) 100%)',
                    border: `1px solid rgba(210,105,30,0.20)`,
                  }}
                >
                  <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(210,105,30,0.6), transparent)` }} />
                  
                  {/* Faune */}
                  {horoscope.culturalData.faune && (
                    <div className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, rgba(210,105,30,0.20), rgba(255,215,0,0.12))',
                            border: '1px solid rgba(210,105,30,0.30)'
                          }}
                        >
                          <span className="text-2xl">🦎</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ancestral-cream text-sm flex items-center gap-2">
                            {horoscope.culturalData.faune.nom_commun}
                            <span className="text-ancestral-cream/40 text-xs">({horoscope.culturalData.faune.nom_creole})</span>
                          </h3>
                          <p className="text-ancestral-cream/50 text-xs mt-2 leading-relaxed italic">
                            {horoscope.culturalData.faune.savoir}
                          </p>
                          {horoscope.culturalData.faune.conditions.length > 0 && (
                            <div className="mt-3 flex gap-2">
                              {horoscope.culturalData.faune.conditions.map((c) => (
                                <span
                                  key={c}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                  style={{
                                    background: 'rgba(245,245,220,0.10)',
                                    color: 'rgba(245,245,220,0.60)',
                                    border: '1px solid rgba(245,245,220,0.15)'
                                  }}
                                >
                                  {c === 'soleil' && '☀️'}
                                  {c === 'pluie' && '🌧️'}
                                  {c === 'nuageux' && '☁️'}
                                  {c === 'vent' && '💨'}
                                  {c === 'chaleur' && '🔥'}
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {horoscope.culturalData.faune && horoscope.culturalData.flore && (
                    <div className="px-6 pb-4 pt-2 border-t border-white/5">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, rgba(34,139,34,0.20), rgba(144,238,144,0.12))',
                            border: '1px solid rgba(34,139,34,0.30)'
                          }}
                        >
                          <span className="text-2xl">🌺</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ancestral-cream text-sm flex items-center gap-2">
                            {horoscope.culturalData.flore.nom_commun}
                            <span className="text-ancestral-cream/40 text-xs">({horoscope.culturalData.flore.nom_creole})</span>
                          </h3>
                          <p className="text-ancestral-cream/50 text-xs mt-2 leading-relaxed italic">
                            {horoscope.culturalData.flore.savoir}
                          </p>
                          {horoscope.culturalData.flore.conditions.length > 0 && (
                            <div className="mt-3 flex gap-2">
                              {horoscope.culturalData.flore.conditions.map((c) => (
                                <span
                                  key={c}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                  style={{
                                    background: 'rgba(245,245,220,0.10)',
                                    color: 'rgba(245,245,220,0.60)',
                                    border: '1px solid rgba(245,245,220,0.15)'
                                  }}
                                >
                                  {c === 'soleil' && '☀️'}
                                  {c === 'pluie' && '🌧️'}
                                  {c === 'nuageux' && '☁️'}
                                  {c === 'vent' && '💨'}
                                  {c === 'chaleur' && '🔥'}
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {horoscope.culturalData.lieuDetails && (
                    <div className="px-6 py-4 border-t border-white/5">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, rgba(70,130,180,0.20), rgba(173,216,230,0.12))',
                            border: '1px solid rgba(70,130,180,0.30)'
                          }}
                        >
                          <span className="text-2xl">📍</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ancestral-cream text-sm flex items-center gap-2">
                            {horoscope.culturalData.lieu}
                          </h3>
                          <p className="text-ancestral-cream/50 text-xs mt-2 leading-relaxed">
                            {horoscope.culturalData.lieuDetails.description}
                          </p>
                          <p className="text-ancestral-cream/40 text-xs mt-2 italic">
                            "{horoscope.culturalData.lieuDetails.symbolique}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)` }} />
                </div>
              </motion.section>
            )}

            {/* Newsletter - Recevoir son horoscope par mail */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-14"
            >
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(210,105,30,0.12), rgba(255,215,0,0.08))',
                  border: '1px solid rgba(210,105,30,0.25)',
                }}
              >
                <h3 className="font-display text-lg font-bold text-ancestral-cream mb-3 flex items-center justify-center gap-3">
                  <div
                    className="flex gap-0.5 overflow-hidden relative w-7 h-7 rounded-full"
                    style={{ background: 'rgba(245,245,220,0.08)' }}
                  >
                    <motion.div
                      className="flex gap-0.5 whitespace-nowrap items-center"
                      animate={{ x: ['0%', '-100%'] }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                      <span className="text-base">{sign.emoji}</span>
                      <span className="text-base">❤️</span>
                      <span className="text-base">💰</span>
                      <span className="text-base">💪</span>
                      <span className="text-base">🤝</span>
                      <span className="text-base">💼</span>
                      <span className="text-base">{sign.emoji}</span>
                      <span className="text-base">❤️</span>
                      <span className="text-base">💰</span>
                    </motion.div>
                  </div>
                  Recevez votre horoscope du {sign.name} tous les matins
                </h3>
                <p className="text-ancestral-cream/40 text-sm mb-5">
                  Les prédictions de Maryse CondAI directement dans votre boîte mail.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="flex-1 px-4 py-2.5 rounded-xl text-ancestral-cream/80 placeholder-ancestral-cream/20 text-sm"
                    style={{
                      background: 'rgba(245,245,220,0.05)',
                      border: '1px solid rgba(245,245,220,0.15)',
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-ancestral-dark bg-gradient-to-r from-ancestral-gold/90 to-ancestral-gold/60"
                  >
                    S'abonner
                  </motion.button>
                </div>
                <p className="text-ancestral-cream/30 text-[10px] mt-3">
                  Désabonnement en un clic. Vos données restent privées.
                </p>
              </div>
            </motion.section>

            {/* ══ Ambiance Astrale ══════════════════════════════════════════ */}
            {ambiance && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <p className="text-ancestral-gold/45 text-xs uppercase tracking-[0.35em] mb-1">Sagesse du jour</p>
                <h2 className="font-display text-xl font-bold text-ancestral-cream mb-6">✦ Énergie de Karukera</h2>

                {/* Ambiance text */}
                <div
                  className="rounded-2xl p-5 mb-8"
                  style={{
                    background: 'linear-gradient(135deg, rgba(210,105,30,0.1), rgba(255,215,0,0.06))',
                    border: '1px solid rgba(210,105,30,0.18)',
                  }}
                >
                  <p className="text-ancestral-cream/65 text-sm sm:text-base leading-relaxed italic">
                    {ambiance.ambiance}
                  </p>
                </div>

                {/* Score bars */}
                <div className="space-y-3 mb-10">
                  {SCORE_ITEMS.map(({ key, label, color }, i) => {
                    const score = ambiance.scores?.[key as keyof AmbianceScores] ?? 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-ancestral-cream/40 text-xs w-24 flex-shrink-0">{label}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(245,245,220,0.06)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-ancestral-cream/50 text-xs w-9 text-right font-medium">{score}%</span>
                      </div>
                    );
                  })}
                </div>

                {/* Lucky number + Compatible signs */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div
                    className="rounded-2xl p-5 flex flex-col items-center justify-center text-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(210,105,30,0.12), rgba(255,215,0,0.06))',
                      border: '1px solid rgba(210,105,30,0.22)',
                    }}
                  >
                    <p className="text-ancestral-gold/60 text-[10px] uppercase tracking-widest mb-2">
                      Chiffre sacré
                    </p>
                    <span className="font-display text-5xl font-bold text-ancestral-gold">
                      {ambiance.chiffrePorteBonheur}
                    </span>
                  </div>

                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: 'linear-gradient(135deg, rgba(228,196,144,0.12), rgba(255,215,0,0.06))',
                      border: '1px solid rgba(228,196,144,0.22)',
                    }}
                  >
                    <p className="text-ancestral-gold/60 text-[10px] uppercase tracking-widest mb-3">
                      Totems alliés
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
                            <span className="text-ancestral-cream/65 text-sm">{compSign.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Lunar sections */}
                <div>
                  <p className="text-ancestral-cream/30 text-[10px] uppercase tracking-widest mb-0.5">Phase lunaire</p>
                  <p className="text-ancestral-cream/50 text-sm mb-5">🌕 {moonLabel}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LUNE_ITEMS.map(({ key, label, emoji: luneEmoji }) => {
                      const text = ambiance.lune?.[key as keyof AmbianceLune];
                      if (!text) return null;
                      return (
                        <motion.div
                          key={key}
                          className="rounded-2xl p-4"
                          style={{
                            background: 'linear-gradient(145deg, rgba(245,245,220,0.04) 0%, rgba(139,69,19,0.02) 100%)',
                            border: '1px solid rgba(245,245,220,0.07)',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <p className="text-ancestral-cream/50 text-xs font-semibold uppercase tracking-wider mb-2">
                            {luneEmoji} {label}
                          </p>
                          <p className="text-ancestral-cream/45 text-xs leading-relaxed">{text}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
            )}
            
            {/* Horoscope audio */}
            {horoscope && (
              <div className="mt-16">
                <AudioPlayer
                  signName={sign.name}
                  horoscope={horoscope}
                  edition={horoscope.edition || edition || 'matin'}
                />
              </div>
            )}
          </>
        )}

        {/* Footer nav */}
        <div className="text-center mt-16 pt-8 border-t border-ancestral-cream/5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm text-ancestral-cream/50 hover:text-ancestral-cream/80 transition-colors border border-ancestral-cream/10 hover:border-ancestral-gold/30"
            style={{ background: 'rgba(245,245,220,0.03)' }}
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
