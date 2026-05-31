'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, Loader2, PhoneCall } from 'lucide-react';

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

const CALLING_MESSAGES = [
  "Le téléphone sonne chez Maryse…",
  "Elle va bientôt décrocher…",
  "Patiente… patiente…",
  "Elle arrive…",
  "Ça sonne encore…",
  "Elle est en train de préparer ton oracle…",
  "Patiente encore un peu…",
  "Elle décroche… elle parle…",
];

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
  const [callingMsg, setCallingMsg] = useState(CALLING_MESSAGES[0]);
  const callingIndexRef = useRef(0);
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
      setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 1000);

    return () => clearInterval(interval);
  }, [showLoading]);

  // Cycle through calling messages sequentially
  useEffect(() => {
    if (!showLoading) {
      callingIndexRef.current = 0;
      setCallingMsg(CALLING_MESSAGES[0]);
      return;
    }

    const interval = setInterval(() => {
      callingIndexRef.current = (callingIndexRef.current + 1) % CALLING_MESSAGES.length;
      setCallingMsg(CALLING_MESSAGES[callingIndexRef.current]);
    }, 2200);

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

      // Utiliser l'heure actuelle du navigateur
      const now = new Date();
      const currentHour = now.getHours();
      const currentDate = now.toISOString().split('T')[0]; // Format YYYY-MM-DD

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horoscope: horoscope,
          signName: signName,
          edition: edition,
          userDate: userDate || currentDate,
          userHour: userHour || currentHour.toString()
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
        className="text-center mb-6"
      >
        <p style={{ color: 'rgba(212,175,80,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.35em', marginBottom: '6px' }}>
          La Voix des Ancêtres
        </p>
        <h2 className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: '#C8D8C0' }}>
          Écoutez Maryse
        </h2>
        <p style={{ color: 'rgba(200,216,192,0.35)', fontSize: '13px', marginTop: '4px' }}>🎧 Horoscope audio</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative',
          borderRadius: '18px',
          padding: '16px',
          overflow: 'hidden',
          background: 'rgba(212,175,80,0.10)',
          border: '1px solid rgba(212,175,80,0.22)',
        }}
      >
        {/* Barres audio animées */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                bottom: 0,
                left: `${(i / 30) * 100}%`,
                width: '2px',
                background: 'linear-gradient(to top, rgba(212,175,80,0.35), transparent)',
                transformOrigin: 'bottom',
                borderRadius: '2px',
              }}
              animate={
                isPlaying
                  ? { height: [`${12 + (i % 5) * 7}%`, `${25 + (i % 7) * 5}%`, `${8 + (i % 3) * 10}%`] }
                  : { height: '8%' }
              }
              transition={{
                duration: 0.55 + (i % 4) * 0.12,
                repeat: isPlaying ? Infinity : 0,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: (i % 8) * 0.04,
              }}
            />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Bouton play circulaire doré */}
          <motion.button
            onClick={hasAudio ? togglePlay : generate}
            disabled={showLoading}
            style={{
              flexShrink: 0,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isPlaying
                ? 'linear-gradient(135deg, #D4AF50, #E8D98A)'
                : 'linear-gradient(135deg, #D4AF50, #B8943A)',
              boxShadow: isPlaying
                ? '0 0 30px rgba(212,175,80,0.6), 0 0 60px rgba(212,175,80,0.2)'
                : '0 0 16px rgba(212,175,80,0.3)',
              border: 'none',
              cursor: showLoading ? 'not-allowed' : 'pointer',
              opacity: showLoading ? 0.6 : 1,
            }}
            whileHover={!isGenerating ? { scale: 1.06 } : {}}
            whileTap={!isGenerating ? { scale: 0.94 } : {}}
          >
            <AnimatePresence mode="wait">
              {showLoading ? (
                <motion.div
                  key="calling"
                  animate={{ rotate: [-5, 5, -5], x: [-2, 2, -2], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: 'inline-flex' }}
                >
                  <PhoneCall size={20} style={{ color: '#0D1A12' }} />
                </motion.div>
              ) : isPlaying ? (
                <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Pause size={20} style={{ color: '#0D1A12', fill: '#0D1A12' }} />
                </motion.div>
              ) : (
                <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Play size={20} style={{ color: '#0D1A12', fill: '#0D1A12', marginLeft: '2px' }} />
                </motion.div>
              )}
            </AnimatePresence>
            {isPlaying && (
              <motion.div
                style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '2px solid rgba(212,175,80,0.6)',
                }}
                animate={{ scale: [1, 1.7], opacity: [0.8, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </motion.button>

          {/* Texte + barre */}
          <div style={{ flex: 1 }}>
            <AnimatePresence mode="wait">
              {showLoading ? (
                <motion.p
                  key={callingMsg}
                  style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '14px', fontWeight: 600, color: '#E8D98A' }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.4 }}
                >
                  {callingMsg}
                </motion.p>
              ) : (
                <motion.p
                  key="title"
                  style={{ fontSize: '14px', fontWeight: 500, color: '#C8D8C0' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {signName ? `Horoscope ${signName}` : 'Horoscope audio'}
                </motion.p>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {showLoading ? (
                <motion.p
                  key={loadingMsg}
                  style={{ fontSize: '11px', color: 'rgba(200,216,192,0.5)', marginTop: '2px', fontStyle: 'italic' }}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.35 }}
                >
                  {loadingMsg}
                </motion.p>
              ) : (
                <p style={{ fontSize: '11px', color: 'rgba(200,216,192,0.4)', marginTop: '2px' }}>
                  {hasAudio && duration > 0
                    ? `Maryse parle · ${formatTime(duration)}`
                    : 'Votre signe lu par Maryse'}
                </p>
              )}
            </AnimatePresence>
            {error && <p style={{ fontSize: '11px', color: 'rgba(220,80,80,0.7)', marginTop: '3px' }}>{error}</p>}

            {hasAudio && (
              <div
                style={{
                  marginTop: '8px',
                  height: '3px',
                  borderRadius: '3px',
                  background: 'rgba(212,175,80,0.15)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  maxWidth: '240px',
                }}
                onClick={(e) => {
                  const audio = audioRef.current;
                  if (!audio || !duration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const newTime = ((e.clientX - rect.left) / rect.width) * duration;
                  audio.currentTime = newTime;
                  setProgress(newTime / duration);
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    borderRadius: '3px',
                    background: 'linear-gradient(90deg, #D4AF50, #E8D98A)',
                    width: `${progress * 100}%`,
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}
          </div>

          <Volume2 size={16} style={{ color: 'rgba(200,216,192,0.25)', flexShrink: 0 }} />
        </div>
      </motion.div>
    </section>
  );
}
