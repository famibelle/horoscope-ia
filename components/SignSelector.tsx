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
        <p className="text-violet-300/45 text-xs uppercase tracking-[0.35em] mb-4">
          Cosmologie
        </p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          Choisissez votre signe
        </h2>
        <p className="text-white/35 text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
          Sélectionnez votre constellation pour révéler votre destinée cosmique du jour
        </p>
      </motion.div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
        {signs.map((sign, index) => {
          const isSelected = selected === sign.id;

          return (
            <motion.button
              key={sign.id}
              onClick={() => onSelect(sign.id)}
              className="relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border transition-colors duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.5 }}
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.96 }}
              style={
                isSelected
                  ? {
                      background: `linear-gradient(135deg, ${sign.gradientFrom}18, ${sign.gradientTo}12)`,
                      borderColor: `${sign.gradientFrom}50`,
                      boxShadow: `0 0 28px ${sign.glowColor}, 0 0 60px ${sign.glowColor}40`,
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(255,255,255,0.08)',
                    }
              }
              aria-pressed={isSelected}
              aria-label={`${sign.name} — ${sign.tagline}`}
            >
              <span className="text-2xl sm:text-3xl leading-none">{sign.emoji}</span>
              <span
                className="text-xs font-medium leading-tight text-center transition-colors duration-200"
                style={{ color: isSelected ? sign.gradientFrom : 'rgba(255,255,255,0.65)' }}
              >
                {sign.name}
              </span>
              <span className="text-white/25 text-[10px] leading-tight text-center hidden sm:block">
                {elementEmoji[sign.element]} {sign.element}
              </span>

              {isSelected && (
                <motion.div
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#020617]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  style={{ background: sign.gradientFrom }}
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
                  background: `linear-gradient(135deg, ${sign.gradientFrom}20, ${sign.gradientTo}15)`,
                  border: `1px solid ${sign.gradientFrom}35`,
                  color: sign.gradientFrom,
                }}
              >
                <span>{sign.emoji}</span>
                <span className="font-semibold">{sign.name}</span>
                <span className="text-white/40">·</span>
                <span className="text-white/50 text-xs">{sign.tagline}</span>
                <span className="text-white/30 text-xs">· {sign.planet}</span>
              </div>
            );
          })()}
        </motion.div>
      )}
    </section>
  );
}
