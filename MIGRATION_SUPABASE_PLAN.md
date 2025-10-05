# 🔄 Plan de Migration : Sanity → Supabase

## 🎯 Objectif
Migrer les données utilisateurs de Sanity vers Supabase pour la conformité RGPD et réduire les coûts.

## 📊 Données Actuelles dans Sanity

### **Schémas à migrer :**
```typescript
// Actuellement dans Sanity
user: {
  _id: string
  email: string
  password: string (hashé)
  first_name: string
  last_name: string
  name: string
  createdAt: string
}

purchase: {
  _id: string
  userId: string
  postId: string
  postTitle: string
  amount: number
  stripeSessionId: string
  purchasedAt: string
  status: 'completed' | 'pending' | 'failed'
}
```

## 🏗️ Nouvelle Architecture Supabase

### **1. Configuration Supabase**

```sql
-- Table des profils utilisateurs
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des achats
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  post_title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'chf',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'completed',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_post_id ON purchases(post_id);
CREATE INDEX idx_purchases_status ON purchases(status);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);
```

### **2. Variables d'Environnement**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth avec Supabase
NEXTAUTH_URL=https://helvetiforma.ch
NEXTAUTH_SECRET=your-secret-key

# Garder Sanity pour le contenu (pas les utilisateurs)
NEXT_PUBLIC_SANITY_PROJECT_ID=xzzyyelh
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-sanity-token
```

## 🔧 Migration des Données

### **Script de Migration**

```typescript
// scripts/migrate-to-supabase.ts
import { createClient } from '@supabase/supabase-js'
import { sanityClient } from '../src/lib/sanity'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrateUsers() {
  // 1. Récupérer tous les utilisateurs de Sanity
  const users = await sanityClient.fetch(`*[_type == "user"]`)
  
  // 2. Migrer vers Supabase
  for (const user of users) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.createdAt
      })
    
    if (error) {
      console.error('Error migrating user:', user.email, error)
    } else {
      console.log('✅ Migrated user:', user.email)
    }
  }
}

async function migratePurchases() {
  // 1. Récupérer tous les achats de Sanity
  const purchases = await sanityClient.fetch(`*[_type == "purchase"]`)
  
  // 2. Migrer vers Supabase
  for (const purchase of purchases) {
    const { data, error } = await supabase
      .from('purchases')
      .insert({
        user_id: purchase.userId,
        post_id: purchase.postId,
        post_title: purchase.postTitle,
        amount: purchase.amount,
        stripe_session_id: purchase.stripeSessionId,
        status: purchase.status,
        purchased_at: purchase.purchasedAt
      })
    
    if (error) {
      console.error('Error migrating purchase:', purchase._id, error)
    } else {
      console.log('✅ Migrated purchase:', purchase._id)
    }
  }
}
```

## 🔄 Nouvelle Configuration NextAuth

### **Auth avec Supabase**

```typescript
// lib/auth-supabase.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const supabaseAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Vérifier l'utilisateur dans Supabase
        const { data: user, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', credentials.email)
          .single()

        if (error || !user) {
          return null
        }

        // Vérifier le mot de passe (hashé avec bcrypt)
        const isValid = await bcrypt.compare(credentials.password, user.password_hash)
        
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`.trim()
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        (session.user as any).id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  }
}
```

## 📈 Avantages de la Migration

### **Conformité RGPD**
- ✅ **Droit à l'oubli** : Suppression automatique
- ✅ **Portabilité** : Export des données
- ✅ **Consentement** : Gestion des préférences
- ✅ **Hébergement EU** : Données en Europe

### **Coûts**
- ✅ **Gratuit** : 500MB + 2GB/mois
- ✅ **Pas de limite utilisateurs**
- ✅ **Scaling automatique**

### **Performance**
- ✅ **PostgreSQL** : Base de données robuste
- ✅ **Index optimisés** : Requêtes rapides
- ✅ **Cache intégré** : Performance améliorée

## 🚀 Étapes de Migration

1. **Créer projet Supabase**
2. **Configurer les tables**
3. **Migrer les données**
4. **Mettre à jour NextAuth**
5. **Tester l'authentification**
6. **Déployer en production**
7. **Supprimer les données Sanity**

## ⚠️ Points d'Attention

- **Sauvegarde** : Exporter toutes les données avant migration
- **Tests** : Tester en local d'abord
- **Rollback** : Garder Sanity en parallèle temporairement
- **Notifications** : Informer les utilisateurs du changement
