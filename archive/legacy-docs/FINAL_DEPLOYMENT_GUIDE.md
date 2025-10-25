# Guide de Déploiement Final - Architecture WordPress

## 🎯 État actuel
✅ **Terminé :**
- Connexion WordPress établie
- Articles migrés et accessibles (7 articles)
- Produits WooCommerce créés (3 produits premium)
- Application Next.js adaptée pour WordPress
- Client WordPress configuré
- Système d'authentification WordPress prêt
- API routes WooCommerce créées
- Code des endpoints personnalisés créé

❌ **À faire :**
- Ajouter le code PHP des endpoints à functions.php
- Activer ACF dans WordPress Admin
- Configurer Stripe pour les paiements

## 🔧 Configuration WordPress requise

### 1. Ajouter les endpoints personnalisés

#### 1.1 Copier le code PHP
1. Le fichier `scripts/wordpress-endpoints-final.php` a été créé
2. Copiez tout le contenu de ce fichier
3. Ajoutez-le à `wp-content/themes/[votre-theme]/functions.php`
4. Ou créez un plugin personnalisé avec ce code

#### 1.2 Vérifier les endpoints
Les endpoints suivants doivent être accessibles :
- `GET /wp-json/helvetiforma/v1/posts` - Liste des articles
- `GET /wp-json/helvetiforma/v1/posts/{slug}` - Article par slug

### 2. Activer ACF (optionnel)

#### 2.1 Installation
1. Allez dans WordPress Admin > Extensions > Ajouter
2. Recherchez "Advanced Custom Fields"
3. Installez et activez le plugin

#### 2.2 Créer le groupe de champs (optionnel)
1. Allez dans Champs personnalisés > Groupes de champs
2. Créez "Article Metadata" avec :
   - `access_level` (Select) : public, members, premium
   - `woocommerce_product_id` (Number)
   - `preview_content` (WYSIWYG)

### 3. Configurer Stripe

#### 3.1 Clés API
Ajoutez vos clés Stripe dans `.env.local` :
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 3.2 Webhooks
Configurez les webhooks Stripe vers :
- `https://votre-domaine.com/api/payment/webhook`
- Événements : `checkout.session.completed`, `payment_intent.succeeded`

## 🚀 Déploiement de l'application

### 1. Variables d'environnement
Vérifiez que `.env.local` contient :
```env
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
WORDPRESS_APP_USER=admin
WORDPRESS_APP_PASSWORD=BFTk NM5S 8pDa gxpV PBKt Bpmb
```

### 2. Démarrer l'application
```bash
npm run dev
```

### 3. Tester l'application
1. Visitez `http://localhost:3000/posts`
2. Vérifiez l'affichage des articles
3. Testez un article individuel
4. Vérifiez les badges Premium/Public

## 🧪 Tests de validation

### 1. Test complet
```bash
node scripts/final-configuration-test.js
```

### 2. Test des articles
```bash
node scripts/test-nextjs-app.js
```

### 3. Test de l'intégration WordPress
```bash
node scripts/test-wordpress-integration.js
```

## 📋 Checklist de déploiement

### WordPress
- [ ] Endpoints personnalisés ajoutés à functions.php
- [ ] WooCommerce installé et configuré
- [ ] ACF installé et activé (optionnel)
- [ ] Articles avec métadonnées correctes
- [ ] Produits WooCommerce créés pour articles premium

### Next.js
- [ ] Variables d'environnement configurées
- [ ] Application démarre sans erreur
- [ ] Page articles affiche les articles WordPress
- [ ] Articles individuels fonctionnent
- [ ] Boutons de paiement fonctionnent

### Stripe
- [ ] Clés API configurées
- [ ] Webhooks configurés
- [ ] Paiements de test fonctionnent

## 🐛 Dépannage

### Problèmes courants

#### 1. "Aucune route correspondante" (404)
- Vérifiez que le code PHP est bien ajouté à `functions.php`
- Vérifiez que les endpoints sont accessibles

#### 2. "WooCommerce non accessible"
- Vérifiez que WooCommerce est installé et activé
- Vérifiez les permissions de l'utilisateur Application Password

#### 3. "ACF non accessible"
- Vérifiez qu'ACF est installé et activé
- Vérifiez que les champs personnalisés sont créés

#### 4. Erreurs d'authentification
- Vérifiez les variables d'environnement WordPress
- Vérifiez que l'Application Password est correct

### Logs utiles
- WordPress : `wp-content/debug.log`
- Next.js : Console du navigateur
- Stripe : Dashboard > Webhooks > Logs

## 📁 Fichiers créés

### Nouveaux fichiers
- `src/lib/wordpress.ts` - Client WordPress
- `src/lib/wordpress-auth.ts` - Authentification WordPress
- `src/app/api/wordpress/add-to-cart/route.ts` - API WooCommerce
- `scripts/wordpress-endpoints-final.php` - Code des endpoints
- `scripts/complete-final-setup.js` - Configuration finale
- `scripts/final-configuration-test.js` - Tests complets

### Fichiers modifiés
- `src/app/(site)/posts/page.tsx` - Page articles
- `src/app/(site)/posts/[slug]/page.tsx` - Page article individuel
- `src/components/PaymentButton.tsx` - Bouton de paiement
- `.env.local` - Variables d'environnement

## 🎉 Résultat final

Une fois la configuration terminée, vous aurez :
- Une application Next.js fonctionnelle
- Des articles gérés par WordPress
- Un système de paiement WooCommerce + Stripe
- Une authentification WordPress
- Une UI identique à l'original
- Des articles premium et gratuits

## 📞 Support

En cas de problème :
1. Vérifiez les logs d'erreur
2. Testez chaque composant individuellement
3. Consultez la documentation des plugins
4. Contactez le support technique

## 🚀 Commandes rapides

```bash
# Tester la configuration
node scripts/final-configuration-test.js

# Configuration finale
node scripts/complete-final-setup.js

# Démarrer l'application
npm run dev

# Tester l'application
node scripts/test-nextjs-app.js
```

## 💰 Articles premium configurés

- **Test transaction 4** : 1 CHF (Produit WooCommerce: 3700)
- **test 2** : 5 CHF (Produit WooCommerce: 3701)
- **Les charges sociales** : 10 CHF (Produit WooCommerce: 3702)

## 📝 Code PHP à ajouter

Copiez le contenu de `scripts/wordpress-endpoints-final.php` et ajoutez-le à `wp-content/themes/[votre-theme]/functions.php` ou créez un plugin personnalisé avec ce code.
