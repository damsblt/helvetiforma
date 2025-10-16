# Configuration des Achats WordPress/WooCommerce

## 🎯 Migration Terminée

Le système d'achats a été complètement migré de Sanity vers WordPress/WooCommerce.

## 🔧 Configuration Requise

### 1. Variables d'Environnement

Ajoutez ces variables à votre fichier `.env.local` :

```bash
# WordPress
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch

# WooCommerce API
WOOCOMMERCE_CONSUMER_KEY=ck_...
WOOCOMMERCE_CONSUMER_SECRET=cs_...

# Stripe (déjà configuré)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Configuration WooCommerce

1. **Générer les clés API WooCommerce** :
   - Allez dans WordPress Admin > WooCommerce > Paramètres > Avancé > REST API
   - Cliquez sur "Ajouter une clé"
   - Description : "HelvetiForma Next.js"
   - Utilisateur : Admin
   - Permissions : Lecture/Écriture
   - Copiez la Consumer Key et Consumer Secret

2. **Configurer les produits** :
   - Chaque article premium doit avoir un produit WooCommerce associé
   - Le champ ACF `woocommerce_product_id` doit contenir l'ID du produit

## 🚀 Fonctionnalités Implémentées

### ✅ **Stockage des Achats**
- **Commandes WooCommerce** : Chaque achat crée une commande
- **Métadonnées Stripe** : Session ID et Payment Intent ID stockés
- **Liaison Article** : `_post_id` dans les métadonnées de commande

### ✅ **Vérification des Achats**
- **API `/api/check-purchase`** : Vérifie via WooCommerce
- **API `/api/user/purchases`** : Liste les commandes utilisateur
- **Fonction WordPress** : `checkWordPressPurchase()`

### ✅ **Webhook Stripe**
- **Création automatique** : Commande WooCommerce à chaque paiement réussi
- **Récupération produit** : Via `woocommerce_product_id` ACF
- **Métadonnées complètes** : Stripe + Article WordPress

## 🔄 **Nouveau Flux d'Achat**

```
1. Sélection article → Bouton "Acheter"
2. Page checkout → /checkout/[postId]
3. Paiement Stripe → Elements intégré
4. Webhook Stripe → Création commande WooCommerce
5. Vérification achat → WooCommerce API
6. Accès article → Fonction WordPress
```

## 📊 **Avantages**

- **Unifié** : Tout dans WordPress/WooCommerce
- **Standard** : Utilise les fonctionnalités natives WooCommerce
- **Évolutif** : Facile d'ajouter des fonctionnalités e-commerce
- **Maintenable** : Plus de dépendance Sanity

## 🧪 **Test du Système**

1. **Créer un article premium** avec `woocommerce_product_id`
2. **Tester l'achat** via la page checkout
3. **Vérifier la commande** dans WordPress Admin
4. **Tester l'accès** à l'article après achat

Le système est maintenant entièrement basé sur WordPress/WooCommerce !
