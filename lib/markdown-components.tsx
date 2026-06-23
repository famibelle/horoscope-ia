import { MarkdownHooks } from 'react-markdown';
import type { Components } from 'react-markdown';
import { useState } from 'react';
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

/** Tooltip hover pour un mot créole */
function CreoleWord({ word, def }: { word: string; def: DictDef }) {
  const [open, setOpen] = useState(false);
  const label = def.nomFrancais ? `${word} — ${def.nomFrancais}` : word;
  return (
    <span className="relative inline-block">
      <em
        className="italic text-ancestral-gold cursor-help underline decoration-dotted decoration-ancestral-gold/50 underline-offset-2"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        tabIndex={0}
        aria-label={`${label}${def.definition ? ' : ' + def.definition : ''}`}
      >
        {word}
      </em>
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 w-56 rounded-lg border border-ancestral-gold/20 bg-[#0d1a0f]/95 px-3 py-2 text-left shadow-xl backdrop-blur-sm"
          style={{ fontSize: '12px', lineHeight: 1.5 }}
        >
          <span className="block font-semibold text-ancestral-gold" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
            {label}
          </span>
          {def.nomScientifique && (
            <span className="block italic opacity-50" style={{ fontSize: '10px' }}>
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
  return {
    em: ({ children }) => {
      const word = typeof children === 'string' ? children : String(children ?? '');
      const def = dict[word] ?? dict[word.split('/')[0]?.trim()] ?? null;
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
