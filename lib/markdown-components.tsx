import { MarkdownHooks } from 'react-markdown';
import type { Components } from 'react-markdown';
import { useState, useEffect, useRef } from 'react';
import type { DictDef } from './use-dictionnaire';

export { MarkdownHooks as Markdown };

/**
 * Composants ReactMarkdown partagés — applique le style ancestral aux balises em/strong.
 * Utilisation : <ReactMarkdown components={markdownComponents}>...</ReactMarkdown>
 *
 * Avec dictionnaire : <ReactMarkdown components={creoleComponents(dict)}>...</ReactMarkdown>
 * Les mots créoles dorés affichent alors une définition au survol (tooltip).
 */
export const markdownComponents: Components = {
  em: ({ children }) => (
    <em className="italic text-ancestral-gold">{children}</em>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-ancestral-gold">{children}</strong>
  ),
};

/** Tooltip hover (desktop) / tap (mobile) pour un mot créole */
function CreoleWord({ word, def }: { word: string; def: DictDef }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isTouchRef = useRef(false);

  useEffect(() => {
    isTouchRef.current = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }, []);

  // Ferme au tap en dehors (mobile)
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: TouchEvent | MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('touchstart', handleOutside, { passive: true });
    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [open]);

  const ariaLabel = `${word}${def.nomFrancais ? ` (${def.nomFrancais})` : ''}${def.definition ? ' : ' + def.definition : ''}`;

  return (
    <span ref={ref} className="relative inline-block">
      <em
        className="italic text-ancestral-gold cursor-help"
        onMouseEnter={() => { if (!isTouchRef.current) setOpen(true); }}
        onMouseLeave={() => { if (!isTouchRef.current) setOpen(false); }}
        onClick={(e) => { e.stopPropagation(); if (isTouchRef.current) setOpen(v => !v); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        tabIndex={0}
        aria-label={ariaLabel}
      >
        {word}
      </em>
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 w-56 rounded-lg border border-ancestral-gold/20 px-3 py-2 text-left shadow-xl"
          style={{ backgroundColor: '#0d1a0f', fontSize: '12px', lineHeight: 1.5 }}
        >
          {def.nomFrancais && (
            <span className="block font-semibold text-ancestral-gold" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
              {def.nomFrancais}
            </span>
          )}
          {def.nomScientifique && (
            <span className={`block italic opacity-50 ${def.nomFrancais ? '' : 'mt-0'}`} style={{ fontSize: '10px' }}>
              {def.nomScientifique}
            </span>
          )}
          {def.definition && (
            <span className="mt-1 block text-[#C8D8C0]/90">{def.definition}</span>
          )}
          {def.sacreSymbolique && (
            <span className="mt-1 block font-semibold text-ancestral-gold/70" style={{ fontSize: '10px' }}>
              ✦ {def.sacreSymbolique}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

/**
 * Retourne des composants ReactMarkdown avec tooltips hover sur les mots créoles.
 * Utiliser à la place de markdownComponents quand le dictionnaire est chargé.
 */
export function creoleComponents(dict: Record<string, DictDef>): Components {
  const lower: Record<string, DictDef> = {};
  for (const [k, v] of Object.entries(dict)) {
    lower[k.toLowerCase()] = v;
  }
  return {
    em: ({ children }) => {
      const word = typeof children === 'string' ? children : String(children ?? '');
      const wl = word.toLowerCase();
      const def = dict[word]
        ?? dict[word.split('/')[0]?.trim()]
        ?? lower[wl]
        ?? lower[wl.split('/')[0]?.trim()]
        ?? null;
      if (!def || !def.definition) {
        return <em className="italic text-ancestral-gold">{children}</em>;
      }
      return <CreoleWord word={word} def={def} />;
    },
    strong: ({ children }) => (
      <strong className="font-semibold text-ancestral-gold">{children}</strong>
    ),
  };
}

/** Supprime les marqueurs markdown d'une chaîne (pour les extraits tronqués). */
export function stripMarkdown(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1');
}
