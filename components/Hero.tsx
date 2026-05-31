'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  const scrollToSigns = () => {
    document.getElementById('signs')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex flex-col items-center justify-center px-5 py-10 text-center overflow-hidden">
      {/* Souffle des ancêtres (remplace le glow cosmique) */}
      <motion.div
        aria-hidden
        className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,80,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Title */}
        <motion.h1
          className="font-display font-bold leading-tight mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <span className="block text-5xl sm:text-6xl" style={{ color: '#D4AF50' }}>
            Maryse CondAI
          </span>
          <span className="block text-2xl sm:text-3xl font-light mt-1" style={{ color: 'rgba(200,216,192,0.7)' }}>
            vous parle
          </span>
        </motion.h1>

        {/* CTA */}
        <motion.button
          onClick={scrollToSigns}
          className="relative px-8 py-3 rounded-2xl font-ui font-medium text-sm overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,80,0.2), rgba(212,175,80,0.1))',
            border: '1px solid rgba(212,175,80,0.35)',
            color: '#D4AF50',
          }}
        >
          <span className="relative z-10">🌿 Choisir mon signe</span>
        </motion.button>
      </div>
    </section>
  );
}
