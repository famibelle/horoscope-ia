'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  signName: string;
  text: string;
}

type PlayerState = 'idle' | 'generating' | 'ready' | 'playing' | 'paused';

export default function AudioPlayer({ signName, text }: AudioPlayerProps) {
  const [state, setState]       = useState<PlayerState>('idle');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError]       = useState<string | null>(null);
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Reset when sign/text changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setState('idle');
    setProgress(0);
    setDuration(0);
    setError(null);
  }, [text]);

  async function generate() {
    if (!text) return;
    setState('generating');
    setError(null);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.addEventListener('timeupdate', () => {
        if (audio.duration > 0) {
          setProgress(audio.currentTime / audio.duration);
        }
      });
      audio.addEventListener('ended', () => {
        setState('ready');
        setProgress(0);
      });

      setState('ready');
      // Auto-play after generation
      audio.play();
      setState('playing');
    } catch (e) {
      console.error(e);
      setError('Génération audio indisponible.');
      setState('idle');
    }
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (state === 'playing') {
      audio.pause();
      setState('paused');
    } else {
      audio.play();
      setState('playing');
    }
  }

  const isGenerating = state === 'generating';
  const isPlaying    = state === 'playing';
  const hasAudio     = state === 'ready' || state === 'playing' || state === 'paused';

  const formatTime = (sec: number) => {
    if (!sec || !isFinite(sec)) return '—';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="px-4 pb-12 max-w-2xl mx-auto">
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
          Écoutez Maryse
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
                background: 'linear-gradient(to top, rgba(124,58,237,0.4), transparent)',
                transformOrigin: 'bottom',
              }}
              animate={
                isPlaying
                  ? { height: [`${15 + (i % 5) * 8}%`, `${30 + (i % 7) * 6}%`, `${10 + (i % 3) * 12}%`] }
                  : { height: '12%' }
              }
              transition={{
                duration: 0.6 + (i % 4) * 0.15,
                repeat: isPlaying ? Infinity : 0,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: (i % 8) * 0.05,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Play/Generate button */}
          <motion.button
            onClick={hasAudio ? togglePlay : generate}
            disabled={isGenerating || !text}
            className="relative flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center focus:outline-none disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              boxShadow: isPlaying
                ? '0 0 40px rgba(124,58,237,0.7), 0 0 80px rgba(124,58,237,0.3)'
                : '0 0 20px rgba(124,58,237,0.4)',
            }}
            whileHover={!isGenerating ? { scale: 1.08 } : {}}
            whileTap={!isGenerating ? { scale: 0.95 } : {}}
          >
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Loader2 size={22} className="text-white animate-spin" />
                </motion.div>
              ) : isPlaying ? (
                <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Pause size={22} className="text-white" fill="white" />
                </motion.div>
              ) : (
                <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Play size={22} className="text-white ml-1" fill="white" />
                </motion.div>
              )}
            </AnimatePresence>

            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-violet-400"
                animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </motion.button>

          {/* Track info */}
          <div className="text-center sm:text-left flex-1 w-full">
            <p className="text-white/80 font-semibold text-base sm:text-lg">
              {signName ? `Horoscope ${signName}` : 'Horoscope audio'}
            </p>
            <p className="text-white/35 text-sm mt-1">
              {isGenerating
                ? 'Génération en cours…'
                : hasAudio && duration > 0
                  ? `Narration IA · ${formatTime(duration)}`
                  : 'Cliquez pour générer'}
            </p>
            {error && <p className="text-rose-400/70 text-xs mt-1">{error}</p>}

            {/* Progress bar */}
            {hasAudio && (
              <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden max-w-xs mx-auto sm:mx-0">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                    width: `${progress * 100}%`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}
          </div>

          <Volume2 size={18} className="text-white/25 flex-shrink-0" />
        </div>
      </motion.div>
    </section>
  );
}
