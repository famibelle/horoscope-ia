# TODO - Optimisations & Améliorations

## 📬 Newsletter

### ✅ Critique — fait
- [x] Brancher les vrais horoscopes Supabase dans le générateur (édition matin)
- [x] Ajouter l'envoi Brevo dans le CI (GitHub Actions)
- [x] Script de migration abonnés fichier chiffré → Brevo (`scripts/migrate-subscribers-to-brevo.ts`)

### ✅ Important — fait
- [x] Refaire le template HTML dans le style du site (palette ancestral sombre)
- [x] Corriger les labels des sections (Parole des ancêtres, Lyannaj, Présage ancestral…)
- [x] Intégrer le présage du jour depuis la table `presages`
- [x] Stocker les newsletters dans Supabase (table `newsletters`, plus de filesystem éphémère)

### 🔲 Confort — à faire
- [ ] Lien de désabonnement réel (remplacer `{{unsubscribe_url}}` par une vraie route)
- [ ] Page de prévisualisation de la newsletter avant envoi
- [ ] Corriger l'erreur Brevo `sendCampaignNow` (réponse JSON vide sur 204)
- [ ] Supprimer le log trompeur "📁 Chemin: private_data/newsletters/…" dans le script CI

### 🔲 Affinage — à faire plus tard
- [ ] Affiner le design de la newsletter (polices, espacement, mobile)
- [ ] Ajouter un lien vers la page web de chaque newsletter (`/newsletter/[id]`)
- [ ] Tester l'affichage dans Gmail, Apple Mail, Outlook

---

## 📖 Fiches culturelles (Traditions & culture)

### 🔲 À faire
- [ ] Auto-surligner les mots du glossaire créole en doré sans dépendre du balisage `*mot*` — les fiches générées n'entourent pas systématiquement les noms d'animaux/plantes d'astérisques (ex: `kabribo` présent dans le glossaire mais jamais balisé)

---

## 🎵 TTS / Audio

### ✅ Fait
- [x] `normalizeForTTS` dans `lib/tts-utils.ts`
- [x] Prononciations créoles guadeloupéennes portées depuis FlashInfoKarukera

---

## 🌙 Horoscopes

### ✅ Fait
- [x] Cache en mémoire pour les données culturelles
- [x] Édition "nuit" (0h–6h)
- [x] Contexte temporel (date et heure du navigateur)

### 🔲 Backlog
- [ ] Pré-calculer les données culturelles en CI pour éviter les calculs à la volée (Option 3)
- [ ] Ajouter `data/` au `.gitignore` et nettoyer les fichiers de test

---

## 🗄️ Base de données Supabase

### ✅ Fait
- [x] Tables : `horoscopes`, `ambiances`, `presages`, `glossaire`, `newsletters`
- [x] `supabase/newsletters.sql` — DDL à exécuter manuellement

### 🔲 À faire
- [ ] Créer un schéma en étoile si des besoins analytiques émergent (mis de côté)
- [ ] Script `parse-vaudou-ref.ts` manquant (seule référence sans pipeline automatisé)

---

## ⚙️ Infrastructure / Netlify

### 🔲 À faire
- [ ] Ajouter `CONTACT_EMAIL=medhi.famibelle@gmail.com` dans les variables d'environnement Netlify (dashboard → Site settings → Environment variables)
