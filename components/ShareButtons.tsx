'use client';

import { motion } from 'framer-motion';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const platforms = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    emoji: '💬',
    color: '#25D366',
    bgGradient: 'from-green-600/20 to-emerald-600/15',
    borderColor: 'rgba(37, 211, 102, 0.25)',
    glowColor: 'rgba(37, 211, 102, 0.3)',
    url: (text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    emoji: '📘',
    color: '#1877F2',
    bgGradient: 'from-blue-600/20 to-blue-700/15',
    borderColor: 'rgba(24, 119, 242, 0.25)',
    glowColor: 'rgba(24, 119, 242, 0.3)',
    url: (text: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(text)}`,
  },
  {
    id: 'instagram',
    name: 'Instagram Story',
    emoji: '📸',
    color: '#E1306C',
    bgGradient: 'from-pink-600/20 to-purple-600/15',
    borderColor: 'rgba(225, 48, 108, 0.25)',
    glowColor: 'rgba(225, 48, 108, 0.3)',
    url: () => null,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    emoji: '🐦',
    color: '#1DA1F2',
    bgGradient: 'from-sky-500/20 to-blue-500/15',
    borderColor: 'rgba(29, 161, 242, 0.25)',
    glowColor: 'rgba(29, 161, 242, 0.3)',
    url: (text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  },
];

const SHARE_TEXT =
  '🌙 Mon horoscope IA du jour — Lion · "Votre énergie attire naturellement les bonnes opportunités." ✨ Découvrez le vôtre sur Horoscope Karukera';

export default function ShareButtons() {
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: (typeof platforms)[0]) => {
    const url = platform.url(SHARE_TEXT);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigator.clipboard.writeText(SHARE_TEXT).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(SHARE_TEXT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
          Partager l&apos;énergie
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          📲 Partager mon horoscope
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {platforms.map((platform, i) => (
          <motion.button
            key={platform.id}
            onClick={() => handleShare(platform)}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${platform.bgGradient} transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400`}
            style={{
              border: `1px solid ${platform.borderColor}`,
            }}
          >
            <span className="text-2xl">{platform.emoji}</span>
            <span className="text-white/70 text-xs font-medium text-center leading-tight">
              {platform.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Copy link */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-4"
      >
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white/50 text-sm transition-all duration-200 hover:text-white/70 focus:outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-300">Copié !</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copier le lien</span>
            </>
          )}
        </button>
      </motion.div>
    </section>
  );
}
