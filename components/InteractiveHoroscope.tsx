'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import SignSelector from './SignSelector';
import HoroscopeCard from './HoroscopeCard';
import AudioPlayer from './AudioPlayer';
import { signs } from '@/lib/signs-data';
import { detectEdition, EDITION_LABELS, getMoonPhaseEmoji } from '@/lib/edition';
import type { HoroscopeResponse } from '@/lib/horoscope-data';
import { todayISO } from '@/lib/horoscope-data';
import type { Edition } from '@/private/maryse-prompt';

export default function InteractiveHoroscope() {
  const [selectedSignId, setSelectedSignId] = useState<string>('lion');
  const [edition, setEdition] = useState<Edition>('matin');
  const [data, setData]       = useState<HoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [moonEmoji, setMoonEmoji] = useState<string>('🌙');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEdition(detectEdition());
    setMoonEmoji(getMoonPhaseEmoji());
  }, []);

  // Toggle dark mode for "soir" edition
  useEffect(() => {
    document.body.classList.toggle('soir-mode', edition === 'soir');
  }, [edition]);

  useEffect(() => {
    const handler = (e: Event) => {
      const signId = (e as CustomEvent<string>).detail;
      setSelectedSignId(signId);
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    };
    window.addEventListener('select-sign', handler);
    return () => window.removeEventListener('select-sign', handler);
  }, []);

  const fetchHoroscope = useCallback(async (signId: string, ed: Edition) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(
        `/api/horoscope/${signId}?date=${todayISO()}&edition=${ed}`,
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setData(json as HoroscopeResponse);
    } catch (e) {
      setError("L'horoscope est temporairement indisponible.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHoroscope(selectedSignId, edition);
  }, [selectedSignId, edition, fetchHoroscope]);

  const sign = signs.find((s) => s.id === selectedSignId);

  const horoscopeText = data
    ? [data.ouverture, data.amour, data.travail, data.argent, data.amitie, data.prediction]
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <>
      {/* Edition toggle */}
      <div className="flex justify-center gap-2 px-4 mb-2">
        {(['matin', 'midi', 'soir'] as Edition[]).map((ed) => {
          const { label, emoji } = EDITION_LABELS[ed];
          const active = edition === ed;
          // Use dynamic moon emoji for "soir"
          const displayEmoji = ed === 'soir' ? moonEmoji : emoji;
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
                border: active
                  ? '1px solid rgba(210,105,30,0.5)'
                  : '1px solid rgba(245,245,220,0.08)',
                color: active ? '#F5F5DC' : 'rgba(245,245,220,0.35)',
              }}
            >
              <span>{displayEmoji}</span>
              <span>{label}</span>
            </motion.button>
          );
        })}
      </div>

      <SignSelector
        selected={selectedSignId}
        onSelect={(id) => {
          setSelectedSignId(id);
          cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />

      <div ref={cardRef} />
      <HoroscopeCard
        sign={sign}
        data={data}
        loading={loading}
        error={error}
        onRetry={() => fetchHoroscope(selectedSignId, edition)}
      />

      <AudioPlayer
        signName={sign?.name ?? ''}
        text={horoscopeText}
      />
    </>
  );
}
