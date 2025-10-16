# 🤖 Guide d'Automatisation WordPress - Articles Premium

Ce guide explique comment configurer l'automatisation pour créer automatiquement des produits WooCommerce lorsqu'un article avec `access_level = "premium"` est ajouté dans **WordPress**.

## 📋 Vue d'ensemble

L'automatisation fonctionne directement dans WordPress avec un plugin personnalisé qui :

1. **Détecte** la création/modification d'articles WordPress
2. **Vérifie** que `access_level = "premium"` et `price > 0`
3. **Crée** automatiquement le produit WooCommerce correspondant
4. **Lie** le produit à l'article via des métadonnées

## 🔧 Installation

### Méthode 1 : Installation automatique (recommandée)

```bash
node scripts/install-wordpress-premium-plugin.js
```

### Méthode 2 : Installation manuelle

1. **Téléchargez le plugin** :
   - Fichier : `wordpress-plugin/helvetiforma-premium-automation.php`

2. **Uploadez dans WordPress** :
   - Créez le dossier : `/wp-content/plugins/helvetiforma-premium-automation/`
   - Uploadez le fichier dans ce dossier

3. **Activez le plugin** :
   - Allez dans l'admin WordPress → Plugins
   - Activez "HelvetiForma Premium Automation"

## ⚙️ Configuration

### Prérequis

- ✅ WordPress 5.0+
- ✅ WooCommerce 5.0+
- ✅ Permissions d'édition des articles
- ✅ Permissions de création de produits

### Variables d'environnement

Assurez-vous que ces variables sont configurées dans `.env.local` :

```bash
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
WORDPRESS_USER=gibivawa
WORDPRESS_PASSWORD=0FU5 nwzs hUZG Q065 0Iby 2USq
```

## 🚀 Utilisation

### Créer un article premium

1. **Dans l'admin WordPress** :
   - Allez dans Articles → Ajouter
   - Remplissez le titre et le contenu

2. **Configurez les paramètres premium** :
   - Dans la boîte "Paramètres Premium" (à droite) :
     - **Niveau d'accès** : Sélectionnez "Premium"
     - **Prix (CHF)** : Entrez le prix (ex: 29.90)

3. **Publiez l'article** :
   - Cliquez sur "Publier"
   - Le produit WooCommerce sera créé automatiquement !

### Gestion des articles premium

#### Interface d'administration

- **Liste des articles** : Colonnes ajoutées pour voir le niveau d'accès et le produit lié
- **Édition d'article** : Boîte "Paramètres Premium" pour configurer l'accès et le prix
- **Liaison produit** : Lien direct vers le produit WooCommerce créé

#### Métadonnées automatiques

Le plugin ajoute automatiquement ces métadonnées :

**À l'article WordPress :**
- `access_level` : "premium", "members", ou "public"
- `price` : Prix en CHF
- `woocommerce_product_id` : ID du produit lié

**Au produit WooCommerce :**
- `article_post_id` : ID de l'article source
- `article_type` : "premium"
- `article_slug` : Slug de l'article

## 🔍 Fonctionnement détaillé

### Hooks WordPress utilisés

1. **`save_post`** : Détecte la sauvegarde d'articles
2. **`transition_post_status`** : Détecte les changements de statut
3. **`before_delete_post`** : Gère la suppression d'articles

### Logique d'automatisation

```php
// Pseudo-code de la logique
if (article.access_level === 'premium' && article.price > 0) {
    if (produit_existe_déjà) {
        mettre_à_jour_produit();
    } else {
        créer_nouveau_produit();
    }
} else {
    supprimer_produit_lié();
}
```

### Gestion des statuts

- **Publier** : Crée/active le produit WooCommerce
- **Brouillon** : Désactive le produit (statut "draft")
- **Supprimer** : Supprime le produit lié

## 📊 Monitoring et logs

### Logs WordPress

Les actions sont loggées dans les logs WordPress :

```
HelvetiForma: Produit WooCommerce créé (ID: 123) pour l'article 456
HelvetiForma: Produit WooCommerce mis à jour (ID: 123) pour l'article 456
HelvetiForma: Produit WooCommerce supprimé (ID: 123) pour l'article 456
```

### Notifications admin

- ✅ Notifications de succès lors de la création de produits
- ⚠️ Avertissements si WooCommerce n'est pas actif
- 📊 Colonnes dans la liste des articles pour le suivi

## 🧪 Tests

### Test automatique

```bash
node scripts/install-wordpress-premium-plugin.js
```

### Test manuel

1. **Créez un article premium** :
   - Titre : "Test Article Premium"
   - Niveau d'accès : Premium
   - Prix : 25.00 CHF
   - Publiez l'article

2. **Vérifiez la création** :
   - Allez dans WooCommerce → Produits
   - Cherchez "Test Article Premium"
   - Vérifiez que le produit est créé avec le bon prix

3. **Vérifiez la liaison** :
   - Dans l'article, vérifiez la boîte "Paramètres Premium"
   - Le lien vers le produit WooCommerce doit être visible

## 🔧 Dépannage

### Le produit n'est pas créé

1. **Vérifiez que WooCommerce est actif** :
   - Allez dans Plugins → Vérifiez que WooCommerce est activé

2. **Vérifiez les logs WordPress** :
   - Allez dans Outils → Santé du site → Info → Logs d'erreur

3. **Vérifiez les permissions** :
   - L'utilisateur doit avoir les permissions d'édition des articles
   - L'utilisateur doit avoir les permissions de création de produits

### Erreurs courantes

- **"WooCommerce n'est pas actif"** : Activez WooCommerce d'abord
- **"Permissions insuffisantes"** : Vérifiez les rôles utilisateur
- **"Produit non créé"** : Vérifiez les logs pour les erreurs détaillées

## 📈 Avantages

✅ **Intégration native** - Fonctionne directement dans WordPress  
✅ **Automatisation complète** - Plus de création manuelle de produits  
✅ **Synchronisation** - Prix et titres synchronisés automatiquement  
✅ **Gestion des statuts** - Produits activés/désactivés selon le statut de l'article  
✅ **Interface intuitive** - Boîtes de métadonnées et colonnes personnalisées  
✅ **Logs détaillés** - Suivi complet des opérations  
✅ **Gestion des erreurs** - Notifications et logs pour le debugging  

## 🔒 Sécurité

- **Validation des données** : Tous les inputs sont validés et sanitizés
- **Vérification des permissions** : Contrôle d'accès pour toutes les opérations
- **Nonces WordPress** : Protection CSRF pour les formulaires
- **Échappement** : Toutes les sorties sont échappées

## 📋 Résumé

L'automatisation WordPress est maintenant active ! Dès qu'un article avec `access_level = "premium"` et `price > 0` est créé ou modifié dans WordPress, un produit WooCommerce correspondant sera automatiquement créé, mis à jour ou supprimé selon le cas.

L'automatisation est **prête à être utilisée en production** ! 🚀
