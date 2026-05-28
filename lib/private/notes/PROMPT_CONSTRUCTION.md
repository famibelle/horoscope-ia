# Architecture du Prompt pour l'Horoscope

Ce document détaille la construction du prompt envoyé à Mistral pour la génération des horoscopes. Il est divisé en deux parties : le **System Prompt** (persona) et le **User Prompt** (données dynamiques).

## 1. System Prompt (`MARYSE_SYSTEM`)
Le System Prompt définit l'identité de l'IA. Elle incarne **Maryse Condé**.

*   **Identité** : Écrivaine guadeloupéenne.
*   **Ton** : Littéraire, ancré dans la culture, le quotidien guadeloupéen, la mémoire de l'esclavage et la chaleur des Caraïbes.
*   **Style** : Oral direct, phrases percutantes, créolisation du français (mots créoles traduits entre parenthèses).
*   **Contraintes de format** :
    *   Interdiction des caractères spéciaux : tiret cadratin (—), point-virgule (;), deux-points (:).
    *   Usage exclusif : virgules, points, tirets simples (-), espaces.

## 2. User Prompt (`buildHoroscopeUserPrompt`)
Construit dynamiquement par le script `scripts/generate-horoscopes.ts` à chaque appel. Il agrège :

### A. Contexte Environnemental
*   **Date et Heure** : Basées sur `todayGuadeloupe()` (UTC-4).
*   **Météo** : Températures, précipitations et vent fournis par Open-Meteo pour Pointe-à-Pitre.

### B. Données Culturelles Injectées (Propriété Intellectuelle)
Le script enrichit le prompt avec des bases de données spécifiques :
1.  **Faune & Flore** : Sélectionnées via `getSignFaune` et `getSignFlore`.
2.  **Lieux sacrés** : Sélectionnés via `getSignLieu`.
3.  **Résistance (Kreyol)** : Symboles historiques et pratiques culturelles (via `getResistancePratique`, `getResistanceObjet`).
4.  **Histoire** : Résonance historique basée sur la période actuelle (via `getHistoricalResonance`).
5.  **Contexte Vaudou** : Injection du Loa principal, énergies, couleurs et rituels associés au signe (via `vaudou-mappings.ts`).

### C. Règles de Variété
Le prompt impose des règles strictes pour éviter les répétitions :
*   Symboles de Faune/Flore uniques par section.
*   Interdiction de répéter les symboles majeurs (Bœuf créole, Orchidée, Awokasié) plus d'une fois par horoscope.
*   Gestion dynamique des Loas selon l'édition (Nuit, Matin, Midi, Soir).

## 3. Flux de traitement actuel
1.  **Récupération** : Appel API météo + bases de données culturelles.
2.  **Construction** : Fusion des données dans le prompt utilisateur.
3.  **Appel Mistral** : `mistral-large-latest` avec température 0.75.
4.  **Réception** : Le texte est reçu en **brut** (texte complet).
5.  **Sauvegarde** : Le texte est enregistré tel quel dans le fichier JSON final sous la clé `horoscope`.
