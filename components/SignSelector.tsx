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
        <p className="text-ancestral-gold/45 text-xs uppercase tracking-[0.35em] mb-4">
          Sagesse de Karukera
        </p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-ancestral-cream mb-4">
          Découvrez votre totem
        </h2>
        <p className="text-ancestral-cream/35 text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
          Les esprits de la Guadeloupe vous guident vers votre destin ancestral
        </p>
      </motion.div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
        {signs.map((sign, index) => {
          const isSelected = selected === sign.id;

          return (
            <motion.button
              key={sign.id}
              onClick={() => onSelect(sign.id)}
              className="relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border transition-colors duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ancestral-gold"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.5 }}
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.96 }}
              style={
                isSelected
                  ? {
                      background: `linear-gradient(135deg, rgba(210,105,30,0.18), rgba(255,215,0,0.12))`,
                      borderColor: `rgba(210,105,30,0.5)`,
                      boxShadow: `0 0 28px rgba(210,105,30,0.4), 0 0 60px rgba(210,105,30,0.2)`,
                    }
                  : {
                      background: 'rgba(245,245,220,0.04)',
                      borderColor: 'rgba(245,245,220,0.08)',
                    }
              }
              aria-pressed={isSelected}
              aria-label={`${sign.name} — ${sign.tagline}`}
            >
              <span className="text-2xl sm:text-3xl leading-none">{sign.emoji}</span>
              <span
                className="text-xs font-medium leading-tight text-center transition-colors duration-200 text-ancestral-gold"
                style={{ color: isSelected ? '#FFD700' : 'rgba(245,245,220,0.65)' }}
              >
                {sign.name}
              </span>
              <span className="text-ancestral-cream/25 text-[10px] leading-tight text-center hidden sm:block">
                {elementEmoji[sign.element]} {sign.element}
              </span>

              {isSelected && (
                <motion.div
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-ancestral-earth"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  style={{ background: '#FFD700' }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected sign detail pill */}
      {selected && (
        <motion.div
          key={selected}
          className="mt-8 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {(() => {
            const sign = signs.find((s) => s.id === selected);
            if (!sign) return null;
            return (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{
                  background: `linear-gradient(135deg, rgba(210,105,30,0.20), rgba(255,215,0,0.15))`,
                  border: `1px solid rgba(210,105,30,0.35)`,
                  color: '#FFD700',
                }}
              >
                <span>{sign.emoji}</span>
                <span className="font-semibold">{sign.name}</span>
                <span className="text-ancestral-cream/40">·</span>
                <span className="text-ancestral-cream/50 text-xs">{sign.tagline}</span>
                <span className="text-ancestral-cream/30 text-xs">· {sign.planet}</span>
              </div>
            );
          })()}
        </motion.div>
      )}
    </section>
  );
}
