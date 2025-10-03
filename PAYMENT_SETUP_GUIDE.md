# 💳 Guide de Configuration du Système de Paiement

## 🎯 Vue d'ensemble

Le système de paiement est maintenant intégré avec Stripe pour gérer les articles premium. Les utilisateurs peuvent acheter des articles à 5 CHF (ou tout autre prix configuré).

---

## 🔧 Configuration Requise

### 1. Variables d'Environnement

Ajoutez ces variables à votre fichier `.env.local` :

```bash
# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. Configuration Stripe

1. **Créez un compte Stripe** : https://stripe.com
2. **Récupérez vos clés** dans le Dashboard Stripe :
   - `STRIPE_SECRET_KEY` : Clé secrète (sk_test_...)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` : Clé publique (pk_test_...)

3. **Configurez le webhook** :
   - URL : `https://votre-domaine.com/api/payment/webhook`
   - Événements : `checkout.session.completed`
   - Récupérez le secret webhook (whsec_...)

---

## 🚀 Fonctionnalités Implémentées

### ✅ **API de Paiement**
- **Endpoint** : `/api/payment/create-checkout-session`
- **Méthode** : POST
- **Fonction** : Crée une session de paiement Stripe

### ✅ **Webhook de Paiement**
- **Endpoint** : `/api/payment/webhook`
- **Fonction** : Traite les paiements réussis et enregistre les achats

### ✅ **Suivi des Achats**
- **Schéma Sanity** : `purchase`
- **Fonction** : Vérifie si un utilisateur a acheté un article

### ✅ **Interface Utilisateur**
- **Bouton de paiement** : Design moderne avec loading
- **Gating premium** : Affiche le bouton d'achat pour les articles premium

---

## 🎨 Utilisation

### Pour les Articles Premium

1. **Dans Sanity Studio** :
   - Sélectionnez "Premium (Payant)" comme niveau d'accès
   - Définissez le prix en CHF
   - Ajoutez un aperçu gratuit

2. **Sur le site** :
   - Les utilisateurs non connectés voient un message de connexion
   - Les utilisateurs connectés voient le bouton d'achat
   - Après achat, l'article devient accessible

### Flux de Paiement

```
1. Utilisateur clique "Acheter pour 5 CHF"
2. Redirection vers Stripe Checkout
3. Paiement par carte bancaire
4. Webhook enregistre l'achat dans Sanity
5. Redirection vers l'article (maintenant accessible)
```

---

## 🔍 Test du Système

### 1. Mode Test Stripe

Utilisez les cartes de test :
- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0025 0000 3155`

### 2. Vérification des Achats

```bash
# Vérifier les achats dans Sanity
cd sanity && node scripts/check-purchases.js
```

### 3. Logs de Débogage

Les logs sont disponibles dans :
- Console du navigateur (erreurs frontend)
- Logs du serveur (erreurs API)
- Dashboard Stripe (événements webhook)

---

## 🛠️ Maintenance

### Vérifier les Achats

```typescript
import { checkUserPurchase } from '@/lib/purchases'

const hasPurchased = await checkUserPurchase('user-id', 'post-id')
```

### Récupérer les Achats d'un Utilisateur

```typescript
import { getUserPurchases } from '@/lib/purchases'

const purchases = await getUserPurchases('user-id')
```

### Gérer les Remboursements

1. Dans le Dashboard Stripe
2. Ou via l'API Stripe
3. Mettre à jour le statut dans Sanity

---

## 🔒 Sécurité

### ✅ **Mesures Implémentées**
- Validation des webhooks Stripe
- Vérification des sessions utilisateur
- Chiffrement des données sensibles
- Logs d'audit des achats

### ⚠️ **Recommandations**
- Utilisez HTTPS en production
- Surveillez les tentatives de fraude
- Sauvegardez régulièrement les données d'achat
- Testez régulièrement le système

---

## 🚨 Dépannage

### Problèmes Courants

1. **Bouton de paiement ne s'affiche pas**
   - Vérifiez que l'article est en mode "Premium"
   - Vérifiez que l'utilisateur est connecté

2. **Erreur de paiement**
   - Vérifiez les clés Stripe
   - Vérifiez la configuration du webhook

3. **Achat non enregistré**
   - Vérifiez les logs du webhook
   - Vérifiez la configuration Sanity

### Support

- **Documentation Stripe** : https://stripe.com/docs
- **Logs Sanity** : Dashboard Sanity Studio
- **Logs Next.js** : Console du serveur

---

## 🎉 Résultat Final

Votre système de paiement est maintenant opérationnel ! Les utilisateurs peuvent :

- ✅ Voir les articles premium avec leur prix
- ✅ Acheter des articles via Stripe Checkout
- ✅ Accéder au contenu après achat
- ✅ Leur achat est enregistré et vérifié automatiquement

**Prochaines étapes** : Configurez vos clés Stripe et testez le système ! 🚀
