/**
 * Normalise le texte pour le TTS Mistral
 * Supprime les caractères non supportés et adapte les formats
 *
 * Contraintes TTS : seul autorisé = a-z, A-Z, à-ü, À-Ü, 0-9, ponctuation ( . , ! ? ; : ' " / \ ( ) ), espaces
 */

// Prononciations créoles et guadeloupéennes (forme écrite → forme orale pour Voxtral)
// Portées depuis FlashInfoKarukera/data/tts_normalize.py
const PRONONCIATIONS_LOCALES: Record<string, string> = {
  // Vocabulaire créole courant dans les horoscopes
  "Lyannaj":          "Lyanhnage",
  "lyannaj":          "Lyanhnage",
  "Gwoka":            "GroKa",
  "gwoka":            "GroKa",
  "manman dlo":       "maman dlo",
  "Piman Bouk":       "piment bouc",
  "bondamanjak":      "bonda ment jacques",
  "wasou":            "ouassou",
  "soukouyan":        "soukougnan",
  "mwen":             "moins",
  "punch":            "ponche",
  "Goyave":           "Gwayave",
  "Pélikan":          "Pélican",
  "awokasié":         "avokassié",
  "palétuwyé":        "palétuvier",

  // Lieux guadeloupéens
  "Vieux-Habitants":  "Vieux Zabitan",
  "Vieux Habitants":  "Vieux Zabitan",
  "Raizet":           "Rézé",

  // Figures historiques
  "Delgrès":          "Delgrèsse",
  "Henri IV":         "Henri Quatre",
  "Henri 4":          "Henri Quatre",

  // Code départemental
  "971":              "quatre-vingt-dix-sept-un",

  // Genres musicaux guadeloupéens
  "Biguine":          "Bi-guine",
  "biguine":          "Bi-guine",
  "Kadans":           "Ka-dan",
  "kadans":           "Ka-dan",
  "Compas":           "Kom-pa",
  "compas":           "Kom-pa",
  "Soca":             "So-ka",
  "soca":             "So-ka",

  // Artistes
  "Kassav'":          "Kassav",
};

function applyPrononciations(text: string): string {
  // Trier par longueur décroissante pour éviter les substitutions partielles
  const entries = Object.entries(PRONONCIATIONS_LOCALES).sort(
    ([a], [b]) => b.length - a.length,
  );
  for (const [from, to] of entries) {
    text = text.replaceAll(from, to);
  }
  return text;
}

export function normalizeForTTS(text: string): string {
  return applyPrononciations(text)
    // Remplacer les tirets longs et moyens par des virgules
    .replace(/[–—]/g, ', ')
    // Supprimer les guillemets français
    .replace(/[«»]/g, '')
    // Normaliser les degrés
    .replace(/°C/g, ' degrés Celsius')
    .replace(/°F/g, ' degrés Fahrenheit')
    // Supprimer les astérisques et crochets (interdits par TTS)
    .replace(/[*["`]/g, '')
    .replace(/[\]`]/g, '')
    // Remplacer les points de suspension par des points
    .replace(/…/g, '.')
    // Corriger les heures avec espace (ex: "15: 30" → "15:30")
    .replace(/(\d):\s*(\d)/g, '$1:$2')
    // Ajouter espace après ponctuation si manquant
    .replace(/([,.!?;])(\w)/g, '$1 $2')
    .trim();
}
