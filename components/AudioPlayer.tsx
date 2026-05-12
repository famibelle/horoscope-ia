'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  signName: string;
  horoscope: any;
  edition?: string;
  userDate?: string;
  userHour?: string;
}

interface HoroscopeData {
  ouverture?: string;
  amour?: string;
  travail?: string;
  argent?: string;
  amitie?: string;
  prediction?: string;
}

type PlayerState = 'idle' | 'generating' | 'ready' | 'playing' | 'paused';

const LOADING_MESSAGES = [
  "Je consulte l’igwann qui scrute le ciel de Karukera…",
  "J’écoute la Soufrière murmurer ses secrets…",
  "Je demande au colibri ce qu’il a vu dans les fleurs…",
  "Je lis les vents alizés qui traversent l’archipel…",
  "La mangrove me chuchote ce que la mer ne dit pas…",
  "J’interroge les ancêtres, ils alignent les mots…",
  "La frégate me montre l’horizon de ton destin…",
  "Je décrypte la météo de Pointe-à-Pitre comme un présage…",
  "Le gwoka me dicte le rythme de ta journée…",
  "Je pose ma plume, les esprits prennent la main…",
  "Le lamantin me remonte des profondeurs ce que tu dois savoir…",
  "Je pèse chaque syllabe avant de te les offrir…",
  "La mer des Caraïbes me parle en langues anciennes…",
  "Je rassemble mon souffle pour te livrer l’oracle…",
  "Je tends l’oreille aux vagues de Deshaies…",
  "Le flamboyant m’éblouit de ses feuilles en feu…",
  "J’invoque les esprits de Matouba, ils veillent sur toi…",
  "Le pélican me trace dans le ciel les lignes de ta vie…",
  "Je me penche sur la rivière Salée, elle me murmure ton avenir…",
  "Les tambours du Carnaval battent dans mes tempes pour toi…",
  "Je suis le cabri qui escalade les mornes de ton signe…",
  "La vanille parfume les mots que je prépare…",
  "J’écoute les alizés porter les voix de ceux qui savent…",
  "Le manguier m’offre ses fruits lourds de sagesse…",
  "Je sens la Soufrière gronder doucement sous mes pieds…",
  "Le zandoli me montre comment changer de couleur avec le destin…",
  "Les chutes du Carbet chantent la mélodie de ta semaine…",
  "Je me balance avec le kokoye au rythme de ton horoscope…",
  "Les étoiles de Pointe Allègre s’alignent pour ton signe…",
  "Le balisier rouge s’ouvre et me révèle ton intention…",
  "Je vois les mains de Solitude tisser les fils de ton destin…",
  "Le quimbois protège mes paroles avant qu’elles ne t’atteignent…",
  "Les crabes rouges dansent sur la plage en ton honneur…",
  "Le gommier me murmure les secrets que la forêt cache…",
  "Je noue les madras qui colorieront ton chemin…",
  "Le lambi sonne l’appel de ton signe à travers les mornes…",
  "Je suis la tortue karet qui nage vers ton futur…",
  "Les fleurs de corossol s’ouvrent à la nuit pour t’éclairer…",
  "Je saupoudre ton jour de colombo, épice de chance…",
  "Je vois les pirogues glisser vers ton destin comme sur l’eau…",
  "Le morne veille sur mes pas pendant que je prépare ton oracle…",
  "Les fleurs d’hibiscus parfument l’air de tes possibilités…",
  "Je laisse le rhum arrangé infuser de patience dans mes mots…",
  "Je pèse ton destin dans les cases à peser de mon esprit…",
  "Le son du ka bat le rythme de ta vie dans ma tête…",
  "Je suis les lucioles qui éclairent ton chemin dans l’obscurité…",
  "Je purifie mon discours avec le sel de la mer…",
  "Les herbes de la savane me guident vers les bons conseils…",
  "J’attends que le vent de l’est m’apporte tes nouvelles…",
  "Les grains de café réveillent mon intuition pour toi…",
  "Je remplis la calebasse des mots sacrés à te transmettre…",
  "Je marche avec les ombres de la nuit qui protègent ton âme…",
  "Je sens le soleil de Grande-Terre réchauffer mon cœur et mes mots…",
  "Les vagues de la Pointe des Châteaux sculptent ton destin sous mes yeux…",
];

export default function AudioPlayer({ 
  signName, 
  horoscope, 
  edition = 'matin',
  userDate,
  userHour 
}: AudioPlayerProps) {
  const [state, setState]         = useState<PlayerState>('idle');
  const [progress, setProgress]   = useState(0);
  const [duration, setDuration]   = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(() =>
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
  );
  const [showLoading, setShowLoading] = useState(false);
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isGenerating = state === 'generating';
  const isPlaying    = state === 'playing';
  const hasAudio     = state === 'ready' || state === 'playing' || state === 'paused';

  // Cycle through loading messages during generation
  useEffect(() => {
    if (!showLoading) return;

    const interval = setInterval(() => {
      const newIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
      setLoadingMsg(LOADING_MESSAGES[newIndex]);
    }, 1000);

    return () => clearInterval(interval);
  }, [showLoading]);

  // Reset when horoscope changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setProgress(0);
    setDuration(0);
    setError(null);
  }, [horoscope, signName, edition, userDate, userHour]);

  async function generate() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    
    const initialMsgIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    setLoadingMsg(LOADING_MESSAGES[initialMsgIndex]);
    
    setState('generating');
    setShowLoading(true);
    setError(null);

    try {
      if (!horoscope) {
        setError('Aucun horoscope à narrer');
        return;
      }

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horoscope: horoscope,
          signName: signName,
          edition: edition,
          userDate: userDate,
          userHour: userHour
        }),
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
      audio.play();
      setState('playing');
      setShowLoading(false);
    } catch (e) {
      setError('Génération audio indisponible.');
      setShowLoading(false);
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
          La Voix des Ancêtres
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Écoutez Maryse
        </h2>
        <p className="text-white/30 text-sm mt-2">
          🎧 Horoscope audio
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
          <motion.button
            onClick={hasAudio ? togglePlay : generate}
            disabled={showLoading}
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
              {showLoading ? (
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

          <div className="text-center sm:text-left flex-1 w-full">
            <p className="text-white/80 font-semibold text-base sm:text-lg">
              {signName ? `Horoscope ${signName}` : 'Horoscope audio'}
            </p>
            <AnimatePresence mode="wait">
              {showLoading ? (
                <motion.p
                  key={loadingMsg}
                  className="text-violet-300/60 text-sm mt-1 italic"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.4 }}
                >
                  {loadingMsg}
                </motion.p>
              ) : (
              <p className="text-white/35 text-sm mt-1">
              {hasAudio && duration > 0
                  ? `Maryse parle · ${formatTime(duration)}`
                  : 'Votre signe lu par Maryse'}
              </p>
              )}
            </AnimatePresence>
            {error && <p className="text-rose-400/70 text-xs mt-1">{error}</p>}

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
