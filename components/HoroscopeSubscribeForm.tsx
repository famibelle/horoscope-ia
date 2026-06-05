'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

const SIGNS = [
  { value: 'belier',     label: '🐏 Bélier' },
  { value: 'taureau',    label: '🐂 Taureau' },
  { value: 'gemeaux',    label: '👫 Gémeaux' },
  { value: 'cancer',     label: '🦀 Cancer' },
  { value: 'lion',       label: '🦁 Lion' },
  { value: 'vierge',     label: '👗 Vierge' },
  { value: 'balance',    label: '⚖️ Balance' },
  { value: 'scorpion',   label: '🦂 Scorpion' },
  { value: 'sagittaire', label: '🏹 Sagittaire' },
  { value: 'capricorne', label: '🐐 Capricorne' },
  { value: 'verseau',    label: '💧 Verseau' },
  { value: 'poissons',   label: '🐟 Poissons' },
];

const inputStyle = {
  background: 'rgba(245,245,220,0.05)',
  border: '1px solid rgba(245,245,220,0.15)',
};

export default function HoroscopeSubscribeForm({ defaultSignId }: { defaultSignId: string }) {
  const [email, setEmail] = useState('');
  const [sign, setSign] = useState(defaultSignId);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sign }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-ancestral-gold">
        <CheckCircle size={18} />
        <span className="text-sm font-medium">Inscription réussie — à demain matin !</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="votre@email.com"
        required
        className="flex-1 min-w-0 px-4 py-2.5 rounded-xl text-ancestral-cream/80 placeholder-ancestral-cream/20 text-sm"
        style={inputStyle}
      />
      <select
        value={sign}
        onChange={e => setSign(e.target.value)}
        className="px-3 py-2.5 rounded-xl text-ancestral-cream/80 text-sm"
        style={inputStyle}
      >
        {SIGNS.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-ancestral-dark bg-gradient-to-r from-ancestral-gold/90 to-ancestral-gold/60 disabled:opacity-60 disabled:cursor-wait"
      >
        {status === 'loading' ? '…' : "S'abonner"}
      </button>
      {status === 'error' && (
        <p className="w-full text-center text-red-400 text-xs mt-1">Erreur — réessaie dans un instant.</p>
      )}
    </form>
  );
}
