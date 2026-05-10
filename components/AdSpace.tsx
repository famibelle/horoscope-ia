'use client';

import { motion } from 'framer-motion';

interface AdSpaceProps {
  variant: 'banner' | 'square';
}

export default function AdSpace({ variant }: AdSpaceProps) {
  const isBanner = variant === 'banner';

  return (
    <motion.div
      className="px-4 my-8 max-w-5xl mx-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div
        className={`relative rounded-2xl overflow-hidden flex items-center justify-center ${
          isBanner ? 'h-20 sm:h-24' : 'h-64 sm:h-80 max-w-sm mx-auto'
        }`}
        style={{
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)',
          border: '1px dashed rgba(255,255,255,0.08)',
        }}
      >
        {/* Corner markers */}
        {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(
          (pos) => (
            <div
              key={pos}
              className={`absolute ${pos} w-3 h-3`}
              style={{
                borderTop: pos.includes('top') ? '2px solid rgba(124,58,237,0.25)' : undefined,
                borderBottom: pos.includes('bottom')
                  ? '2px solid rgba(124,58,237,0.25)'
                  : undefined,
                borderLeft: pos.includes('left') ? '2px solid rgba(124,58,237,0.25)' : undefined,
                borderRight: pos.includes('right')
                  ? '2px solid rgba(124,58,237,0.25)'
                  : undefined,
              }}
            />
          )
        )}

        <div className="flex flex-col items-center gap-1.5 text-center px-4">
          <span className="text-white/15 text-[10px] uppercase tracking-[0.3em]">
            Espace publicitaire
          </span>
          <span className="text-white/8 text-[9px] font-mono">
            {isBanner ? 'AdSense — 728×90 · 320×50 mobile' : 'AdSense — 300×250'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
