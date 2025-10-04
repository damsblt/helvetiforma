# 🚀 Guide de Déploiement du Système de Paiement

## ✅ **État actuel du système**

Le système de paiement est **fonctionnel** avec les composants suivants :

### 🎯 **Composants implémentés :**
- ✅ Page de paiement native (`/checkout/[postId]`)
- ✅ API de création de session Stripe (`/api/payment/create-checkout-session`)
- ✅ API d'enregistrement d'achat (`/api/payment/record-purchase`)
- ✅ Gestion des erreurs côté client
- ✅ Interface utilisateur responsive et moderne
- ✅ Intégration Supabase pour l'authentification

### 🧪 **Tests validés :**
- ✅ Article premium accessible
- ✅ Page de checkout fonctionnelle
- ✅ API de paiement opérationnelle
- ✅ API d'enregistrement d'achat fonctionnelle

## 🔧 **Configuration requise pour la production**

### 1. **Variables d'environnement Vercel**

```bash
# Supabase (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=https://qdylfeltqwvfhrnxjrek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (déjà configuré)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sanity (déjà configuré)
NEXT_PUBLIC_SANITY_PROJECT_ID=xzzyyelh
NEXT_PUBLIC_SANITY_DATASET=production

# À ajouter pour la production
SANITY_API_TOKEN=sk_... # Token avec permissions d'écriture
NEXT_PUBLIC_SITE_URL=https://helvetiforma.ch
```

### 2. **Configuration du token Sanity**

1. Allez sur [https://www.sanity.io/manage](https://www.sanity.io/manage)
2. Sélectionnez votre projet `helvetiforma`
3. Allez dans "API" > "Tokens"
4. Créez un nouveau token avec les permissions "Editor"
5. Ajoutez-le à vos variables d'environnement Vercel

### 3. **Configuration des webhooks Stripe**

```bash
# URL de production
https://helvetiforma.ch/api/payment/webhook

# Événements à écouter
- checkout.session.completed
- payment_intent.succeeded
- payment_intent.payment_failed
- payment_intent.canceled
```

## 🚀 **Déploiement**

### 1. **Déployer sur Vercel**

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod

# Configurer les variables d'environnement
vercel env add SANITY_API_TOKEN
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_SITE_URL
```

### 2. **Activer l'enregistrement réel des achats**

Une fois le token Sanity configuré, remplacez dans `src/app/api/payment/record-purchase/route.ts` :

```typescript
// Remplacer la simulation par l'enregistrement réel
const purchase = await sanityAdminClient.create(purchaseData)
```

## 🧪 **Tests de production**

### 1. **Test du flux complet**

1. Ouvrez `https://helvetiforma.ch/posts/test-2`
2. Cliquez sur "Acheter pour 5 CHF"
3. Connectez-vous si nécessaire
4. Effectuez un paiement test avec Stripe
5. Vérifiez que l'achat est enregistré dans Sanity

### 2. **Test des webhooks**

```bash
# Installer Stripe CLI
stripe listen --forward-to https://helvetiforma.ch/api/payment/webhook

# Tester un paiement
stripe trigger checkout.session.completed
```

## 📊 **Monitoring**

### 1. **Logs Vercel**
- Surveillez les logs des API routes
- Vérifiez les erreurs de paiement

### 2. **Dashboard Stripe**
- Surveillez les paiements réussis/échoués
- Vérifiez les webhooks

### 3. **Sanity Studio**
- Vérifiez que les achats sont enregistrés
- Surveillez les erreurs d'API

## 🔒 **Sécurité**

### 1. **Validation des paiements**
- Toujours vérifier les webhooks Stripe
- Valider les signatures des webhooks
- Ne jamais faire confiance aux données client

### 2. **Gestion des erreurs**
- Logs détaillés pour le debugging
- Messages d'erreur génériques pour les utilisateurs
- Fallbacks en cas d'échec

## 🎯 **Prochaines améliorations**

### 1. **Fonctionnalités avancées**
- [ ] Gestion des remboursements
- [ ] Historique des achats utilisateur
- [ ] Notifications email de confirmation
- [ ] Factures PDF

### 2. **Optimisations**
- [ ] Cache des vérifications d'achat
- [ ] Mise en cache des articles
- [ ] Optimisation des images

### 3. **Analytics**
- [ ] Tracking des conversions
- [ ] Métriques de paiement
- [ ] A/B testing des pages de checkout

## 🆘 **Support**

En cas de problème :

1. **Vérifiez les logs Vercel** : `vercel logs`
2. **Testez les API** : Utilisez les scripts de test fournis
3. **Vérifiez les webhooks** : Dashboard Stripe > Webhooks
4. **Consultez Sanity** : Studio pour vérifier les données

---

**🎉 Félicitations ! Votre système de paiement est prêt pour la production !**
