# 🚀 Configuration Hybride: Next.js + WordPress Headless

## Vue d'ensemble

Cette approche vous permet de garder votre frontend Next.js tout en utilisant WordPress comme CMS headless, avec Strapi comme backup.

## 📋 Architecture

```
Next.js Frontend
├── WordPress API (CMS principal)
└── Strapi API (backup/fallback)
```

---

## 🛠️ Installation WordPress Headless

### Step 1: Installer le Plugin WordPress

1. **Allez dans votre WordPress admin** (`yourdomain.com/wp-admin`)
2. **Naviguez vers**: Plugins > Add New > Upload Plugin
3. **Uploadez**: `helvetiforma-headless-plugin.php`
4. **Activez le plugin**

### Step 2: Configurer les Custom Post Types

Le plugin crée automatiquement:
- **Formations** (post type)
- **Modules** (post type)
- **Taxonomies** (thèmes, types, niveaux)

### Step 3: Tester l'API

Testez les endpoints:
- `https://yourdomain.com/wp-json/helvetiforma/v1/formations`
- `https://yourdomain.com/wp-json/helvetiforma/v1/formations/1`

---

## 🔧 Configuration Next.js

### Step 1: Variables d'environnement

Créez un fichier `.env.local` dans votre projet Next.js:

```env
# Strapi Configuration (Backup)
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

# WordPress Configuration (Principal)
NEXT_PUBLIC_WORDPRESS_URL=https://yourdomain.com

# API Source Control
NEXT_PUBLIC_USE_WORDPRESS=false
NEXT_PUBLIC_FALLBACK_TO_STRAPI=true
```

### Step 2: Utiliser le Service API

Remplacez vos appels API existants par le nouveau service:

```typescript
// Avant (Strapi seulement)
const res = await fetch(`http://localhost:1337/api/formations/${id}`);

// Après (WordPress + Fallback Strapi)
import apiService from '../services/apiService';
const formation = await apiService.getFormation(id);
```

### Step 3: Ajouter le Composant de Contrôle

Ajoutez le composant `ApiToggle` dans votre admin:

```tsx
import ApiToggle from '../components/ApiToggle';

// Dans votre composant
<ApiToggle onApiChange={(apiSource) => {
  console.log('API changed to:', apiSource);
}} />
```

---

## 🔄 Migration des Données

### Step 1: Préparer la Migration

1. **Sauvegardez vos données Strapi**
2. **Vérifiez la connectivité WordPress**
3. **Testez l'API WordPress**

### Step 2: Migrer Formation par Formation

```typescript
// Utilisez la fonction de migration
const success = await apiService.migrateFormationToWordPress('strapi_formation_id');
```

### Step 3: Vérifier la Migration

1. **Vérifiez dans WordPress admin**
2. **Testez les endpoints API**
3. **Comparez les données**

---

## 🎯 Utilisation

### Basculer entre APIs

```typescript
// Basculer vers WordPress
apiService.toggleApi(true);

// Basculer vers Strapi
apiService.toggleApi(false);
```

### Vérifier la santé des APIs

```typescript
const health = await apiService.checkApiHealth();
console.log('WordPress:', health.wordpress);
console.log('Strapi:', health.strapi);
```

### Gestion des erreurs avec fallback

```typescript
try {
  const formation = await apiService.getFormation(id);
  // Utilise WordPress ou Strapi automatiquement
} catch (error) {
  // Fallback automatique si configuré
  console.error('Both APIs failed:', error);
}
```

---

## 🔧 Configuration Avancée

### Endpoints API WordPress

- **Formations**: `/wp-json/helvetiforma/v1/formations`
- **Formation spécifique**: `/wp-json/helvetiforma/v1/formations/{id}`
- **Filtres**: `?theme=salaire&type=online&difficulty=debutant`

### Endpoints API Strapi (existants)

- **Formations**: `/api/formations`
- **Formation spécifique**: `/api/formations/{id}`
- **Filtres**: `?filters[Theme][$eq]=Salaire`

---

## 🚨 Dépannage

### Problèmes WordPress API

1. **Vérifiez que le plugin est activé**
2. **Testez les endpoints REST**
3. **Vérifiez les permissions**

### Problèmes de Fallback

1. **Vérifiez les variables d'environnement**
2. **Testez la connectivité des deux APIs**
3. **Vérifiez les logs de console**

### Problèmes de Migration

1. **Vérifiez les tokens d'authentification**
2. **Vérifiez les permissions WordPress**
3. **Testez avec une formation simple**

---

## 📊 Monitoring

### Vérifier les APIs

```typescript
// Vérification automatique
const health = await apiService.checkApiHealth();

// Afficher le statut
console.log('WordPress:', health.wordpress ? '✅' : '❌');
console.log('Strapi:', health.strapi ? '✅' : '❌');
```

### Logs de Performance

Le service API log automatiquement:
- **Temps de réponse** de chaque API
- **Erreurs** et fallbacks
- **Changements** d'API source

---

## 🎯 Avantages de cette Approche

### ✅ Pour vous:
- **Gardez votre design Next.js** (pas de refonte)
- **WordPress pour le contenu** (facile à gérer)
- **Strapi comme backup** (sécurité)
- **Migration progressive** (pas de rush)

### ✅ Pour votre business:
- **E-commerce intégré** (WooCommerce)
- **Gestion de contenu facile** (WordPress)
- **Performance optimale** (Next.js)
- **Scalabilité** (architecture moderne)

---

## 🚀 Prochaines Étapes

1. **Installez le plugin WordPress**
2. **Configurez les variables d'environnement**
3. **Testez les APIs**
4. **Migrez vos données**
5. **Basculez vers WordPress**
6. **Gardez Strapi comme backup**

---

**Votre plateforme sera prête avec le meilleur des deux mondes!** 🎉

