# Guide de Migration vers WordPress

## Vue d'ensemble
Ce guide vous accompagne dans la migration de l'application HelvetiForma vers une architecture hybride Sanity + WordPress.

## Architecture finale
- **Sanity** : Pages statiques (home, concept, contact, etc.)
- **WordPress** : Articles (gratuits/payants), authentification, WooCommerce
- **TutorLMS** : Cours uniquement (séparé des articles)
- **Next.js** : UI identique, aucun changement visuel

## Étapes de migration

### 1. Installation des plugins WordPress

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

### 2. Configuration des endpoints WordPress

#### 2.1 Ajouter le code PHP
1. Copiez le contenu du fichier `wordpress-custom-endpoints.php`
2. Ajoutez-le à `wp-content/themes/[votre-theme]/functions.php`
3. Ou créez un plugin personnalisé avec ce code

#### 2.2 Vérifier les endpoints
Les endpoints suivants doivent être accessibles :
- `GET /wp-json/helvetiforma/v1/posts` - Liste des articles
- `GET /wp-json/helvetiforma/v1/posts/{slug}` - Article par slug
- `GET /wp-json/helvetiforma/v1/check-purchase?postId={id}` - Vérifier achat

### 3. Configuration des articles migrés

#### 3.1 Exécuter le script de métadonnées
```bash
node scripts/update-wordpress-metadata.js
```

Ce script va :
- Créer des produits WooCommerce pour les articles premium
- Ajouter les métadonnées `access_level` et `woocommerce_product_id`
- Configurer les prix

#### 3.2 Vérifier la configuration
```bash
node scripts/test-wordpress-integration.js
```

### 4. Test de l'application Next.js

#### 4.1 Démarrer l'application
```bash
npm run dev
```

#### 4.2 Tester les fonctionnalités
1. **Page articles** (`/posts`) :
   - Vérifier l'affichage des articles
   - Vérifier les badges Premium/Public
   - Vérifier les prix

2. **Article individuel** (`/posts/{slug}`) :
   - Vérifier l'affichage du contenu
   - Tester le bouton d'achat pour les articles premium
   - Vérifier la redirection vers WooCommerce

3. **Authentification** :
   - Tester la connexion avec un utilisateur WordPress
   - Vérifier l'accès aux articles membres

4. **Paiement** :
   - Tester l'ajout au panier WooCommerce
   - Compléter un achat test avec Stripe
   - Vérifier l'accès après achat

### 5. Configuration Stripe

#### 5.1 Clés API
Ajoutez vos clés Stripe dans `.env.local` :
```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 5.2 Webhooks
Configurez les webhooks Stripe vers :
- `https://votre-domaine.com/api/payment/webhook`
- Événements : `checkout.session.completed`, `payment_intent.succeeded`

### 6. Nettoyage (optionnel)

#### 6.1 Supprimer NextAuth
Une fois que tout fonctionne, vous pouvez supprimer :
- `src/lib/auth*.ts`
- `src/app/api/auth/`
- Dépendances `next-auth` dans `package.json`

#### 6.2 Garder Sanity pour les pages statiques
Les pages suivantes continuent d'utiliser Sanity :
- `/` (home)
- `/concept`
- `/contact`
- Autres pages statiques

## Dépannage

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

## Support

En cas de problème :
1. Vérifiez les logs d'erreur
2. Testez chaque composant individuellement
3. Consultez la documentation des plugins
4. Contactez le support technique

## Fichiers importants

- `src/lib/wordpress.ts` - Client WordPress
- `src/lib/wordpress-auth.ts` - Authentification WordPress
- `src/app/api/wordpress/add-to-cart/route.ts` - API WooCommerce
- `wordpress-custom-endpoints.php` - Endpoints WordPress
- `scripts/update-wordpress-metadata.js` - Script de configuration
- `scripts/test-wordpress-integration.js` - Tests d'intégration
