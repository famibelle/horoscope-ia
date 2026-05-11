import StarField from '@/components/StarField';
import Hero from '@/components/Hero';
import InteractiveHoroscope from '@/components/InteractiveHoroscope';
import EditionToggle from '@/components/EditionToggle';
import EnergyBanner from '@/components/EnergyBanner';
import ShareButtons from '@/components/ShareButtons';
import HoroscopesPreview from '@/components/HoroscopesPreview';
import AdSpace from '@/components/AdSpace';
import Articles from '@/components/Articles';
import Footer from '@/components/Footer';
import { EditionProvider } from '@/contexts/EditionContext';

export default function Home() {
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
          <InteractiveHoroscope />
          <AdSpace variant="banner" />
          <HoroscopesPreview />
          <EnergyBanner />
          <ShareButtons />
          <AdSpace variant="square" />
          <Articles />
          <Footer />
        </div>
      </EditionProvider>
    </main>
  );
}
