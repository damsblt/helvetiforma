# Configuration de la Redirection WordPress vers Next.js

Ce document explique comment configurer WordPress pour rediriger automatiquement les utilisateurs connectés (abonnés) vers le tableau de bord Next.js.

## Problème Résolu

Quand un utilisateur WordPress (abonné) se connecte, il arrive sur une page de contenu WordPress au lieu d'être redirigé vers son tableau de bord Tutor LMS dans l'application Next.js.

## Solution Implémentée

### 1. Fichier de Redirection WordPress

Le fichier `wordpress-login-redirect.php` contient le code PHP à ajouter à WordPress pour gérer les redirections automatiques.

### 2. Installation

#### Option A: Ajouter au fichier functions.php du thème

```php
// Copier tout le contenu de wordpress-login-redirect.php
// dans le fichier functions.php de votre thème WordPress actif
```

#### Option B: Créer un plugin personnalisé

1. Créer un nouveau fichier : `/wp-content/plugins/helvetiforma-redirect/helvetiforma-redirect.php`

```php
<?php
/**
 * Plugin Name: HelvetiForma Redirect
 * Description: Redirige les utilisateurs connectés vers l'application Next.js
 * Version: 1.0.0
 * Author: HelvetiForma
 */

// Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Inclure le code de redirection
require_once plugin_dir_path(__FILE__) . 'includes/redirect-functions.php';
```

2. Créer le dossier `includes/` et y placer le contenu de `wordpress-login-redirect.php`

3. Activer le plugin dans l'administration WordPress

### 3. Configuration des URLs

Modifier les URLs dans le fichier selon votre environnement :

```php
// Développement
$nextjs_url = 'http://localhost:3000';

// Production  
if (defined('WP_ENV') && WP_ENV === 'production') {
    $nextjs_url = 'https://helvetiforma.vercel.app';
}
```

## Fonctionnalités

### 1. Redirection Automatique

- **Qui** : Utilisateurs avec le rôle `subscriber` ou `student`
- **Quand** : Après connexion ou lors de l'accès à une page WordPress
- **Où** : Vers `/tableau-de-bord` de l'application Next.js

### 2. Exceptions

La redirection ne s'applique PAS :
- Dans l'administration WordPress (`/wp-admin/`)
- Pour les requêtes AJAX ou API REST
- Dans les iframes (`?iframe=1`)
- Pour les administrateurs et instructeurs
- Sur les pages de login/register

### 3. Auto-Login

Quand un utilisateur est redirigé depuis WordPress :
- Ses informations sont passées en paramètres URL sécurisés
- L'application Next.js tente une auto-connexion
- En cas d'échec, l'utilisateur peut se connecter manuellement

## Paramètres URL de Redirection

```
https://helvetiforma.vercel.app/tableau-de-bord?user_id=123&email=user@example.com&username=username&from=wordpress&auto_login=1
```

### Paramètres :
- `user_id` : ID utilisateur WordPress
- `email` : Email de l'utilisateur
- `username` : Nom d'utilisateur
- `from` : Source de la redirection (`wordpress`, `wordpress_login`, `wordpress_auto`)
- `auto_login` : Indicateur pour tenter l'auto-connexion

## Sécurité

### 1. Vérification des Données

- L'API Next.js vérifie que l'utilisateur existe dans WordPress
- Les données utilisateur sont validées côté serveur
- Tokens temporaires pour l'auto-login (15 minutes d'expiration)

### 2. Restrictions d'Accès

- Les abonnés ne peuvent plus accéder au tableau de bord WordPress
- La barre d'administration est masquée pour les abonnés
- Redirection automatique si tentative d'accès à `/wp-admin/`

## Tests

### 1. Test de Redirection

1. Se connecter en tant qu'abonné sur WordPress
2. Vérifier la redirection vers Next.js
3. Confirmer l'auto-connexion dans l'application

### 2. Test des Exceptions

1. Se connecter en tant qu'administrateur
2. Vérifier qu'il reste sur WordPress
3. Tester l'accès aux iframes

## Dépannage

### Problème : Boucle de Redirection

**Cause** : URLs mal configurées ou problème de détection d'environnement

**Solution** :
```php
// Vérifier les URLs dans le code
$nextjs_url = 'http://localhost:3000'; // Développement
```

### Problème : Auto-Login Échoue

**Cause** : Utilisateur non trouvé dans WordPress ou données incorrectes

**Solution** :
- Vérifier que l'utilisateur existe dans WordPress
- Contrôler les logs d'erreur Next.js
- Tester la connexion manuelle

### Problème : Administrateurs Redirigés

**Cause** : Logique de détection des rôles incorrecte

**Solution** :
```php
// Vérifier la condition dans le code
if (in_array('subscriber', $current_user->roles) || 
    in_array('student', $current_user->roles) ||
    (empty(array_intersect(['administrator', 'editor', 'author', 'contributor', 'tutor_instructor'], $current_user->roles)))) {
    // Rediriger seulement les abonnés
}
```

## Logs et Monitoring

### Côté WordPress

Ajouter des logs pour déboguer :

```php
error_log('HelvetiForma Redirect: User ' . $current_user->user_login . ' redirected to Next.js');
```

### Côté Next.js

Les erreurs d'auto-login sont loggées dans la console :

```javascript
console.error('Auto-login error:', error);
```

## Mise à Jour

Pour mettre à jour la configuration :

1. Modifier les URLs si nécessaire
2. Ajuster les conditions de redirection
3. Tester en environnement de développement
4. Déployer en production

## Support

En cas de problème :
1. Vérifier les logs d'erreur WordPress
2. Contrôler la console développeur du navigateur
3. Tester avec différents rôles d'utilisateur
4. Valider les URLs de redirection
