'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return '-';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MiniPlayer() {
  const { track, isPlaying, progress, duration, play, pause, stop, seek } = useAudioPlayer();

  return (
    <AnimatePresence>
      {track && (
        <motion.div
          key="mini-player"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: '64px',          // hauteur tab bar
            left: 0,
            right: 0,
            zIndex: 90,
            background: '#162B1A',
            borderTop: '1px solid rgba(212,175,80,0.2)',
          }}
        >
          {/* Barre de progression en haut */}
          <div style={{ height: '2px', background: 'rgba(212,175,80,0.1)', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progress * 100}%`,
                background: '#D4AF50',
                transition: 'width 0.15s linear',
              }}
            />
            {/* Zone cliquable pour seek */}
            <div
              style={{ position: 'absolute', inset: '-6px 0', cursor: 'pointer' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek((e.clientX - rect.left) / rect.width);
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px' }}>
            {/* Glyphe */}
            <span style={{ fontSize: '22px', lineHeight: 1, flexShrink: 0 }}>{track.glyph}</span>

            {/* Infos */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                className="font-display"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#E8D98A',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}
              >
                {track.signe} · Maryse CondAI
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <p
                  className="font-ui"
                  style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4B6450' }}
                >
                  {track.moment}
                </p>
                {duration > 0 && (
                  <p
                    className="font-ui"
                    style={{ fontSize: '8px', color: '#4B6450', letterSpacing: '0.04em' }}
                  >
                    · {formatTime(duration * progress)} / {formatTime(duration)}
                  </p>
                )}
              </div>
            </div>

            {/* Play/Pause */}
            <button
              onClick={() => isPlaying ? pause() : play(track)}
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#D4AF50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {isPlaying
                ? <Pause size={14} style={{ color: '#0D1A12', fill: '#0D1A12' }} />
                : <Play  size={14} style={{ color: '#0D1A12', fill: '#0D1A12', marginLeft: '1px' }} />
              }
            </button>

            {/* Fermer */}
            <button
              onClick={stop}
              aria-label="Fermer le player"
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={14} style={{ color: '#2E4A32' }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
