/**
 * Normalise le texte pour le TTS Mistral
 * Supprime les caractères non supportés et adapte les formats
 *
 * Contraintes TTS : seul autorisé = a-z, A-Z, à-ü, À-Ü, 0-9, ponctuation ( . , ! ? ; : ' " / \ ( ) ), espaces
 */
export function normalizeForTTS(text: string): string {
  return text
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
    // Conserver les sauts de ligne existants
    // Corriger les heures avec espace (ex: "15: 30" → "15:30")
    .replace(/(\d):\s*(\d)/g, '$1:$2')
    // Ajouter espace après ponctuation si manquant
    .replace(/([,.!?;])(\w)/g, '$1 $2')
    .trim();
}
