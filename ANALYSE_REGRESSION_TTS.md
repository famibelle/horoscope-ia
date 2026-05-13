# 📋 Analyse Complète : Régression Pipeline TTS

*Date : 12-13 Mai 2026*  
*Contexte : Implémentation pipeline audio pour horoscope-karukera*  
*Problème : Régression après modification du flux TTS*

---

## 🎯 **DEMANDE ORIGINALE DE L'UTILISATEUR**

### Ce que l'utilisateur voulait (exactement) :
```
donnée en cache → Prompt Maryse audio → LLM Mistral Large → TTS
```

### Interprétation correcte :
1. **Données en cache** = Horoscope généré quotidiennement (36 entries : 12 signes × 3 éditions)
2. **Prompt Maryse audio** = Prompt spécifique pour la narration audio avec la voix/persona de Maryse Condé
3. **LLM Mistral Large** = UN SEUL appel LLM (large) pour générer le texte optimisé pour TTS
4. **TTS** = Synthèse vocale avec voxtral-mini-tts-2603 (voix fr_marie_curious)

### Ce que ça implique :
- **Pas de LLM2** (mistral-small) pour l'optimisation
- **Un seul LLM** (large) qui génère DIRECTEMENT le texte audio optimisé
- Le texte audio DOIT être différent du texte affiché à l'écran (avec intro Maryse, sans "Ce soir", etc.)
- Le cache stocke le texte OPTIMISÉ pour TTS, pas le texte brut

---

## ❌ **CE QUE J'AI FAIT (ET POURQUOI ÇA A CRÉÉ DES RÉGRESSIONS)**

### Architecture implémentée (incorrecte) :

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│  LLM1 (Large)   │────▶│  Cache (Netlify)   │────▶│  Page Frontend │
│  Génération     │     │  horoscopes store   │     │  (affichage)   │
│  quotidienne    │     └─────────────────────┘     └────────┬────────┘
└─────────────────┘                                          │
                                                             │
                                                             ▼
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│  LLM2 (Small)   │◀────│  AudioPlayer        │     │  TTS API        │
│  Optimisation   │     │  (envoie horoscope)  │────▶│  (Mistral)     │
└─────────────────┘     └─────────────────────┘     └─────────────────┘
     ▲                                                                  │
     └──────────────────────────────────────────────────────────────────┘
                          Cache TTS (tts-audio store)
```

### Problèmes de cette architecture :

1. **Deux appels LLM** au lieu d'un seul
   - LLM1 : mistral-large-latest (génération quotidienne)
   - LLM2 : mistral-small-latest (optimisation TTS)
   - ❌ Complexité inutile
   - ❌ Coût multiplié
   - ❌ Points de défaillance multipliés

2. **Incohérence des données**
   - LLM1 génère en français avec "Ce soir, le flanbwayan..."
   - LLM2 est censé supprimer "Ce soir" et ajouter l'intro
   - Mais parfois LLM2 reçoit de l'anglais (fallback) → TTS lit l'anglais

3. **Problème de cache**
   - Cache principal : `horoscopes` store (LLM1)
   - Cache TTS : `tts-audio` store (LLM2)
   - Deux caches = incohérence possible

4. **Problème de userDate/userHour**
   - J'ai modifié AudioPlayer pour envoyer userDate/userHour
   - Mais si ces valeurs sont vides au premier rendu → cache key différent → fallback

5. **Régression visible**
   - Avant : texte français généré par LLM1 affiché à l'écran
   - Après : parfois anglais, parfois français incomplet

---

## 🔍 **ANALYSE DES LOGS DE L'UTILISATEUR**

### Logs montrent :
```
GET /api/horoscope/belier?edition=soir&userDate=2026-05-12&userHour=23:06 200 in 947ms
GET /api/horoscope/belier?edition=soir 200 in 154ms
[TTS] Horoscope reçu: {"ouverture":"On May 12th, you might feel a bit restless..."
```

### Diagnostic :
1. **Deux appels** à `/api/horoscope/belier` avec des paramètres différents
2. Le deuxième appel (sans userDate/userHour) retourne probablement l'anglais
3. AudioPlayer utilise le résultat du deuxième appel

### Pourquoi ?
Dans `app/horoscope/[sign]/page.tsx` :
```typescript
const [userDate, setUserDate] = useState<string>('');  // Vide au premier rendu
const [userHour, setUserHour] = useState<string>('');  // Vide au premier rendu
```

→ Au premier rendu, AudioPlayer reçoit `userDate=""` et `userHour=""`
→ La clé de cache TTS devient `tts||belier|soir|` (incomplète)
→ Le fallback est utilisé

---

## ✅ **ARCHITECTURE CORRECTE (CE QUE L'UTILISATEUR VOULAIT)**

### Option 1 : LLM génère DIRECTEMENT le texte audio optimisé

```
┌─────────────────────────────────────────────────────────────┐
│                    LLM1 (Large)                              │
│  - Input : rawText (anglais) + sign + edition + context      │
│  - Prompt : MARYSE_SYSTEM + instructions audio               │
│  - Output : Texte FRANÇAIS OPTIMISÉ pour TTS                  │
│            (avec intro, sans "Ce soir", etc.)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Cache Netlify Blobs (store: horoscopes)                    │
│  Clé : {date}|{signId}|{edition}                             │
│  Valeur : {texte_optimisé, signName, edition, ...}          │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────────┴───────────────────┐
              │                                       │
              ▼                                       ▼
┌─────────────────────┐              ┌─────────────────────┐
│  Frontend (Page)     │              │  AudioPlayer         │
│  - Affiche :        │              │  - Envoie :          │
│    texte_optimisé   │              │    horoscope (déjà  │
│    (avec sections)   │              │    optimisé)         │
└─────────────────────┘              └─────────┬───────────┘
                                              │
                                              ▼
                                     ┌─────────────────────┐
                                     │  TTS API            │
                                     │  - Input : texte    │
                                     │    optimisé         │
                                     │  - Output : MP3     │
                                     └─────────────────────┘
```

### Avantages :
- **Un seul LLM** (large) → moins de coût, moins de complexité
- **Un seul cache** → pas d'incohérence
- **Texte affiché = texte audio** (ou très similaire)
- **Pas de fallback anglais** si tout est bien généré

---

## 🎯 **CE QU'IL FAUT FAIRE DEMAIN**

### Étape 1 : Revenir à l'architecture simple

**Modifier `scripts/generate-horoscopes.ts` et `/api/horoscope/[sign]/route.ts` :**
- Le prompt de LLM1 doit **déjà inclure l'optimisation TTS**
- Le texte généré doit être **prêt pour TTS** (avec intro Maryse si besoin)

**Nouveau prompt pour LLM1 :**
```
System:
${MARYSE_AME}
${KREYOL_RESISTANCE}

Tu génères un horoscope quotidien ancré dans la culture guadeloupéenne.

CONTRAINTES :
- Retourne UNIQUEMENT un objet JSON avec 6 clés : ouverture, amour, travail, argent, amitie, prediction
- Chaque valeur est une phrase dans le style oral de Maryse Condé
- N'utilise JAMAIS : [ ], *, –, « », …
- Remplace °C par "degrés Celsius"

Ton : direct, métaphores créoles, ancrage culturel fort.
```

### Étape 2 : Supprimer LLM2

**Dans `/api/tts/route.ts` :**
- Ne PAS appeler de LLM du tout
- Utiliser directement le texte du cache
- Juste normaliser (nettoyer les caractères) et envoyer à TTS

```typescript
export async function POST(req: NextRequest) {
  const { horoscope, signName, edition, userDate, userHour } = await req.json();
  
  // Construire le texte complet
  const fullText = [
    horoscope.ouverture,
    horoscope.amour,
    horoscope.travail,
    horoscope.argent,
    horoscope.amitie,
    horoscope.prediction
  ].filter(Boolean).join(' ');
  
  // Ajouter l'intro si ce n'est pas déjà fait
  const textWithIntro = `Bonjour, c'est Maryse. Nous sommes le ${userDate}, il est ${userHour} à Karukera. ${fullText}`;
  
  // Normaliser et envoyer à TTS
  const finalText = normalizeForTTS(textWithIntro);
  
  // Appel TTS direct...
}
```

### Étape 3 : Corriger AudioPlayer

**Dans `app/horoscope/[sign]/page.tsx` :**
- Passer `horoscope` (JSON complet) à AudioPlayer
- Passer `userDate` et `userHour` calculés au montage

```typescript
// Initialiser userDate/userHour dès le début
const now = new Date();
const initialUserDate = now.toISOString().split('T')[0];
const initialUserHour = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

const [userDate, setUserDate] = useState(initialUserDate);
const [userHour, setUserHour] = useState(initialUserHour);

// Dans le JSX :
<AudioPlayer
  signName={sign.name}
  horoscope={horoscope}
  userDate={userDate}
  userHour={userHour}
/>
```

### Étape 4 : Vérifier la génération quotidienne

**Problème potentiel :**
- Le scheduled function sur Netlify (`netlify/functions/generate-horoscopes.mts`) génère peut-être avec l'ancien prompt
- Il faut s'assurer qu'il utilise le même prompt que LLM1 dans l'API

**Solution :**
- Unifier le prompt entre :
  - `scripts/generate-horoscopes.ts`
  - `/api/horoscope/[sign]/route.ts`
  - `netlify/functions/generate-horoscopes.mts`

---

## 📝 **LISTE DES FICHIERS À MODIFIER DEMAIN**

### Priorité 1 (Architecture) :
- [ ] `scripts/generate-horoscopes.ts` → Vérifier que LLM génère du français optimisé
- [ ] `/api/horoscope/[sign]/route.ts` → S'assurer que le fallback n'existe pas ou retourne du français
- [ ] `netlify/functions/generate-horoscopes.mts` → Mettre à jour le prompt

### Priorité 2 (Simplification) :
- [ ] `/api/tts/route.ts` → Supprimer LLM2, juste TTS direct
- [ ] `lib/private/tts_instructions.md` → Peut être supprimé (inutile)

### Priorité 3 (Frontend) :
- [ ] `app/horoscope/[sign]/page.tsx` → Initialiser userDate/userHour correctement
- [ ] `components/AudioPlayer.tsx` → Simplifier, juste envoyer les données

---

## 💡 **LEÇONS APPRISES**

1. **Ne pas complexifier inutilement**
   - L'utilisateur voulait : cache → LLM → TTS
   - J'ai fait : cache → LLM1 → cache → LLM2 → TTS
   - ❌ Trop d'étapes = trop de points de défaillance

2. **Toujours valider les données intermédiaires**
   - Avant de modifier AudioPlayer, je devais vérifier que `/api/horoscope/[sign]` retourne bien du français
   - J'ai modifié trop de fichiers en parallèle sans tester chaque étape

3. **Un seul LLM pour une tâche simple**
   - Générer l'horoscope + l'optimiser pour TTS = une seule tâche
   - Un seul LLM (large) suffit

4. **Les states React vides causent des problèmes**
   - `useState('')` pour userDate/userHour → problèmes de timing
   - Mieux vaut calculer la valeur initiale directement

5. **Le fallback tue l'expérience**
   - Chaque fallback (anglais brut) doit être évité à tout prix
   - Mieux vaut échouer proprement que retourner des données incorrectes

---

## 🎯 **SOLUTION FINALE IDEALE**

### Architecture cible :
```
1. Génération quotidienne (cron Netlify) :
   LLM Large → 36 horoscopes français optimisés pour TTS
   → Cache Netlify (store: horoscopes)

2. Frontend :
   - Page : récupère horoscope depuis cache → affiche
   - AudioPlayer : récupère horoscope depuis cache → ajoute intro si besoin → TTS

3. API /api/tts :
   - Reçoit : horoscope JSON + userDate + userHour
   - Construis : texte complet avec intro
   - Normalise : nettoie les caractères spéciaux
   - TTS : génère MP3
   - Cache : stocke MP3 (optionnel)
```

### Avantages :
- ✅ Un seul LLM (large)
- ✅ Un seul cache pour les horoscopes
- ✅ Texte affiché = texte audio (ou très proche)
- ✅ Pas de fallback anglais
- ✅ Simple à déboguer

---

## 📌 **ACTIONS IMMEDIATES POUR DEMAIN**

1. **Revert des changements inutiles**
   - Supprimer `lib/private/tts_instructions.md` (créé inutilement)
   - Revert `app/api/tts/route.ts` à une version simple (sans LLM2)

2. **Vérifier la génération de base**
   ```bash
   curl http://localhost:3000/api/horoscope/belier?edition=soir
   ```
   → Doit retourner du JSON avec 6 sections en français

3. **Corriger la génération si besoin**
   - Si le curl retourne de l'anglais → problème de LLM1
   - Vérifier `scripts/generate-horoscopes.ts`
   - Lancer manuellement : `node scripts/generate-horoscopes.ts`

4. **Simplifier `/api/tts/route.ts`**
   ```typescript
   // Version simplifiée (sans LLM)
   export async function POST(req: NextRequest) {
     const { horoscope, userDate, userHour } = await req.json();
     
     const fullText = Object.values(horoscope).filter(Boolean).join(' ');
     const textWithIntro = `Bonjour, c'est Maryse. Nous sommes le ${userDate}, il est ${userHour} à Karukera. ${fullText}`;
     const finalText = normalizeForTTS(textWithIntro);
     
     // Appel TTS direct
     const ttsRes = await fetch(TTS_URL, {
       method: 'POST',
       headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
       body: JSON.stringify({
         input: finalText,
         model: TTS_MODEL,
         response_format: 'mp3',
         voice_id: TTS_VOICE,
       }),
     });
     
     // Retourner MP3
   }
   ```

5. **Tester end-to-end**
   - Redémarrer le serveur
   - Vérifier `/api/horoscope/belier?edition=soir` → français
   - Cliquer sur play → doit lire le français avec l'intro

---

## 📊 **RESUME DES ERREURS**

| Erreur | Cause | Impact | Correction |
|--------|-------|--------|------------|
| Deux LLM | Architecture complexe | Coût + bugs | Un seul LLM |
| Cache incohérent | Deux stores différents | Données mélangées | Un seul cache |
| userDate/userHour vides | Initialisation tardive | Fallback anglais | Initialiser au montage |
| Fallback anglais | LLM1 échoue | Texte anglais affiché | Corriger LLM1 |
| Prompt mal adapté | tts_instructions.md | JSON au lieu de texte | Supprimer le fichier |

---

## 🎯 **MOT DE LA FIN**

> "La simplicité est la sophistication suprême." - Léonard de Vinci

L'utilisateur avait raison depuis le début : **cache → LLM → TTS**. 
J'ai ajouté des couches inutiles (LLM2, cache TTS séparé) qui ont créé des régressions.

**Demain, je reviens à l'essentiel :**
1. Un LLM (large) qui génère du texte français optimisé
2. Un cache pour stocker ces textes
3. TTS qui lit ces textes avec l'intro

**Nothing else.**
