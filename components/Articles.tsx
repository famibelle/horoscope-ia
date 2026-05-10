'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const articles = [
  {
    id: 1,
    emoji: '♌♎',
    title: 'Compatibilité Lion / Balance',
    excerpt:
      'Deux énergies opposées qui se complètent magnifiquement. Découvrez la dynamique unique de ce duo cosmique fascinant.',
    tag: 'Compatibilité',
    tagColor: 'from-yellow-500 to-rose-500',
    readTime: '4 min',
  },
  {
    id: 2,
    emoji: '🌕',
    title: 'Influence de la pleine lune sur votre signe',
    excerpt:
      'La pleine lune amplifie les émotions et révèle ce qui reste caché. Comment chaque signe vit-il cette intensité lunaire ?',
    tag: 'Astrologie',
    tagColor: 'from-blue-400 to-violet-500',
    readTime: '6 min',
  },
  {
    id: 3,
    emoji: '❤️',
    title: 'Horoscope amour du mois de mai',
    excerpt:
      'Vénus traverse des zones de rencontre exceptionnelles. Voici ce que le cosmos réserve à chaque signe en amour.',
    tag: 'Amour',
    tagColor: 'from-pink-500 to-rose-600',
    readTime: '5 min',
  },
  {
    id: 4,
    emoji: '🔮',
    title: 'Les signes les plus intuitifs en 2026',
    excerpt:
      'Cancer, Scorpion, Poissons : ces signes d\'eau vivent dans une dimension que les autres peinent à saisir.',
    tag: 'Insight',
    tagColor: 'from-violet-500 to-indigo-600',
    readTime: '3 min',
  },
  {
    id: 5,
    emoji: '💼',
    title: 'Succès professionnel : les signes favorisés',
    excerpt:
      'Jupiter en transit offre une fenêtre d\'opportunité rare à certains signes. Votre carrière est-elle sur le point de décoller ?',
    tag: 'Travail',
    tagColor: 'from-emerald-500 to-teal-600',
    readTime: '5 min',
  },
  {
    id: 6,
    emoji: '🌊',
    title: 'Mercure rétrograde : survivre et prospérer',
    excerpt:
      'Loin d\'être une malédiction, Mercure rétrograde est une invitation à la relecture. Guide pratique signe par signe.',
    tag: 'Planètes',
    tagColor: 'from-sky-400 to-blue-600',
    readTime: '7 min',
  },
];

export default function Articles() {
  return (
    <section className="px-4 py-20 max-w-5xl mx-auto">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-violet-300/45 text-xs uppercase tracking-[0.35em] mb-4">
          Savoir & découverte
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
          📰 Explorer l&apos;univers astrologique
        </h2>
        <p className="text-white/35 text-sm sm:text-base max-w-sm mx-auto">
          Approfondissez votre compréhension des astres et de leur influence sur votre vie
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {articles.map((article, index) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07, duration: 0.6 }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="relative rounded-2xl p-5 sm:p-6 cursor-pointer group overflow-hidden"
            style={{
              background:
                'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Hover shimmer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer-bg" />

            {/* Content */}
            <div className="relative z-10">
              {/* Tag */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-white text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r ${article.tagColor}`}
                >
                  {article.tag}
                </span>
                <span className="text-white/25 text-[10px] uppercase tracking-wider">
                  {article.readTime}
                </span>
              </div>

              {/* Emoji */}
              <div className="text-3xl mb-3">{article.emoji}</div>

              {/* Title */}
              <h3 className="font-display font-bold text-white text-base sm:text-lg leading-snug mb-3 group-hover:text-violet-200 transition-colors duration-200">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="text-white/40 text-sm leading-relaxed mb-5 line-clamp-3">
                {article.excerpt}
              </p>

              {/* CTA */}
              <div className="flex items-center gap-1.5 text-violet-300/60 text-xs font-medium group-hover:text-violet-300 transition-colors duration-200">
                <span>Lire l&apos;article</span>
                <ArrowRight
                  size={12}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Load more */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <button
          className="px-8 py-3 rounded-2xl text-white/60 text-sm font-medium border border-white/10 hover:border-violet-400/30 hover:text-white/80 transition-all duration-200 focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          Voir tous les articles →
        </button>
      </motion.div>
    </section>
  );
}
