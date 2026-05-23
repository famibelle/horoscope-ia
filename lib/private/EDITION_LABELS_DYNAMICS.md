# 📊 Tableau des onglets dynamiques par tranche horaire

> **Objectif** : Adapter les libellés des onglets (Nuit, Matin, Midi, Soir) en fonction de la tranche horaire actuelle en Guadeloupe, pour refléter le temps grammatical (passé, présent, futur) de chaque édition.

---

## 📋 Tableau récapitulatif

| Tranche actuelle | Heures (Guadeloupe) | Onglet NUIT | Onglet MATIN | Onglet MIDI | Onglet SOIR |
|------------------|--------------------|-------------|--------------|-------------|-------------|
| **Nuit** 🌌 | 00:00 – 05:59 | **🌌 Nuit** *(Ce qui compte maintenant)* | 🔮 Matin *(Ce qui vous attend demain matin)* | 🔮 Midi *(Ce qui vous attend demain à midi)* | 🔮 Soir *(Ce qui vous attend demain soir)* |
| **Matin** 🌅 | 06:00 – 11:59 | 🌌 Nuit *(Cette nuit (pour référence))* | **🌅 Matin** *(Ce qui compte maintenant)* | 🔮 Midi *(Ce qui vous attend cet après-midi)* | 🌙 Soir *(Comment terminer votre journée)* |
| **Midi** ☀️ | 12:00 – 17:59 | 🌌 Nuit *(Cette nuit (pour référence))* | 🌅 Matin *(Ce matin (pour référence))* | **☀️ Midi** *(Ce qui compte maintenant)* | 🌙 Soir *(Comment terminer votre journée)* |
| **Soir** 🌙 | 18:00 – 23:59 | 🌌 Nuit *(Ce qui vous attend cette nuit)* | 🌅 Matin *(Ce matin (pour référence))* | ☀️ Midi *(Cet après-midi (pour référence))* | **🌙 Soir** *(Ce qui compte maintenant)* |

---

## 🔧 Implémentation

La fonction `getDynamicEditionLabels()` dans `lib/edition.ts` implémente cette logique :

```typescript
import { getDynamicEditionLabels, detectEditionWithNight } from '@/lib/edition';

// 1. Détecter l'édition actuelle
const currentEdition = detectEditionWithNight(); // 'nuit' | 'matin' | 'midi' | 'soir'

// 2. Obtenir les libellés dynamiques
const labels = getDynamicEditionLabels(currentEdition);

// 3. Utilisation dans les composants
labels.nuit.label   // "Nuit" ou "Nuit" avec emoji
labels.nuit.emoji    // "🌌" ou "🔮" selon le contexte
labels.nuit.desc     // Description contextuelle (présent/futur/passé)
```

---

## 💡 Logique temporelle

### Contexte : **Présent** (onglet actif)
- L'onglet correspondant à la tranche horaire actuelle
- Libellé simple avec emoji de base
- Description : "Ce qui compte maintenant"

### Contexte : **Futur proche** (même journée)
- Onglets à venir dans la même journée
- Emoji 🔮 pour indiquer une prédiction
- Description : "Ce qui vous attend..." (cet après-midi, ce soir)

### Contexte : **Futur lointain** (lendemain)
- Quand on est la nuit (00:00-05:59), tous les autres onglets sont pour le lendemain
- Emoji 🔮 pour indiquer une prédiction
- Description : "Ce qui vous attend demain..."

### Contexte : **Passé** (pour référence)
- Onglets déjà écoulés dans la journée
- Emoji standard (🌌, 🌅, ☀️, 🌙)
- Description : "...(pour référence)" ou "Ce matin/Cet après-midi"

---

## 📌 Règles de détermination

| Tranche | Condition | Heure Guadeloupe |
|---------|-----------|------------------|
| Nuit | `h >= 0 && h < 6` | 00:00 – 05:59 |
| Matin | `h >= 6 && h < 12` | 06:00 – 11:59 |
| Midi | `h >= 12 && h < 18` | 12:00 – 17:59 |
| Soir | `h >= 18` | 18:00 – 23:59 |

> **Note** : Les heures sont basées sur le fuseau horaire **America/Guadeloupe** (UTC-4), pas sur l'heure locale du navigateur.

---

## 🎯 Cas d'usage

### Exemple 1 : Il est 10h00 (Matin)
```
Onglets affichés :
├── Nuit   🌌 Cette nuit (pour référence)
├── Matin  🌅 Ce qui compte maintenant  ← ACTIF
├── Midi   🔮 Ce qui vous attend cet après-midi
└── Soir   🌙 Comment terminer votre journée
```

### Exemple 2 : Il est 15h00 (Midi)
```
Onglets affichés :
├── Nuit   🌌 Cette nuit (pour référence)
├── Matin  🌅 Ce matin (pour référence)
├── Midi   ☀️ Ce qui compte maintenant      ← ACTIF
└── Soir   🌙 Comment terminer votre journée
```

### Exemple 3 : Il est 02h00 (Nuit)
```
Onglets affichés :
├── Nuit   🌌 Ce qui compte maintenant      ← ACTIF
├── Matin  🔮 Ce qui vous attend demain matin
├── Midi   🔮 Ce qui vous attend demain à midi
└── Soir   🔮 Ce qui vous attend demain soir
```

---

## 🔗 Fonctions associées

| Fonction | Description | Retour |
|----------|-------------|--------|
| `detectEditionWithNight()` | Détecte l'édition actuelle (nuit/matin/midi/soir) | `EditionWithNight` |
| `getDynamicEditionLabels(edition)` | Retourne les libellés adaptés pour chaque onglet | `Record<Edition, { label: string; emoji: string; desc: string }>` |
| `getGuadeloupeHour()` | Récupère l'heure actuelle en Guadeloupe (0-23) | `number` |

---

## 📝 Maintenance

Pour modifier les libellés ou la logique :
1. Modifier la fonction `getDynamicEditionLabels()` dans `lib/edition.ts`
2. Tester avec différents fuseaux horaires
3. Vérifier que les emojis restent cohérents (🌌, 🌅, ☀️, 🌙, 🔮)

> **Important** : Toujours utiliser `getGuadeloupeHour()` et non `new Date().getHours()` pour garantir la cohérence avec le fuseau horaire de Guadeloupe.
