# 🔄 Configuration Stripe - Changement Facile entre Environnements

## 🎯 Vue d'ensemble

Le système de paiement Stripe est maintenant configuré pour permettre un changement facile entre les environnements de **test** et de **production** en modifiant simplement les variables d'environnement Vercel.

## ✅ Configuration Centralisée

### Variables d'environnement requises

```bash
# Clés Stripe (changez selon l'environnement)
STRIPE_SECRET_KEY=sk_test_... # ou sk_live_... pour la production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # ou pk_live_... pour la production
STRIPE_WEBHOOK_SECRET=whsec_...

# URL de base (change automatiquement les redirections)
NEXT_PUBLIC_SITE_URL=https://helvetiforma.ch # ou http://localhost:3000 pour le dev
```

## 🔧 Changement d'Environnement

### Pour passer en TEST :
```bash
STRIPE_SECRET_KEY=sk_test_51ABC123...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
STRIPE_WEBHOOK_SECRET=whsec_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Pour passer en PRODUCTION :
```bash
STRIPE_SECRET_KEY=sk_live_51ABC123...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ABC123...
STRIPE_WEBHOOK_SECRET=whsec_live_...
NEXT_PUBLIC_SITE_URL=https://helvetiforma.ch
```

## 🚀 Avantages de cette Configuration

### ✅ **URLs Dynamiques**
- Les URLs de redirection Stripe s'adaptent automatiquement selon `NEXT_PUBLIC_SITE_URL`
- Plus d'URLs hardcodées dans le code

### ✅ **Détection Automatique du Mode**
- Le système détecte automatiquement si vous êtes en mode test ou production
- Basé sur le préfixe de la clé secrète (`sk_test_` vs `sk_live_`)

### ✅ **Configuration Centralisée**
- Toute la configuration Stripe est dans `src/lib/stripe.ts`
- Facile à maintenir et à modifier

## 📋 Checklist de Déploiement

### 1. **Variables Vercel - TEST**
- [ ] `STRIPE_SECRET_KEY` = clé test Stripe
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = clé publique test
- [ ] `STRIPE_WEBHOOK_SECRET` = secret webhook test
- [ ] `NEXT_PUBLIC_SITE_URL` = `http://localhost:3000` (ou votre URL de test)

### 2. **Variables Vercel - PRODUCTION**
- [ ] `STRIPE_SECRET_KEY` = clé live Stripe
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = clé publique live
- [ ] `STRIPE_WEBHOOK_SECRET` = secret webhook live
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://helvetiforma.ch`

### 3. **Webhooks Stripe**
- [ ] **Test** : `http://localhost:3000/api/payment/webhook`
- [ ] **Production** : `https://helvetiforma.ch/api/payment/webhook`

## 🔍 Vérification

### Test de la Configuration
```bash
# Vérifier que les URLs sont correctes
curl -X POST https://helvetiforma.ch/api/payment/create-course-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"courseId":123,"userId":456,"amount":50,"courseTitle":"Test","courseSlug":"test"}'
```

### Logs de Debug
Le système affiche automatiquement :
- Mode détecté (test/production)
- URLs de redirection utilisées
- Configuration Stripe active

## 🛠️ Fonctions Utilitaires Disponibles

```typescript
import { 
  STRIPE_CONFIG, 
  getStripeSuccessUrl, 
  getStripeCancelUrl,
  getStripeWebhookUrl 
} from '@/lib/stripe'

// Obtenir l'URL de succès
const successUrl = getStripeSuccessUrl('/courses/mon-cours')

// Obtenir l'URL d'annulation
const cancelUrl = getStripeCancelUrl('/courses/mon-cours')

// Vérifier le mode
const isTestMode = STRIPE_CONFIG.isTestMode
```

## ⚠️ Points d'Attention

1. **Webhooks** : Assurez-vous que les webhooks Stripe pointent vers la bonne URL
2. **Clés** : Ne mélangez jamais les clés test et production
3. **URLs** : Vérifiez que `NEXT_PUBLIC_SITE_URL` correspond à votre environnement
4. **Cache** : Redéployez après changement des variables d'environnement

## 🎉 Résultat

Avec cette configuration, vous pouvez maintenant :
- ✅ Changer d'environnement en modifiant uniquement les variables Vercel
- ✅ Avoir des URLs de redirection automatiques
- ✅ Détecter automatiquement le mode test/production
- ✅ Maintenir une configuration centralisée et propre
