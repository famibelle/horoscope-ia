/**
 * Templates HTML email pour la newsletter Horoscope Karukera
 * Design : thème ancestral sombre, palette du site
 * Compatible email (inline styles, pas de flexbox/grid complexe)
 */

import { Sign } from './signs-data';
import { HoroscopeResponse } from './horoscope-data';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://zodyak-karukera.com';

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:           '#0d0d1a',   // fond principal
  card:         '#13111f',   // fond carte
  cardAlt:      '#1a1428',   // fond carte alternée
  border:       '#2a2040',   // bordure subtile
  gold:         '#FFD700',   // ancestral-gold
  terracotta:   '#CD5C5C',   // ancestral-terracotta
  forest:       '#228B22',   // ancestral-forest
  earth:        '#8B4513',   // ancestral-earth
  cream:        '#F5F5DC',   // ancestral-cream
  creamFaint:   '#c8c8a0',   // cream atténué
  purple:       '#7c3aed',   // accent violet
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface NewsletterData {
  date: string;
  sign: Sign;
  horoscope: HoroscopeResponse;
  culturalTip?: string;
  ritual?: string;
}

export interface PresageData {
  type: string;
  nom_creole: string;
  nom_commun: string;
  presage_naturel: string;
  interpretation: Record<string, string> | string;
}

// ── Sections du signe (labels du site) ───────────────────────────────────────
const SECTIONS = [
  { key: 'ouverture',  label: 'Parole des ancêtres', color: C.gold,        emoji: '✦' },
  { key: 'amour',      label: 'Amour',               color: C.terracotta,  emoji: '❤' },
  { key: 'travail',    label: 'Travail',              color: C.forest,      emoji: '⚒' },
  { key: 'argent',     label: 'Argent',               color: C.gold,        emoji: '✧' },
  { key: 'amitie',     label: 'Lyannaj',              color: C.earth,       emoji: '⟡' },
  { key: 'prediction', label: 'Présage ancestral',    color: C.gold,        emoji: '◈' },
  { key: 'conseil',    label: 'Conseil de Maryse',    color: C.forest,      emoji: '✿' },
] as const;

// ── Header ────────────────────────────────────────────────────────────────────
export function getHeaderTemplate(date: string): string {
  const d = new Date(date + 'T12:00:00');
  const day = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);

  return `
<div style="background:${C.bg};padding:40px 32px 32px;text-align:center;border-bottom:1px solid ${C.border};">
  <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:13px;letter-spacing:4px;color:${C.gold};text-transform:uppercase;">
    Horoscope Karukera
  </p>
  <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:30px;font-weight:700;color:${C.cream};line-height:1.2;">
    Les étoiles de Gwadloup<br>vous parlent
  </h1>
  <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:${C.creamFaint};">
    ${dayCapitalized}
  </p>
</div>`.trim();
}

// ── Présage du jour ───────────────────────────────────────────────────────────
export function getPresageTemplate(presage: PresageData): string {
  const interpretation = typeof presage.interpretation === 'string'
    ? presage.interpretation
    : presage.interpretation?.texte ?? presage.interpretation?.general ?? '';

  return `
<div style="margin:0;padding:28px 32px;background:${C.cardAlt};border-top:2px solid ${C.gold};border-bottom:1px solid ${C.border};">
  <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:11px;letter-spacing:3px;color:${C.gold};text-transform:uppercase;">
    Signe du jour
  </p>
  <h2 style="margin:0 0 4px;font-family:Georgia,serif;font-size:20px;color:${C.cream};">
    ${presage.nom_creole}
    <span style="font-size:14px;color:${C.creamFaint};font-style:italic;"> — ${presage.nom_commun}</span>
  </h2>
  <p style="margin:12px 0 0;font-family:Georgia,serif;font-size:16px;color:${C.cream};line-height:1.6;font-style:italic;">
    "${presage.presage_naturel}"
  </p>
  ${interpretation ? `<p style="margin:10px 0 0;font-family:Arial,sans-serif;font-size:14px;color:${C.creamFaint};line-height:1.6;">${interpretation}</p>` : ''}
</div>`.trim();
}

// ── Carte d'un signe ─────────────────────────────────────────────────────────
export function getSignHtmlTemplate(data: NewsletterData): string {
  const { sign, horoscope } = data;

  const teaser = horoscope.teaser
    ? `<div style="margin:0 0 20px;padding:16px;background:rgba(255,215,0,0.06);border-left:3px solid ${C.gold};">
         <p style="margin:0;font-family:Georgia,serif;font-size:15px;color:${C.cream};line-height:1.6;font-style:italic;">"${horoscope.teaser}"</p>
       </div>`
    : '';

  const sections = SECTIONS.map(({ key, label, color, emoji }) => {
    const text = (horoscope as any)[key];
    if (!text) return '';
    return `
<div style="margin:0 0 16px;">
  <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:${color};text-transform:uppercase;">
    ${emoji} ${label}
  </p>
  <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:${C.creamFaint};line-height:1.7;">
    ${text}
  </p>
</div>`.trim();
  }).join('\n');

  const meta = [
    sign.element && `${sign.element}`,
    sign.faune?.nom_creole && sign.faune.nom_creole,
    sign.flore?.nom_creole && sign.flore.nom_creole,
  ].filter(Boolean).join(' · ');

  return `
<div style="margin:0;padding:28px 32px;border-bottom:1px solid ${C.border};background:${C.card};">
  <div style="margin:0 0 20px;">
    <h3 style="margin:0 0 4px;font-family:Georgia,serif;font-size:22px;color:${C.cream};">
      ${sign.name}
      <span style="font-size:15px;color:${C.gold};font-style:italic;"> ${sign.nomKreyol ?? ''}</span>
    </h3>
    ${meta ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:${C.creamFaint};letter-spacing:1px;">${meta}</p>` : ''}
  </div>

  ${teaser}
  ${sections}

  <div style="margin:24px 0 0;text-align:center;">
    <a href="${BASE_URL}/horoscope/${sign.id}"
       style="display:inline-block;padding:14px 32px;background:${C.gold};color:${C.bg};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;letter-spacing:1px;border-radius:4px;">
      Lire mon horoscope complet →
    </a>
  </div>
</div>`.trim();
}

// ── Template texte brut ───────────────────────────────────────────────────────
export function getSignTextTemplate(data: NewsletterData): string {
  const { sign, horoscope } = data;
  const lines = [`\n${sign.name} (${sign.nomKreyol ?? ''})\n${'─'.repeat(40)}`];
  for (const { key, label } of SECTIONS) {
    const text = (horoscope as any)[key];
    if (text) lines.push(`${label} :\n${text}`);
  }
  lines.push(`\n${BASE_URL}/horoscope/${sign.id}\n`);
  return lines.join('\n\n');
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function getFooterTemplate(unsubscribeUrl = '{{unsubscribe_url}}'): string {
  return `
<div style="padding:28px 32px;background:${C.bg};text-align:center;border-top:1px solid ${C.border};">
  <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:13px;color:${C.creamFaint};font-style:italic;">
    Transmis depuis Karukera avec amour
  </p>
  <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:12px;color:${C.border};">
    <a href="${BASE_URL}" style="color:${C.gold};text-decoration:none;">${BASE_URL.replace(/^https?:\/\//, '')}</a>
    &nbsp;·&nbsp;
    <a href="${unsubscribeUrl}" style="color:${C.creamFaint};text-decoration:none;">Se désabonner</a>
  </p>
  <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#333344;">
    © ${new Date().getFullYear()} Horoscope Karukera
  </p>
</div>`.trim();
}

// ── Enveloppe HTML complète ───────────────────────────────────────────────────
export function wrapHtml(subject: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="max-width:600px;margin:0 auto;background:${C.bg};">
${body}
</div>
</body>
</html>`;
}

// ── Export legacy (compatibilité avec le code existant) ───────────────────────
const NewsletterTemplates = {
  getSignHtmlTemplate,
  getSignTextTemplate,
  getHeaderTemplate,
  getFooterTemplate: () => getFooterTemplate(),
  getCulturalSectionTemplate: (title: string, content: string) => `
<div style="margin:0;padding:28px 32px;background:${C.cardAlt};border-bottom:1px solid ${C.border};">
  <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:18px;color:${C.gold};">${title}</h2>
  <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:${C.creamFaint};line-height:1.7;">${content}</p>
</div>`.trim(),
  getSpecialPredictionsTemplate: () => '',
};

export default NewsletterTemplates;
