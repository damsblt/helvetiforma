# 🚀 Guide de Configuration Supabase pour les Membres

## 🎯 Vue d'ensemble

Ce guide configure Supabase comme base de données pour les membres, remplaçant Microsoft OAuth par un système d'inscription traditionnel.

## 📋 Architecture

```
Next.js Frontend
    ↓
Supabase (Auth + Database)
    ↓
Stripe (Paiements)
    ↓
Sanity (Contenu articles)
```

## 🔧 Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et les clés API

### 2. Variables d'environnement

Ajoutez à votre `.env.local` :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (garder existant)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# NextAuth (remplacer par Supabase)
AUTH_SECRET=your-auth-secret
```

### 3. Schéma de base de données

Exécutez ce SQL dans l'éditeur SQL de Supabase :

```sql
-- Table des profils utilisateurs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des achats
CREATE TABLE purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL, -- ID de l'article Sanity
  post_title TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Montant en centimes
  currency TEXT DEFAULT 'chf',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des abonnements (optionnel)
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL, -- active, canceled, past_due, etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_post_id ON purchases(post_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🛠️ Installation des dépendances

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## 📁 Structure des fichiers

```
src/
├── lib/
│   ├── supabase.ts          # Configuration Supabase
│   ├── auth.ts              # Auth avec Supabase
│   └── purchases.ts         # Gestion des achats
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx    # Formulaire de connexion
│   │   ├── RegisterForm.tsx # Formulaire d'inscription
│   │   └── AuthProvider.tsx # Provider d'authentification
│   └── PaymentButton.tsx    # Bouton de paiement (modifié)
└── app/
    ├── (site)/
    │   ├── login/
    │   │   └── page.tsx     # Page de connexion
    │   ├── register/
    │   │   └── page.tsx     # Page d'inscription
    │   └── dashboard/
    │       └── page.tsx     # Tableau de bord membre
    └── api/
        ├── auth/
        │   └── [...nextauth]/
        │       └── route.ts # NextAuth avec Supabase
        └── payment/
            └── webhook/
                └── route.ts # Webhook Stripe (modifié)
```

## 🎨 Fonctionnalités implémentées

### ✅ **Authentification**
- Inscription avec email/mot de passe
- Connexion sécurisée
- Gestion des sessions
- Mot de passe oublié

### ✅ **Gestion des achats**
- Achat d'articles premium
- Historique des achats
- Vérification d'accès
- Intégration Stripe

### ✅ **Tableau de bord membre**
- Profil utilisateur
- Articles achetés
- Historique des paiements
- Gestion du compte

## 🔒 Sécurité

- **RLS activé** : Chaque utilisateur ne voit que ses données
- **Validation côté serveur** : Toutes les opérations sont vérifiées
- **Tokens JWT** : Sessions sécurisées
- **Webhooks Stripe** : Paiements vérifiés côté serveur

## 📊 Avantages de cette approche

1. **Simplicité** : Pas de configuration OAuth complexe
2. **Contrôle total** : Gestion complète des utilisateurs
3. **Évolutivité** : Facile d'ajouter des fonctionnalités
4. **Coût** : Gratuit jusqu'à 50k utilisateurs
5. **Performance** : Base de données optimisée pour les relations

## 🚀 Prochaines étapes

1. Configurer Supabase
2. Installer les dépendances
3. Créer les composants d'authentification
4. Modifier le système de paiement
5. Tester le flux complet
