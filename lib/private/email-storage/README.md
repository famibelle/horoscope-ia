# Système de Stockage Sécurisé des Emails

## 🔒 Architecture de Sécurité

### Chiffrement
- **AES-256-CBC** : Algorithme de chiffrement militaire
- **Vecteur d'initialisation aléatoire** : Pour chaque email
- **Clé dérivée** : SHA-256 de la clé principale
- **Format de stockage** : `IV:chiffré`

### Stockage Physique
- **Dossier protégé** : `private_data/` avec permissions 700
- **Fichier sécurisé** : `subscribers_encrypted.dat` avec permissions 600
- **Exclu de Git** : Ajouté au `.gitignore`

### Protection des Données
- **Normalisation** : Conversion en minuscules et trim
- **Validation** : Regex strict pour les emails
- **Déduplication** : Vérification avant ajout
- **Horodatage** : Chaque entrée est timestampée

## 📁 Structure des Données

```
private_data/
└── subscribers_encrypted.dat
    ├── [IV_hex]:[email_chiffré]|[timestamp]\n
    ├── [IV_hex]:[email_chiffré]|[timestamp]\n
    └── ...
```

## 🔑 Configuration

### Variables d'Environnement

Ajoutez dans votre `.env.local` :

```env
EMAIL_ENCRYPTION_KEY=votre-clé-super-sécurisée-de-32-caractères-minimum
ALLOWED_ORIGINS=https://votre-domaine.com
```

> ⚠️ **IMPORTANT** : Changez la clé par défaut immédiatement !

## 📂 API Endpoints

### POST `/api/subscribe`

**Requête** :
```json
{
  "email": "utilisateur@example.com"
}
```

**Réponses** :
- `200` : Succès avec compteur d'abonnés
- `400` : Email invalide ou déjà inscrit
- `500` : Erreur serveur

### GET `/api/subscribe`

**Réponse** :
```json
{
  "subscribers": 42
}
```

## 🛡️ Bonnes Pratiques de Sécurité

1. **Ne jamais committer** le dossier `private_data/`
2. **Changer la clé de chiffrement** par défaut
3. **Restreindre les origines CORS** dans la production
4. **Sauvegarder régulièrement** le fichier de données
5. **Monitorer les accès** au fichier
6. **Rotater la clé** périodiquement

## 🔧 Utilisation

### Sauvegarder un email

```typescript
import { saveEmail } from '@/lib/private/email-storage';

const result = await saveEmail('user@example.com');
if (result.success) {
  console.log('Email sauvegardé avec succès !');
}
```

### Lire tous les emails

```typescript
import { getAllEmails } from '@/lib/private/email-storage';

const emails = await getAllEmails();
console.log('Liste des abonnés:', emails);
```

### Compter les abonnés

```typescript
import { getSubscriberCount } from '@/lib/private/email-storage';

const count = await getSubscriberCount();
console.log('Nombre d\'abonnés:', count);
```

## 🚨 Procédure en Cas de Compromission

1. **Arrêter immédiatement** l'application
2. **Changer la clé** de chiffrement
3. **Rechiffrer tous les emails** avec la nouvelle clé
4. **Auditer les logs** pour comprendre la faille
5. **Notifier les utilisateurs** si nécessaire (RGPD)

## 📈 Intégration Frontend

```jsx
import EmailSubscribe from '@/components/EmailSubscribe';

function Page() {
  return (
    <div>
      <EmailSubscribe />
    </div>
  );
}
```

## 🔍 Audit de Sécurité

- ✅ Chiffrement AES-256
- ✅ Validation stricte des emails
- ✅ Protection contre les doublons
- ✅ Permissions restrictives sur les fichiers
- ✅ Exclusion de Git
- ✅ CORS configuré
- ✅ Protection CSRF (via Next.js)
- ✅ Rate limiting recommandé en production

---

**Dernière mise à jour** : 2024
**Responsable** : Équipe de sécurité
**Niveau de confidentialité** : CONFIDENTIEL