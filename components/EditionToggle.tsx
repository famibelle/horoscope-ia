'use client';

import { motion } from 'framer-motion';
import { getDynamicEditionLabels } from '@/lib/edition';
import { useEdition } from '@/contexts/EditionContext';
import type { Edition } from '@/lib/private/maryse-prompt';

export default function EditionToggle() {
  const { edition, setEdition, moonEmoji } = useEdition();
  const dynamicLabels = getDynamicEditionLabels(edition);

  return (
    <div className="flex justify-center gap-2 px-4 py-4">
      {(['nuit', 'matin', 'midi', 'soir'] as const).map((ed) => {
        const { label, emoji } = dynamicLabels[ed];
        const active = edition === ed;
        // Use dynamic moon emoji for "soir"
        const displayEmoji = ed === 'soir' ? moonEmoji : emoji;
        return (
          <motion.button
            key={ed}
            onClick={() => setEdition(ed)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: active
                ? 'linear-gradient(135deg, rgba(210,105,30,0.35), rgba(255,215,0,0.25))'
                : 'rgba(245,245,220,0.05)',
              border: active
                ? '1px solid rgba(210,105,30,0.5)'
                : '1px solid rgba(245,245,220,0.08)',
              color: active ? '#F5F5DC' : 'rgba(245,245,220,0.35)',
            }}
          >
            <span>{displayEmoji}</span>
            <span>{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
