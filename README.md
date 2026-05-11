# Horoscope Karukera — Votre énergie cosmique personnalisée

> **🌙 Un site d'astrologie guadeloupéenne propulsé par l'IA Maryse CondAI**

[![Next.js](https://img.shields.io/badge/Next.js-15.0.0-000000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Mistral AI](https://img.shields.io/badge/Mistral%20AI-Large-7A3AED?logo=mistralai)](https://mistral.ai/)
[![Netlify](https://img.shields.io/badge/Netlify-%23000000.svg?logo=netlify&logoColor=#00C7B7)](https://www.netlify.com/)
[![License](https://img.shields.io/badge/License-Private-red)](https://github.com/)

---

## 📌 Sommaire

- [🎯 À propos du projet](#-à-propos-du-projet)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture Technique](#️-architecture-technique)
- [📁 Structure du projet](#-structure-du-projet)
- [🔧 Configuration](#-configuration)
- [🚀 Déploiement](#-déploiement)
- [🎨 Design System](#-design-system)
- [🤖 Maryse CondAI - Persona IA](#-maryse-condai---persona-ia)
- [🌙 Système d'Horoscope](#-système-dhoroscope)
- [📰 Articles & Contenu](#-articles--contenu)
- [🎵 Fonctionnalités Audio](#-fonctionnalités-audio)
- [💰 Monétisation](#-monétisation)
- [📊 API Endpoints](#-api-endpoints)
- [🔐 Variables d'Environnement](#-variables-denvironnement)
- [📝 Scripts disponibles](#-scripts-disponibles)
- [🤝 Contribuer](#-contribuer)
- [📜 Licence](#-licence)

---

## 🎯 À propos du projet

**Horoscope Karukera** est une plateforme d'astrologie unique qui fusionne la sagesse ancestrale guadeloupéenne (Karukera) avec l'intelligence artificielle moderne. Le site propose des horoscopes quotidiens personnalisés, rédigés dans la voix de **Maryse Condé** (romancière guadeloupéenne, prix Nobel alternatif de littérature 2018), et ancrés dans la culture créole.

### 🎨 Concept Clé

- **Ancrage culturel** : Chaque prédiction intègre des éléments spécifiques à la Guadeloupe (lieux, plantes, animaux, traditions)
- **Voix authentique** : Maryse CondAI parle avec le rythme, les expressions et la profondeur de la romancière
- **Approche holistique** : Combinaison d'astrologie occidentale, de symboles créoles et de météo locale
- **Expérience immersive** : Horoscopes textuels + audio + visuels cosmiques

### 🌍 Public Cible

- Communauté guadeloupéenne et antillaise
- Amateurs d'astrologie à la recherche d'une approche culturelle unique
- Passionnés de culture caribéenne et de spiritualité
- Utilisateurs cherchant une alternative aux horoscopes génériques

---

## ✨ Fonctionnalités

### 🔮 Horoscope Quotidien

| Fonctionnalité | Description |
|---------------|-------------|
| **12 Signes Zodiacaux** | Bélier → Poissons avec correspondances créoles |
| **3 Éditions/Jour** | Matin (🌅), Midi (☀️), Soir (🌙) |
| **6 Catégories** | Ouverture, Amour, Travail, Argent, Amitié, Prédiction |
| **Ambiance Astrale** | Scores, compatibilité, conseil lunaire |
| **Météo Intégrée** | Prévisions pour Pointe-à-Pitre |
| **Cache Netlify Blobs** | Optimisation des performances |

### 🌿 Signe du Jour

- **Flore ou Faune** : Alternance quotidienne entre plantes et animaux de la Caraïbe
- **Sélection intelligente** : Basée sur la météo et l'édition du jour
- **Phrase générée** : Conseils ancrés dans la tradition créole

### 🎧 Expérience Audio

- **Text-to-Speech** : Narration IA avec Mistral Voxtral (voix française Marie)
- **Lecture complète** : Horoscope entier lu avec intonation naturelle
- **Animation visuelle** : Visualiseur audio personnalisé

### 📰 Articles de Fond

- **6 Articles thématiques** : Lune, Quimbois, Soufrière, Signes d'eau, Vénus, Mercure
- **Génération mensuelle** : Contenu frais via GitHub Actions
- **Style Maryse Condé** : Écriture littéraire et culturelle

### 💫 Fonctionnalités UI/UX

- **Design Cosmique** : Fond étoilé, gradients, animations fluides
- **Sélection interactive** : 12 signes avec animations Framer Motion
- **Aperçus rapides** : Prévisualisation des horoscopes tous signes
- **Partage social** : WhatsApp, Facebook, Twitter, Instagram
- **Responsive** : Adapté mobile et desktop

---

## 🏗️ Architecture Technique

```
Horoscope Karukera (Next.js 15)
├── Frontend
│   ├── React 19 + TypeScript
│   ├── Tailwind CSS 3.4
│   ├── Framer Motion (animations)
│   ├── Lucide React (icônes)
│   └── Google Fonts (Inter, Playfair Display)
│
├── Backend (API Routes)
│   ├── Next.js API Routes
│   ├── Netlify Blobs (cache)
│   └── Netlify Functions
│
├── IA & Services Externes
│   ├── Mistral AI (horoscopes, TTS)
│   ├── Open-Meteo (météo Guadeloupe)
│   └── FreeHoroscopeAPI (source brute)
│
├── Hébergement
│   ├── Netlify (production)
│   └── GitHub Pages (optionnel)
│
└── Monétisation
    └── Google AdSense
```

### 📊 Stack Technique Complète

| Catégorie | Technologie | Version |
|----------|-------------|---------|
| Framework | Next.js | 15.0.0 |
| Langage | TypeScript | 5.x |
| React | React + React DOM | 19.0.0 |
| Styling | Tailwind CSS | 3.4.0 |
| Animations | Framer Motion | 11.0.0 |
| Icônes | Lucide React | 0.400.0 |
| Build | @netlify/plugin-nextjs | 5.15.11 |
| Stockage | @netlify/blobs | 10.7.4 |
| Package Manager | npm | - |

---

## 📁 Structure du projet

```
horoscope-ia/
├── app/                          # Application Next.js (App Router)
│   ├── api/                      # API Routes
│   │   ├── ambiance/[sign]/      # Ambiance astrale
│   │   ├── horoscope/[sign]/    # Horoscope complet
│   │   ├── horoscopes-preview/   # Aperçus tous signes
│   │   ├── signe-du-jour/        # Signe du jour (flore/faune)
│   │   ├── tts/                  # Text-to-Speech
│   │   └── weather/              # Météo locale
│   │
│   ├── articles/[slug]/          # Pages articles
│   ├── horoscope/[sign]/        # Page horoscope par signe
│   ├── globals.css               # Styles globaux
│   ├── layout.tsx                # Layout racine
│   └── page.tsx                 # Page d'accueil
│
├── components/                   # Composants React
│   ├── AdSpace.tsx               # Espaces publicitaires
│   ├── Articles.tsx              # Grille d'articles
│   ├── AudioPlayer.tsx           # Lecteur audio
│   ├── EnergyBanner.tsx          # Bannière énergies du jour
│   ├── Footer.tsx                # Pied de page
│   ├── Hero.tsx                  # Hero section
│   ├── HoroscopeCard.tsx        # Carte horoscope
│   ├── HoroscopesPreview.tsx     # Aperçus horoscopes
│   ├── InteractiveHoroscope.tsx # Horoscope interactif
│   ├── ShareButtons.tsx          # Boutons de partage
│   ├── SignSelector.tsx          # Sélecteur de signes
│   └── StarField.tsx             # Fond étoilé animé
│
├── lib/                         # Bibliothèques & Données
│   ├── articles-content.json    # Contenu des articles (généré)
│   ├── articles-data.ts         # Métadonnées articles
│   ├── edition.ts                # Gestion des éditions
│   ├── horoscope-data.ts        # Types horoscope
│   └── signs-data.ts             # Données des 12 signes
│
├── private/                     # 🔒 PRIVÉ - Non versionné
│   ├── maryse-prompt.ts          # Prompts IA
│   ├── signe-du-jour-data.json  # Données signe du jour
│   └── generate-articles.ts      # Script génération articles
│
├── public/                      # Assets statiques
├── styles/                      # Styles additionnels
├── .env.local.example           # Exemple variables d'environnement
├── .gitignore
├── .gitmodules
├── next.config.ts
├── netlify.toml
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔧 Configuration

### Prérequis

- Node.js 20+ (recommandé)
- npm 10+
- Git
- Compte Mistral AI (pour la clé API)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/FlashInfoKarukera/horoscope-ia.git
cd horoscope-ia

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.local.example .env.local

# Configurer les variables dans .env.local
MISTRAL_API_KEY=votre_clé_mistral
```

### Configuration .env.local

```env
# Clé API Mistral — obligatoire pour la génération IA
# Obtenez une clé sur https://console.mistral.ai/
MISTRAL_API_KEY=votre_clé_mistral_ici
```

### Lancer le projet

```bash
# Développement local
npm run dev

# Build production
npm run build

# Lancer en production
npm run start

# Linting
npm run lint
```

Le site sera disponible sur [http://localhost:3000](http://localhost:3000)

---

## 🚀 Déploiement

### Avec Netlify (Recommandé)

1. **Créer un compte Netlify** et un nouveau site
2. **Connecter le dépôt GitHub** `FlashInfoKarukera/horoscope-ia`
3. **Configurer les variables d'environnement** :
   - `MISTRAL_API_KEY` : Votre clé Mistral AI
4. **Configurer le build** :
   - Build command: `npm run build`
   - Publish directory: `.next`
5. **Ajouter le plugin Next.js** : `@netlify/plugin-nextjs`

### Configuration Netlify (netlify.toml)

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
```

### Avec GitHub Pages

⚠️ **Note** : GitHub Pages supporte les sites statiques uniquement. Pour utiliser Next.js avec GitHub Pages, un build statique est nécessaire.

```bash
# Build statique
npm run build
npm run export

# Déployer sur gh-pages
git add out/
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### AdSense sur GitHub Pages

✅ **Oui, GitHub Pages supporte Google AdSense**

- Aucune restriction technique de GitHub
- Respectez les [politiques AdSense](https://support.google.com/adsense)
- Ajoutez le script dans `app/layout.tsx` (déjà intégré)

---

## 🎨 Design System

### Palette de Couleurs

| Nom | Code | Usage |
|-----|------|-------|
| Cosmic | `#020617` | Fond principal |
| Violet Primary | `#7c3aed` | Accent principal |
| Blue Accent | `#3b82f6` | Accent secondaire |
| Rose | `#f43f5e` | Amour |
| Emerald | `#10b981` | Amitié |
| Amber | `#f59e0b` | Argent |
| Purple | `#8b5cf6` | Présage |

### Typographie

| Type |Police | Usage |
|------|-------|-------|
| Display | Playfair Display | Titres, héros |
| Body | Inter | Texte, UI |

### Composants UI

- **Cartes** : Fond semi-transparent, bordure subtile, effet glass
- **Boutons** : Gradients, animations au survol
- **Animations** : Framer Motion pour transitions fluides
- **Effets** : Glow, shimmer, pulse

---

## 🤖 Maryse CondAI - Persona IA

### 📝 Persona

Maryse Condé est une romancière guadeloupéenne, prix Nobel alternatif de littérature 2018. Sa voix est :

- **Libre et sans concession**
- **Ancrée dans la culture guadeloupéenne** (mots créoles, références locales)
- **Rythme oral** : Phrases courtes qui claquent
- **Images concrètes** : Flamboyant, Soufrière, mangrove, alizés
- **Respect des auditeurs** : Pas de condescendance, ton direct

### 🎯 Principes de Rédaction

1. **Ancrée Karukera** : Toujours faire référence à la Guadeloupe
2. **Langue riche** : Français + mots créoles bien placés
3. **Rythme oral** : Écrit pour être entendu, pas seulement lu
4. **Images fortes** : Utiliser la nature, les traditions, les lieux
5. **Sans markdown** : Texte brut dans les réponses JSON

### 📁 Fichiers de Configuration

- `private/maryse-prompt.ts` : Prompts système et utilisateur
- `private/generate-articles.ts` : Script de génération de contenu

---

## 🌙 Système d'Horoscope

### Données des Signes

Chaque signe (`lib/signs-data.ts`) contient :

```typescript
{
  id: 'belier',
  name: 'Bélier',
  emoji: '♈',
  tagline: 'courage & pionnière',
  dateRange: '21 mars – 19 avril',
  element: 'Feu',
  planet: 'Mars',
  gradientFrom: '#ef4444',
  gradientTo: '#f97316',
  glowColor: 'rgba(239, 68, 68, 0.4)',
  animal: 'Iguane / Gwo Zandoli',
  nomKreyol: 'Gwo Zandoli',
  plante: 'Flamboyant',
  arbre: 'Flanbwayan',
  lieu: 'Pointe des Châteaux',
  spirituel: 'Animal totem des Arawaks...'
}
```

### Correspondances Créoles

| Signe | Animal | Nom Créole | Plante | Arbre | Lieu |
|-------|--------|------------|--------|-------|------|
| Bélier | Iguane | Gwo Zandoli | Flamboyant | Flanbwayan | Pointe des Châteaux |
| Taureau | Bœuf créole | Bèf a Bos | Orchidée | Avocatier | Sainte-Anne |
| Gémeaux | Colibri | Foufou | Alpinia | Gommier | Jardin botanique |
| Cancer | Crabe rouge | Touloulou | Dachine | Palétuvier | Grand Cul-de-Sac |
| Lion | Pélican | Gran Pélikan | Strelitzia | Flanbwayan | Grande Vigie |
| Vierge | Mangouste | Mango blan | Panache | Manguié | Chutes du Carbet |
| Balance | Lamantin | Manman dlo | Hibiscus | Amandier | Rivière Salée |
| Scorpion | Scarabée Hercule | Hèrkil | Aloès | Calebassier | La Soufrière |
| Sagittaire | Crevette | Wasou | Maracudja | Gommier | Forêt de Basse-Terre |
| Capricorne | Cabri | Kabrit | Chadon béni | Thym créole | Matouba |
| Verseau | Lambi (Conque) | Lambi | Citronnelle | Cocotier | Pointe Allègre |
| Poissons | Tortue | Karet | Corossol | Palétuvier | Plages du nord |

### Génération des Horoscopes

1. **Récupération source** : FreeHoroscopeAPI (anglais)
2. **Traduction/Adaptation** : Mistral Large avec persona Maryse Condé
3. **Enrichissement** : Intégration météo, lieu, symbole du signe
4. **Cache** : Stockage dans Netlify Blobs (24h)

### Format de Réponse

```typescript
{
  ouverture: "Image caribéenne qui pose le ton...",
  amour: "Ce que le signe dit sur les relations...",
  travail: "Ce que le signe dit sur l'action...",
  argent: "Conseils financiers ancrés localement...",
  amitie: "Lien social et solidarité...",
  prediction: "Tendance pour les jours à venir...",
  signFr: "Bélier",
  weather: "24–30°C, légère pluie, vent modéré (25 km/h)",
  edition: "matin",
  teaser: "Accroche courte pour l'aperçu",
  source: "mistral"
}
```

---

## 📰 Articles & Contenu

### Articles Disponibles

| Slug | Titre | Thème | Durée |
|------|-------|-------|--------|
| lune-et-peche | La lune et les pêcheurs de Karukera | Lune | 5 min |
| quimbois-et-planetes | Quimbois et planètes — un savoir parallèle | Spirituel | 6 min |
| soufriere-et-saturne | La Soufrière, Saturne et l'art d'attendre | Planètes | 5 min |
| signes-eau-mangrove | Les signes d'eau et la mangrove guadeloupéenne | Éléments | 5 min |
| venus-en-caraibe | Vénus en Caraïbe — amour, corps, liberté | Amour | 6 min |
| mercure-et-creole | Mercure et la langue créole — parler pour guérer | Langage | 6 min |

### Structure d'un Article

```typescript
{
  introduction: "Accroche forte, 2-3 phrases...",
  sections: [
    { titre: "Section 1", corps: "120-180 mots..." },
    { titre: "Section 2", corps: "120-180 mots..." }
  ],
  conclusion: "Phrase qui reste...",
  generatedAt: "2026-05-10"
}
```

### Régénération Automatique

Les articles sont régénérés **le 1er de chaque mois à minuit (heure Guadeloupe)** via GitHub Actions.

```yaml
# .github/workflows/regenerate-articles.yml
on:
  schedule:
    - cron: '0 4 1 * *'  # 1er du mois à 4h UTC = minuit Guadeloupe
  workflow_dispatch:       # Déclenchement manuel
```

---

## 🎵 Fonctionnalités Audio

### Text-to-Speech

- **Service** : Mistral AI Voxtral Mini TTS
- **Modèle** : `voxtral-mini-tts-2603`
- **Voix** : `fr_marie_curious` (voix féminine française)
- **Format** : MP3

### Lecteur Audio

Fonctionnalités :
- Génération à la demande
- Messages de chargement animés (15 messages différents)
- Visualiseur audio (barres animées)
- Contrôles : Play/Pause
- Barre de progression
- Formatage du temps (MM:SS)

---

## 💰 Monétisation

### Google AdSense

✅ **Intégration déjà en place**

- Script chargé dans `app/layout.tsx`
- Espaces réservés : `AdSpace` component (banner + square)
- ID client : `ca-pub-3159683365493434`

### Formats Publicitaires

| Format | Taille | Emplacement |
|--------|--------|-------------|
| Banner | 728×90 / 320×50 mobile | Entre Hero et Horoscopes |
| Square | 300×250 | Après Energy Banner |

### Compatibilité GitHub Pages

✅ **Oui, GitHub Pages supporte AdSense**
- Pas de restriction technique
- Respect des politiques Google nécessaires
- Intégration standard via script JavaScript

---

## 📊 API Endpoints

### GET /api/horoscope/:sign

Récupère l'horoscope pour un signe spécifique.

**Paramètres** :
- `sign` (path) : ID du signe (belier, taureau, etc.)
- `edition` (query) : matin/midi/soir (optionnel, défaut: auto)

**Réponse** : `HoroscopeResponse`

### GET /api/horoscopes-preview

Récupère les aperçus des horoscopes pour tous les signes.

**Paramètres** :
- `edition` (query) : matin/midi/soir (optionnel)

**Réponse** : `Array<SignPreview>`

### GET /api/ambiance/:sign

Récupère l'ambiance astrale pour un signe.

**Paramètres** :
- `sign` (path) : ID du signe
- `edition` (query) : matin/midi/soir (optionnel)

**Réponse** :
```typescript
{
  ambiance: string,
  scores: { amour: number, travail: number, bienetre: number, vieSociale: number, finances: number },
  chiffrePorteBonheur: number,
  compatibilite: string[],
  lune: { bienetre: string, beaute: string, esprit: string, maison: string, jardinage: string }
}
```

### GET /api/signe-du-jour

Récupère le signe du jour (flore ou faune).

**Réponse** :
```typescript
{
  type: 'flore' | 'faune',
  nomCreole: string,
  nomCommun: string,
  phrase: string,
  edition: Edition
}
```

### GET /api/weather

Récupère la météo pour Pointe-à-Pitre.

**Réponse** : `WeatherData`

### POST /api/tts

Génère un audio à partir de texte.

**Body** :
```json
{
  "text": "Texte à lire"
}
```

**Réponse** : Audio MP3 (binary)

---

## 🔐 Variables d'Environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `MISTRAL_API_KEY` | ✅ Oui | Clé API Mistral AI |
| `MISTRAL_API_KEY_BOTIRAN` | ❌ Non | Clé alternative |

### Clés Présentes dans .env (PRIVÉ - NE PAS COMMITTER)

```env
# Mistral AI
MISTRAL_API_KEY=VOTRE_CLE_ICI
MISTRAL_API_KEY_BOTIRAN=VOTRE_CLE_ICI

# Telegram
TELEGRAM_BOT_TOKEN=VOTRE_CLE_ICI
TELEGRAM_CHAT_ID=8603305182

# Buzzsprout (Podcast)
BUZZSPROUT_API_TOKEN=VOTRE_CLE_ICI
BUZZSPROUT_PODCAST_ID=2611321

# Twitter/X
X_API_KEY=VOTRE_CLE_ICI
X_API_SECRET=VOTRE_CLE_ICI
X_ACCESS_TOKEN=VOTRE_CLE_ICI
X_ACCESS_TOKEN_SECRET=VOTRE_CLE_ICI

# YouTube
YOUTUBE_CLIENT_ID=VOTRE_CLE_ICI
YOUTUBE_CLIENT_SECRET=VOTRE_CLE_ICI
YOUTUBE_REFRESH_TOKEN=VOTRE_CLE_ICI

# OpenAI
OPENAI_API_KEY=VOTRE_CLE_ICI

# Backblaze B2
B2_KEY_ID=VOTRE_CLE_ICI
B2_APPLICATION_KEY=VOTRE_CLE_ICI
B2_BUCKET_NAME=botiran-news
B2_ENDPOINT=https://s3.eu-central-003.backblazeb2.com

# Archive.org
ARCHIVE_ACCESS_KEY=VOTRE_CLE_ICI
ARCHIVE_SECRET_KEY=VOTRE_CLE_ICI

# Spotify
SPOTIPY_CLIENT_ID=VOTRE_CLE_ICI
SPOTIPY_CLIENT_SECRET=VOTRE_CLE_ICI
SPOTIFY_PLAYLIST_ID=06vOuArUZbjoGMpbS52sHP

# ElevenLabs
ELEVENLABS_API_KEY=VOTRE_CLE_ICI

# GitHub
GH_TOKEN=VOTRE_CLE_ICI
```

---

## 📝 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer le serveur de développement |
| `npm run build` | Build pour la production |
| `npm run start` | Lancer le serveur production |
| `npm run lint` | Exécuter le linter |
| `npx tsx private/generate-articles.ts` | Générer les articles (nécessite MISTRAL_API_KEY) |

### Génération des Articles

```bash
# Prérequis : MISTRAL_API_KEY configuré
npx tsx private/generate-articles.ts

# Résultat : lib/articles-content.json mis à jour
# 6 articles générés avec voix Maryse Condé
```

---

## 🤝 Contribuer

### Setup de Développement

1. Forker le dépôt
2. Cloner localement
3. Installer les dépendances : `npm install`
4. Créer `.env.local` avec votre clé Mistral
5. Lancer : `npm run dev`

### Conventions de Code

- **TypeScript** : Typage strict obligatoire
- **Nommage** : camelCase pour variables, PascalCase pour composants
- **Commit** : Messages clairs et concis
- **PR** : Description détaillée des changements

### Structure des Commits

```
feat: nouvelle fonctionnalité
fix: correction de bug
chore: maintenance/maintenance
docs: documentation
style: changements stylistiques
refactor: refactorisation de code
```

---

## 📜 Licence

**Projet Privé** - Tous droits réservés © 2026 Horoscope Botiran.

- Le code source est propriétaire
- Les contenus générés par Maryse CondAI sont protégés
- Whole ou partie du code ne peut être utilisé sans autorisation

---

## 📞 Contact & Support

- **Site** : [Horoscope Karukera](https://horoscope-karukera.netlify.app)
- **Email** : contact@botiran.com
- **GitHub** : [FlashInfoKarukera/horoscope-ia](https://github.com/FlashInfoKarukera/horoscope-ia)

---

## 🙏 Remerciements

- **Maryse Condé** - Pour l'inspiration littéraire et culturelle
- **Mistral AI** - Pour les modèles de langage puissants
- **Next.js** - Pour le framework réactif et performant
- **Netlify** - Pour l'hébergement sans friction
- **La communauté Guadeloupéenne** - Pour la richesse culturelle

---

**✨ sous le flamboyant, Maryse vous guide ✨**
