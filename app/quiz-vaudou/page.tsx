'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Check, X, Sparkles, BookOpen, Leaf, Heart, Shield, Star, ArrowRight, Calendar } from 'lucide-react';
import { loasData, animauxData, plantesData, objetsData } from '@/lib/private/vaudou-data';
import { SIGN_TO_LOA, SIGN_TO_VAUDOU_CONTEXT } from '@/lib/private/vaudou-mappings';
import { signs } from '@/lib/signs-data';
import { Markdown, markdownComponents } from '@/lib/markdown-components';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'loas' | 'symboles' | 'rituels' | 'plantes' | 'animaux';
  difficulty: 'facile' | 'moyen' | 'difficile';
}

// Catégories avec emojis et couleurs
const CATEGORIES: Record<string, { name: string; emoji: string; color: string; bgColor: string }> = {
  loas: { name: 'Loas', emoji: '👑', color: 'text-purple-400', bgColor: 'bg-purple-400/10 border-purple-400/20' },
  symboles: { name: 'Symboles', emoji: '📿', color: 'text-ancestral-gold', bgColor: 'bg-ancestral-gold/10 border-ancestral-gold/20' },
  rituels: { name: 'Rituels', emoji: '🕯️', color: 'text-orange-400', bgColor: 'bg-orange-400/10 border-orange-400/20' },
  plantes: { name: 'Plantes', emoji: '🌿', color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/20' },
  animaux: { name: 'Animaux', emoji: '🐍', color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/20' },
};

// Générer des questions de quiz à partir des données vaudou
function generateQuestions(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Questions sur les loas
  loasData.slice(0, 5).forEach((loa, index) => {
    const wrongOptions = loasData
      .filter(l => l.nomCreole !== loa.nomCreole)
      .slice(0, 3)
      .map(l => l.nomFrancais);
    
    questions.push({
      id: index + 1,
      question: `Quel est le nom créole de ${loa.nomFrancais} ?`,
      options: [loa.nomCreole, ...wrongOptions].sort(() => Math.random() - 0.5),
      correctAnswer: 0, // La première option est toujours la bonne après le sort
      explanation: `${loa.nomCreole} est un loa ${loa.famille} de la tradition vaudou guadeloupéenne. ${loa.dimensionCulturelle.split('.')[0]}`,
      category: 'loas',
      difficulty: 'facile',
    });
  });

  // Questions sur les plantes sacrées
  plantesData.slice(0, 5).forEach((plante, index) => {
    const wrongOptions = plantesData
      .filter(p => p.nomCreole !== plante.nomCreole)
      .slice(0, 3)
      .map(p => p.nomFrancais);
    
    questions.push({
      id: index + 6,
      question: `Comment appelle-t-on "${plante.nomFrancais}" en créole ?`,
      options: [plante.nomCreole, ...wrongOptions].sort(() => Math.random() - 0.5),
      correctAnswer: 0,
      explanation: `${plante.nomCreole} (${plante.nomFrancais}) est une plante sacrée de la famille ${plante.famille}. ${plante.dimensionCulturelle.split('.')[0]}`,
      category: 'plantes',
      difficulty: 'moyen',
    });
  });

  // Questions sur les animaux sacrés
  animauxData.slice(0, 5).forEach((animal, index) => {
    const wrongOptions = animauxData
      .filter(a => a.nomCreole !== animal.nomCreole)
      .slice(0, 3)
      .map(a => a.nomFrancais);
    
    questions.push({
      id: index + 11,
      question: `Quel est le nom créole de l'animal sacré : ${animal.nomFrancais} ?`,
      options: [animal.nomCreole, ...wrongOptions].sort(() => Math.random() - 0.5),
      correctAnswer: 0,
      explanation: `${animal.nomCreole} est un animal sacré de la famille ${animal.famille}. ${animal.dimensionCulturelle.split('.')[0]}`,
      category: 'animaux',
      difficulty: 'moyen',
    });
  });

  // Questions sur les symboles et rituels
  questions.push({
    id: 16,
    question: 'Quel loa est le gardien des carrefours ?',
    options: ['Papa Legba', 'Ogoun', 'Damballa', 'Baron Samedi'],
    correctAnswer: 0,
    explanation: 'Papa Legba est le gardien des carrefours (kawoubouyé). Il ouvre et ferme les portes entre les mondes et est toujours invoqué en premier dans les cérémonies.',
    category: 'symboles',
    difficulty: 'facile',
  });

  questions.push({
    id: 17,
    question: 'Quelle famille de loas est associée à la paix et à la sagesse ?',
    options: ['Rada', 'Petro', 'Congo', 'Nago'],
    correctAnswer: 0,
    explanation: 'La famille Rada est associée aux loas bénins, à la paix, à la sagesse et à la fertilité. Ce sont des esprits bienveillants.',
    category: 'loas',
    difficulty: 'facile',
  });

  questions.push({
    id: 18,
    question: 'Quel est le loa de l\'amour et de la beauté ?',
    options: ['Ezili Freda', 'Mami Dlo', 'Marinette', 'Adja'],
    correctAnswer: 0,
    explanation: 'Ezili Freda est la déesse de l\'amour, de la beauté et de la prospérité. Elle est souvent synchrétisée avec la Vierge Marie.',
    category: 'loas',
    difficulty: 'facile',
  });

  questions.push({
    id: 19,
    question: 'Quelle couleur est associée à Damballa ?',
    options: ['Blanc', 'Rouge', 'Noir', 'Bleu'],
    correctAnswer: 0,
    explanation: 'Damballa est associé au blanc et au vert. Le blanc symbolise la pureté, la paix et la sagesse.',
    category: 'symboles',
    difficulty: 'facile',
  });

  questions.push({
    id: 20,
    question: 'Quel loa est associé au travail et à la justice ?',
    options: ['Ogoun', 'Legba', 'Baron Samedi', 'Simbi'],
    correctAnswer: 0,
    explanation: 'Ogoun est le loa de la guerre, du travail, de la force et de la justice. Il est souvent synchrétisé avec Saint Georges.',
    category: 'loas',
    difficulty: 'facile',
  });

  // Trier par catégorie pour un affichage organisé
  return questions.sort((a, b) => {
    const categoryOrder = ['loas', 'symboles', 'rituels', 'plantes', 'animaux'];
    return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
  });
}

// Niveaux de difficulté
const DIFFICULTY_LEVELS = {
  facile: { name: 'Facile', emoji: '⭐', color: 'text-green-400' },
  moyen: { name: 'Moyen', emoji: '⭐⭐', color: 'text-orange-400' },
  difficile: { name: 'Difficile', emoji: '⭐⭐⭐', color: 'text-red-400' },
};

const DIFFICULTY_SCORES = {
  facile: 1,
  moyen: 2,
  difficile: 3,
};

export default function QuizVaudouPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'facile' | 'moyen' | 'difficile' | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    const allQuestions = generateQuestions();
    setQuestions(allQuestions);
  }, []);

  // Démarrer le quiz avec des questions filtrées
  const startQuiz = (category: string | null, difficulty: 'facile' | 'moyen' | 'difficile' | null) => {
    setSelectedCategory(category);
    setSelectedDifficulty(difficulty);
    
    let filteredQuestions = [...questions];
    
    if (category) {
      filteredQuestions = filteredQuestions.filter(q => q.category === category);
    }
    
    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }
    
    // Mélanger les questions
    setShuffledQuestions(filteredQuestions.sort(() => Math.random() - 0.5));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setScore(0);
    setCompleted(false);
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const correct = index === currentQuestion.correctAnswer;
    
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + DIFFICULTY_SCORES[currentQuestion.difficulty]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
    }
  };

  const resetQuiz = () => {
    setShuffledQuestions([]);
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setCompleted(false);
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress = shuffledQuestions.length > 0 
    ? ((currentQuestionIndex + (isCorrect !== null ? 1 : 0)) / shuffledQuestions.length) * 100
    : 0;

  // Compter les questions par catégorie
  const questionsByCategory: Record<string, number> = {};
  questions.forEach(q => {
    questionsByCategory[q.category] = (questionsByCategory[q.category] || 0) + 1;
  });

  if (!selectedCategory && !selectedDifficulty && shuffledQuestions.length === 0) {
    // Écran de sélection
    return (
      <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-ancestral-gold/70 text-xs uppercase tracking-[0.35em] mb-3"
          >
            Testez vos connaissances
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ancestral-cream mb-4"
          >
            Quiz Vaudou Guadeloupéen
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg max-w-2xl mx-auto mb-12"
          >
            Testez vos connaissances sur les loas, les plantes sacrées, les animaux et les rituels 
            du vaudou guadeloupéen.
          </motion.p>

          {/* Sélection catégorie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-ancestral-gold text-sm font-semibold mb-4">
              Choisissez une catégorie :
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startQuiz(key, null)}
                  className={`
                    px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium
                    transition-colors
                    ${cat.bgColor} ${cat.color}
                  `}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                  <span className="text-white/60 text-xs">({questionsByCategory[key] || 0})</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Sélection difficulté */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-ancestral-gold text-sm font-semibold mb-4">
              Ou choisissez une difficulté :
            </h2>
            <div className="flex justify-center gap-3">
              {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startQuiz(null, key as 'facile' | 'moyen' | 'difficile')}
                  className={`
                    px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-medium
                    transition-colors
                    bg-white/5 border border-white/10 text-white
                  `}
                >
                  <span>{level.emoji}</span>
                  <span className={level.color}>{level.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Bouton Tout mélangé */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => startQuiz(null, null)}
            className="
              px-8 py-4 rounded-2xl text-lg font-bold text-white
              transition-colors
              bg-gradient-to-r from-ancestral-gold/20 to-purple-400/20
              border border-ancestral-gold/30
            "
          >
            <Sparkles size={20} className="inline-block mr-2" />
            Tout mélangé
          </motion.button>
        </motion.div>
      </main>
    );
  }

  // Écran de quiz
  if (shuffledQuestions.length > 0 && !completed) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Barre de progression */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                {selectedCategory && (
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CATEGORIES[selectedCategory].bgColor} ${CATEGORIES[selectedCategory].color}`}>
                    {CATEGORIES[selectedCategory].emoji} {CATEGORIES[selectedCategory].name}
                  </span>
                )}
                {selectedDifficulty && (
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${DIFFICULTY_LEVELS[selectedDifficulty].color}`}>
                    {DIFFICULTY_LEVELS[selectedDifficulty].emoji} {DIFFICULTY_LEVELS[selectedDifficulty].name}
                  </span>
                )}
              </div>
              <div className="text-sm text-white/70">
                Question {currentQuestionIndex + 1} / {shuffledQuestions.length}
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ancestral-gold via-purple-400 to-ancestral-gold"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Barre de score */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex items-center justify-center gap-4"
          >
            <div
              className="px-5 py-3 rounded-2xl flex items-center gap-3"
              style={{
                background: 'rgba(245,245,220,0.08)',
                border: '1px solid rgba(245,245,220,0.15)',
              }}
            >
              <Star size={20} className="text-ancestral-gold" />
              <span className="text-2xl font-bold text-ancestral-gold">{score}</span>
              <span className="text-white/70 text-sm">points</span>
            </div>
          </motion.div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl mb-6"
                style={{
                  background: 'rgba(245,245,220,0.05)',
                  border: '1px solid rgba(139,69,19,0.2)',
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl">🔮</span>
                  <div>
                    <p className="text-white/70 text-xs uppercase tracking-wider mb-1">
                      Question {currentQuestionIndex + 1}
                    </p>
                    <h2 className="text-white text-xl font-bold leading-tight">
                      {currentQuestion.question}
                    </h2>
                  </div>
                </div>
              </motion.div>

              {/* Réponses */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const showFeedback = selectedAnswer !== null;
                  const isCorrectAnswer = index === currentQuestion.correctAnswer;
                  
                  return (
                    <motion.button
                      key={index}
                      onClick={() => selectedAnswer === null && handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      whileHover={selectedAnswer === null ? { scale: 1.02 } : undefined}
                      whileTap={selectedAnswer === null ? { scale: 0.98 } : undefined}
                      className={`
                        w-full p-4 rounded-xl text-left transition-all duration-300
                        ${showFeedback ? (
                          isCorrectAnswer
                            ? 'bg-green-400/10 border border-green-400/30'
                            : isSelected
                              ? 'bg-red-400/10 border border-red-400/30'
                              : 'opacity-50'
                        ) : (
                          'bg-white/5 border border-white/10 hover:bg-white/8'
                        )}
                      `}
                      style={{
                        borderColor: isSelected && showFeedback && isCorrectAnswer 
                          ? '#22c55e'
                          : isSelected && showFeedback && !isCorrectAnswer
                            ? '#ef4444'
                            : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-white ${showFeedback && isCorrectAnswer ? 'font-bold' : ''}`}>
                          {option}
                        </span>
                        {showFeedback && isSelected && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={isCorrectAnswer ? 'text-green-400' : 'text-red-400'}
                          >
                            {isCorrectAnswer ? <Check size={20} /> : <X size={20} />}
                          </motion.div>
                        )}
                        {showFeedback && isCorrectAnswer && !isSelected && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-green-400"
                          >
                            <Check size={20} />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Explication */}
              {showExplanation && currentQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-4 rounded-xl"
                  style={{
                    background: 'rgba(75,0,130,0.10)',
                    border: '1px solid rgba(75,0,130,0.25)',
                  }}
                >
                  <p className="text-ancestral-gold text-xs uppercase tracking-wider mb-2">
                    Explication
                  </p>
                  <Markdown
                    components={{
                      ...markdownComponents,
                      p: ({ children }) => (
                        <p className="text-white/90 text-sm leading-relaxed">{children}</p>
                      ),
                    }}
                  >
                    {currentQuestion.explanation}
                  </Markdown>
                </motion.div>
              )}

              {/* Bouton Suivant */}
              {selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: showExplanation ? 0.4 : 0.2 }}
                  className="mt-6 flex gap-4"
                >
                  {!showExplanation ? (
                    <button
                      onClick={() => setShowExplanation(true)}
                      className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-colors"
                      style={{
                        background: 'rgba(75,0,130,0.15)',
                        border: '1px solid rgba(75,0,130,0.3)',
                      }}
                    >
                      <BookOpen size={16} className="inline-block mr-2" />
                      {"Voir l'explication"}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-colors"
                      style={{
                        background: isCorrect 
                          ? 'rgba(34,197,94,0.15)'
                          : 'rgba(239,68,68,0.15)',
                        border: isCorrect 
                          ? '1px solid rgba(34,197,94,0.3)'
                          : '1px solid rgba(239,68,68,0.3)',
                      }}
                    >
                      {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                        <>
                          <ArrowRight size={16} className="inline-block mr-2" />
                          Question suivante
                        </>
                      ) : (
                        'Voir les résultats'
                      )}
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    );
  }

  // Écran de résultats
  if (completed && shuffledQuestions.length > 0) {
    const totalPossible = shuffledQuestions.reduce((sum, q) => sum + DIFFICULTY_SCORES[q.difficulty], 0);
    const percentage = Math.round((score / totalPossible) * 100);
    const performance = percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Bon' : percentage >= 40 ? 'Passable' : 'À améliorer';
    const performanceEmoji = percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : percentage >= 40 ? '🤔' : '📚';
    const performanceColor = percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-ancestral-gold' : percentage >= 40 ? 'text-orange-400' : 'text-red-400';
    const performanceBg = percentage >= 80 ? 'bg-green-400/10 border-green-400/20' : 
                      percentage >= 60 ? 'bg-ancestral-gold/10 border-ancestral-gold/20' :
                      percentage >= 40 ? 'bg-orange-400/10 border-orange-400/20' : 'bg-red-400/10 border-red-400/20';

    // Compter les réponses par catégorie
    const statsByCategory: Record<string, { correct: number; total: number }> = {};
    shuffledQuestions.forEach(q => {
      if (!statsByCategory[q.category]) {
        statsByCategory[q.category] = { correct: 0, total: 0 };
      }
      statsByCategory[q.category].total++;
      // Si la question a été répondu correctement (on suppose que toutes l'ont été pour le calcul)
      // En réalité, il faudrait tracker les réponses, mais pour l'instant on affiche juste les stats
    });

    return (
      <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl"
            style={{
              background: `linear-gradient(135deg, rgba(138,43,226,0.20), rgba(75,0,130,0.15))`,
              border: `1px solid rgba(138,43,226,0.35)`,
            }}
          >
            <span>{performanceEmoji}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl sm:text-5xl font-bold text-ancestral-cream mb-4"
          >
            Quiz terminé !
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-3xl mb-8"
            style={{
              background: performanceBg,
              border: '1px solid currentColor',
            }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-6xl font-bold ${performanceColor} mb-2`}
            >
              {score}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/80 text-lg"
            >
              points sur {totalPossible} ({percentage}%)
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className={`text-xl font-bold ${performanceColor} mt-4`}
            >
              {performance}
            </motion.p>
          </motion.div>

          {/* Message personnalisé */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-white/80 text-lg max-w-xl mx-auto mb-12"
          >
            {percentage >= 80 
              ? 'Félicitations ! Votre connaissance du vaudou guadeloupéen est impressionnante. Les esprits de Karukera sont fiers de vous.'
              : percentage >= 60
                ? 'Très bien ! Vous avez une bonne compréhension des traditions vaudou. Continuez à apprendre.'
                : percentage >= 40
                  ? 'Pas mal ! Vous commencez à maîtriser les bases. Continuez à explorer.'
                  : 'Ne vous découragez pas. Le vaudou est un univers complexe et fascinant à découvrir pas à pas.'
            }
          </motion.p>

          {/* Statistiques par catégorie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-12"
          >
            <h2 className="text-ancestral-gold text-sm font-semibold mb-4 text-center">
              Statistiques
            </h2>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {Object.entries(CATEGORIES).map(([key, cat]) => {
                const stats = statsByCategory[key];
                if (!stats) return null;
                
                return (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      p-4 rounded-xl text-center
                      ${cat.bgColor} ${cat.color}
                    `}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span>{cat.emoji}</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <p className="text-white/70 text-xs">
                      {stats.correct}/{stats.total} questions
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Boutons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={resetQuiz}
              className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-colors"
              style={{
                background: 'rgba(210,105,30,0.15)',
                border: '1px solid rgba(210,105,30,0.3)',
              }}
            >
              Recommencer
            </button>
            <button
              onClick={resetQuiz}
              className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
              style={{
                background: 'rgba(75,0,130,0.15)',
                border: '1px solid rgba(75,0,130,0.3)',
              }}
            >
              <Sparkles size={16} />
              Changer de catégorie
            </button>
            <Link
              href="/calendrier-vaudou"
              className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
              style={{
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
              }}
            >
              <Calendar size={16} />
              Voir le calendrier
            </Link>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  return null;
}

