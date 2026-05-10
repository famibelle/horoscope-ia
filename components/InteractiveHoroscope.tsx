'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import SignSelector from './SignSelector';
import HoroscopeCard from './HoroscopeCard';
import AudioPlayer from './AudioPlayer';
import { signs } from '@/lib/signs-data';
import { detectEdition, EDITION_LABELS } from '@/lib/edition';
import type { HoroscopeResponse } from '@/lib/horoscope-data';
import { todayISO } from '@/lib/horoscope-data';
import type { Edition } from '@/private/maryse-prompt';

export default function InteractiveHoroscope() {
  const [selectedSignId, setSelectedSignId] = useState<string>('lion');
  const [edition, setEdition] = useState<Edition>('matin');
  const [data, setData]       = useState<HoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEdition(detectEdition());
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
                border: active
                  ? '1px solid rgba(124,58,237,0.5)'
                  : '1px solid rgba(255,255,255,0.08)',
                color: active ? '#e2d9f3' : 'rgba(255,255,255,0.35)',
              }}
            >
              <span>{emoji}</span>
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
