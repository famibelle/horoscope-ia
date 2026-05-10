'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Briefcase, Compass, Sparkles } from 'lucide-react';
import { signs } from '@/lib/signs-data';
import { horoscopeData, formatDate } from '@/lib/horoscope-data';

interface HoroscopeCardProps {
  signId: string;
}

export default function HoroscopeCard({ signId }: HoroscopeCardProps) {
  const sign = signs.find((s) => s.id === signId);
  const horoscope = horoscopeData[signId];

  if (!sign || !horoscope) return null;

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
          <div className="px-6 pt-8 pb-6 sm:px-8">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{sign.emoji}</span>
                  <div>
                    <h2
                      className="font-display text-2xl sm:text-3xl font-bold"
                      style={{ color: sign.gradientFrom }}
                    >
                      {sign.name}
                    </h2>
                    <p className="text-white/35 text-xs uppercase tracking-widest">
                      {sign.planet} · {sign.element}
                    </p>
                  </div>
                </div>
                <p className="text-white/40 text-sm capitalize">{date}</p>
              </div>

              {/* Intensity badge */}
              <div
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${sign.gradientFrom}20, ${sign.gradientTo}15)`,
                  border: `1px solid ${sign.gradientFrom}30`,
                }}
              >
                <span className="text-lg font-bold" style={{ color: sign.gradientFrom }}>
                  {horoscope.intensity}/10
                </span>
                <span className="text-white/30 text-[10px] uppercase tracking-wider">
                  intensité
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="mx-6 sm:mx-8 h-px mb-6"
            style={{
              background: `linear-gradient(90deg, ${sign.gradientFrom}30, transparent)`,
            }}
          />

          {/* Content */}
          <div className="px-6 sm:px-8 pb-8 space-y-6">
            {/* Cosmic message */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={14}
                  style={{ color: sign.gradientFrom }}
                  className="flex-shrink-0"
                />
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: sign.gradientFrom }}
                >
                  Message cosmique
                </span>
              </div>
              <p className="text-white/75 text-sm sm:text-base leading-relaxed pl-5">
                {horoscope.cosmic}
              </p>
            </div>

            {/* Love */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-rose-400 flex-shrink-0" />
                <span className="text-rose-300 text-xs font-semibold uppercase tracking-widest">
                  Amour
                </span>
              </div>
              <p className="text-white/65 text-sm leading-relaxed pl-5">{horoscope.love}</p>
            </div>

            {/* Work */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-blue-400 flex-shrink-0" />
                <span className="text-blue-300 text-xs font-semibold uppercase tracking-widest">
                  Travail
                </span>
              </div>
              <p className="text-white/65 text-sm leading-relaxed pl-5">{horoscope.work}</p>
            </div>

            {/* Advice */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: `linear-gradient(135deg, ${sign.gradientFrom}10, ${sign.gradientTo}08)`,
                border: `1px solid ${sign.gradientFrom}20`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Compass size={14} style={{ color: sign.gradientFrom }} className="flex-shrink-0" />
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: sign.gradientFrom }}
                >
                  Conseil du jour
                </span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed italic">&ldquo;{horoscope.advice}&rdquo;</p>
            </div>

            {/* Bottom row: music + color + number */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: 'Musique', value: horoscope.music, icon: '🎵' },
                { label: 'Couleur', value: horoscope.color, icon: '🎨', color: horoscope.colorHex },
                { label: 'Chiffre', value: String(horoscope.luckyNumber), icon: '🔢' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="text-lg mb-1">{item.icon}</div>
                  <div
                    className="text-xs font-bold leading-tight truncate"
                    style={{ color: item.color ?? 'rgba(255,255,255,0.8)' }}
                  >
                    {item.value}
                  </div>
                  <div className="text-white/25 text-[10px] uppercase tracking-wider mt-1">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom glow bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${sign.gradientTo}40, transparent)`,
            }}
          />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
