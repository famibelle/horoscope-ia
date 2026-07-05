import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'À propos, Horoscope Karukera | Zodyak Karukera',
  description:
    "Découvrez la mission de Zodyak Karukera, l'astrologie occidentale croisée avec la sagesse ancestrale guadeloupéenne, portée par Fanchette et inspirée par Maryse Condé.",
};

export default function AProposPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div
        aria-hidden
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      >
        <div
          className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,80,0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative z-10 px-4 py-12 max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/35 text-sm hover:text-white/70 transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Retour à l'accueil
        </Link>

        {/* En-tête */}
        <div className="mb-10">
          <p
            className="text-xs tracking-[4px] uppercase mb-4"
            style={{ color: 'var(--color-gold, #D4AF50)' }}
          >
            Ma démarche
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-snug mb-4">
            À propos de<br />Zodyak Karukera
          </h1>
          <div
            className="h-px mt-6"
            style={{
              background: 'linear-gradient(90deg, rgba(212,175,80,0.6), transparent)',
            }}
          />
        </div>

        {/* Section 1, Karukera */}
        <section className="mb-12">
          <h2
            className="font-display text-xl font-bold mb-4"
            style={{ color: 'var(--color-gold, #D4AF50)' }}
          >
            Karukera, l'île aux belles eaux
          </h2>
          <div className="space-y-4 text-white/65 text-base sm:text-lg leading-[1.75]">
            <p>
              Karukera est le nom donné à la Guadeloupe par les peuples Kalinago, ses premiers habitants. En langue kalinago, <em>karukera</em> signifie « l'île aux belles eaux ». Avant que les cartes européennes ne la rebaptisent, cette île portait déjà en elle une identité cosmique : entre Atlantique et mer des Caraïbes, baignée de deux océans, elle a toujours été un lieu de passage, de rencontre et de mémoire.
            </p>
            <p>
              C'est dans cet héritage que j'ai voulu ancrer Zodyak Karukera. Pas l'astrologie des magazines parisiens, générique et déracinée, mais une lecture du ciel enracinée dans la terre guadeloupéenne, dans ses plantes, ses animaux, ses saisons, ses croyances héritées des Kalinago, des Africains déportés, et de toutes les cultures qui ont façonné la Guadeloupe d'aujourd'hui.
            </p>
          </div>
        </section>

        {/* Section 2, Mission */}
        <section className="mb-12">
          <h2
            className="font-display text-xl font-bold mb-4"
            style={{ color: 'var(--color-gold, #D4AF50)' }}
          >
            Une astrologie ancrée dans la culture créole
          </h2>
          <div className="space-y-4 text-white/65 text-base sm:text-lg leading-[1.75]">
            <p>
              L'astrologie occidentale offre un cadre universel : les 12 signes, les planètes, les maisons. Mais un horoscope qui ignore où tu vis, dans quelle lumière tu te lèves, quels arbres te regardent, quelle mer tu entends, cet horoscope ne te parle qu'à moitié.
            </p>
            <p>
              J'ai voulu relier ces deux lectures. Chaque horoscope intègre un <strong style={{ color: 'rgba(255,255,255,0.85)' }}>signe du jour</strong> tiré du monde naturel guadeloupéen : un animal (le colibri, le zandoli, la mangouste), une plante (le balisier, le flamboyant, la canne à sucre), un lieu (la Soufrière, la mangrove, la Désirade). Ce signe n'est pas décoratif. Il est une grille de lecture, un présage naturel que les ancêtres décodaient pour comprendre l'énergie du jour.
            </p>
            <p>
              Chaque horoscope explore sept dimensions de l'existence : la parole des ancêtres, l'amour, le travail, l'argent, le lyannaj (le lien aux autres), le présage ancestral, et le conseil de Fanchette.
            </p>
          </div>
        </section>

        {/* Section 3, Fanchette */}
        <section className="mb-12">
          <h2
            className="font-display text-xl font-bold mb-4"
            style={{ color: 'var(--color-gold, #D4AF50)' }}
          >
            Fanchette, la voix du site
          </h2>
          <div className="space-y-4 text-white/65 text-base sm:text-lg leading-[1.75]">
            <p>
              Fanchette est la voix narrative de Zodyak Karukera, et ce n'est pas un personnage inventé sans lien avec moi. Je m'appelle Medhi Famibelle, je suis le créateur de ce site, et Fanchette, c'est le nom de mon aïeule : née en 1789 en Afrique, de parents inconnus, devenue, née libre, la fondatrice de ma famille en Guadeloupe. Comment elle est arrivée sur l'archipel reste à ce jour partiellement obscur ; je mène des recherches généalogiques pour éclairer cette histoire, probablement liée à la traite et à l'esclavage colonial.
            </p>
            <p>
              Donner sa voix à ce site, c'est ma façon d'honorer sa mémoire et de la faire dialoguer avec la culture guadeloupéenne d'aujourd'hui.
            </p>
            <p>
              Ce projet doit aussi beaucoup à l'œuvre de Maryse Condé, dont l'écriture m'a montré qu'on pouvait raconter la Guadeloupe sans folklore de carte postale, avec ses zones d'ombre, sa complexité, sa mémoire vivante. Mes textes s'en inspirent librement, sans jamais prétendre parler en son nom : un hommage assumé, distinct de la voix de Fanchette.
            </p>
          </div>
        </section>

        {/* Section 4, IA */}
        <section className="mb-12">
          <h2
            className="font-display text-xl font-bold mb-4"
            style={{ color: 'var(--color-gold, #D4AF50)' }}
          >
            Une IA utilisée avec transparence
          </h2>
          <div className="space-y-4 text-white/65 text-base sm:text-lg leading-[1.75]">
            <p>
              Les horoscopes quotidiens et certains articles sont assistés par l'intelligence artificielle, une technologie que j'utilise de façon transparente pour produire du contenu en volume, tout en maintenant une cohérence culturelle et éditoriale. Je relis et valide chaque contenu avant publication.
            </p>
            <p>
              Je crois que l'IA peut être un outil de valorisation culturelle, à condition d'être utilisée avec rigueur, respect, et une vraie connaissance du terrain.
            </p>
          </div>
        </section>

        {/* Section 5, Les présages */}
        <section className="mb-12">
          <h2
            className="font-display text-xl font-bold mb-4"
            style={{ color: 'var(--color-gold, #D4AF50)' }}
          >
            Les présages naturels, un dictionnaire vivant
          </h2>
          <div className="space-y-4 text-white/65 text-base sm:text-lg leading-[1.75]">
            <p>
              Au cœur de Zodyak Karukera se trouve un dictionnaire des présages naturels guadeloupéens : une base de la faune et de la flore locale, chaque espèce associée à une signification symbolique héritée des traditions créoles, africaines et kalinago.
            </p>
            <p>
              Le zandoli (le petit lézard vert qu'on voit partout) annonce-t-il la chance ou la vigilance ? Le chant du mâle-coq avant l'aube est-il bon ou mauvais présage ? Quand le balisier fleurit hors saison, que dit-il ? Ces questions, les anciens y répondaient. J'ai collecté et structuré ces savoirs pour les réintégrer dans une lecture astrologique quotidienne.
            </p>
          </div>
        </section>

        {/* Section 6, Rejoindre */}
        <section
          className="rounded-2xl p-6 mb-12"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,80,0.07), rgba(124,58,237,0.05))',
            border: '1px solid rgba(212,175,80,0.15)',
          }}
        >
          <h2 className="font-display text-xl font-bold mb-3 text-white">
            Rejoindre la communauté
          </h2>
          <p className="text-white/65 text-base sm:text-lg leading-[1.75] mb-5">
            Zodyak Karukera s'adresse à toutes celles et tous ceux qui portent en eux un lien avec la Guadeloupe, qu'ils y vivent, qu'ils en soient originaires, ou qu'ils soient simplement attirés par une astrologie plus proche de la terre et des racines.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: 'var(--color-gold, #D4AF50)',
                color: '#0d0d1a',
              }}
            >
              S'abonner à la newsletter
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white/90 transition-colors border border-white/10 hover:border-white/20"
            >
              Me contacter
            </Link>
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm text-white/50 hover:text-white/80 transition-colors border border-white/10 hover:border-violet-400/30"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            ← Voir mon horoscope du jour
          </Link>
        </div>
      </div>
    </main>
  );
}
