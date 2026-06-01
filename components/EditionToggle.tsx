'use client';

import { motion } from 'framer-motion';
import { getLocalDynamicEditionLabels } from '@/lib/edition';
import { useEdition } from '@/contexts/EditionContext';

export default function EditionToggle() {
  const { edition, setEdition, moonEmoji } = useEdition();
  const dynamicLabels = getLocalDynamicEditionLabels(edition);

  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        padding: '12px 16px',
      }}
    >
      {(['nuit', 'matin', 'midi', 'soir'] as const).map((ed) => {
        const { label, emoji } = dynamicLabels[ed];
        const active = edition === ed;
        const displayEmoji = ed === 'soir' ? moonEmoji : emoji;
        return (
          <motion.button
            key={ed}
            onClick={() => setEdition(ed)}
            whileTap={{ scale: 0.96 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '7px 4px',
              minHeight: '48px',
              borderRadius: '10px',
              border: active
                ? '1px solid rgba(212,175,80,0.4)'
                : '1px solid rgba(255,255,255,0.08)',
              background: active
                ? 'rgba(212,175,80,0.12)'
                : 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>{displayEmoji}</span>
            <span
              className="font-ui"
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 500,
              color: active ? '#D4AF50' : '#6B8A6E',
            }}
            >
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
