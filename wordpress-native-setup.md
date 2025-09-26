# Configuration WordPress Native (Sans Plugins JWT)

## 🎯 Objectif
Utiliser uniquement l'API REST native de WordPress pour l'authentification, sans dépendance au plugin JWT.

## 📋 Configuration WordPress Requise

### 1. Activer l'API REST (Déjà activée par défaut)
L'API REST WordPress est native depuis la version 4.7. Aucun plugin requis.

**Test de l'API :**
```bash
curl https://api.helvetiforma.ch/wp-json/wp/v2/posts
```

### 2. Activer les Application Passwords (WordPress 5.6+)

#### Dans wp-config.php :
```php
// Activer les Application Passwords (si pas déjà fait)
define('WP_APPLICATION_PASSWORDS', true);
```

#### Créer un Application Password :
1. Aller dans **Utilisateurs > Profil**
2. Section **Application Passwords**
3. Nom : `HelvetiForma API`
4. Cliquer **Add New Application Password**
5. Copier le mot de passe généré

### 3. Configuration CORS (Optionnel)

#### Dans functions.php ou plugin personnalisé :
```php
function helvetiforma_cors_headers() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed_origins = [
        'http://localhost:3000',
        'https://helvetiforma.vercel.app',
        'https://helvetiforma.ch'
    ];
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
}
add_action('init', 'helvetiforma_cors_headers');
```

### 4. Permettre l'inscription utilisateur

#### Via l'admin WordPress :
- **Réglages > Général**
- Cocher **"Tout le monde peut s'enregistrer"**

#### Ou via functions.php :
```php
// Permettre l'inscription pour les requêtes API
function helvetiforma_enable_api_registration() {
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false) {
        add_filter('option_users_can_register', '__return_true');
    }
}
add_action('init', 'helvetiforma_enable_api_registration');
```

## 🔧 Variables d'Environnement

### Dans .env.local :
```bash
# WordPress API (Native - pas de JWT)
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
WORDPRESS_APP_USER=gibivawa
WORDPRESS_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx-xxxx-xxxx

# Tutor LMS
TUTOR_API_URL=https://api.helvetiforma.ch
DEFAULT_COURSE_ID=24
```

## 📡 Endpoints API Utilisés

### Authentification Native :
- **Login** : `POST /wp-login.php` (formulaire natif)
- **Validation** : `GET /wp-json/wp/v2/users/me`
- **Basic Auth** : `Authorization: Basic base64(username:password)`

### Gestion Utilisateurs :
- **Créer** : `POST /wp-json/wp/v2/users`
- **Lire** : `GET /wp-json/wp/v2/users/me`
- **Modifier** : `PUT /wp-json/wp/v2/users/{id}`

### Posts/Courses :
- **Lister** : `GET /wp-json/wp/v2/posts`
- **Courses** : `GET /wp-json/wp/v2/courses` (si Tutor LMS)

## ✅ Avantages de l'Approche Native

1. **Aucun plugin tiers requis**
2. **Sécurité renforcée** (Application Passwords)
3. **Compatibilité garantie** avec toutes versions WP
4. **Performance optimale**
5. **Maintenance réduite**

## 🧪 Test de Connexion

### Via curl :
```bash
# Test Basic Auth
curl -u "username:password" \
  https://api.helvetiforma.ch/wp-json/wp/v2/users/me

# Test Application Password
curl -u "gibivawa:xxxx-xxxx-xxxx-xxxx" \
  https://api.helvetiforma.ch/wp-json/wp/v2/users/me
```

### Via JavaScript :
```javascript
const credentials = btoa('username:password');
fetch('https://api.helvetiforma.ch/wp-json/wp/v2/users/me', {
  headers: {
    'Authorization': `Basic ${credentials}`
  }
});
```

## 🔐 Sécurité

- ✅ **Application Passwords** : Révocables individuellement
- ✅ **Basic Auth over HTTPS** : Chiffrement total
- ✅ **Permissions WordPress** : Respect des rôles natifs
- ✅ **Pas de JWT stocké** : Moins de surface d'attaque

## 🚫 Plugins à Supprimer

Si vous aviez installé ces plugins, vous pouvez les désactiver :
- JWT Authentication for WP REST API
- WP JWT Auth
- Tout autre plugin JWT

L'authentification native WordPress est plus sécurisée et plus simple !
