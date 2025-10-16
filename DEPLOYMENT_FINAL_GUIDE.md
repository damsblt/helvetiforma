# Guide de Déploiement Final - Architecture WordPress

## 🎯 Vue d'ensemble
L'application HelvetiForma a été migrée vers une architecture hybride :
- **Sanity** : Pages statiques (home, concept, contact)
- **WordPress** : Articles (gratuits/payants), authentification, WooCommerce
- **Next.js** : UI identique, aucun changement visuel

## ✅ État actuel
- ✅ Connexion WordPress établie
- ✅ Articles migrés et accessibles
- ✅ Application Next.js adaptée
- ✅ Client WordPress configuré
- ✅ Système d'authentification WordPress prêt
- ✅ API routes WooCommerce créées

## 🔧 Configuration WordPress requise

### 1. Installer les plugins WordPress

#### 1.1 WooCommerce
1. Allez dans WordPress Admin > Extensions > Ajouter
2. Recherchez "WooCommerce"
3. Installez et activez le plugin
4. Suivez l'assistant de configuration :
   - Devise : CHF
   - Pays : Suisse
   - Méthodes de paiement : Stripe
   - Configurez vos clés Stripe

#### 1.2 Advanced Custom Fields (ACF)
1. Allez dans WordPress Admin > Extensions > Ajouter
2. Recherchez "Advanced Custom Fields"
3. Installez et activez le plugin
4. Créez un groupe de champs "Article Metadata" :
   - `access_level` (Select) : public, members, premium
   - `woocommerce_product_id` (Number)
   - `preview_content` (WYSIWYG)
5. Assignez ce groupe au type de contenu "Articles"

### 2. Ajouter les endpoints personnalisés

#### 2.1 Copier le code PHP
1. Ouvrez le fichier `wordpress-custom-endpoints.php`
2. Copiez tout le contenu
3. Ajoutez-le à `wp-content/themes/[votre-theme]/functions.php`
4. Ou créez un plugin personnalisé avec ce code

#### 2.2 Vérifier les endpoints
Les endpoints suivants doivent être accessibles :
- `GET /wp-json/helvetiforma/v1/posts` - Liste des articles
- `GET /wp-json/helvetiforma/v1/posts/{slug}` - Article par slug
- `GET /wp-json/helvetiforma/v1/check-purchase?postId={id}` - Vérifier achat

### 3. Configurer les articles

#### 3.1 Exécuter le script de configuration
```bash
node scripts/configure-articles-metadata.js
```

#### 3.2 Vérifier la configuration
```bash
node scripts/test-wordpress-integration.js
```

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

### 1. Test des articles
```bash
node scripts/test-nextjs-app.js
```

### 2. Test de l'intégration WordPress
```bash
node scripts/test-wordpress-integration.js
```

### 3. Test complet
```bash
node scripts/final-setup-and-test.js
```

## 🔐 Configuration Stripe

### 1. Clés API
Ajoutez vos clés Stripe dans `.env.local` :
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Webhooks
Configurez les webhooks Stripe vers :
- `https://votre-domaine.com/api/payment/webhook`
- Événements : `checkout.session.completed`, `payment_intent.succeeded`

## 📋 Checklist de déploiement

### WordPress
- [ ] WooCommerce installé et configuré
- [ ] ACF installé et configuré
- [ ] Endpoints personnalisés ajoutés
- [ ] Custom fields configurés
- [ ] Articles avec métadonnées correctes

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
- Vérifiez que les plugins sont activés

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

## 📁 Fichiers importants

### Nouveaux fichiers
- `src/lib/wordpress.ts` - Client WordPress
- `src/lib/wordpress-auth.ts` - Authentification WordPress
- `src/app/api/wordpress/add-to-cart/route.ts` - API WooCommerce
- `wordpress-custom-endpoints.php` - Endpoints WordPress
- `scripts/configure-articles-metadata.js` - Configuration articles
- `scripts/test-wordpress-integration.js` - Tests d'intégration

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
