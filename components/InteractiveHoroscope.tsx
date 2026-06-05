'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import SignSelector from './SignSelector';
import HoroscopeCard from './HoroscopeCard';
import AudioPlayer from './AudioPlayer';
import { signs } from '@/lib/signs-data';

function getCurrentSign(): string {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'belier';
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'taureau';
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'gemeaux';
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'cancer';
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'lion';
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'vierge';
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'balance';
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'scorpion';
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'sagittaire';
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'capricorne';
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'verseau';
  return 'poissons';
}
import type { HoroscopeResponse } from '@/lib/horoscope-data';
import { todayISO } from '@/lib/horoscope-data';
import { useEdition } from '@/contexts/EditionContext';
import type { Edition } from '@/lib/private/maryse-prompt';

export default function InteractiveHoroscope({
  prefetchedData,
  prefetchedSign,
}: {
  prefetchedData?: HoroscopeResponse | null;
  prefetchedSign?: string | null;
}) {
  const { edition } = useEdition();
  const [selectedSignId, setSelectedSignId] = useState<string>(prefetchedSign ?? 'lion');
  const [ready, setReady]      = useState(false);
  const [data, setData]        = useState<HoroscopeResponse | null>(prefetchedData ?? null);
  const [loading, setLoading]  = useState(!prefetchedData);
  const [error, setError]      = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Restaurer le signe sauvegardé, ou utiliser le signe du jour en cours
  useEffect(() => {
    const saved = localStorage.getItem('lastSign');
    const validIds = new Set(signs.map(s => s.id));
    const resolved = (saved && validIds.has(saved)) ? saved : getCurrentSign();
    setSelectedSignId(resolved);
    setReady(true);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const signId = (e as CustomEvent<string>).detail;
      setSelectedSignId(signId);
      localStorage.setItem('lastSign', signId);
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
      // Get visitor's local date and hour
      const date = todayISO();
      const hour = new Date().getHours();
      
      const res = await fetch(
        `/api/horoscope/${signId}?date=${date}&userHour=${hour}&edition=${ed}`,
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
    if (!ready) return;
    // Réutilise les données prefetchées si le signe correspond, évite un fetch inutile
    if (prefetchedData && selectedSignId === prefetchedSign && edition === 'matin') {
      setData(prefetchedData);
      setLoading(false);
      return;
    }
    fetchHoroscope(selectedSignId, edition);
  }, [selectedSignId, edition, fetchHoroscope, ready, prefetchedData, prefetchedSign]);

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
        horoscope={data}
        signName={sign?.name ?? ''}
        
      />
    </>
  );
}
