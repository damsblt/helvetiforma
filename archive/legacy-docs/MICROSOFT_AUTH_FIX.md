# 🔧 Correction du Problème d'Authentification Microsoft

## 🚨 Problème Identifié

Vous essayez de vous connecter depuis `helvetiforma.ch/login` mais vous êtes redirigé vers `localhost:3000`, ce qui indique un problème de configuration des URLs de redirection.

## ✅ Solutions à Appliquer

### 1. Mise à jour des Variables d'Environnement

Créez ou modifiez votre fichier `.env.local` avec les bonnes URLs de production :

```env
# Microsoft OAuth & Teams Integration
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=your-microsoft-tenant-id

# NextAuth.js Configuration - URLs de PRODUCTION
AUTH_SECRET=your-auth-secret-here
AUTH_URL=https://helvetiforma.ch
NEXTAUTH_URL=https://helvetiforma.ch

# Site Configuration - URL de PRODUCTION
NEXT_PUBLIC_SITE_URL=https://helvetiforma.ch

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production

# WordPress/TutorLMS Integration
NEXT_PUBLIC_WORDPRESS_URL=https://cms.helvetiforma.ch
WORDPRESS_APP_USER=your-wordpress-app-user
WORDPRESS_APP_PASSWORD=your-wordpress-app-password
```

### 2. Configuration dans Azure AD (Portail Microsoft)

1. **Connectez-vous au portail Azure** : https://portal.azure.com
2. **Allez dans "Azure Active Directory"** → **"App registrations"**
3. **Sélectionnez votre application** HelvetiForma
4. **Dans "Authentication"** :
   - Ajoutez cette URL de redirection : `https://helvetiforma.ch/api/auth/callback/microsoft-entra-id`
   - Gardez aussi `http://localhost:3000/api/auth/callback/microsoft-entra-id` pour le développement
5. **Dans "API permissions"** :
   - Vérifiez que vous avez les permissions :
     - `User.Read`
     - `Calendars.ReadWrite`
     - `OnlineMeetings.ReadWrite`
6. **Sauvegardez** les modifications

### 3. Redéploiement de l'Application

Après avoir mis à jour les variables d'environnement :

```bash
# Si vous utilisez Vercel
vercel --prod

# Ou si vous utilisez un autre service de déploiement
npm run build
npm run start
```

### 4. Test de la Connexion

1. **Videz le cache de votre navigateur**
2. **Allez sur** : https://helvetiforma.ch/login
3. **Cliquez sur "Se connecter avec Microsoft"**
4. **Vous devriez être redirigé vers** : `https://helvetiforma.ch/api/auth/callback/microsoft-entra-id`

## 🔍 Vérifications Supplémentaires

### Variables d'Environnement Critiques

Assurez-vous que ces variables sont bien définies en production :

- ✅ `NEXTAUTH_URL=https://helvetiforma.ch`
- ✅ `AUTH_URL=https://helvetiforma.ch`
- ✅ `NEXT_PUBLIC_SITE_URL=https://helvetiforma.ch`
- ✅ `MICROSOFT_CLIENT_ID` (votre ID client Azure)
- ✅ `MICROSOFT_CLIENT_SECRET` (votre secret client Azure)
- ✅ `MICROSOFT_TENANT_ID` (votre ID tenant Azure)

### Configuration NextAuth

La configuration dans `src/auth.ts` est correcte et n'a pas besoin d'être modifiée. Le problème vient uniquement des variables d'environnement.

## 🚀 Après Correction

Une fois ces modifications appliquées :

1. **L'authentification Microsoft fonctionnera** depuis `helvetiforma.ch`
2. **Les redirections se feront** vers le bon domaine
3. **Les sessions seront persistantes** sur le domaine de production
4. **L'accès au calendrier** sera fonctionnel

## 📞 Support

Si le problème persiste après ces corrections, vérifiez :

1. **Les logs de l'application** pour des erreurs spécifiques
2. **La console du navigateur** pour des erreurs JavaScript
3. **Les logs Azure AD** dans le portail Microsoft
4. **La configuration DNS** de votre domaine

---

**Note** : Ce problème est courant lors du passage de l'environnement de développement à la production. La correction des URLs de redirection résout généralement le problème immédiatement.
