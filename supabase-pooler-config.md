# Configuration Supabase Pooler pour Vercel

## 🔧 **Configuration recommandée :**

### 1. **Variables d'environnement pour Vercel :**

```bash
# Dans Vercel Dashboard > Settings > Environment Variables

# Supabase Configuration (Pooler)
NEXT_PUBLIC_SUPABASE_URL=https://qdylfeltqwvfhrnxjrek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWxmZWx0cXd2ZmhybnhqcmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDUyNzAsImV4cCI6MjA3MjIyMTI3MH0.c2LLDSMyTO3cd5qe3HGZc2LW6F3hzM57bo4UCYU6XIY

# Pour les opérations serveur (webhooks, etc.)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeWxmZWx0cXd2ZmhybnhqcmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDUyNzAsImV4cCI6MjA3MjIyMTI3MH0.c2LLDSMyTO3cd5qe3HGZc2LW6F3hzM57bo4UCYU6XIY

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 2. **Configuration du pooler dans Supabase :**

1. Allez dans **Supabase Dashboard** > **Settings** > **Database**
2. Activez le **Transaction Pooler** (mode `transaction`)
3. Utilisez l'URL du pooler : `postgresql://postgres.qdylfeltqwvfhrnxjrek:[YOUR-PASSWORD]@aws-1-eu-central-2.pooler.supabase.com:6543/postgres`

### 3. **Avantages du pooler :**

- ✅ **Connexions optimisées** pour Vercel (serverless)
- ✅ **Meilleure performance** avec les fonctions serverless
- ✅ **Gestion automatique** des connexions
- ✅ **Compatible IPv4** de Vercel

### 4. **Test de la configuration :**

```bash
# Test local
npm run dev

# Test de production
vercel --prod
```

## 🚀 **Déploiement :**

1. **Push du code** vers GitHub
2. **Vercel** détecte automatiquement les changements
3. **Variables d'environnement** configurées dans Vercel
4. **Pooler Supabase** utilisé automatiquement

## 📊 **Monitoring :**

- **Supabase Dashboard** > **Logs** pour voir les connexions
- **Vercel Dashboard** > **Functions** pour les performances
- **Stripe Dashboard** > **Webhooks** pour les paiements
