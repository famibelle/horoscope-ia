'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: fd.get('nom'),
          email: fd.get('email'),
          signe: fd.get('signe'),
          sujet: fd.get('sujet'),
          message: fd.get('message'),
        }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const d = await res.json();
        setStatus('error');
        setErrorMsg(d.error || 'Erreur lors de l\'envoi');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Erreur de connexion');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle size={40} className="text-ancestral-gold" />
        <p className="text-ancestral-cream font-medium">Message envoyé ! Nous répondrons sous 48h.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nom" className="block text-ancestral-cream/80 mb-1">Nom *</label>
        <input type="text" id="nom" name="nom" required placeholder="Votre nom"
          className="w-full p-3 bg-ancestral-dark/50 border border-ancestral-cream/10 rounded-lg text-ancestral-cream focus:outline-none focus:border-ancestral-gold" />
      </div>
      <div>
        <label htmlFor="email" className="block text-ancestral-cream/80 mb-1">Email *</label>
        <input type="email" id="email" name="email" required placeholder="votre@email.com"
          className="w-full p-3 bg-ancestral-dark/50 border border-ancestral-cream/10 rounded-lg text-ancestral-cream focus:outline-none focus:border-ancestral-gold" />
      </div>
      <div>
        <label htmlFor="signe" className="block text-ancestral-cream/80 mb-1">Votre signe (optionnel)</label>
        <select id="signe" name="signe"
          className="w-full p-3 bg-ancestral-dark/50 border border-ancestral-cream/10 rounded-lg text-ancestral-cream focus:outline-none focus:border-ancestral-gold">
          <option value="">-- Sélectionnez votre signe --</option>
          {['Bélier','Taureau','Gémeaux','Cancer','Lion','Vierge','Balance','Scorpion','Sagittaire','Capricorne','Verseau','Poissons'].map(s => (
            <option key={s} value={s.toLowerCase()}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="sujet" className="block text-ancestral-cream/80 mb-1">Sujet *</label>
        <select id="sujet" name="sujet" required
          className="w-full p-3 bg-ancestral-dark/50 border border-ancestral-cream/10 rounded-lg text-ancestral-cream focus:outline-none focus:border-ancestral-gold">
          <option value="">-- Sélectionnez un sujet --</option>
          <option value="question-horoscope">Question sur un horoscope</option>
          <option value="support-technique">Support technique</option>
          <option value="partenariat">Demande de partenariat</option>
          <option value="rgpd">Exercice de vos droits RGPD</option>
          <option value="autre">Autre</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-ancestral-cream/80 mb-1">Message *</label>
        <textarea id="message" name="message" required placeholder="Votre message..." rows={5}
          className="w-full p-3 bg-ancestral-dark/50 border border-ancestral-cream/10 rounded-lg text-ancestral-cream focus:outline-none focus:border-ancestral-gold resize-none" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="consentement" name="consentement" required className="accent-ancestral-gold w-4 h-4" />
        <label htmlFor="consentement" className="text-ancestral-cream/80 text-sm">
          J&apos;accepte que mes données soient traitées conformément à la{' '}
          <a href="/politique-de-confidentialite" className="text-ancestral-gold hover:underline">Politique de Confidentialité</a>.
        </label>
      </div>
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-900/20 border border-red-500/30">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <span className="text-red-300 text-sm">{errorMsg}</span>
        </div>
      )}
      <button type="submit" disabled={status === 'loading'}
        className="w-full py-3 bg-ancestral-gold text-ancestral-dark font-semibold rounded-lg hover:bg-ancestral-gold/90 transition-colors duration-200 disabled:opacity-60">
        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer'}
      </button>
    </form>
  );
}
