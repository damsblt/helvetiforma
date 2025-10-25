# Configuration de l'Authentification WordPress

## 🎯 Migration Terminée

Le système d'authentification a été migré de Sanity vers WordPress.

## 🔧 Configuration Requise

### 1. Variables d'Environnement

Ajoutez ces variables à votre fichier `.env.local` :

```bash
# WordPress
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 2. Configuration WordPress

1. **Activer l'API REST** :
   - L'API REST WordPress doit être activée
   - Vérifiez que `/wp-json/` est accessible

2. **Permissions utilisateurs** :
   - Les utilisateurs peuvent être créés via l'API REST
   - Rôle par défaut : `subscriber`

3. **Endpoint de vérification** :
   - Ajouté `/wp-json/helvetiforma/v1/verify-user`
   - Permet de vérifier les identifiants utilisateur

## 🚀 Fonctionnalités Implémentées

### ✅ **Inscription Utilisateur**
- **API `/api/auth/register`** : Crée des utilisateurs dans WordPress
- **Vérification email** : Vérifie si l'email existe déjà
- **Gestion erreurs** : Messages d'erreur spécifiques WordPress

### ✅ **Authentification**
- **API `/api/auth/verify-user`** : Vérifie les identifiants WordPress
- **Session NextAuth** : Compatible avec le système existant
- **Fallback** : Méthodes alternatives d'authentification

### ✅ **Gestion des Utilisateurs**
- **Création automatique** : Via le formulaire d'inscription
- **Rôles WordPress** : Utilisateurs avec rôle `subscriber`
- **Métadonnées** : Prénom, nom, email stockés

## 🔄 **Nouveau Flux d'Authentification**

```
1. Inscription → Création utilisateur WordPress
2. Connexion → Vérification via WordPress API
3. Session → NextAuth avec ID WordPress
4. Achats → Liés à l'utilisateur WordPress
```

## 📊 **Avantages**

- **Unifié** : Tout dans WordPress
- **Standard** : Utilise l'API REST WordPress
- **Sécurisé** : Authentification WordPress native
- **Évolutif** : Facile d'ajouter des fonctionnalités

## 🧪 **Test du Système**

1. **Tester l'inscription** avec un nouvel email
2. **Vérifier la création** dans WordPress Admin
3. **Tester la connexion** avec les identifiants
4. **Vérifier les achats** liés à l'utilisateur

## 🔧 **Dépannage**

### Erreur "Un utilisateur avec cet email existe déjà"
- Vérifiez que l'utilisateur n'existe pas déjà dans WordPress
- L'API vérifie automatiquement les doublons

### Erreur d'authentification
- Vérifiez que l'endpoint `/wp-json/helvetiforma/v1/verify-user` est accessible
- Vérifiez les logs WordPress pour les erreurs

### Problème de permissions
- Vérifiez que l'API REST WordPress est activée
- Vérifiez les permissions de création d'utilisateurs

Le système d'authentification est maintenant entièrement basé sur WordPress !
