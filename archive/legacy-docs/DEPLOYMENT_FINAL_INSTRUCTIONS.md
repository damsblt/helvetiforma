# Instructions de Déploiement Final - Architecture WordPress

## 🎯 État actuel
✅ **Terminé :**
- Connexion WordPress établie
- Articles migrés et accessibles
- Application Next.js adaptée pour WordPress
- Client WordPress configuré
- Système d'authentification WordPress prêt
- API routes WooCommerce créées
- Plugin personnalisé créé
- Scripts de configuration créés

❌ **À faire :**
- Installer et activer les plugins WordPress
- Configurer les custom fields
- Tester les paiements

## 🔧 Configuration WordPress requise

### 1. Installer le plugin personnalisé

#### 1.1 Copier le plugin
1. Le fichier `wordpress-plugin/helvetiforma-custom-api.php` a été créé
2. Copiez ce fichier dans `wp-content/plugins/helvetiforma-custom-api/`
3. Créez le dossier si nécessaire

#### 1.2 Activer le plugin
1. Allez dans WordPress Admin > Extensions
2. Trouvez "HelvetiForma Custom API"
3. Cliquez sur "Activer"

### 2. Installer WooCommerce

#### 2.1 Installation
1. Allez dans WordPress Admin > Extensions > Ajouter
2. Recherchez "WooCommerce"
3. Installez et activez le plugin
4. Suivez l'assistant de configuration :
   - Devise : CHF
   - Pays : Suisse
   - Méthodes de paiement : Stripe
   - Configurez vos clés Stripe

#### 2.2 Configuration
1. Allez dans WooCommerce > Paramètres
2. Onglet "Général" > Devise : CHF
3. Onglet "Paiements" > Activez Stripe
4. Configurez vos clés Stripe

### 3. Installer Advanced Custom Fields (ACF)

#### 3.1 Installation
1. Allez dans WordPress Admin > Extensions > Ajouter
2. Recherchez "Advanced Custom Fields"
3. Installez et activez le plugin

#### 3.2 Créer le groupe de champs
1. Allez dans Champs personnalisés > Groupes de champs
2. Cliquez sur "Nouveau"
3. Nom : "Article Metadata"
4. Ajoutez les champs :
   - `access_level` (Select) : public, members, premium
   - `woocommerce_product_id` (Number)
   - `preview_content` (WYSIWYG)
5. Assignez ce groupe au type de contenu "Articles"

### 4. Configurer les articles

#### 4.1 Exécuter le script de configuration
```bash
node scripts/configure-articles-with-acf.js
```

#### 4.2 Vérifier la configuration
```bash
node scripts/final-test-complete.js
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

### 1. Test complet
```bash
node scripts/final-test-complete.js
```

### 2. Test des articles
```bash
node scripts/test-nextjs-app.js
```

### 3. Test de l'intégration WordPress
```bash
node scripts/test-wordpress-integration.js
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
- [ ] Plugin helvetiforma-custom-api installé et activé
- [ ] WooCommerce installé et configuré
- [ ] ACF installé et configuré
- [ ] Groupe de champs "Article Metadata" créé
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
- Vérifiez que le plugin helvetiforma-custom-api est activé
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
- `wordpress-plugin/helvetiforma-custom-api.php` - Plugin WordPress
- `scripts/configure-articles-with-acf.js` - Configuration articles
- `scripts/setup-custom-endpoints.js` - Configuration endpoints
- `scripts/final-test-complete.js` - Tests complets

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
node scripts/final-test-complete.js

# Configurer les articles
node scripts/configure-articles-with-acf.js

# Démarrer l'application
npm run dev

# Tester l'application
node scripts/test-nextjs-app.js
```
