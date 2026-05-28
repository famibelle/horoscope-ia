'use client';

import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, BookOpen, Sparkles, Leaf, Crown, Church, Music, Calendar } from 'lucide-react';
import { vaudouData, VaudouEntry, isLoaEntry, isAnimalEntry, isPlanteEntry, isObjetEntry, isLieuEntry, isRituelEntry, isChantEntry, isDateRituelleEntry } from '@/lib/private/vaudou-data';

// Catégories avec icônes et couleurs
const CATEGORIES = [
  { id: 'loa', name: 'Loas', emoji: '👑', icon: Crown, color: 'text-purple-400', bgColor: 'bg-purple-400/10 border-purple-400/20' },
  { id: 'animal', name: 'Animaux Sacrés', emoji: '🐍', icon: Leaf, color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/20' },
  { id: 'plante', name: 'Plantes Sacrées', emoji: '🌿', icon: Leaf, color: 'text-ancestral-gold', bgColor: 'bg-ancestral-gold/10 border-ancestral-gold/20' },
  { id: 'objet', name: 'Objets Rituels', emoji: '📿', icon: Church, color: 'text-orange-400', bgColor: 'bg-orange-400/10 border-orange-400/20' },
  { id: 'lieu', name: 'Lieux Sacrés', emoji: '🏝️', icon: Church, color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/20' },
  { id: 'rituel', name: 'Rituels', emoji: '🕯️', icon: Sparkles, color: 'text-pink-400', bgColor: 'bg-pink-400/10 border-pink-400/20' },
  { id: 'chant', name: 'Chants', emoji: '🎶', icon: Music, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10 border-cyan-400/20' },
  { id: 'date', name: 'Dates Rituelles', emoji: '📅', icon: Calendar, color: 'text-red-400', bgColor: 'bg-red-400/10 border-red-400/20' },
];

// Niveaux de sacralité
const SACRALITE_LEVELS: Record<string, { label: string; emoji: string; color: string; bgColor: string }> = {
  SACRÉ: { label: 'Sacré', emoji: '⭐', color: 'text-ancestral-gold', bgColor: 'bg-ancestral-gold/15 border-ancestral-gold/30' },
  Emblématique: { label: 'Emblématique', emoji: '✨', color: 'text-purple-400', bgColor: 'bg-purple-400/15 border-purple-400/30' },
  Culturel: { label: 'Culturel', emoji: '🎭', color: 'text-blue-400', bgColor: 'bg-blue-400/15 border-blue-400/30' },
  Ambivalent: { label: 'Ambivalent', emoji: '⚖️', color: 'text-orange-400', bgColor: 'bg-orange-400/15 border-orange-400/30' },
  Symbolique: { label: 'Symbolique', emoji: '📿', color: 'text-cyan-400', bgColor: 'bg-cyan-400/15 border-cyan-400/30' },
};

// Familles
const FAMILLES: Record<string, { color: string; bgColor: string }> = {
  Rada: { color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/20' },
  Petro: { color: 'text-red-400', bgColor: 'bg-red-400/10 border-red-400/20' },
  Congo: { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/20' },
};

export default function DictionnaireVaudouPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedSacralite, setSelectedSacralite] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<VaudouEntry | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filtrer les entrées
  const filteredEntries = useMemo(() => {
    return vaudouData.filter(entry => {
      // Filtre par catégorie
      if (selectedCategory && entry.type !== selectedCategory) {
        return false;
      }

      // Filtre par famille
      if (selectedFamily && 'famille' in entry && entry.famille !== selectedFamily) {
        return false;
      }

      // Filtre par sacralité
      if (selectedSacralite && entry.niveauSacralite !== selectedSacralite) {
        return false;
      }

      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const nomCreole = entry.nomCreole.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const nomFrancais = entry.nomFrancais.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const dimension = entry.dimensionCulturelle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        return nomCreole.includes(query) || nomFrancais.includes(query) || dimension.includes(query);
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedFamily, selectedSacralite]);

  // Grouper par lettre initiale
  const groupedEntries: Record<string, VaudouEntry[]> = {};
  filteredEntries.forEach(entry => {
    const firstLetter = entry.nomCreole.charAt(0).toUpperCase();
    if (!groupedEntries[firstLetter]) {
      groupedEntries[firstLetter] = [];
    }
    groupedEntries[firstLetter].push(entry);
  });

  // Compter les entrées par catégorie
  const categoryCounts: Record<string, number> = {};
  CATEGORIES.forEach(cat => {
    categoryCounts[cat.id] = vaudouData.filter(e => e.type === cat.id).length;
  });

  // Obtenir toutes les familles uniques
  const allFamilies = useMemo(() => {
    const families = new Set<string>();
    vaudouData.forEach(entry => {
      if ('famille' in entry) {
        families.add(entry.famille);
      }
    });
    return Array.from(families).sort();
  }, []);

  // Obtenir tous les niveaux de sacralité uniques
  const allSacraliteLevels = Object.keys(SACRALITE_LEVELS);

  // Obtenir les tags uniques pour les suggestions
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    vaudouData.forEach(entry => {
      entry.tags.forEach(tag => {
        const cleanTag = tag.replace(/^[^a-z]/, '').replace(/-[a-z]+$/, '');
        tags.add(cleanTag);
      });
    });
    return Array.from(tags).sort();
  }, []);

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedFamily(null);
    setSelectedSacralite(null);
    setSearchQuery('');
  };

  // Get category config
  const getCategoryConfig = (type: string) => {
    return CATEGORIES.find(c => c.id === type) || CATEGORIES[0];
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-ancestral-gold/70 text-xs uppercase tracking-[0.35em] mb-3"
          >
            Répertoire spirituel
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ancestral-cream mb-4"
          >
            Dictionnaire Vaudou
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg max-w-2xl mx-auto"
          >
            Explorez plus de 200 entrées sur les loas, plantes sacrées, animaux, rituels et symboles 
            du vaudou guadeloupéen.
          </motion.p>
        </div>
      </motion.div>

      {/* Filtres et recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-4 pb-8 max-w-5xl mx-auto"
      >
        <div
          className="rounded-3xl p-6"
          style={{
            background: 'rgba(245,245,220,0.03)',
            border: '1px solid rgba(139,69,19,0.2)',
          }}
        >
          {/* Recherche */}
          <div className="relative mb-6">
            <Search
              size={20}
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${isSearchFocused ? 'text-ancestral-gold' : 'text-white/60'}`}
            />
            <input
              type="text"
              placeholder="Rechercher par nom créole, français ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/60 focus:outline-none focus:border-ancestral-gold/30 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {/* Catégories */}
            <div className="space-y-2">
              <p className="text-white/70 text-xs uppercase tracking-wider">Catégorie</p>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ancestral-gold/30"
              >
                <option value="">Toutes</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name} ({categoryCounts[cat.id]})
                  </option>
                ))}
              </select>
            </div>

            {/* Familles */}
            <div className="space-y-2">
              <p className="text-white/70 text-xs uppercase tracking-wider">Famille</p>
              <select
                value={selectedFamily || ''}
                onChange={(e) => setSelectedFamily(e.target.value || null)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ancestral-gold/30"
              >
                <option value="">Toutes</option>
                {allFamilies.map(famille => (
                  <option key={famille} value={famille}>
                    {famille === 'Rada' ? '🟢' : famille === 'Petro' ? '🔴' : famille === 'Congo' ? '🟡' : ''} {famille}
                  </option>
                ))}
              </select>
            </div>

            {/* Sacralité */}
            <div className="space-y-2">
              <p className="text-white/70 text-xs uppercase tracking-wider">Sacralité</p>
              <select
                value={selectedSacralite || ''}
                onChange={(e) => setSelectedSacralite(e.target.value || null)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ancestral-gold/30"
              >
                <option value="">Tous</option>
                {allSacraliteLevels.map(level => {
                  const config = SACRALITE_LEVELS[level];
                  return (
                    <option key={level} value={level}>
                      {config.emoji} {config.label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Bouton Réinitialiser */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                disabled={!selectedCategory && !selectedFamily && !selectedSacralite && !searchQuery}
                className={`
                  w-full p-2.5 rounded-xl text-sm font-medium transition-colors
                  ${!selectedCategory && !selectedFamily && !selectedSacralite && !searchQuery
                    ? 'opacity-50 cursor-not-allowed bg-white/5 border border-white/10 text-white/60'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/8'
                  }
                `}
              >
                <X size={16} className="inline-block mr-2" />
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Résultats */}
          <div className="pt-4 border-t border-white/5">
            <p className="text-white/70 text-sm">
              <span className="text-ancestral-gold">{filteredEntries.length}</span> entrées trouvées
              {selectedCategory && (
                <span className="ml-2 text-white/50">/ {categoryCounts[selectedCategory]} dans {CATEGORIES.find(c => c.id === selectedCategory)?.name}</span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Suggestions de tags */}
      {filteredEntries.length === 0 && searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-8 max-w-5xl mx-auto"
        >
          <p className="text-white/60 text-sm mb-4 text-center">
            Aucune entrée trouvée. Essayez avec :
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {allTags
              .filter(tag => tag.includes(searchQuery.toLowerCase().replace(/[^a-z]/g, '')))
              .slice(0, 5)
              .map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1.5 rounded-full text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {tag}
                </button>
              ))}
          </div>
        </motion.div>
      )}

      {/* Liste des entrées */}
      {filteredEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="px-4 pb-16 max-w-5xl mx-auto"
        >
          {/* Affichage par lettre */}
          <div className="space-y-8">
            {Object.entries(groupedEntries).sort(([a], [b]) => a.localeCompare(b, 'fr')).map(([letter, entries]) => (
              <motion.div
                key={letter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {/* Lettre */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-4"
                >
                  <h2 className="text-2xl font-bold text-ancestral-gold">{letter}</h2>
                  <div className="h-px w-full mt-2 bg-gradient-to-r from-ancestral-gold/30 to-transparent" />
                </motion.div>

                {/* Entrées */}
                <div className="space-y-3">
                  {entries.map((entry) => {
                    const category = getCategoryConfig(entry.type);
                    const sacralite = SACRALITE_LEVELS[entry.niveauSacralite];
                    const famille = 'famille' in entry ? FAMILLES[entry.famille] : null;

                    return (
                      <motion.button
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full text-left p-4 rounded-2xl transition-colors"
                        style={{
                          background: 'rgba(245,245,220,0.03)',
                          border: '1px solid rgba(139,69,19,0.1)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0
                                ${category.bgColor} ${category.color}`}
                            >
                              <span>{entry.type === 'loa' ? '👑' : 
                                     entry.type === 'animal' ? '🐍' : 
                                     entry.type === 'plante' ? '🌿' : 
                                     entry.type === 'objet' ? '📿' : 
                                     entry.type === 'lieu' ? '🏝️' : 
                                     entry.type === 'rituel' ? '🕯️' : 
                                     entry.type === 'chant' ? '🎶' : '📅'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-white font-medium flex items-center gap-2">
                                {entry.nomCreole}
                                {sacralite && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${sacralite.bgColor} ${sacralite.color}`}>
                                    {sacralite.emoji}
                                  </span>
                                )}
                              </h3>
                              <p className="text-white/70 text-sm">{entry.nomFrancais}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {famille && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${famille.bgColor} ${famille.color}`}>
                                {entry.famille}
                              </span>
                            )}
                            <span className="text-white/50 text-xs">→</span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modal détail */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(145deg, rgba(245,245,220,0.08) 0%, rgba(139,69,19,0.04) 100%)',
                border: '1px solid rgba(138,43,226,0.3)',
              }}
            >
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
              >
                <X size={24} />
              </button>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* En-tête */}
                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
                    style={{
                      background: `linear-gradient(135deg, rgba(138,43,226,0.20), rgba(75,0,130,0.15))`,
                      border: `1px solid rgba(138,43,226,0.35)`,
                    }}
                  >
                    <span>
                      {selectedEntry.type === 'loa' ? '👑' : 
                       selectedEntry.type === 'animal' ? '🐍' : 
                       selectedEntry.type === 'plante' ? '🌿' : 
                       selectedEntry.type === 'objet' ? '📿' : 
                       selectedEntry.type === 'lieu' ? '🏝️' : 
                       selectedEntry.type === 'rituel' ? '🕯️' : 
                       selectedEntry.type === 'chant' ? '🎶' : '📅'}
                    </span>
                  </div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-display text-2xl font-bold text-ancestral-gold"
                  >
                    {selectedEntry.nomCreole}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/80 text-lg mt-1"
                  >
                    {selectedEntry.nomFrancais}
                  </motion.p>

                  {/* Badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-2 mt-4"
                  >
                    <span className={`text-xs px-3 py-1 rounded-full ${getCategoryConfig(selectedEntry.type).bgColor} ${getCategoryConfig(selectedEntry.type).color}`}>
                      {getCategoryConfig(selectedEntry.type).emoji} {getCategoryConfig(selectedEntry.type).name}
                    </span>
                    {'famille' in selectedEntry && selectedEntry.famille && FAMILLES[selectedEntry.famille] && (
                      <span className={`text-xs px-3 py-1 rounded-full ${FAMILLES[selectedEntry.famille].bgColor} ${FAMILLES[selectedEntry.famille].color}`}>
                        {selectedEntry.famille}
                      </span>
                    )}
                    <span className={`text-xs px-3 py-1 rounded-full ${SACRALITE_LEVELS[selectedEntry.niveauSacralite].bgColor} ${SACRALITE_LEVELS[selectedEntry.niveauSacralite].color}`}>
                      {SACRALITE_LEVELS[selectedEntry.niveauSacralite].emoji} {SACRALITE_LEVELS[selectedEntry.niveauSacralite].label}
                    </span>
                  </motion.div>
                </div>

                {/* Contenu */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6"
                >
                  {/* Description */}
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: 'rgba(245,245,220,0.05)',
                      border: '1px solid rgba(245,245,220,0.1)',
                    }}
                  >
                    <p className="text-ancestral-gold text-xs uppercase tracking-wider mb-2">
                      Dimension culturelle
                    </p>
                    <div className="text-white/90 text-sm leading-relaxed">
                      <ReactMarkdown>{selectedEntry.dimensionCulturelle}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Sacre Symbolique */}
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: 'rgba(75,0,130,0.05)',
                      border: '1px solid rgba(75,0,130,0.15)',
                    }}
                  >
                    <p className="text-purple-400 text-xs uppercase tracking-wider mb-2">
                      Symbolique
                    </p>
                    <div className="text-white/90 text-sm leading-relaxed">
                      <ReactMarkdown>{selectedEntry.sacreSymbolique}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Tags */}
                  {'tags' in selectedEntry && selectedEntry.tags.length > 0 && (
                    <div className="pt-2">
                      <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.slice(0, 5).map((tag, i) => (
                          <span
                            key={`${tag}-${i}`}
                            className="px-2.5 py-1 rounded-full text-xs text-white/80"
                            style={{
                              background: 'rgba(245,245,220,0.08)',
                              border: '1px solid rgba(245,245,220,0.15)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Catégorie et Sous-catégorie */}
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Classement</p>
                    <p className="text-white/90 text-sm">
                      Catégorie : {selectedEntry.categorie}
                    </p>
                    <p className="text-white/90 text-sm">
                      Sous-catégorie : {selectedEntry.sousCategorie}
                    </p>
                  </div>

                  {/* Champs spécifiques par type */}
                  <div className="pt-2 border-t border-white/10 space-y-4">
                    {isLoaEntry(selectedEntry) && selectedEntry.couleurs && (
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Couleurs</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntry.couleurs.map(couleur => (
                            <span
                              key={couleur}
                              className="px-2.5 py-1 rounded-full text-xs text-white"
                              style={{
                                background: `rgba(138,43,226,0.15)`,
                                border: `1px solid rgba(138,43,226,0.25)`,
                              }}
                            >
                              {couleur}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {isLoaEntry(selectedEntry) && selectedEntry.correspondanceAfricaine && (
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Correspondance Africaine</p>
                        <p className="text-white/90 text-sm">{selectedEntry.correspondanceAfricaine}</p>
                      </div>
                    )}

                    {isAnimalEntry(selectedEntry) && selectedEntry.nomScientifique && (
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Nom Scientifique</p>
                        <p className="text-white/90 text-sm italic">{selectedEntry.nomScientifique}</p>
                      </div>
                    )}

                    {isPlanteEntry(selectedEntry) && selectedEntry.nomScientifique && (
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Nom Scientifique</p>
                        <p className="text-white/90 text-sm italic">{selectedEntry.nomScientifique}</p>
                      </div>
                    )}

                    {isObjetEntry(selectedEntry) && selectedEntry.description && (
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Description</p>
                        <p className="text-white/90 text-sm">{selectedEntry.description}</p>
                      </div>
                    )}

                    {isLieuEntry(selectedEntry) && selectedEntry.localisation && (
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Localisation</p>
                        <p className="text-white/90 text-sm">{selectedEntry.localisation}</p>
                      </div>
                    )}

                    {(isRituelEntry(selectedEntry) || isChantEntry(selectedEntry)) && 'description' in selectedEntry && selectedEntry.description && (
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Description</p>
                        <p className="text-white/90 text-sm">{selectedEntry.description}</p>
                      </div>
                    )}

                    {isChantEntry(selectedEntry) && selectedEntry.rythme && (
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Rythme</p>
                        <p className="text-white/90 text-sm">{selectedEntry.rythme}</p>
                      </div>
                    )}

                    {isDateRituelleEntry(selectedEntry) && selectedEntry.datePeriod && (
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Période</p>
                        <p className="text-white/90 text-sm">{selectedEntry.datePeriod}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Bouton de fermeture */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-center"
              >
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-colors"
                  style={{
                    background: 'rgba(138,43,226,0.15)',
                    border: '1px solid rgba(138,43,226,0.3)',
                  }}
                >
                  Fermer
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
