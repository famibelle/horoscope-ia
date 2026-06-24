# Changelog

## [2026-06-24]

### Performance
- **Cache CDN Netlify** sur `/horoscope/*` — `s-maxage=3600, stale-while-revalidate=600` : les pages horoscope sont servies depuis le CDN après la première requête, réduisant drastiquement les executions Function

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
