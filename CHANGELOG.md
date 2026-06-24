# Changelog

## [2026-06-24] — session 2

### Performance
- **ISR `/horoscope/[sign]`** : ajout de `revalidate = 900` + `generateStaticParams` — les 12 pages passent de `ƒ` (SSR pur) à `●` (ISR 15 min), plus d'appel Supabase sur chaque requête
- **Scripts non-bloquants** : AdSense et Google Analytics déplacés de `<head>` vers `next/script strategy="afterInteractive"` — chargés après l'hydratation, améliore LCP et CLS

### Fiches culturelles (Traditions & culture)
- **Rendu ReactMarkdown** : le corps des fiches était rendu en `<p>` brut — les `*mots*` n'étaient pas traités. Passage via `ReactMarkdown + creoleComponents(dict)` pour que les mots créoles balisés deviennent dorés avec tooltip
- **Mots bannis supprimés** : `*zombis*`, `*dorlis*`, `*djables*` retirés des fiches Gémeaux, Scorpion, Capricorne et Poissons (glissés lors de la génération initiale sans les contraintes du prompt Maryse) ; remplacés par des formulations équivalentes
- **Élision incorrecte sur "wasou"** : `L'wasou` / `l'wasou` corrigés en `Le wasou` / `le wasou` — `w` est une consonne, pas d'élision en français (3 occurrences dans la fiche Sagittaire)

### Fixes
- **Hydration React #418** : suppression du `<head>` manuel dans `layout.tsx` — conflictait avec la gestion interne du head par Next.js App Router ; `<meta google-adsense-account>` déplacée dans `metadata.other`
- **JSON-LD "Invalid or unexpected token"** : `<Script strategy="afterInteractive">` évaluait le JSON comme du JS (`@context` invalide en JS) ; remplacé par un `<script>` plain rendu côté serveur
- **Formulaire contact — destinataire incorrect** : l'email de contact partait à `EMAIL_FROM` (expéditeur newsletter) au lieu de l'adresse admin ; ajout de `CONTACT_EMAIL` comme variable de destination, fallback `medhi.famibelle@gmail.com`
- **Newsletter — sujets trop courts** : `max_tokens: 60` (~40 chars) empêchait Mistral de respecter la contrainte 50-70 chars déjà dans le prompt ; porté à 100

## [2026-06-24]

### Performance
- **Cache CDN Netlify** sur `/horoscope/*` — `s-maxage=3600, stale-while-revalidate=600` : les pages horoscope sont servies depuis le CDN après la première requête, réduisant drastiquement les executions Function
- **Fonts** : suppression de Cormorant Garamond poids 300 (normal + italic) — poids jamais utilisé dans le code, économise ~2 fichiers woff2 (~70 KB)

### Dictionnaire & Tooltips
- **18 termes vaudou/culturels** ajoutés aux tooltips : loa, Legba, Kafou, Ogoun, Ezili Freda, Baron Samedi, La Sirène, peristil, vèvè, pwen, lyannaj, quimbois, soukougnan, gade zafe, mas, chanté mas, ka, lajan — termes curatés manuellement, Supabase faune/flore en priorité
- **Tooltip mobile** : tap pour ouvrir/fermer sur appareils tactiles (détection via `matchMedia('(hover: none) and (pointer: coarse)')`), fermeture au tap extérieur
- **Déduplication** : suppression du doublon mot créole dans l'en-tête du tooltip

### Édition / Fuseau horaire
- **Heure locale du visiteur** : `HoroscopeSignPage` et `HoroscopesPreview` utilisent désormais `detectLocalEditionWithNight()` (heure navigateur) au lieu de l'heure Guadeloupe serveur — l'édition affichée correspond à l'heure réelle du lecteur

### Typographie
- **Corps 18px / line-height 1.75** sur toutes les pages (articles, horoscopes, à-propos, CGU, newsletter, désinscription) — standard des grands sites éditoriaux
- **Hiérarchie articles** : titre plus grand et plus lumineux que le tag catégorie

### Contenu
- **6 articles Vaudou** (~1 400 mots chacun) : Papa Legba, Ezili Freda, Baron Samedi, Damballa, Trois familles (Rada/Pétro/Congo), Ogoun
- **Tirets cadratin supprimés** partout (titres, JSON articles, meta, signatures)

## [2026-06-19]

### Contenu & AdSense
- **18 fiches culturelles** par signe (~1 000 mots/page)
- **Articles enrichis** à 10–21K chars pour AdSense
- **Articles généraux** portés à 1 700–3 500 mots

### Newsletter
- Même traitement de titre pour la newsletter quotidienne
- Throttle entre signes pour éviter le rate-limit Mistral
- Objet d'email par signe via persona Maryse + anti-répétition
- Expéditeur du mail de bienvenue sur le domaine authentifié
