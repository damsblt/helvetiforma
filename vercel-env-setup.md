# Configuration des Variables d'Environnement Vercel

## Variables à Ajouter dans Vercel :

### 1. Tutor LMS Configuration
```
TUTOR_API_URL=https://api.helvetiforma.ch
TUTOR_API_KEY=key_41b07de3d8e6e2d21df756ed2dff73ad
TUTOR_SECRET_KEY=secret_c59d6489d2bb179380853bed081688c8d2a86b9e471f34ec44660359597f127f
```

### 2. WordPress Configuration
```
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
WORDPRESS_WEBHOOK_SECRET=helvetiforma-webhook-secret-2025-db1991
```

### 3. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://qdylfeltqwvfhrnxjrek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_pFlvHkzbkx3Zg-Dc6R-l1g_XSdHaRgy
```

## Comment Ajouter les Variables :

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `helvetiforma`
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez chaque variable une par une
5. Redéployez votre projet

## Avantages de cette Approche :

✅ **Pas de plugin WordPress** nécessaire
✅ **Configuration via variables d'environnement**
✅ **API Next.js** directe vers WordPress
✅ **Plus simple** à maintenir
✅ **Plus sécurisé** (clés dans Vercel)

