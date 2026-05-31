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
  '🌿 Mon horoscope ancestral — Découvrez la sagesse de Karukera et les paroles de Maryse CondAI. Explorez votre totem sur Horoscope Karukera';

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
        <p className="text-ancestral-gold/45 text-xs uppercase tracking-[0.35em] mb-3">
          Transmettre la sagesse
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ancestral-cream">
          📲 Partager les paroles des ancêtres
        </h2>
      </motion.div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {platforms.map((platform, i) => (
          <motion.button
            key={platform.id}
            onClick={() => handleShare(platform)}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '10px 4px',
              borderRadius: '12px',
              border: `1px solid ${platform.borderColor}`,
              background: platform.id === 'whatsapp'
                ? 'rgba(37,211,102,0.1)'
                : platform.id === 'facebook'
                ? 'rgba(59,89,152,0.15)'
                : platform.id === 'instagram'
                ? 'rgba(225,48,108,0.1)'
                : 'rgba(29,161,242,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{platform.emoji}</span>
            <span
              style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 500,
                color: platform.color,
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
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
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-ancestral-cream/50 text-sm transition-all duration-200 hover:text-ancestral-cream/70 focus:outline-none"
          style={{
            background: 'rgba(245,245,220,0.04)',
            border: '1px solid rgba(245,245,220,0.07)',
          }}
        >
          {copied ? (
            <>
              <Check size={14} className="text-ancestral-gold" />
              <span className="text-ancestral-gold">Copié !</span>
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
