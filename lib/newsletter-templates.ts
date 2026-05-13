/**
 * Générateur de templates pour la newsletter d'horoscope
 * Templates simples et réutilisables pour différents formats
 */

import { Sign } from './signs-data';
import { HoroscopeResponse } from './horoscope-data';

// Interface pour les données de la newsletter
interface NewsletterData {
  date: string;
  sign: Sign;
  horoscope: HoroscopeResponse;
  culturalTip?: string;
  specialAdvice?: string;
  ritual?: string;
}

// Template HTML de base pour un signe
function getSignHtmlTemplate(data: NewsletterData): string {
  return `
<div style="
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 24px;
  margin: 16px 0;
  border-left: 4px solid #7c3aed;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
">
  <div style="display: flex; align-items: center; margin-bottom: 16px;">
    <div style="
      width: 48px;
      height: 48px;
      background: #7c3aed;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      margin-right: 12px;
      flex-shrink: 0;
    ">
      ${data.sign.emoji || data.sign.name.slice(0, 2)}
    </div>
    <div>
      <h3 style="
        margin: 0;
        color: #2d3748;
        font-size: 18px;
        font-weight: 600;
      ">
        ${data.sign.name} (${data.sign.nomKreyol})
      </h3>
      <p style="
        margin: 4px 0 0 0;
        color: #718096;
        font-size: 14px;
      ">
        ${data.sign.element} | ${data.sign.faune?.nom_creole || '—'} | ${data.sign.flore?.nom_creole || '—'}
      </p>
    </div>
  </div>

  <div style="margin: 16px 0;">
    <p style="
      color: #4a5568;
      line-height: 1.6;
      margin: 0 0 12px 0;
    ">
      <strong style="color: #7c3aed;">Ce matin :</strong> ${data.horoscope.ouverture}
    </p>
    <p style="
      color: #4a5568;
      line-height: 1.6;
      margin: 0 0 12px 0;
    ">
      <strong style="color: #7c3aed;">Cet après-midi :</strong> ${data.horoscope.amour}
    </p>
    <p style="
      color: #4a5568;
      line-height: 1.6;
      margin: 0;
    ">
      <strong style="color: #7c3aed;">Ce soir :</strong> ${data.horoscope.travail}
    </p>
  </div>

  ${data.culturalTip ? `
  <div style="
    background: rgba(124, 58, 237, 0.05);
    border-left: 2px solid #7c3aed;
    padding: 12px;
    margin: 16px 0;
    border-radius: 6px;
  ">
    <p style="
      color: #7c3aed;
      font-style: italic;
      margin: 0 0 8px 0;
      font-weight: 500;
    ">
      Conseil de résistance
    </p>
    <p style="
      color: #4a5568;
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
    ">
      ${data.culturalTip}
    </p>
  </div>
  ` : ''}

  ${data.ritual ? `
  <div style="
    background: rgba(59, 130, 246, 0.05);
    border-left: 2px solid #3b82f6;
    padding: 12px;
    margin: 16px 0;
    border-radius: 6px;
  ">
    <p style="
      color: #3b82f6;
      font-style: italic;
      margin: 0 0 8px 0;
      font-weight: 500;
    ">
      Rituel du jour
    </p>
    <p style="
      color: #4a5568;
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
    ">
      ${data.ritual}
    </p>
  </div>
  ` : ''}

  <div style="
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
    text-align: center;
  ">
    <a href="https://horoscope-guadeloupe.com/horoscope/${data.sign.id}?date=${data.date}" 
       style="
         display: inline-block;
         background: #7c3aed;
         color: white;
         padding: 8px 16px;
         border-radius: 6px;
         text-decoration: none;
         font-weight: 500;
         font-size: 14px;
         transition: background 0.2s;
       "
       onmouseover="this.style.background='#6b21a8'"
       onmouseout="this.style.background='#7c3aed'"
    >
      Lire mon horoscope complet
    </a>
  </div>
</div>
  `;
}

// Template texte simple pour un signe
function getSignTextTemplate(data: NewsletterData): string {
  return `
${data.sign.name} (${data.sign.nomKreyol})
${'='.repeat(data.sign.name.length + data.sign.nomKreyol.length + 3)}

Élément: ${data.sign.element}
Faune: ${data.sign.faune?.nom_creole || '—'}
Flore: ${data.sign.flore?.nom_creole || '—'}

Ce matin: ${data.horoscope.ouverture}
Cet après-midi: ${data.horoscope.amour}
Ce soir: ${data.horoscope.travail}

${data.culturalTip ? `
CONSEIL DE RÉSISTANCE:
${data.culturalTip}
` : ''}

${data.ritual ? `
RITUEL DU JOUR:
${data.ritual}
` : ''}

Lire mon horoscope complet:
https://horoscope-guadeloupe.com/horoscope/${data.sign.id}?date=${data.date}

${'—'.repeat(20)}
  `;
}

// Template pour l'en-tête de la newsletter
function getHeaderTemplate(date: string): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 
                  'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  const d = new Date(date);
  const dayName = days[d.getDay()];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `
<div style="
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
  color: white;
  border-radius: 12px 12px 0 0;
">
  <h1 style="
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
  ">
    🌟 Horoscope Guadeloupéen
  </h1>
  <p style="
    margin: 0;
    font-size: 18px;
    opacity: 0.9;
    margin-bottom: 4px;
  ">
    ${dayName} ${day} ${month} ${year}
  </p>
  <p style="
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
    font-style: italic;
  ">
    "Les esprits de Karukera vous parlent"
  </p>
</div>
  `;
}

// Template pour le pied de page
function getFooterTemplate(): string {
  return `
<div style="
  text-align: center;
  padding: 24px;
  color: #718096;
  font-size: 12px;
  margin-top: 32px;
">
  <p style="margin: 0 0 8px 0;">
    Cet email vous est envoyé depuis la Guadeloupe avec amour ❤️
  </p>
  <p style="margin: 0 0 8px 0;">
    <a href="https://horoscope-guadeloupe.com" style="color: #7c3aed; text-decoration: none;">
      Visitez notre site
    </a> | 
    <a href="{{unsubscribe_link}}" style="color: #7c3aed; text-decoration: none;">
      Se désabonner
    </a>
  </p>
  <p style="margin: 0;">
    © ${new Date().getFullYear()} Horoscope Guadeloupéen. Tous droits réservés.
  </p>
</div>
  `;
}

// Template pour la section culturelle
function getCulturalSectionTemplate(title: string, content: string, imageUrl?: string): string {
  return `
<div style="
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
">
  <h2 style="
    color: #2d3748;
    font-size: 20px;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #7c3aed;
  ">
    ${title}
  </h2>
  
  ${imageUrl ? `
  <img src="${imageUrl}" alt="${title}" style="
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 16px;
  " />
  ` : ''}
  
  <p style="
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
  ">
    ${content}
  </p>
</div>
  `;
}

// Template pour les prévisions spéciales
function getSpecialPredictionsTemplate(predictions: {
  love: string;
  work: string;
  money: string;
  health: string;
}): string {
  return `
<div style="
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
">
  <h2 style="
    color: #1e40af;
    font-size: 20px;
    margin: 0 0 20px 0;
    text-align: center;
  ">
    🔮 Prévisions Spéciales du Jour
  </h2>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
    <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #ef4444; font-weight: 600;">❤️ Amour</p>
      <p style="margin: 0; color: #4a5568; font-size: 14px;">${predictions.love}</p>
    </div>
    
    <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #f59e0b; font-weight: 600;">💼 Travail</p>
      <p style="margin: 0; color: #4a5568; font-size: 14px;">${predictions.work}</p>
    </div>
    
    <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #10b981; font-weight: 600;">💰 Argent</p>
      <p style="margin: 0; color: #4a5568; font-size: 14px;">${predictions.money}</p>
    </div>
    
    <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; color: #8b5cf6; font-weight: 600;">🏥 Santé</p>
      <p style="margin: 0; color: #4a5568; font-size: 14px;">${predictions.health}</p>
    </div>
  </div>
</div>
  `;
}

// Export des templates
const NewsletterTemplates = {
  getSignHtmlTemplate,
  getSignTextTemplate,
  getHeaderTemplate,
  getFooterTemplate,
  getCulturalSectionTemplate,
  getSpecialPredictionsTemplate
};

export type { NewsletterData };
export default NewsletterTemplates;