'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getAllRitualDates, type RitualDateInfo } from '@/lib/private/vaudou-calendar-utils';

// Noms des mois en français
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Famille colors
const FAMILLE_COLORS: Record<string, string> = {
  Rada: 'text-ancestral-gold',
  Petro: 'text-purple-400',
  Congo: 'text-green-400',
};

const FAMILLE_BG: Record<string, string> = {
  Rada: 'bg-ancestral-gold/10 border-ancestral-gold/20',
  Petro: 'bg-purple-400/10 border-purple-400/20',
  Congo: 'bg-green-400/10 border-green-400/20',
};

const SACRALITE_LEVELS: Record<string, { label: string; emoji: string }> = {
  SACRÉ: { label: 'Sacré', emoji: '⭐' },
  Emblématique: { label: 'Emblématique', emoji: '✨' },
  Culturel: { label: 'Culturel', emoji: '🎭' },
  Ambivalent: { label: 'Ambivalent', emoji: '⚖️' },
  Symbolique: { label: 'Symbolique', emoji: '📿' },
};

// Loa associé à chaque jour de la semaine (0 = dimanche)
const WEEKLY_LOAS: Record<number, { loa: string; emoji: string; color: string; description: string }> = {
  1: { loa: 'Ezili Freda', emoji: '💗', color: 'text-pink-300', description: 'Loa de l\'amour, de la beauté et de la féminité. Elle préside aux désirs du cœur.' },
  2: { loa: 'Ogou', emoji: '⚔️', color: 'text-red-400', description: 'Loa de la guerre, du feu et du travail. Il protège les guerriers et les travailleurs.' },
  3: { loa: 'Legba · Gede', emoji: '🔑', color: 'text-blue-300', description: 'Legba ouvre les chemins et les carrefours. Gede veille sur les esprits des morts.' },
  4: { loa: 'Agwe', emoji: '🌊', color: 'text-cyan-400', description: 'Maître de la mer et des eaux. Il protège les navigateurs et les pêcheurs de Karukera.' },
  5: { loa: 'Danbala · Ayida-Wedo', emoji: '🐍', color: 'text-green-300', description: 'Danbala, le grand serpent blanc, et Ayida-Wedo, l\'arc-en-ciel. Ils symbolisent la création et l\'harmonie.' },
  6: { loa: 'Baron Samedi · Gede', emoji: '💀', color: 'text-purple-400', description: 'Baron Samedi règne sur les morts et la résurrection. Gede est son compagnon facétieux.' },
  0: { loa: 'Bondye', emoji: '☀️', color: 'text-ancestral-gold', description: 'Le Dieu créateur suprême. Jour de recueillement, de prière et de connexion avec l\'Éternel.' },
};

export default function CalendrierVaudouPage() {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [ritualDates, setRitualDates] = useState<RitualDateInfo[]>([]);
  const [selectedDate, setSelectedDate] = useState<RitualDateInfo | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<{ day: number; month: number; year: number; dow: number } | null>(null);

  useEffect(() => {
    setRitualDates(getAllRitualDates());
  }, []);

  // Filtrer les dates par mois
  const currentMonthDates = ritualDates.filter(d => d.month === currentMonth + 1);

  // Grouper par jour
  const datesByDay: Record<number, RitualDateInfo[]> = {};
  currentMonthDates.forEach(date => {
    if (!datesByDay[date.day]) {
      datesByDay[date.day] = [];
    }
    datesByDay[date.day].push(date);
  });

  // Nombre de jours dans le mois
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Précédent / suivant
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // aujourd'hui
  const today = new Date();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const todayDay = today.getDate();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-ancestral-gold/70 text-xs uppercase tracking-[0.35em] mb-3"
          >
            Calendrier spirituel
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ancestral-cream mb-4"
          >
            Calendrier Vaudou Guadeloupéen
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg max-w-2xl mx-auto"
          >
            Découvrez les dates rituelles sacrées, les fêtes des loas et les périodes propices 
            aux cérémonies traditionnelles de Karukera.
          </motion.p>
          
          {/* Navigation mois */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-8"
          >
            <button
              onClick={goToPreviousMonth}
              className="p-2.5 rounded-xl hover:bg-white/5 transition-colors"
              aria-label="Mois précédent"
            >
              <ArrowLeft size={20} className="text-ancestral-cream" />
            </button>
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ancestral-gold">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2.5 rounded-xl hover:bg-white/5 transition-colors"
              aria-label="Mois suivant"
            >
              <ArrowRight size={20} className="text-ancestral-cream" />
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Calendrier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="px-4 pb-16 max-w-4xl mx-auto"
      >
        <div
          className="rounded-3xl p-6 sm:p-8"
          style={{
            background: 'rgba(245,245,220,0.03)',
            border: '1px solid rgba(139,69,19,0.2)',
          }}
        >
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-white/60 uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-2">
            {/* Jours vides avant le 1er */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Jours du mois */}
            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
              const day = dayIndex + 1;
              const dateObj = new Date(currentYear, currentMonth, day);
              const dow = dateObj.getDay();
              const weeklyLoa = WEEKLY_LOAS[dow];
              const isToday = isCurrentMonth && day === todayDay;
              const hasRitual = datesByDay[day];
              const ritualCount = hasRitual ? hasRitual.length : 0;

              return (
                <motion.button
                  key={day}
                  onClick={() => {
                    if (hasRitual) setSelectedDate(hasRitual[0]);
                    else setSelectedDayOfWeek({ day, month: currentMonth + 1, year: currentYear, dow });
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`aspect-square rounded-xl cursor-pointer transition-all duration-200 ${isToday ? 'ring-2 ring-ancestral-gold' : ''}`}
                  style={{
                    background: hasRitual
                      ? `linear-gradient(135deg, rgba(138,43,226,0.15), rgba(75,0,130,0.10))`
                      : 'rgba(245,245,220,0.04)',
                    border: hasRitual
                      ? '1px solid rgba(138,43,226,0.3)'
                      : '1px solid rgba(245,245,220,0.05)',
                  }}
                >
                  <div className="relative w-full h-full flex flex-col items-center justify-center gap-0.5">
                    <span className="text-sm font-medium text-white leading-none">{day}</span>
                    <span className="text-[10px] leading-none" title={weeklyLoa.loa}>{weeklyLoa.emoji}</span>
                    {hasRitual && (
                      <div className="absolute top-0.5 right-0.5">
                        <span className="text-[9px] text-ancestral-gold font-bold">
                          {ritualCount > 1 ? `+${ritualCount}` : SACRALITE_LEVELS[hasRitual[0].niveauSacralite]?.emoji}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Légende */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-ancestral-gold/30" />
              <span className="text-xs text-white/70">Date rituelle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400/30" />
              <span className="text-xs text-white/70">Multiple rituels</span>
            </div>
            <div className="w-full pt-3 border-t border-white/5 grid grid-cols-4 sm:grid-cols-7 gap-2">
              {Object.entries(WEEKLY_LOAS).sort(([a], [b]) => {
                const da = Number(a) === 0 ? 7 : Number(a);
                const db = Number(b) === 0 ? 7 : Number(b);
                return da - db;
              }).map(([dow, info]) => {
                const DAY_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
                return (
                  <div key={dow} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-white/40">{DAY_SHORT[Number(dow)]}</span>
                    <span className="text-base" title={info.loa}>{info.emoji}</span>
                    <span className={`text-[9px] text-center leading-tight ${info.color}`}>{info.loa.split(' · ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste des dates du mois */}
      {currentMonthDates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="px-4 pb-16 max-w-4xl mx-auto"
        >
          <div className="space-y-4">
            {currentMonthDates.map((ritualDate) => {
              const sacralite = SACRALITE_LEVELS[ritualDate.niveauSacralite];
              return (
                <motion.div
                  key={ritualDate.date}
                  whileHover={{ scale: 1.01 }}
                  className={`
                    rounded-2xl p-5 transition-colors
                    ${FAMILLE_BG[ritualDate.famille]}
                    border ${FAMILLE_COLORS[ritualDate.famille]}/30
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: `rgba(138,43,226,0.12)`,
                        border: `1px solid rgba(138,43,226,0.25)`,
                      }}
                    >
                      <span>{sacralite?.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <h3 className="font-display text-lg font-bold text-ancestral-cream">
                          {ritualDate.day} {MONTH_NAMES[ritualDate.month - 1]}
                        </h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FAMILLE_BG[ritualDate.famille]} ${FAMILLE_COLORS[ritualDate.famille]}`}>
                          {ritualDate.famille}
                        </span>
                        {ritualDate.niveauSacralite === 'SACRÉ' && (
                          <span className="text-xs text-ancestral-gold font-semibold">
                            {sacralite?.label}
                          </span>
                        )}
                      </div>
                      <h4 className="text-white font-medium mt-1">
                        {ritualDate.nomFrancais}
                        {ritualDate.nomCreole && (
                          <span className="text-white/70 ml-2">({ritualDate.nomCreole})</span>
                        )}
                      </h4>
                      <div className="text-white/80 text-sm mt-1 line-clamp-2">
                        <ReactMarkdown components={markdownComponents}>{ritualDate.theme}</ReactMarkdown>
                      </div>
                      <p className="text-white/60 text-xs mt-2">
                        Loa : {ritualDate.loa}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Modal loa du jour (jours sans fête) */}
      {selectedDayOfWeek && !selectedDate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDayOfWeek(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-3xl p-6 sm:p-8 max-w-md w-full"
            style={{
              background: 'linear-gradient(145deg, rgba(245,245,220,0.08) 0%, rgba(139,69,19,0.04) 100%)',
              border: '1px solid rgba(210,105,30,0.3)',
            }}
          >
            <button onClick={() => setSelectedDayOfWeek(null)} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">×</button>
            {(() => {
              const loa = WEEKLY_LOAS[selectedDayOfWeek.dow];
              const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
              return (
                <div className="text-center">
                  <div className="text-5xl mb-4">{loa.emoji}</div>
                  <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
                    {DAY_NAMES[selectedDayOfWeek.dow]} {selectedDayOfWeek.day} {MONTH_NAMES[selectedDayOfWeek.month - 1]}
                  </p>
                  <h3 className={`font-display text-2xl font-bold mb-4 ${loa.color}`}>{loa.loa}</h3>
                  <p className="text-white/75 text-sm leading-relaxed">{loa.description}</p>
                </div>
              );
            })()}
            <button
              onClick={() => setSelectedDayOfWeek(null)}
              className="mt-6 w-full py-3 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ background: 'rgba(210,105,30,0.15)', border: '1px solid rgba(210,105,30,0.3)' }}
            >
              Fermer
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Modal détail */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDate(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-3xl p-6 sm:p-8 max-w-md w-full"
            style={{
              background: 'linear-gradient(145deg, rgba(245,245,220,0.08) 0%, rgba(139,69,19,0.04) 100%)',
              border: '1px solid rgba(138,43,226,0.3)',
            }}
          >
            <button
              onClick={() => setSelectedDate(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              ×
            </button>
            
            <div className="text-center mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
                style={{
                  background: `linear-gradient(135deg, rgba(138,43,226,0.20), rgba(75,0,130,0.15))`,
                  border: `1px solid rgba(138,43,226,0.35)`,
                }}
              >
                <Sparkles size={32} className="text-purple-400" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display text-xl font-bold text-ancestral-gold"
              >
                {selectedDate.nomFrancais}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 text-sm mt-1"
              >
                {selectedDate.nomCreole}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-white/60 w-20">Date</span>
                <span className="text-white font-medium">
                  {selectedDate.day} {MONTH_NAMES[selectedDate.month - 1]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/60 w-20">Loa</span>
                <span className="text-white font-medium">{selectedDate.loa}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/60 w-20">Famille</span>
                <span className={`font-medium ${FAMILLE_COLORS[selectedDate.famille]}`}>
                  {selectedDate.famille}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/60 w-20">Niveau</span>
                <span className="text-ancestral-gold font-medium">
                  {SACRALITE_LEVELS[selectedDate.niveauSacralite]?.label}
                </span>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 mb-1">Thème</p>
                <div className="text-white text-base leading-relaxed">
                  <ReactMarkdown components={markdownComponents}>{selectedDate.dimensionCulturelle}</ReactMarkdown>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex gap-3"
            >
              <Link
                href={`/horoscope/${selectedDate.loa.toLowerCase() === 'legba' ? 'gemeaux' : 
                  selectedDate.loa.toLowerCase() === 'ogoun' ? 'belier' :
                  selectedDate.loa.toLowerCase() === 'ezili freda' ? 'lion' :
                  selectedDate.loa.toLowerCase() === 'damballa' ? 'cancer' :
                  selectedDate.loa.toLowerCase() === 'baron samedi' ? 'scorpion' :
                  'belier'}`}
                className="flex-1 text-center py-3 rounded-xl text-sm font-medium text-white transition-colors"
                style={{
                  background: 'rgba(210,105,30,0.15)',
                  border: '1px solid rgba(210,105,30,0.3)',
                }}
              >
                Voir lhoroscope
              </Link>
              <button
                onClick={() => setSelectedDate(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-colors"
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
    </main>
  );
}
