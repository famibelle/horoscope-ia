'use client';

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailSubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [subscriberCount, setSubscriberCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setSubscriberCount(data.subscribers || 0);
        setEmail('');
      } else {
        setStatus('error');
        setError(data.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setStatus('error');
      setError('Erreur de connexion');
    }
  };

  const handleGetCount = async () => {
    try {
      const response = await fetch('/api/subscribe');
      const data = await response.json();
      setSubscriberCount(data.subscribers || 0);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 sm:p-8 opacity-0 animate-fadeInUp">
      <div className="text-center mb-6">
        <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
          Recevez les horoscopes par email
        </h3>
        <p className="text-white/45 text-sm">
          Abonnez-vous pour recevoir les horoscopes quotidiens de Maryse dans votre boîte mail.
        </p>
        {subscriberCount > 0 && (
          <p className="text-violet-400/60 text-xs mt-2">
            Rejoignez {subscriberCount} autres abonnés
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 
                      text-white placeholder-white/30 focus:outline-none 
                      focus:ring-2 focus:ring-violet-500/30 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all 
                    ${status === 'loading' 
                      ? 'bg-violet-600/50 cursor-wait'
                      : status === 'success' 
                        ? 'bg-green-600/70 cursor-default'
                        : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 
                           transform hover:scale-[1.02] active:scale-95'}`}
        >
          {status === 'loading' ? (
            <span>Envoi en cours...</span>
          ) : status === 'success' ? (
            <span><CheckCircle size={18} className="inline-block mr-2" /> Inscrit !</span>
          ) : (
            <span>S\'abonner gratuitement</span>
          )}
        </button>

        <div className="mt-4">
          {status === 'error' && (
            <div className="overflow-hidden animate-fadeIn">
              <div className="flex items-center p-3 rounded-lg bg-rose-900/20 border border-rose-500/30">
                <AlertCircle size={16} className="text-rose-400 mr-2" />
                <span className="text-rose-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="overflow-hidden animate-fadeIn">
              <div className="flex items-center p-3 rounded-lg bg-green-900/20 border border-green-500/30">
                <CheckCircle size={16} className="text-green-400 mr-2" />
                <span className="text-green-300 text-sm">
                  Merci ! Vérifiez votre boîte mail pour confirmer votre abonnement.
                </span>
              </div>
            </div>
          )}
        </div>
      </form>

      <p className="text-xs text-white/20 text-center mt-6">
        Vos données sont chiffrées et ne seront jamais partagées.
      </p>
    </div>
  );
}
