import { MarkdownHooks } from 'react-markdown';
import type { Components } from 'react-markdown';

export { MarkdownHooks as Markdown };

/**
 * Composants ReactMarkdown partagés — applique le style ancestral aux balises em/strong.
 * Utilisation : <ReactMarkdown components={markdownComponents}>...</ReactMarkdown>
 */
export const markdownComponents: Components = {
  em: ({ children }) => (
    <em className="italic text-ancestral-gold">{children}</em>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-ancestral-gold">{children}</strong>
  ),
};

/** Supprime les marqueurs markdown d'une chaîne (pour les extraits tronqués). */
export function stripMarkdown(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1');
}
