import StarField from '@/components/StarField';
import Hero from '@/components/Hero';
import InteractiveHoroscope from '@/components/InteractiveHoroscope';
import EnergyBanner from '@/components/EnergyBanner';
import ShareButtons from '@/components/ShareButtons';
import HoroscopesPreview from '@/components/HoroscopesPreview';
import AdSpace from '@/components/AdSpace';
import Articles from '@/components/Articles';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <StarField />

      {/* Ambient background glows */}
      <div
        aria-hidden
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      >
        <div
          className="absolute top-[-10%] left-[15%] w-[700px] h-[700px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute top-[40%] right-[10%] w-[500px] h-[500px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative z-10">
        <Hero />
        <AdSpace variant="banner" />
        <InteractiveHoroscope />
        <EnergyBanner />
        <ShareButtons />
        <HoroscopesPreview />
        <AdSpace variant="square" />
        <Articles />
        <Footer />
      </div>
    </main>
  );
}
