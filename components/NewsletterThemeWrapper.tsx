'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function NewsletterThemeWrapper({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('newsletter-theme');
    const dark = stored !== 'light';
    setIsDark(dark);
  }, []);

  // Synchronise les iframes avec le thème courant
  useEffect(() => {
    const syncIframes = () => {
      document.querySelectorAll('iframe').forEach(iframe => {
        try {
          const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
          doc?.documentElement.classList.toggle('dark', isDark);
        } catch (_) {}
      });
    };
    syncIframes();
    // Réessaie après 300ms pour les iframes lazy-loaded
    const t = setTimeout(syncIframes, 300);
    return () => clearTimeout(t);
  }, [isDark]);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('newsletter-theme', next ? 'dark' : 'light');
  }

  return (
    <div id="nl-theme" className={isDark ? 'dark' : ''}>
      <button
        onClick={toggle}
        aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        className="fixed top-4 right-4 z-50 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
        style={{
          background: isDark ? 'rgba(13,26,18,0.7)' : 'rgba(242,236,224,0.7)',
          border: isDark ? '1px solid rgba(200,216,192,0.15)' : '1px solid rgba(26,46,26,0.2)',
          color: isDark ? '#D4AF50' : '#8B6914',
          backdropFilter: 'blur(8px)',
        }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      {children}
    </div>
  );
}
