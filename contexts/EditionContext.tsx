'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { detectEdition, getMoonPhaseEmoji } from '@/lib/edition';
import type { Edition } from '@/private/maryse-prompt';

interface EditionContextType {
  edition: Edition;
  setEdition: (edition: Edition) => void;
  moonEmoji: string;
}

const EditionContext = createContext<EditionContextType | undefined>(undefined);

export function EditionProvider({ children }: { children: ReactNode }) {
  const [edition, setEdition] = useState<Edition>('matin');
  const [moonEmoji, setMoonEmoji] = useState<string>('🌙');

  useEffect(() => {
    setEdition(detectEdition());
    setMoonEmoji(getMoonPhaseEmoji());
  }, []);

  // Apply theme class to body
  useEffect(() => {
    document.body.classList.remove('matin-mode', 'midi-mode', 'soir-mode');
    if (edition === 'matin') {
      document.body.classList.add('matin-mode');
    } else if (edition === 'midi') {
      document.body.classList.add('midi-mode');
    } else if (edition === 'soir') {
      document.body.classList.add('soir-mode');
    }
  }, [edition]);

  return (
    <EditionContext.Provider value={{ edition, setEdition, moonEmoji }}>
      {children}
    </EditionContext.Provider>
  );
}

export function useEdition() {
  const context = useContext(EditionContext);
  if (context === undefined) {
    throw new Error('useEdition must be used within an EditionProvider');
  }
  return context;
}
