'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  const scrollToSigns = () => {
    document.getElementById('signs')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 py-24 text-center overflow-hidden">
      {/* Central pulsing glow */}
      <motion.div
        aria-hidden
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)',
          filter: 'blur(40px)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting ring */}
      <motion.div
        aria-hidden
        className="absolute w-[340px] h-[340px] rounded-full border border-violet-500/10 pointer-events-none"
        style={{ left: '50%', top: '50%', marginLeft: '-170px', marginTop: '-170px' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        aria-hidden
        className="absolute w-[520px] h-[520px] rounded-full border border-blue-500/5 pointer-events-none"
        style={{ left: '50%', top: '50%', marginLeft: '-260px', marginTop: '-260px' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Eyebrow */}
        <motion.p
          className="text-violet-300/60 text-xs sm:text-sm uppercase tracking-[0.35em] mb-8 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Sous le flamboyant
        </motion.p>

        {/* Title */}
        <motion.h1
          className="font-display font-bold leading-[1.05] mb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <span className="block text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-1">
            🌳 Sous le flamboyant
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-gradient">
            Maryse
          </span>
          <span className="block text-white/70 text-2xl sm:text-3xl md:text-4xl font-light mt-3">
            vous guide
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-white/40 text-base sm:text-lg max-w-sm mx-auto mb-14 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.65 }}
        >
          Découvrez votre énergie cosmique personnalisée,{' '}
          <em className="text-violet-300/60 not-italic">
            À l&apos;ombre du flamboyant, là où les esprits parlent, Maryse CondAI lit ce que vos ancêtres ont semé pour vous
          </em>
        </motion.p>

        {/* CTA */}
        <motion.button
          onClick={scrollToSigns}
          className="relative px-10 py-4 rounded-2xl text-white font-semibold text-base sm:text-lg overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.9, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
            boxShadow:
              '0 0 40px rgba(124, 58, 237, 0.5), 0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <span className="relative z-10">✨ Choisir mon signe</span>
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 opacity-30 shimmer-bg"
            aria-hidden
          />
        </motion.button>

        {/* Stats row */}
        <motion.div
          className="flex items-center justify-center gap-8 mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          {[
            { value: '12', label: 'signes' },
            { value: '✨', label: 'Maryse CondAI' },
            { value: '∞', label: 'énergies' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-gradient">{stat.value}</span>
              <span className="text-white/25 text-xs uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Scroll arrow */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          <motion.div
            className="w-px h-14 bg-gradient-to-b from-violet-400/50 to-transparent"
            style={{ originY: 'top' }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
}
