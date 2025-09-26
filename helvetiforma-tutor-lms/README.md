# HelvetiForma - Tutor LMS Integration

Une web app moderne basée sur **Next.js** et intégrée avec **Tutor LMS** pour la formation professionnelle en Suisse.

## 🎯 Vue d'ensemble

Cette application combine :
- **Pages vitrine Next.js** : Accueil, concept, formations, documentation, contact
- **Intégration Tutor LMS** : Système complet de gestion de formation via WordPress
- **Monétisation native** : Système de paiement intégré de Tutor LMS
- **Authentification unifiée** : SSO entre Next.js et WordPress

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- WordPress avec Tutor LMS Pro installé sur `api.helvetiforma.ch`
- Accès aux APIs WordPress et Tutor LMS

### Configuration

1. **Cloner et installer les dépendances**
```bash
cd /Users/damien/Documents/Oksan/helvetiforma-tutor-lms
npm install
```

2. **Configuration des variables d'environnement**
```bash
cp env.example .env.local
```

Remplir les variables dans `.env.local` :
```bash
# WordPress/Tutor LMS - OBLIGATOIRE
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
TUTOR_API_URL=https://api.helvetiforma.ch
TUTOR_LICENSE_KEY=EC00F-9DF58-E44EC-E68BC-1757919356
TUTOR_CLIENT_ID=your_tutor_client_id
TUTOR_SECRET_KEY=your_tutor_secret_key
WORDPRESS_APP_USER=gibivawa
WORDPRESS_APP_PASSWORD=your_app_password

# Configuration
DEFAULT_COURSE_ID=24
NODE_ENV=development
REVALIDATE_SECRET=your_secret_key
```

3. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du Projet

```
src/
├── app/                          # Pages Next.js App Router
│   ├── page.tsx                 # Page d'accueil
│   ├── concept/                 # Page concept
│   ├── formations/              # Catalogue formations
│   ├── docs/                    # Documentation
│   ├── contact/                 # Contact
│   ├── courses/[id]/           # Détail cours Tutor LMS
│   ├── tutor-login/            # Connexion Tutor LMS
│   ├── tableau-de-bord/        # Dashboard (iframe)
│   ├── inscription-des-apprenants/      # Inscription étudiants
│   ├── inscription-des-formateurs-et-formatrices/  # Inscription formateurs
│   ├── panier/                 # Panier Tutor LMS
│   ├── validation-de-la-commande/      # Checkout
│   └── api/                    # API Routes
│       └── tutor/              # APIs Tutor LMS
├── components/
│   ├── Navigation.tsx          # Navigation principale
│   └── tutor/                  # Composants Tutor LMS
│       ├── TutorIframe.tsx     # Intégration iframe
│       └── AuthWrapper.tsx     # Protection authentification
├── services/
│   ├── authService.ts          # Service authentification
│   └── tutorService.ts         # Service Tutor LMS
├── types/
│   └── tutor.ts               # Types TypeScript
└── lib/
    └── wordpress.ts           # Configuration WordPress
```

## 🔌 Intégration Tutor LMS

### Pages Tutor LMS (via iframe)

Les pages suivantes sont intégrées depuis WordPress :
- `/tutor-login` → `api.helvetiforma.ch/tutor-login`
- `/tableau-de-bord` → `api.helvetiforma.ch/tableau-de-bord`
- `/inscription-des-apprenants` → `api.helvetiforma.ch/inscription-des-apprenants`
- `/inscription-des-formateurs-et-formatrices` → `api.helvetiforma.ch/inscription-des-formateurs-et-formatrices`
- `/panier` → `api.helvetiforma.ch/panier`
- `/validation-de-la-commande` → `api.helvetiforma.ch/validation-de-la-commande`

### APIs Disponibles

#### Authentification
- `POST /api/tutor/auth/login` - Connexion utilisateur
- `POST /api/tutor/auth/register` - Inscription utilisateur

#### Gestion des cours
- `GET /api/tutor/courses` - Liste des cours
- `GET /api/tutor/courses/[id]` - Détail d'un cours
- `POST /api/tutor/enroll` - Inscription à un cours
- `POST /api/tutor/purchase` - Achat d'un cours

#### Statistiques
- `GET /api/tutor/stats` - Statistiques générales

## 🛡️ Authentification

Le système utilise :
- **JWT WordPress** pour l'authentification
- **Application Passwords** comme fallback
- **Synchronisation d'état** entre Next.js et WordPress
- **Protection des routes** avec `AuthWrapper`

## 💰 Monétisation

Utilise le **système natif de Tutor LMS** :
- Cours gratuits et payants
- Gestion du panier intégrée
- Processus de checkout Tutor LMS
- Pas de dépendance WooCommerce

## 🎨 Interface Utilisateur

- **Design moderne** avec Tailwind CSS
- **Navigation unifiée** entre pages Next.js et Tutor LMS
- **Responsive** mobile-first
- **Intégration transparente** des iframes

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connecter le repository à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Variables d'environnement de production
```bash
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
TUTOR_API_URL=https://api.helvetiforma.ch
TUTOR_LICENSE_KEY=EC00F-9DF58-E44EC-E68BC-1757919356
# ... autres variables
```

## 🔧 Configuration WordPress

### Plugins requis
- **Tutor LMS Pro** (licence valide)
- **JWT Authentication** (pour l'API)

### Pages WordPress à créer
Créer ces pages dans WordPress avec les slugs exacts :
- `tutor-login`
- `tableau-de-bord` 
- `inscription-des-apprenants`
- `inscription-des-formateurs-et-formatrices`
- `panier`
- `validation-de-la-commande`

### Configuration API
1. Activer les permaliens WordPress
2. Configurer JWT Authentication
3. Créer des Application Passwords
4. Configurer les permissions Tutor LMS

## 📚 Documentation

### Pour les développeurs
- Architecture basée sur Next.js 15 App Router
- TypeScript pour la sécurité des types
- Services modulaires pour l'intégration
- Gestion d'erreur robuste

### Pour les utilisateurs
- Guide d'utilisation dans `/docs`
- FAQ intégrée
- Support technique disponible

## 🤝 Support

- **Email** : support@helvetiforma.ch
- **Documentation** : `/docs`
- **Issues** : Via le repository Git

## 📄 Licence

Propriétaire - HelvetiForma 2024

---

**Note importante** : Cette application nécessite une instance WordPress avec Tutor LMS Pro configurée sur `api.helvetiforma.ch` pour fonctionner correctement.