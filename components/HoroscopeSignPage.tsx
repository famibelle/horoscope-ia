'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Heart, Briefcase, Coins, Users, Sparkles, Eye, Activity } from 'lucide-react';
import { signs } from '@/lib/signs-data';
import { detectLocalEditionWithNight, getLocalDynamicEditionLabels } from '@/lib/edition';
import AudioPlayer from '@/components/AudioPlayer';
import type { Edition } from '@/lib/private/maryse-prompt';
import type { HoroscopeResponse } from '@/lib/horoscope-data';
import { Markdown as ReactMarkdown, markdownComponents, creoleComponents } from '@/lib/markdown-components';
import { useDictionnaire } from '@/lib/use-dictionnaire';
import HoroscopeSubscribeForm from '@/components/HoroscopeSubscribeForm';
import fichesData from '@/lib/fiches-culturelles.json';

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

/* ── Component ─────────────────────────────────────────────────────────────── */

interface Props {
  signId: string;
  prefetchedHoroscope: HoroscopeResponse | null;
}

function ChiffreSacre({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayed, setDisplayed] = useState<number>(() => Math.floor(Math.random() * 9) + 1);

  useEffect(() => {
    if (!isInView) return;
    let count = 0;
    const flashes = 14;
    const id = setInterval(() => {
      count++;
      if (count >= flashes) {
        setDisplayed(value);
        clearInterval(id);
      } else {
        setDisplayed(Math.floor(Math.random() * 9) + 1);
      }
    }, 70);
    return () => clearInterval(id);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      className="rounded-2xl p-5 flex flex-col items-center justify-center text-center"
      style={{ background: 'linear-gradient(135deg, rgba(210,105,30,0.12), rgba(255,215,0,0.06))', border: '1px solid rgba(210,105,30,0.22)' }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.5, ease: 'backOut' }}
    >
      <p className="text-ancestral-gold/60 text-[12px] uppercase tracking-widest mb-2">Chiffre sacré</p>
      <span className="font-display text-5xl font-bold text-ancestral-gold">{displayed}</span>
    </motion.div>
  );
}

function TotemsAllies({ compatibilite }: { compatibilite: string[] | Record<string, string> }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const finalIds = (Array.isArray(compatibilite) ? compatibilite : Object.values(compatibilite ?? {})).slice(0, 2);
  const randomSign = () => signs[Math.floor(Math.random() * signs.length)].id;
  const [displayed, setDisplayed] = useState<string[]>(() => [randomSign(), randomSign()]);
  const [settled, setSettled] = useState([false, false]);

  useEffect(() => {
    if (!isInView || finalIds.length === 0) return;
    const flashes = 14;
    let count = 0;
    const id = setInterval(() => {
      count++;
      if (count >= flashes + 4) {
        setDisplayed(finalIds);
        setSettled([true, true]);
        clearInterval(id);
      } else if (count >= flashes) {
        setDisplayed(prev => [finalIds[0], randomSign()]);
        setSettled(prev => [true, prev[1]]);
      } else {
        setDisplayed([randomSign(), randomSign()]);
      }
    }, 70);
    return () => clearInterval(id);
  }, [isInView]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      ref={ref}
      className="rounded-2xl p-5"
      style={{ background: 'linear-gradient(135deg, rgba(228,196,144,0.12), rgba(255,215,0,0.06))', border: '1px solid rgba(228,196,144,0.22)' }}
      initial={{ opacity: 0, x: 20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <p className="text-ancestral-gold/60 text-[12px] uppercase tracking-widest mb-3">Totems alliés</p>
      <div className="flex flex-col gap-2.5">
        {displayed.map((signId, i) => {
          const sign = signs.find((s) => s.id === signId);
          if (!sign) return null;
          const isSettled = settled[i];
          const finalId = finalIds[i];
          const inner = (
            <>
              <span className="text-xl">{sign.emoji}</span>
              <span className="text-ancestral-cream/65 text-[15px]">{sign.name}</span>
            </>
          );
          return isSettled ? (
            <Link key={finalId} href={`/horoscope/${finalId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {inner}
            </Link>
          ) : (
            <div key={i} className="flex items-center gap-2 opacity-70">{inner}</div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function HoroscopeSignPage({ signId, prefetchedHoroscope }: Props) {
  const sign = signs.find((s) => s.id === signId);

  const [edition, setEdition] = useState<Edition | null>(null);
  const [horoscope, setHoroscope] = useState<HoroscopeResponse | null>(prefetchedHoroscope ?? null);
  const [ambiance, setAmbiance] = useState<AmbianceData | null>(null);
  const [loading, setLoading] = useState(!prefetchedHoroscope);
  const [localDateTime, setLocalDateTime] = useState('');

  function formatLocalDateTime(): string {
    const now = new Date();
    const date = now.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    return `${date}, ${h}h${m}`;
  }

  useEffect(() => {
    setLocalDateTime(formatLocalDateTime());
    const id = setInterval(() => setLocalDateTime(formatLocalDateTime()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setEdition(detectLocalEditionWithNight());
  }, []);

  useEffect(() => {
    if (!edition || !signId) return;

    const controller = new AbortController();
    const { signal } = controller;
    const date = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();

    if (horoscope?.edition === edition) {
      // Horoscope déjà correct, charger uniquement l'ambiance si absente
      if (!ambiance) {
        fetch(`/api/ambiance/${signId}?userDate=${date}&edition=${edition}`, { signal })
          .then((r) => r.json())
          .then((a) => { if (!signal.aborted) setAmbiance(a as AmbianceData); })
          .catch(() => {});
      }
    } else {
      // Édition différente → refetch horoscope + ambiance ensemble
      setLoading(true);
      setHoroscope(null);
      setAmbiance(null);
      Promise.all([
        fetch(`/api/horoscope/${signId}?date=${date}&userHour=${hour}&edition=${edition}`, { signal }).then((r) => r.json()),
        fetch(`/api/ambiance/${signId}?userDate=${date}&edition=${edition}`, { signal }).then((r) => r.json()),
      ])
        .then(([h, a]) => {
          if (signal.aborted) return;
          setHoroscope(h as HoroscopeResponse);
          setAmbiance(a as AmbianceData);
        })
        .catch((err) => { if (!signal.aborted) console.error(err); })
        .finally(() => { if (!signal.aborted) setLoading(false); });
    }

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signId, edition]);

  const dict = useDictionnaire();
  const mdComponents = Object.keys(dict).length > 0 ? creoleComponents(dict) : markdownComponents;

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

      <div className="relative z-10 max-w-2xl mx-auto">

        {/* ── Header hero ──────────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(180deg, #0D1A12 0%, #14291A 100%)',
            padding: '16px 16px 20px',
          }}
        >
          {/* Ligne haute : logo + avatar */}
          <div className="flex items-center justify-between mb-4">
            <span
              className="font-accent italic"
              style={{ fontSize: '15px', color: '#D4AF50', letterSpacing: '0.02em' }}
            >
              La Voix de nos Ancêtres
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1.5px solid rgba(212,175,80,0.5)',
                background: 'rgba(212,175,80,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              🌿
            </div>
          </div>

          {/* Pill du signe */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(212,175,80,0.08)',
              border: '1px solid rgba(212,175,80,0.25)',
              borderRadius: '16px',
              padding: '10px 14px',
            }}
          >
            <span style={{ fontSize: '28px', lineHeight: 1 }}>{sign.emoji}</span>
            <div style={{ flex: 1 }}>
              <p
                className="font-display"
                style={{ fontSize: '18px', fontWeight: 700, color: '#E8D98A', lineHeight: 1.1 }}
              >
                {sign.name}
              </p>
              <p className="font-ui" style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {sign.planet} · {sign.element}
              </p>
            </div>
            <Link
              href="/"
              style={{
                fontSize: '12px',
                color: 'var(--color-gold)',
                border: '1px solid rgba(212,175,80,0.3)',
                borderRadius: '8px',
                padding: '4px 8px',
                textDecoration: 'none',
                fontWeight: 500,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
              }}
            >
              Changer
            </Link>
          </motion.div>

          {/* Date et heure locale */}
          {localDateTime && (
            <p className="font-ui" style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginTop: '10px', textTransform: 'capitalize' }}>
              {localDateTime}
            </p>
          )}
        </div>

        <div className="px-4 py-6">

        {/* ── Bloc statique signe, indexable par Google ─────────────── */}
        <section className="mb-6 pb-5" style={{ borderBottom: '1px solid rgba(245,245,220,0.06)' }}>
          <h1
            className="font-display font-bold text-ancestral-cream mb-1"
            style={{ fontSize: '20px', lineHeight: 1.2 }}
          >
            Horoscope {sign.name} du jour, Karukera
          </h1>
          <p
            className="font-ui text-ancestral-cream/40 text-[12px] mb-3"
            style={{ letterSpacing: '0.05em' }}
          >
            {sign.dateRange} · {sign.element} · {sign.planet}
          </p>
        </section>

        {/* Edition pills */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {(['nuit', 'matin', 'midi', 'soir'] as const).map((ed) => {
            const dynamicLabels = getLocalDynamicEditionLabels(edition || 'matin');
            const { label, emoji: edEmoji } = dynamicLabels[ed];
            const active = edition === ed;
            return (
              <motion.button
                key={ed}
                onClick={() => setEdition(ed)}
                whileTap={{ scale: 0.96 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '7px 4px',
                  minHeight: '48px',
                  borderRadius: '10px',
                  border: active
                    ? '1px solid rgba(212,175,80,0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: active
                    ? 'rgba(212,175,80,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '14px', lineHeight: 1 }}>{edEmoji}</span>
                <span
                  className="font-ui"
                  style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: active ? '#D4AF50' : '#6B8A6E' }}
                >
                  {label}
                </span>
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
                <p className="text-ancestral-gold/45 text-[12px] uppercase tracking-[0.35em] mb-1">Paroles de Maryse CondAI</p>
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
                      if (!text || key === 'sante') return null;
                      const isPrediction = key === 'prediction';
                      return (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Icon size={13} className={`${colorClass} flex-shrink-0`} />
                            <span className={`text-[12px] font-semibold uppercase tracking-widest ${colorClass}`}>{label}</span>
                          </div>
                          <ReactMarkdown
                            components={{
                              ...mdComponents,
                              p: ({ children }) => (
                                <p className={`text-[18px] leading-[1.75] pl-5 ${isPrediction ? 'italic text-ancestral-cream/60' : 'text-ancestral-cream/70'}`}>
                                  {children}
                                </p>
                              ),
                            }}
                          >
                            {isPrediction ? `"${text}"` : text}
                          </ReactMarkdown>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)` }} />
                </div>

                {/* Dimension spirituelle */}
                <div
                  className="mt-3"
                  style={{ paddingTop: '14px', borderTop: '1px solid rgba(245,245,220,0.08)' }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={{ fontSize: '11px', color: 'rgba(212,175,80,0.6)', lineHeight: 1 }}>✦</span>
                    <p className="font-ui text-[11px] uppercase tracking-widest" style={{ color: 'rgba(200,216,192,0.55)' }}>Dimension spirituelle</p>
                    {horoscope?.spirituelMensuel && (
                      <span style={{
                        fontSize: '9px', letterSpacing: '0.06em', textTransform: 'uppercase',
                        background: 'rgba(212,175,80,0.12)', border: '1px solid rgba(212,175,80,0.22)',
                        borderRadius: '4px', padding: '1px 5px', color: 'rgba(212,175,80,0.7)',
                      }}>Mensuelle</span>
                    )}
                  </div>
                  <p className="font-accent text-[18px] leading-[1.75]" style={{ color: 'rgba(200,216,192,0.75)' }}>{horoscope?.spirituelMensuel ?? sign.spirituel}</p>
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
                <p className="text-ancestral-gold/45 text-[12px] uppercase tracking-[0.35em] mb-1">Savoirs de Karukera</p>
                <h2 className="font-display text-xl font-bold text-ancestral-cream mb-2">🌿 Totems et symboles</h2>
                <p className="text-ancestral-cream/65 text-[17px] mb-6 italic">
                  {(!edition && "Les esprits de Karukera vous attendent...") ||
                   (edition === 'nuit' && "Cette nuit, les esprits de Karukera dansent sous la lune, écoutez leurs murmures dans le vent.") ||
                   (edition === 'matin' && "Ce matin, le soleil se lève sur les mornes de Guadeloupe, éveillant les forces ancestrales.") ||
                   (edition === 'midi' && "Ce midi, l'énergie de Karukera est à son apogée, comme le zandoli sous le soleil de midi.") ||
                   (edition === 'soir' && "Ce soir, les étoiles guident vos pas sur les chemins de la sagesse créole.")}
                </p>

                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, rgba(46,72,44,0.08) 0%, rgba(139,69,19,0.04) 100%)',
                    border: `1px solid rgba(210,105,30,0.20)`,
                  }}
                >
                  <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(210,105,30,0.6), transparent)` }} />

                  {horoscope.culturalData.faune && (
                    <div className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, rgba(210,105,30,0.20), rgba(255,215,0,0.12))', border: '1px solid rgba(210,105,30,0.30)' }}
                        >
                          <span className="text-2xl">🦎</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ancestral-cream text-[15px] flex items-center gap-2">
                            {horoscope.culturalData.faune.nom_commun}
                            <span className="text-ancestral-cream/40 text-[12px]">({horoscope.culturalData.faune.nom_creole})</span>
                          </h3>
                          <p className="text-ancestral-cream/60 text-[17px] mt-2 leading-[1.75] italic">{horoscope.culturalData.faune.savoir}</p>
                          {horoscope.culturalData.faune.conditions.length > 0 && (
                            <div className="mt-3 flex gap-2">
                              {horoscope.culturalData.faune.conditions.map((c) => (
                                <span key={c} className="px-2 py-0.5 rounded-full text-[12px] font-medium"
                                  style={{ background: 'rgba(245,245,220,0.10)', color: 'rgba(245,245,220,0.60)', border: '1px solid rgba(245,245,220,0.15)' }}>
                                  {c === 'soleil' && '☀️'}{c === 'pluie' && '🌧️'}{c === 'nuageux' && '☁️'}{c === 'vent' && '💨'}{c === 'chaleur' && '🔥'}{c}
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
                          style={{ background: 'linear-gradient(135deg, rgba(34,139,34,0.20), rgba(144,238,144,0.12))', border: '1px solid rgba(34,139,34,0.30)' }}
                        >
                          <span className="text-2xl">🌺</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ancestral-cream text-[15px] flex items-center gap-2">
                            {horoscope.culturalData.flore.nom_commun}
                            <span className="text-ancestral-cream/40 text-[12px]">({horoscope.culturalData.flore.nom_creole})</span>
                          </h3>
                          <p className="text-ancestral-cream/60 text-[17px] mt-2 leading-[1.75] italic">{horoscope.culturalData.flore.savoir}</p>
                          {horoscope.culturalData.flore.conditions.length > 0 && (
                            <div className="mt-3 flex gap-2">
                              {horoscope.culturalData.flore.conditions.map((c) => (
                                <span key={c} className="px-2 py-0.5 rounded-full text-[12px] font-medium"
                                  style={{ background: 'rgba(245,245,220,0.10)', color: 'rgba(245,245,220,0.60)', border: '1px solid rgba(245,245,220,0.15)' }}>
                                  {c === 'soleil' && '☀️'}{c === 'pluie' && '🌧️'}{c === 'nuageux' && '☁️'}{c === 'vent' && '💨'}{c === 'chaleur' && '🔥'}{c}
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
                          style={{ background: 'linear-gradient(135deg, rgba(70,130,180,0.20), rgba(173,216,230,0.12))', border: '1px solid rgba(70,130,180,0.30)' }}
                        >
                          <span className="text-2xl">📍</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ancestral-cream text-[15px]">{horoscope.culturalData.lieu}</h3>
                          <p className="text-ancestral-cream/60 text-[17px] mt-2 leading-[1.75]">{horoscope.culturalData.lieuDetails.description}</p>
                          <p className="text-ancestral-cream/45 text-[17px] mt-2 italic">"{horoscope.culturalData.lieuDetails.symbolique}"</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)` }} />
                </div>
              </motion.section>
            )}

            {/* ══ Ambiance Astrale ══════════════════════════════════════════ */}
            {ambiance && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-ancestral-gold/45 text-[12px] uppercase tracking-[0.35em] mb-1">Sagesse du jour</p>
                <h2 className="font-display text-xl font-bold text-ancestral-cream mb-6">✦ Énergie de Karukera</h2>

                <div className="rounded-2xl p-5 mb-8"
                  style={{ background: 'linear-gradient(135deg, rgba(210,105,30,0.1), rgba(255,215,0,0.06))', border: '1px solid rgba(210,105,30,0.18)' }}
                >
                  <ReactMarkdown
                    components={{
                      ...mdComponents,
                      p: ({ children }) => (
                        <p className="text-ancestral-cream/70 text-[18px] leading-[1.75] italic">{children}</p>
                      ),
                    }}
                  >
                    {ambiance.ambiance}
                  </ReactMarkdown>
                </div>

                <div className="space-y-3 mb-10">
                  {SCORE_ITEMS.map(({ key, label, color }, i) => {
                    const score = ambiance.scores?.[key as keyof AmbianceScores] ?? 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-ancestral-cream/40 text-[12px] w-24 flex-shrink-0">{label}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(245,245,220,0.06)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${score}%` }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-ancestral-cream/50 text-[12px] w-9 text-right font-medium">{score}%</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <ChiffreSacre value={ambiance.chiffrePorteBonheur} />

                  <TotemsAllies compatibilite={ambiance.compatibilite} />
                </div>

                <div>
                  <p className="text-ancestral-cream/30 text-[12px] uppercase tracking-widest mb-0.5">Phase lunaire</p>
                  <p className="text-ancestral-cream/55 text-[17px] mb-5">🌕 {moonLabel}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LUNE_ITEMS.map(({ key, label, emoji: luneEmoji }) => {
                      const text = ambiance.lune?.[key as keyof AmbianceLune];
                      if (!text) return null;
                      return (
                        <motion.div key={key} className="rounded-2xl p-4"
                          style={{ background: 'linear-gradient(145deg, rgba(245,245,220,0.04) 0%, rgba(139,69,19,0.02) 100%)', border: '1px solid rgba(245,245,220,0.07)' }}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                        >
                          <p className="text-ancestral-cream/50 text-[12px] font-semibold uppercase tracking-wider mb-2">{luneEmoji} {label}</p>
                          <ReactMarkdown
                            components={{
                              ...mdComponents,
                              p: ({ children }) => (
                                <p className="text-ancestral-cream/55 text-[17px] leading-[1.75]">{children}</p>
                              ),
                            }}
                          >
                            {text}
                          </ReactMarkdown>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Newsletter */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-12 mb-14"
            >
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(210,105,30,0.12), rgba(255,215,0,0.08))',
                  border: '1px solid rgba(210,105,30,0.25)',
                }}
              >
                <h3 className="font-display text-lg font-bold text-ancestral-cream mb-3 flex items-center justify-center gap-3">
                  <div className="flex gap-0.5 overflow-hidden relative w-7 h-7 rounded-full" style={{ background: 'rgba(245,245,220,0.08)' }}>
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
                <p className="text-ancestral-cream/45 text-[17px] mb-5">Les prédictions de Maryse CondAI directement dans votre boîte mail.</p>
                <HoroscopeSubscribeForm defaultSignId={sign.id} />
                <p className="text-ancestral-cream/30 text-[12px] mt-3">Désabonnement en un clic. Vos données restent privées.</p>
              </div>
            </motion.section>

            {horoscope && (
              <div className="mt-16">
                <AudioPlayer signName={sign.name} horoscope={horoscope} edition={horoscope.edition || edition || 'matin'} />
              </div>
            )}

            {/* Fiche culturelle statique, indexée par Google */}
            <FicheCulturelle signId={sign.id} signName={sign.name} signEmoji={sign.emoji} faune={sign.faune} flore={sign.flore} lieu={sign.lieu} mdComponents={mdComponents} />
          </>
        )}

        </div>
      </div>
    </main>
  );
}

/* ── Fiche culturelle statique ─────────────────────────────────────────────── */

type FicheData = { symbolique: string; animal_totem: string; plante_sacree: string; lieu_ancestral: string };

function FicheCulturelle({
  signId, signName, signEmoji, faune, flore, lieu, mdComponents,
}: {
  signId: string;
  signName: string;
  signEmoji: string;
  faune: { nom_creole: string; nom_commun: string };
  flore: { nom_creole: string; nom_commun: string };
  lieu: string;
  mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'];
}) {
  const fiche = (fichesData as Record<string, FicheData>)[signId];
  if (!fiche) return null;

  const sections = [
    { titre: `${signEmoji} ${signName} dans la culture créole`, corps: fiche.symbolique },
    { titre: `🦎 L'animal totem : ${faune.nom_creole}`, corps: fiche.animal_totem },
    { titre: `🌿 La plante sacrée : ${flore.nom_creole}`, corps: fiche.plante_sacree },
    { titre: `📍 Le lieu ancestral : ${lieu}`, corps: fiche.lieu_ancestral },
  ];

  return (
    <section className="mt-16 mb-8" aria-label={`Culture et traditions ${signName}`}>
      <div style={{ borderTop: '1px solid rgba(245,245,220,0.07)', paddingTop: '32px' }}>
        <p className="text-ancestral-gold/45 text-[12px] uppercase tracking-[0.35em] mb-1">Karukera ancestrale</p>
        <h2 className="font-display text-xl font-bold text-ancestral-cream mb-2">
          Traditions & culture, {signName}
        </h2>
        <p className="text-ancestral-cream/40 text-[14px] mb-8 italic">
          L&apos;astrologie créole de Karukera puise dans la faune, la flore et les lieux sacrés de Guadeloupe pour donner à chaque signe une identité profondément ancrée dans la terre ancestrale.
        </p>

        <div className="space-y-8">
          {sections.map(({ titre, corps }) => (
            <div key={titre}>
              <h3
                className="font-ui font-semibold text-ancestral-gold text-[13px] uppercase tracking-wider mb-3"
                style={{ letterSpacing: '0.08em' }}
              >
                {titre}
              </h3>
              <div className="text-ancestral-cream/70 text-[17px] leading-[1.75]">
                <ReactMarkdown components={mdComponents}>{corps}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
