'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle } from 'lucide-react';

const SIGNS = [
  { value: 'belier', label: '🐏 Bélier' },
  { value: 'taureau', label: '🐂 Taureau' },
  { value: 'gemeaux', label: '👫 Gémeaux' },
  { value: 'cancer', label: '🦀 Cancer' },
  { value: 'lion', label: '🦁 Lion' },
  { value: 'vierge', label: '👗 Vierge' },
  { value: 'balance', label: '⚖️ Balance' },
  { value: 'scorpion', label: '🦂 Scorpion' },
  { value: 'sagittaire', label: '🏹 Sagittaire' },
  { value: 'capricorne', label: '🐐 Capricorne' },
  { value: 'verseau', label: '💧 Verseau' },
  { value: 'poissons', label: '🐟 Poissons' },
];

export default function NewsletterSubscribeForm() {
  const [email, setEmail] = useState('');
  const [sign, setSign] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sign }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setEmail('');
        setSign('');
        setConsent(false);
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Erreur lors de l\'inscription');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Erreur de connexion');
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <CheckCircle size={48} className="mx-auto mb-4 text-ancestral-gold" />
        <h3 className="text-2xl font-bold text-ancestral-cream mb-2">Vous êtes inscrit !</h3>
        <p className="text-ancestral-cream/70">
          Vous recevrez votre premier horoscope dès demain matin.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
      <div>
        <label htmlFor="nl-email" className="block text-ancestral-cream mb-2 text-sm font-medium">
          Adresse email *
        </label>
        <input
          type="email"
          id="nl-email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="ex: marie@email.com"
          className="w-full p-4 bg-ancestral-dark/50 border-2 border-ancestral-cream/15 rounded-xl
                    text-ancestral-cream placeholder-ancestral-cream/50
                    focus:outline-none focus:border-ancestral-gold focus:bg-ancestral-dark/30
                    transition-all duration-200"
        />
      </div>

      <div>
        <label htmlFor="nl-sign" className="block text-ancestral-cream mb-2 text-sm font-medium">
          Votre signe astrologique (optionnel)
        </label>
        <select
          id="nl-sign"
          value={sign}
          onChange={e => setSign(e.target.value)}
          className="w-full p-4 bg-ancestral-dark/50 border-2 border-ancestral-cream/15 rounded-xl
                    text-ancestral-cream focus:outline-none focus:border-ancestral-gold focus:bg-ancestral-dark/30
                    transition-all duration-200"
        >
          <option value="">-- Sélectionnez votre signe --</option>
          {SIGNS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-start gap-3 p-4 bg-ancestral-dark/30 rounded-xl border border-ancestral-cream/10">
        <input
          type="checkbox"
          id="nl-consent"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          required
          className="mt-1 flex-shrink-0 w-5 h-5 accent-ancestral-gold rounded border-2 border-ancestral-gold/30"
        />
        <label htmlFor="nl-consent" className="text-ancestral-cream/80 text-sm">
          J&apos;accepte de recevoir la newsletter et j&apos;ai lu la{' '}
          <Link href="/politique-de-confidentialite" className="text-ancestral-gold hover:underline font-medium">
            Politique de Confidentialité
          </Link>.
        </label>
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-900/20 border border-red-500/30">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <span className="text-red-300 text-sm">{errorMsg}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 bg-gradient-to-r from-ancestral-gold to-ancestral-gold/80
                  text-ancestral-dark font-bold rounded-xl text-lg
                  hover:from-ancestral-gold/80 hover:to-ancestral-gold
                  transition-all duration-200 shadow-lg hover:shadow-xl
                  disabled:opacity-60 disabled:cursor-wait"
      >
        {status === 'loading' ? 'Inscription en cours...' : 'S\'abonner gratuitement'}
      </button>
    </form>
  );
}
