# 🚀 Guide de Déploiement - Approche Hybride

## Vue d'ensemble

Ce guide vous explique comment déployer votre site Helvetiforma en ligne avec l'approche hybride :
- **Frontend**: Next.js sur Vercel
- **CMS**: WordPress sur Hostpoint (déjà en ligne)
- **Backup**: Strapi local (développement)

---

## 📋 Architecture de Production

```
Production:
├── Frontend Next.js (Vercel) → helvetiforma.vercel.app
├── WordPress CMS (Hostpoint) → helvetiforma.ch
└── Strapi Backup (Local) → localhost:1337

Data Flow:
Next.js Frontend → WordPress API → WooCommerce
                ↓ (fallback)
                Strapi API (si WordPress échoue)
```

---

## 🛠️ Étape 1: Préparation WordPress

### ✅ WordPress déjà configuré
- **URL**: `https://helvetiforma.ch`
- **Plugin**: `helvetiforma-headless-plugin.php` installé
- **API Endpoints**: `/wp-json/helvetiforma/v1/formations`

### 🔧 Vérifications WordPress
1. **Testez l'API**: `https://helvetiforma.ch/wp-json/helvetiforma/v1/formations`
2. **Créez du contenu**: Ajoutez quelques formations de test
3. **Vérifiez WooCommerce**: Configurez les produits de formation

---

## 🚀 Étape 2: Déploiement Next.js sur Vercel

### 1. Préparation du Code
```bash
# Assurez-vous que tout est commité
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Déploiement Vercel
1. **Allez sur** [vercel.com](https://vercel.com)
2. **Connectez votre repo** GitHub
3. **Importez le projet** `helvetiforma-frontend`
4. **Configurez les variables d'environnement**:

```env
NEXT_PUBLIC_WORDPRESS_URL=https://helvetiforma.ch
NEXT_PUBLIC_USE_WORDPRESS=true
NEXT_PUBLIC_FALLBACK_TO_STRAPI=false
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### 3. Configuration Vercel
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

## 🔧 Étape 3: Configuration des Domaines

### Option A: Sous-domaine Vercel
- **URL**: `helvetiforma.vercel.app`
- **Avantages**: Gratuit, SSL automatique
- **Configuration**: Automatique

### Option B: Domaine personnalisé
- **URL**: `app.helvetiforma.ch` ou `www.helvetiforma.ch`
- **Configuration**:
  1. **Ajoutez le domaine** dans Vercel
  2. **Configurez les DNS** chez Hostpoint
  3. **Attendez la propagation** (24-48h)

---

## ⚙️ Étape 4: Variables d'Environnement

### Variables Vercel (Production)
```env
# WordPress (CMS Principal)
NEXT_PUBLIC_WORDPRESS_URL=https://helvetiforma.ch
NEXT_PUBLIC_USE_WORDPRESS=true

# Strapi (Backup - désactivé en production)
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_FALLBACK_TO_STRAPI=false

# Sécurité
NEXT_PUBLIC_WORDPRESS_TOKEN=your_production_token
```

### Variables Locales (Développement)
```env
# WordPress (CMS Principal)
NEXT_PUBLIC_WORDPRESS_URL=https://helvetiforma.ch
NEXT_PUBLIC_USE_WORDPRESS=false

# Strapi (Backup - actif en développement)
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_FALLBACK_TO_STRAPI=true
```

---

## 🔄 Étape 5: Migration des Données

### 1. Migration Strapi → WordPress
```typescript
// Utilisez la fonction de migration
const success = await apiService.migrateFormationToWordPress('strapi_id');
```

### 2. Vérification des Données
1. **Vérifiez WordPress admin**: `https://helvetiforma.ch/wp-admin`
2. **Testez l'API**: `https://helvetiforma.ch/wp-json/helvetiforma/v1/formations`
3. **Comparez** avec Strapi

### 3. Basculement Progressif
1. **Commencez** avec WordPress comme backup
2. **Migrez** formation par formation
3. **Basculez** vers WordPress quand tout est prêt

---

## 🎯 Étape 6: Tests de Production

### 1. Tests Fonctionnels
- [ ] **Page d'accueil** charge correctement
- [ ] **Liste des formations** s'affiche
- [ ] **Détail des formations** fonctionne
- [ ] **Contrôle API** accessible
- [ ] **E-commerce** WooCommerce fonctionne

### 2. Tests de Performance
- [ ] **Temps de chargement** < 3 secondes
- [ ] **SEO** optimisé
- [ ] **Mobile** responsive
- [ ] **SSL** fonctionne

### 3. Tests de Sécurité
- [ ] **HTTPS** obligatoire
- [ ] **Headers** de sécurité
- [ ] **CORS** configuré
- [ ] **API** sécurisée

---

## 🔧 Configuration Avancée

### 1. Optimisation Next.js
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['helvetiforma.ch'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};
```

### 2. Cache et Performance
- **ISR** (Incremental Static Regeneration)
- **Cache** des images
- **Compression** gzip
- **CDN** Vercel

### 3. Monitoring
- **Vercel Analytics**
- **Error tracking**
- **Performance monitoring**

---

## 🚨 Dépannage

### Problèmes Courants

#### 1. Erreur CORS
```javascript
// WordPress: Ajoutez dans functions.php
add_action('rest_api_init', function() {
    header('Access-Control-Allow-Origin: *');
});
```

#### 2. API WordPress non accessible
- Vérifiez que le plugin est activé
- Testez les endpoints REST
- Vérifiez les permissions

#### 3. Images non chargées
- Configurez les domaines dans `next.config.js`
- Vérifiez les URLs des images
- Utilisez le composant `next/image`

---

## 📊 Monitoring Post-Déploiement

### 1. Vercel Dashboard
- **Performance** des pages
- **Erreurs** en temps réel
- **Analytics** des visiteurs

### 2. WordPress Admin
- **Contenu** créé/modifié
- **E-commerce** WooCommerce
- **Plugins** et mises à jour

### 3. Logs et Debugging
- **Console** navigateur
- **Network** tab
- **Vercel** function logs

---

## 🎯 Checklist de Déploiement

### ✅ Pré-déploiement
- [ ] Code testé localement
- [ ] Variables d'environnement configurées
- [ ] WordPress plugin installé
- [ ] Contenu de test créé

### ✅ Déploiement
- [ ] Vercel projet créé
- [ ] Variables d'environnement définies
- [ ] Build réussi
- [ ] Domaine configuré

### ✅ Post-déploiement
- [ ] Tests fonctionnels passés
- [ ] Performance validée
- [ ] SEO vérifié
- [ ] Monitoring activé

---

## 🚀 URLs Finales

### Production
- **Frontend**: `https://helvetiforma.vercel.app` (ou domaine personnalisé)
- **WordPress Admin**: `https://helvetiforma.ch/wp-admin`
- **API WordPress**: `https://helvetiforma.ch/wp-json/helvetiforma/v1/`

### Développement
- **Frontend**: `http://localhost:3000`
- **Strapi**: `http://localhost:1337`
- **Contrôle API**: `http://localhost:3000/api-control`

---

**Votre site sera prêt avec une architecture moderne et scalable!** 🎉

