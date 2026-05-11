'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import SignSelector from './SignSelector';
import HoroscopeCard from './HoroscopeCard';
import AudioPlayer from './AudioPlayer';
import { signs } from '@/lib/signs-data';
import type { HoroscopeResponse } from '@/lib/horoscope-data';
import { todayISO } from '@/lib/horoscope-data';
import { useEdition } from '@/contexts/EditionContext';

export default function InteractiveHoroscope() {
  const { edition } = useEdition();
  const [selectedSignId, setSelectedSignId] = useState<string>('lion');
  const [data, setData]       = useState<HoroscopeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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
