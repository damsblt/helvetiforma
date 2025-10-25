# 🚀 Guide Complet : Inscription et Paiement pour les Articles

## 🎯 Vue d'ensemble

Ce guide explique le processus complet d'inscription et de paiement pour accéder aux articles premium sur HelvetiForma.

## 📋 Architecture du Système

```
Utilisateur → Inscription/Connexion (Supabase) → Achat Article (Stripe) → Accès Contenu (Sanity)
```

### **Composants :**
- **Supabase** : Gestion des membres et authentification
- **Stripe** : Système de paiement sécurisé
- **Sanity** : Gestion du contenu des articles
- **Next.js** : Interface utilisateur

## 🔐 Processus d'Inscription

### **1. Page d'Inscription** (`/register`)

L'utilisateur peut s'inscrire de deux façons :

#### **Option A : Inscription Directe**
1. Aller sur `/register`
2. Remplir le formulaire :
   - Prénom et nom
   - Email
   - Mot de passe (minimum 6 caractères)
   - Confirmation du mot de passe
3. Cliquer sur "Créer mon compte"
4. Vérifier l'email de confirmation

#### **Option B : Depuis un Article Premium**
1. Visiter un article premium
2. Cliquer sur "Se connecter"
3. Choisir "S'inscrire" sur la page de connexion
4. Suivre le processus d'inscription

### **2. Confirmation Email**

Après l'inscription :
- Un email de confirmation est envoyé
- L'utilisateur doit cliquer sur le lien
- Le compte est activé automatiquement

## 🔑 Processus de Connexion

### **Page de Connexion** (`/login`)

1. Aller sur `/login`
2. Entrer email et mot de passe
3. Cliquer sur "Se connecter"
4. Redirection vers `/posts` (liste des articles)

### **Fonctionnalités Disponibles :**
- Connexion avec email/mot de passe
- Mot de passe oublié (réinitialisation par email)
- Redirection automatique après connexion

## 💳 Processus d'Achat d'Articles

### **1. Découverte d'un Article Premium**

L'utilisateur voit :
- **Badge "Premium"** avec icône dorée
- **Prix en CHF** (ex: 5 CHF)
- **Aperçu gratuit** du contenu
- **Bouton "Acheter pour X CHF"**

### **2. Achat via Stripe**

1. **Clic sur "Acheter"** → Vérification de la connexion
2. **Redirection Stripe** → Page de paiement sécurisée
3. **Saisie des informations** :
   - Numéro de carte
   - Date d'expiration
   - CVV
   - Nom sur la carte
4. **Confirmation** → Paiement traité
5. **Retour sur l'article** → Accès complet débloqué

### **3. Gestion des Paiements**

- **Paiement réussi** → Article débloqué immédiatement
- **Paiement échoué** → Message d'erreur, possibilité de réessayer
- **Paiement annulé** → Retour à l'article sans achat

## 🎨 Interface Utilisateur

### **Articles Premium - Avant Achat**

```html
<div class="premium-gate">
  <h3>Contenu Premium</h3>
  <p>Pour accéder à l'intégralité de cet article premium (5 CHF), effectuez votre achat ci-dessous.</p>
  
  <div class="actions">
    <button class="buy-button">Acheter pour 5 CHF</button>
    <a href="/login" class="login-link">Se connecter</a>
  </div>
</div>
```

### **Articles Premium - Après Achat**

```html
<div class="unlocked-content">
  <h3>✅ Article Premium Débloqué</h3>
  <div class="full-content">
    <!-- Contenu complet de l'article -->
  </div>
</div>
```

## 🔒 Sécurité et Protection

### **Authentification**
- **Sessions sécurisées** avec JWT
- **Validation côté serveur** de tous les achats
- **Protection CSRF** intégrée

### **Paiements**
- **Stripe sécurisé** (PCI DSS compliant)
- **Webhooks vérifiés** pour confirmer les paiements
- **Pas de stockage** des données de carte

### **Contenu**
- **Vérification d'accès** à chaque chargement
- **Cache sécurisé** des permissions
- **Logs d'audit** des achats

## 📊 Gestion des Données

### **Base de Données Supabase**

#### **Table `profiles`**
```sql
- id (UUID, clé primaire)
- email (unique)
- first_name, last_name
- avatar_url
- created_at, updated_at
```

#### **Table `purchases`**
```sql
- id (UUID, clé primaire)
- user_id (référence profiles)
- post_id (ID article Sanity)
- post_title
- amount (en centimes)
- currency (CHF)
- stripe_session_id
- stripe_payment_intent_id
- status (pending/completed/failed/refunded)
- purchased_at
```

### **Row Level Security (RLS)**
- Chaque utilisateur ne voit que ses propres achats
- Protection automatique des données sensibles

## 🚀 Flux Complet d'Exemple

### **Scénario : Alice veut lire un article premium**

1. **Alice visite** `/posts/article-premium`
2. **Système vérifie** : Alice n'est pas connectée
3. **Affichage** : Aperçu + bouton "Se connecter"
4. **Alice clique** → Redirection vers `/login`
5. **Alice s'inscrit** → Formulaire d'inscription
6. **Confirmation email** → Alice clique sur le lien
7. **Alice se connecte** → Retour vers l'article
8. **Système vérifie** : Alice n'a pas acheté l'article
9. **Affichage** : Aperçu + bouton "Acheter pour 5 CHF"
10. **Alice achète** → Redirection Stripe
11. **Paiement réussi** → Webhook enregistre l'achat
12. **Retour article** → Contenu complet débloqué
13. **Alice lit** l'article en entier

## 🛠️ Configuration Technique

### **Variables d'Environnement Requises**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Site
NEXT_PUBLIC_SITE_URL=https://helvetiforma.ch
```

### **Dépendances NPM**

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## 📱 Responsive Design

- **Mobile** : Formulaire adaptatif, boutons tactiles
- **Tablet** : Layout optimisé pour les écrans moyens
- **Desktop** : Interface complète avec sidebar

## 🎯 Avantages de cette Approche

### **Pour les Utilisateurs**
- ✅ **Simple** : Inscription en 2 minutes
- ✅ **Sécurisé** : Paiements protégés
- ✅ **Rapide** : Accès immédiat après achat
- ✅ **Mobile-friendly** : Fonctionne sur tous les appareils

### **Pour l'Administration**
- ✅ **Automatique** : Pas de gestion manuelle
- ✅ **Traçable** : Tous les achats sont enregistrés
- ✅ **Évolutif** : Facile d'ajouter de nouveaux articles
- ✅ **Sécurisé** : Conformité PCI DSS via Stripe

## 🔧 Maintenance

### **Monitoring**
- Logs des achats dans Supabase
- Dashboard Stripe pour les paiements
- Analytics des conversions

### **Support**
- Email de confirmation automatique
- Page de contact intégrée
- Gestion des erreurs utilisateur

---

## 🎉 Résumé

Le système d'inscription et de paiement est maintenant **100% fonctionnel** avec :

1. **Inscription simple** avec email/mot de passe
2. **Paiements sécurisés** via Stripe
3. **Accès immédiat** aux articles achetés
4. **Interface moderne** et responsive
5. **Sécurité maximale** avec RLS et webhooks

Les utilisateurs peuvent maintenant s'inscrire, se connecter et acheter des articles premium en toute sécurité ! 🚀
