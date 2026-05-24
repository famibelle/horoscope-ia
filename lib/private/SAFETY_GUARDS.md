# 🛡️ Système de Garde-Fous Vaudou

> **Version**: 1.0.0 | **Date**: 2025 | **Statut**: ✅ Actif

---

## 📜 Sommaire

1. [Pourquoi ce système ?](#-pourquoi-ce-système)
2. [Règles de Sécurité](#-règles-de-sécurité)
3. [Utilisation](#-utilisation)
4. [Exemples](#-exemples)

---

## 🤔 Pourquoi ce système ?

Le Vaudou utilise des symboles puissants (bougies, plantes, objets sacrés) qui peuvent être interprétés littéralement de manière dangereuse.

**Objectifs** : Éviter accidents, respect légal, fidélité culturelle, sécurité des visiteurs.

**Principe** : "Tout ce qui peut être fait physiquement peut être fait spirituellement."

---

## 🛡️ Règles de Sécurité

### 📊 Catégories

| Catégorie | Emoji | Priorité | Description |
|-----------|-------|----------|-------------|
| `fire` | 🔥 | 0 | Feu, bougies, encens |
| `ingestion` | 🚫 | 0 | Ingestion de plantes/boissons |
| `dangerous_objects` | ✂️ | 0 | Couteaux, aiguilles |
| `animal` | 🐍 | 0 | Sacrifice d'animaux |
| `medical` | 🏥 | 0 | Conseils médicaux |
| `illegal` | 🚨 | 0 | Activités illégales |
| `self_harm` | 🤲 | 0 | Auto-mutilation |

### 🔍 Règles Actuelles

- **Feu** : "Allume une bougie" → "Imagine une bougie allumée..."
- **Ingestion** : "Bois du rhum" → "Invoque l'énergie du rhum..."
- **Objets** : "Prends un couteau" → "Symbolise la coupure..."
- **Animaux** : "Sacrifie un animal" → "Honore l'esprit..."
- **Médical** : "Soigne toi avec" → "Consulte un professionnel..."

---

## 💻 Utilisation

### Filtrer un texte
```typescript
import { applySafetyFilters } from '@/lib/private/safety-filter';
const result = applySafetyFilters('Allume une bougie');
// result.safeText = "Imagine une bougie allumée..."
```

### Filtrer un objet JSON
```typescript
import { applySafetyFiltersToObject } from '@/lib/private/safety-filter';
const result = applySafetyFiltersToObject(horoscope);
```

### Vérifier si dangereux
```typescript
import { hasDangerousContent, hasCriticalContent } from '@/lib/private/safety-filter';
if (hasDangerousContent(text)) { /* ... */ }
```

---

## 📝 Exemples

### Avant / Après

| Avant | Après |
|-------|-------|
| Allume une bougie | Imagine une bougie allumée devant toi... |
| Bois du rhum | Invoque l'énergie du rhum dans tes rituels... |
| Prends un couteau | Symbolise la coupure des énergies négatives... |

---

## 🤝 Contribuer

### Ajouter une règle
1. Éditer `safety-guards.ts`
2. Ajouter une entrée dans `SAFETY_RULES`
3. Tester avec `scripts/test-safety.ts`

---

*"Le Vaudou est une voie de lumière. Le Système de Garde-Fous en est le gardien."* 🕯️
