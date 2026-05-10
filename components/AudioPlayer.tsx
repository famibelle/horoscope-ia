'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="px-4 py-10 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <p className="text-violet-300/45 text-xs uppercase tracking-[0.35em] mb-3">
          Expérience immersive
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          🎧 Horoscope audio
        </h2>
        <p className="text-white/30 text-sm mt-2">
          Laissez-vous guider par la voix du cosmos
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl p-6 sm:p-8 overflow-hidden"
        style={{
          background:
            'linear-gradient(145deg, rgba(124,58,237,0.12) 0%, rgba(59,130,246,0.06) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(124,58,237,0.2)',
          boxShadow: '0 0 60px rgba(124,58,237,0.15)',
        }}
      >
        {/* Waveform decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0 rounded-full"
              style={{
                left: `${(i / 40) * 100}%`,
                width: '2px',
                background:
                  'linear-gradient(to top, rgba(124,58,237,0.4), transparent)',
                transformOrigin: 'bottom',
              }}
              animate={
                isPlaying
                  ? {
                      height: [
                        `${Math.random() * 30 + 10}%`,
                        `${Math.random() * 60 + 15}%`,
                        `${Math.random() * 20 + 5}%`,
                      ],
                    }
                  : { height: '15%' }
              }
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: isPlaying ? Infinity : 0,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: Math.random() * 0.3,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Play button */}
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className="relative flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center focus:outline-none"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              boxShadow: isPlaying
                ? '0 0 40px rgba(124,58,237,0.7), 0 0 80px rgba(124,58,237,0.3)'
                : '0 0 20px rgba(124,58,237,0.4)',
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Pause size={22} className="text-white" fill="white" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Play size={22} className="text-white ml-1" fill="white" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulse ring when playing */}
            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-violet-400"
                animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </motion.button>

          {/* Track info */}
          <div className="text-center sm:text-left flex-1">
            <p className="text-white/80 font-semibold text-base sm:text-lg">
              Horoscope du Lion — 10 mai 2026
            </p>
            <p className="text-white/35 text-sm mt-1">
              Narration IA · 3 min 42 s
            </p>
            {/* Progress bar */}
            <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden max-w-xs mx-auto sm:mx-0">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #3b82f6)' }}
                animate={isPlaying ? { width: ['0%', '100%'] } : { width: '0%' }}
                transition={
                  isPlaying
                    ? { duration: 222, ease: 'linear' }
                    : { duration: 0 }
                }
              />
            </div>
          </div>

          <Volume2 size={18} className="text-white/25 flex-shrink-0" />
        </div>
      </motion.div>
    </section>
  );
}
