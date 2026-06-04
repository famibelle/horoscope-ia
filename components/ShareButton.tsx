'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ShareButtonProps {
  url: string;
}

export function ShareButton({ url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-ancestral-cream/10 focus:outline-none"
      style={{
        background: 'rgba(245,245,220,0.06)',
        border: '1px solid rgba(245,245,220,0.12)',
        color: copied ? '#D4AF37' : 'rgba(245,245,220,0.6)',
      }}
    >
      {copied ? (
        <>
          <Check size={14} />
          <span>Lien copié !</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          <span>Partager</span>
        </>
      )}
    </button>
  );
}
