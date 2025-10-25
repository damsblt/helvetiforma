# 🤖 Guide d'Automatisation des Articles Premium

Ce guide explique comment configurer l'automatisation pour créer automatiquement des produits WooCommerce lorsqu'un article avec `access_level = "premium"` est ajouté dans Sanity.

## 📋 Vue d'ensemble

L'automatisation fonctionne en 3 étapes :

1. **Détection** : Webhook Sanity détecte la création/modification d'un article
2. **Filtrage** : Vérification que `accessLevel = "premium"` et `price > 0`
3. **Création** : Création automatique du produit WooCommerce correspondant

## 🔧 Configuration

### 1. Variables d'environnement

Ajoutez ces variables à votre fichier `.env.local` :

```bash
# Sanity
SANITY_WEBHOOK_SECRET=your-secret-key-here
SANITY_API_TOKEN=your-sanity-token

# WordPress/WooCommerce
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
WORDPRESS_USER=your-wp-username
WORDPRESS_PASSWORD=your-wp-password

# API interne
INTERNAL_API_SECRET=your-internal-api-secret

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. Configuration du Webhook Sanity

1. **Connectez-vous à Sanity Studio** : `https://helvetiforma.sanity.studio`

2. **Allez dans les paramètres** : Settings → Webhooks

3. **Créez un nouveau webhook** :
   - **Name** : `Article Premium Automation`
   - **URL** : `https://your-domain.com/api/sanity/webhook`
   - **Dataset** : `production`
   - **Trigger on** : `Create`, `Update`
   - **Filter** : `_type == "post"`
   - **Secret** : `your-secret-key-here` (même que `SANITY_WEBHOOK_SECRET`)

4. **Sauvegardez** le webhook

### 3. Vérification de la configuration

Exécutez le script de test :

```bash
node scripts/test-premium-automation.js
```

## 🚀 Fonctionnement

### Création d'un article premium

1. **Dans Sanity Studio** :
   - Créez un nouvel article
   - Définissez `accessLevel = "premium"`
   - Définissez un `price > 0`
   - Publiez l'article

2. **Automatiquement** :
   - Le webhook Sanity se déclenche
   - L'API vérifie que c'est un article premium
   - Un produit WooCommerce est créé avec :
     - Nom = titre de l'article
     - Prix = prix de l'article
     - Type = "simple" (virtuel)
     - Métadonnées liant au post Sanity

### Mise à jour d'un article premium

- Si l'article existe déjà et qu'un produit WooCommerce est lié, le produit sera mis à jour
- Si aucun produit n'est lié, un nouveau sera créé

## 📁 Fichiers créés

### API Routes

- `src/app/api/sanity/webhook/route.ts` - Webhook Sanity
- `src/app/api/woocommerce/create-product/route.ts` - Création produit WooCommerce

### Scripts de test

- `scripts/test-premium-automation.js` - Test de l'automatisation

## 🔍 Dépannage

### Le produit n'est pas créé

1. **Vérifiez les logs** :
   ```bash
   # Logs Vercel
   vercel logs

   # Logs locaux
   npm run dev
   ```

2. **Vérifiez les variables d'environnement** :
   ```bash
   echo $SANITY_WEBHOOK_SECRET
   echo $WORDPRESS_USER
   ```

3. **Testez l'API manuellement** :
   ```bash
   curl -X POST https://your-domain.com/api/woocommerce/create-product \
     -H "Authorization: Bearer your-internal-api-secret" \
     -H "Content-Type: application/json" \
     -d '{"postId":"test","title":"Test","price":25}'
   ```

### Erreurs courantes

- **"WooCommerce non accessible"** : Vérifiez les credentials WordPress
- **"Invalid secret"** : Vérifiez `SANITY_WEBHOOK_SECRET`
- **"Unauthorized"** : Vérifiez `INTERNAL_API_SECRET`

## 🧪 Tests

### Test complet

```bash
node scripts/test-premium-automation.js
```

### Test manuel

1. Créez un article premium dans Sanity
2. Vérifiez les logs de l'API
3. Vérifiez que le produit apparaît dans WooCommerce

## 📊 Monitoring

### Logs à surveiller

- Webhook Sanity : `src/app/api/sanity/webhook/route.ts`
- Création produit : `src/app/api/woocommerce/create-product/route.ts`

### Métriques importantes

- Nombre d'articles premium créés
- Taux de succès de création des produits
- Temps de traitement des webhooks

## 🔒 Sécurité

- **Webhook secret** : Protège contre les appels non autorisés
- **API interne** : Authentification pour les appels internes
- **Validation** : Vérification des données avant création

## 📈 Améliorations futures

- [ ] Gestion des erreurs plus robuste
- [ ] Retry automatique en cas d'échec
- [ ] Notifications en cas d'erreur
- [ ] Dashboard de monitoring
- [ ] Support des catégories WooCommerce
- [ ] Gestion des images de produits

---

## 🎯 Résumé

Cette automatisation permet de :

✅ **Créer automatiquement** des produits WooCommerce pour les articles premium  
✅ **Synchroniser** les prix et titres entre Sanity et WooCommerce  
✅ **Maintenir** la cohérence entre les deux systèmes  
✅ **Économiser** du temps sur la gestion manuelle  

L'automatisation est maintenant prête à être utilisée ! 🚀
