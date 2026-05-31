'use client';

import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';

export type Track = {
  signe: string;   // ex: "Gémeaux"
  glyph: string;   // ex: "♊"
  moment: string;  // ex: "Matin"
  src: string;     // blob URL généré par TTS
};

type AudioPlayerContextType = {
  track: Track | null;
  isPlaying: boolean;
  progress: number;    // 0–1
  duration: number;    // secondes
  play: (track: Track) => void;
  pause: () => void;
  stop: () => void;
  seek: (ratio: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [track, setTrack]       = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress]  = useState(0);
  const [duration, setDuration]  = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => {
      if (el.duration > 0) setProgress(el.currentTime / el.duration);
    };
    const onLoaded = () => setDuration(el.duration);
    const onEnded  = () => { setIsPlaying(false); setProgress(0); };
    const onPause  = () => setIsPlaying(false);
    const onPlay   = () => setIsPlaying(true);

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('ended', onEnded);
    el.addEventListener('pause', onPause);
    el.addEventListener('play', onPlay);
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('play', onPlay);
    };
  }, []);

  // Padding body dynamique — 80px tab bar + 56px mini player
  useEffect(() => {
    document.body.style.paddingBottom = track ? '136px' : '80px';
  }, [track]);

  const play = useCallback((newTrack: Track) => {
    const el = audioRef.current;
    if (!el) return;
    if (track?.src !== newTrack.src) {
      el.src = newTrack.src;
      setTrack(newTrack);
      setProgress(0);
      setDuration(0);
    }
    el.play().catch(() => {});
  }, [track]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (el) { el.pause(); el.currentTime = 0; }
    setIsPlaying(false);
    setProgress(0);
    setTrack(null);
  }, []);

  const seek = useCallback((ratio: number) => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    el.currentTime = ratio * el.duration;
  }, []);

  return (
    <AudioPlayerContext.Provider value={{ track, isPlaying, progress, duration, play, pause, stop, seek, audioRef }}>
      {children}
      <audio ref={audioRef} />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error('useAudioPlayer must be used inside AudioPlayerProvider');
  return ctx;
}
