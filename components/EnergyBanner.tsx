'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WeatherData {
  tmin: number;
  tmax: number;
  label: string;
  wind: number;
  summary: string;
}

const PHASE_EMOJI = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

function lunarPhase(): { emoji: string; label: string } {
  const known = new Date('2000-01-06').getTime();
  const now = Date.now();
  const days = (now - known) / 86400000;
  const cycle = ((days % 29.53) + 29.53) % 29.53;
  const idx = Math.floor((cycle / 29.53) * 8) % 8;
  const labels = [
    'Nouvelle lune', 'Croissant naissant', 'Premier quartier', 'Croissant gibbeuse',
    'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Croissant décroissant',
  ];
  return { emoji: PHASE_EMOJI[idx], label: labels[idx] };
}

export default function EnergyBanner() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const moon = lunarPhase();

  useEffect(() => {
    fetch('/api/weather')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && !d.error) setWeather(d); })
      .catch(() => {});
  }, []);

  const energies = [
    {
      icon: moon.emoji,
      label: 'Phase lunaire',
      value: moon.label,
    },
    {
      icon: '🌡️',
      label: 'Météo Karukera',
      value: weather
        ? `${weather.tmin}–${weather.tmax}°C · ${weather.label}`
        : '…',
    },
    {
      icon: '💨',
      label: 'Vent',
      value: weather ? `${weather.wind} km/h` : '…',
    },
    {
      icon: '⚡',
      label: 'Énergie globale',
      value: 'Expansive',
    },
    {
      icon: '🌺',
      label: 'Fleur du jour',
      value: 'Balizié',
    },
  ];

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
          Vibrations universelles
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          🌟 Énergies du jour
        </h2>
      </motion.div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
        {energies.map((energy, i) => (
          <motion.div
            key={energy.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.03 }}
            className="flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl cursor-default"
            style={{
              background:
                'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              minWidth: '120px',
            }}
          >
            <span className="text-2xl">{energy.icon}</span>
            <div className="text-center">
              <p className="text-white/75 text-xs sm:text-sm font-semibold leading-tight">
                {energy.value}
              </p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">
                {energy.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

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
