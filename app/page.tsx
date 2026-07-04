import { readFileSync } from 'fs';
import { join } from 'path';
import StarField from '@/components/StarField';
import Hero from '@/components/Hero';
import InteractiveHoroscope from '@/components/InteractiveHoroscope';
import EditionToggle from '@/components/EditionToggle';
import EnergyBanner from '@/components/EnergyBanner';
import ShareButtons from '@/components/ShareButtons';
import NewsletterSubscribeForm from '@/components/NewsletterSubscribeForm';
import HoroscopesPreview from '@/components/HoroscopesPreview';
import AdSpace from '@/components/AdSpace';
import Articles from '@/components/Articles';
import { EditionProvider } from '@/contexts/EditionContext';
import type { HoroscopeResponse } from '@/lib/horoscope-data';

function getDefaultSign(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 'belier';
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 'taureau';
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 'gemeaux';
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 'cancer';
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 'lion';
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 'vierge';
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 'balance';
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 'scorpion';
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 'sagittaire';
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 'capricorne';
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 'verseau';
  return 'poissons';
}

async function prefetchHoroscope(): Promise<{ data: HoroscopeResponse; sign: string } | null> {
  try {
    // Guadeloupe = UTC-4
    const now = new Date();
    const gp = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const dateStr = gp.toISOString().split('T')[0];
    const sign = getDefaultSign(gp);

    const filePath = join(process.cwd(), 'public', 'data', 'horoscopes', `${dateStr}.json`);
    const raw = readFileSync(filePath, 'utf-8');
    const all = JSON.parse(raw) as Record<string, HoroscopeResponse>;

    // matin = édition par défaut
    const data = all[`${dateStr}|${sign}|matin`];
    if (data) return { data, sign };
  } catch {
    // fichier statique absent, le client fera le fetch normalement
  }
  return null;
}

export default async function Home() {
  const prefetched = await prefetchHoroscope();

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <StarField />

      {/* Ambient background glows - Thème ancestral */}
      <div
        aria-hidden
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      >
        <div
          className="absolute top-[-10%] left-[15%] w-[700px] h-[700px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(210,105,30,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute top-[40%] right-[10%] w-[500px] h-[500px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(139,69,19,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(85,64,40,0.07) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <EditionProvider>
        <div className="relative z-10">
          <EditionToggle />
          <Hero />

          {/* Section éditoriale statique, indexable par Google */}
          <section
            className="relative z-10 px-4 py-6 max-w-2xl mx-auto"
            style={{ borderBottom: '1px solid rgba(245,245,220,0.05)' }}
          >
            <p
              className="font-ui text-[11px] uppercase tracking-[3px] mb-3"
              style={{ color: 'var(--color-gold)' }}
            >
              Horoscope Karukera
            </p>
            <p className="font-display text-ancestral-cream/70 text-[15px] leading-relaxed">
              <strong className="text-ancestral-cream/90">Karukera</strong>, le nom kalinago traditionnel de la Guadeloupe, signifie « l'île aux belles eaux ».{' '}
              <strong className="text-ancestral-cream/90">Zodyak Karukera</strong> puise dans la sagesse ancestrale guadeloupéenne : faune, flore, présages naturels, et traditions créoles et africaines.
              Fanchette y interprète chaque horoscope à travers <strong className="text-ancestral-cream/90">sept dimensions</strong>, amour, travail, argent, <em>lyannaj</em>, présage ancestral et conseil personnalisé.
              Choisissez votre signe pour découvrir votre lecture du jour, imprégnée de l'énergie spirituelle de Karukera.
            </p>
          </section>

          <InteractiveHoroscope
            prefetchedData={prefetched?.data ?? null}
            prefetchedSign={prefetched?.sign ?? null}
          />
          <AdSpace variant="banner" />
          <HoroscopesPreview />
          <EnergyBanner />
          <ShareButtons />
          <AdSpace variant="square" />
          <Articles />
          <section className="relative z-10 px-4 py-10 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p className="font-ui text-[12px] uppercase tracking-[0.3em] mb-3" style={{ color: '#D4AF50' }}>
                Recevoir l&apos;horoscope chaque matin
              </p>
              <h2 className="font-display text-2xl font-bold text-ancestral-cream mb-2">
                🌿 S&apos;abonner à la newsletter
              </h2>
              <p className="font-ui text-[14px] leading-relaxed" style={{ color: 'rgba(200,216,192,0.6)' }}>
                Votre horoscope personnalisé, ancré dans la sagesse de Karukera, livré chaque matin.
              </p>
            </div>
            <NewsletterSubscribeForm />
          </section>
        </div>
      </EditionProvider>
    </main>
  );
}
