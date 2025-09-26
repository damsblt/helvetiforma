# Guide de Déploiement - HelvetiForma Tutor LMS

## 🚀 Étapes de Déploiement

### 1. Prérequis WordPress

Avant de déployer l'application Next.js, assurez-vous que WordPress est correctement configuré sur `api.helvetiforma.ch` :

#### Pages WordPress à créer
Créer ces pages dans l'admin WordPress avec les **slugs exacts** :

```
1. tutor-login (Page de connexion Tutor LMS)
2. tableau-de-bord (Dashboard utilisateur)
3. inscription-des-apprenants (Formulaire inscription étudiants)
4. inscription-des-formateurs-et-formatrices (Formulaire inscription formateurs)
5. panier (Panier Tutor LMS)
6. validation-de-la-commande (Checkout Tutor LMS)
```

#### Plugins WordPress requis
- **Tutor LMS Pro** (licence valide)
- **Application Passwords** (WordPress 5.6+ - natif, pas de plugin)

#### Configuration WordPress Native (Sans JWT)
1. **Permaliens** : Configurer en "Nom de l'article"
2. **Application Passwords** : Créer pour l'utilisateur `gibivawa`
3. **Inscription utilisateur** : Activer dans Réglages > Général
4. **Tutor LMS** : Configurer la monétisation native
5. **CORS** : Autoriser les requêtes depuis votre domaine Next.js (optionnel)

### 2. Variables d'Environnement

#### Développement (.env.local)
```bash
# WordPress/Tutor LMS (API Native - Sans JWT)
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
TUTOR_API_URL=https://api.helvetiforma.ch
TUTOR_LICENSE_KEY=EC00F-9DF58-E44EC-E68BC-1757919356
WORDPRESS_APP_USER=gibivawa
WORDPRESS_APP_PASSWORD=your_application_password_from_wordpress

# Configuration
DEFAULT_COURSE_ID=24
NODE_ENV=development
REVALIDATE_SECRET=your_secret_key
```

#### Production (Vercel)
Configurer les mêmes variables dans le dashboard Vercel.

### 3. Déploiement Vercel

#### Option A : Via Dashboard Vercel
1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

#### Option B : Via CLI Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

### 4. Configuration DNS

#### Domaine personnalisé
Si vous utilisez un domaine personnalisé, configurer :
- **CNAME** : `helvetiforma.ch` → `your-app.vercel.app`
- **SSL** : Automatique via Vercel

### 5. Tests Post-Déploiement

#### Tests fonctionnels
1. **Navigation** : Tester tous les liens de navigation
2. **Pages vitrine** : Accueil, concept, formations, docs, contact
3. **Intégration Tutor** : Connexion, inscription, tableau de bord
4. **API** : Tester les endpoints `/api/tutor/*`

#### Tests d'intégration
1. **Authentification** : Login/logout WordPress
2. **Cours** : Affichage et inscription
3. **Paiement** : Processus de checkout (si configuré)

### 6. Monitoring et Maintenance

#### Logs Vercel
- Consulter les logs de fonction dans le dashboard Vercel
- Surveiller les erreurs 500/404

#### Performance
- Utiliser Vercel Analytics
- Surveiller les Core Web Vitals
- Optimiser les images si nécessaire

### 7. Sécurité

#### Headers de sécurité
Configurés dans `next.config.ts` :
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`

#### CORS WordPress
Configurer WordPress pour autoriser les requêtes depuis votre domaine Next.js.

### 8. Backup et Rollback

#### Backup
- Code : Repository Git
- Données : Backup WordPress/Base de données

#### Rollback
```bash
# Revenir à un déploiement précédent
vercel rollback
```

## 🔧 Troubleshooting

### Erreurs communes

#### 1. Erreur 404 sur les pages Tutor LMS
- Vérifier que les pages WordPress existent avec les bons slugs
- Vérifier les permaliens WordPress

#### 2. Erreur d'authentification API
- Vérifier les variables d'environnement
- Tester les Application Passwords WordPress
- Vérifier la configuration JWT

#### 3. Iframe ne se charge pas
- Vérifier les headers `X-Frame-Options`
- Tester l'URL directement dans le navigateur
- Vérifier les CORS WordPress

#### 4. Erreurs de compilation
- Vérifier les types TypeScript
- ESLint est désactivé en production (`eslint.ignoreDuringBuilds: true`)

### Commandes utiles

```bash
# Test local
npm run dev

# Build de production
npm run build

# Vérifier les types
npx tsc --noEmit

# Déploiement Vercel
vercel --prod
```

## 📞 Support

En cas de problème :
1. Consulter les logs Vercel
2. Vérifier la configuration WordPress
3. Tester les APIs manuellement
4. Contacter l'équipe de développement

---

**Note** : Ce guide suppose que WordPress et Tutor LMS sont déjà configurés sur `api.helvetiforma.ch`. L'application Next.js ne fonctionnera pas sans cette infrastructure backend.
