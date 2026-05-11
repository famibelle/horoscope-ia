'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  const scrollToSigns = () => {
    document.getElementById('signs')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 py-24 text-center overflow-hidden">
      {/* Souffle des ancêtres (remplace le glow cosmique) */}
      <motion.div
        aria-hidden
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(245,245,220,0.15) 0%, rgba(139,69,19,0.08) 40%, transparent 70%)',
          filter: 'blur(40px)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Motifs traditionnels (remplace les cercles orbitaux) */}
      <motion.div
        aria-hidden
        className="absolute w-[340px] h-[340px] rounded-full border border-ancestral-gold/15 pointer-events-none"
        style={{
          left: '50%', 
          top: '50%', 
          marginLeft: '-170px', 
          marginTop: '-170px',
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(210,180,140,0.05) 10deg, transparent 20deg, rgba(210,180,140,0.05) 30deg, transparent 40deg)'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        aria-hidden
        className="absolute w-[520px] h-[520px] rounded-full border border-ancestral-gold/10 pointer-events-none"
        style={{
          left: '50%', 
          top: '50%', 
          marginLeft: '-260px', 
          marginTop: '-260px',
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(139,69,19,0.03) 5deg, transparent 10deg, rgba(139,69,19,0.03) 15deg, transparent 20deg)'
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Title */}
        <motion.h1
          className="font-display font-bold leading-[1.05] mb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <span className="block text-5xl sm:text-6xl md:text-7xl text-ancestral-gold">
            Maryse CondAI
          </span>
          <span className="block text-ancestral-cream/80 text-2xl sm:text-3xl md:text-4xl font-light mt-3">
            vous parle
          </span>
        </motion.h1>


        {/* CTA */}
        <motion.button
          onClick={scrollToSigns}
          className="relative px-10 py-4 rounded-2xl text-ancestral-earth font-semibold text-base sm:text-lg overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.9, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'linear-gradient(135deg, #8B4513 0%, #CD5C5C 100%)',
            boxShadow:
              '0 0 40px rgba(139, 69, 19, 0.5), 0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <span className="relative z-10">🌿 Choisir mon signe</span>
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 opacity-30 shimmer-bg"
            aria-hidden
          />
        </motion.button>

        {/* Stats row - Symboles ancestraux */}
        <motion.div
          className="flex items-center justify-center gap-8 mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          {[
            { value: '12', label: 'totems' },
            { value: '🌿', label: 'Maryse CondAI' },
            { value: '∞', label: 'savoir ancestral' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-ancestral-gold">{stat.value}</span>
              <span className="text-ancestral-cream/50 text-xs uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Flèche de scroll - Style ancestral */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          <motion.div
            className="w-px h-14 bg-gradient-to-b from-ancestral-gold/50 to-transparent"
            style={{ originY: 'top' }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
}
