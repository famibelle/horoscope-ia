'use client';

import { motion } from 'framer-motion';
import { signs, elementEmoji } from '@/lib/signs-data';

interface SignSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function SignSelector({ selected, onSelect }: SignSelectorProps) {
  return (
    <section id="signs" className="px-4 py-20 max-w-5xl mx-auto">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-white text-xs uppercase tracking-[0.35em] mb-4">
          Sagesse de Karukera
        </p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          Découvrez votre totem
        </h2>
        <p className="text-white text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
          Les esprits de la Guadeloupe vous guident vers votre destin ancestral
        </p>
      </motion.div>

      {/* Carousel horizontal scrollable */}
      <div
        className="scrollbar-hide"
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '8px',
          paddingLeft: '14px',
          paddingRight: '14px',
          paddingBottom: '4px',
        }}
      >
        {signs.map((sign) => {
          const isSelected = selected === sign.id;
          return (
            <button
              key={sign.id}
              onClick={() => onSelect(sign.id)}
              aria-pressed={isSelected}
              aria-label={sign.name}
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                display: 'flex',
                flexShrink: 0,
                minWidth: '52px',
                padding: '8px 10px',
                borderRadius: '12px',
                border: isSelected
                  ? '1px solid rgba(212,175,80,0.4)'
                  : '1px solid rgba(255,255,255,0.06)',
                background: isSelected
                  ? 'rgba(212,175,80,0.1)'
                  : '#111e14',
                cursor: 'pointer',
                transition: 'all 0.2s',
                gap: '4px',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{sign.emoji}</span>
              <span
                style={{
                  fontSize: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontWeight: 500,
                  color: isSelected ? '#D4AF50' : '#6B8A6E',
                  whiteSpace: 'nowrap',
                }}
              >
                {sign.name}
              </span>
              {isSelected && (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#D4AF50',
                    border: '2px solid #0D1A12',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
