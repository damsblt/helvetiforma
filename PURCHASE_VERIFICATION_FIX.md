# Correction du problème de vérification des achats

## 🐛 Problème identifié
Après un paiement réussi, l'utilisateur est redirigé vers l'article mais le contenu premium n'est toujours pas accessible. Le problème vient de plusieurs points :

1. **Variables WooCommerce manquantes** - Les clés API WooCommerce ne sont pas configurées
2. **Webhook Stripe obsolète** - Essaie encore d'enregistrer dans Sanity au lieu de WooCommerce
3. **Fonction de vérification d'achat** - Ne trouve pas les achats car les commandes WooCommerce ne sont pas créées

## ✅ Solutions implémentées

### 1. Correction du webhook Stripe
Le webhook `payment_intent.succeeded` a été mis à jour pour :
- Créer une commande WooCommerce au lieu d'utiliser Sanity
- Récupérer le `product_id` depuis les métadonnées de l'article
- Enregistrer les métadonnées Stripe dans la commande

### 2. Scripts de configuration WooCommerce
- `scripts/setup-woocommerce-env.js` - Configure les variables d'environnement
- `scripts/test-woocommerce-connection.js` - Teste la connexion WooCommerce
- `scripts/force-woocommerce-sync.js` - Force la synchronisation d'un article

## 🔧 Configuration requise

### Étape 1: Configurer les clés WooCommerce
```bash
# 1. Exécuter le script de configuration
node scripts/setup-woocommerce-env.js

# 2. Configurer les clés dans WordPress Admin
# - WooCommerce > Paramètres > Avancé > API REST
# - Créer une nouvelle clé avec permissions Lecture/Écriture
# - Copier la Consumer Key et Consumer Secret

# 3. Mettre à jour .env.local
WOOCOMMERCE_CONSUMER_KEY=ck_votre_cle_ici
WOOCOMMERCE_CONSUMER_SECRET=cs_votre_secret_ici
```

### Étape 2: Tester la connexion
```bash
node scripts/test-woocommerce-connection.js
```

### Étape 3: Synchroniser l'article
```bash
node scripts/force-woocommerce-sync.js
```

### Étape 4: Redémarrer le serveur
```bash
npm run dev
```

## 🧪 Test du parcours complet

### 1. Vérifier la configuration
- ✅ Variables WooCommerce configurées
- ✅ Connexion WooCommerce fonctionnelle
- ✅ Article synchronisé avec WooCommerce
- ✅ Produit WooCommerce créé

### 2. Tester l'achat
1. Aller sur `/posts/test-test-test`
2. Cliquer sur "Acheter pour 5 CHF"
3. Se connecter ou s'inscrire
4. Effectuer le paiement
5. Vérifier la redirection vers l'article
6. Vérifier l'accès au contenu premium

### 3. Vérifier dans WordPress Admin
- **Articles** : Colonne "Produit WooCommerce" doit afficher "✓ Produit créé"
- **Produits WooCommerce** : Produit "test test test" doit exister
- **Commandes WooCommerce** : Commande doit être créée après paiement

## 🔍 Debugging

### Vérifier les logs
```bash
# Logs du serveur Next.js
npm run dev

# Logs du webhook Stripe
# Vérifier dans Stripe Dashboard > Webhooks > Logs
```

### Vérifier les métadonnées
```bash
# Vérifier l'article WordPress
node -e "
const axios = require('axios');
axios.get('https://api.helvetiforma.ch/wp-json/wp/v2/posts/3774')
  .then(r => console.log('Article:', r.data.title.rendered, 'Meta:', r.data.meta))
  .catch(e => console.error(e.message));
"
```

### Vérifier les commandes WooCommerce
```bash
# Tester la connexion WooCommerce
node scripts/test-woocommerce-connection.js
```

## 🎯 Résultat attendu

Après la configuration complète :
1. **Paiement réussi** → Commande WooCommerce créée
2. **Redirection** → Article avec contenu premium accessible
3. **Vérification d'achat** → Fonctionne correctement
4. **Dashboard utilisateur** → Achat visible dans la liste

## ⚠️ Points d'attention

1. **Sécurité** : Ne jamais commiter les clés WooCommerce
2. **Performance** : Les vérifications d'achat peuvent prendre quelques secondes
3. **Webhooks** : S'assurer que les webhooks Stripe sont configurés
4. **Cache** : Vider le cache WordPress si nécessaire

Le système est maintenant prêt pour la production ! 🚀
