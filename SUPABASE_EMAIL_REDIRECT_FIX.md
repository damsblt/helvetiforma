# 🔧 Correction des Redirections Email Supabase

## 🚨 Problème identifié

Les emails de confirmation Supabase redirigent vers `localhost:3000` au lieu de `helvetiforma.ch`, causant l'erreur :
```
http://localhost:3000/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

## ✅ Solutions à appliquer

### 1. Configuration Vercel (Variables d'environnement)

Ajoutez cette variable dans Vercel → Settings → Environment Variables :

```bash
NEXT_PUBLIC_SITE_URL=https://helvetiforma.ch
```

**Important :** Assurez-vous que cette variable est définie pour **Production**, **Preview**, et **Development**.

### 2. Configuration Supabase Dashboard

Allez dans votre projet Supabase → Authentication → URL Configuration :

#### Site URL
```
https://helvetiforma.ch
```

#### Redirect URLs
Ajoutez ces URLs (une par ligne) :
```
https://helvetiforma.ch
https://helvetiforma.ch/
https://helvetiforma.ch/auth/callback
https://helvetiforma.ch/reset-password
https://helvetiforma.ch/posts
https://helvetiforma.ch/login
https://helvetiforma.ch/register
```

#### Additional Redirect URLs (pour le développement)
```
http://localhost:3000
http://localhost:3000/
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
```

### 3. Vérification des URLs dans le code

Le code a été mis à jour pour utiliser `https://helvetiforma.ch` comme fallback :

```typescript
// Dans src/lib/auth-supabase.ts
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch'

// Dans src/components/auth/LoginForm.tsx
redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch'}/reset-password`
```

## 🧪 Test de la correction

1. **Redéployez** l'application après avoir ajouté la variable Vercel
2. **Testez l'inscription** avec un nouvel email
3. **Vérifiez l'email** reçu - le lien doit maintenant pointer vers `helvetiforma.ch`
4. **Cliquez sur le lien** - vous devriez être redirigé vers le site de production

## 🔍 Debugging

Si le problème persiste, vérifiez :

1. **Variables Vercel** : `NEXT_PUBLIC_SITE_URL` est bien définie
2. **Supabase URLs** : Les URLs de redirection sont correctement configurées
3. **Cache** : Videz le cache du navigateur
4. **Logs** : Vérifiez les logs Vercel pour des erreurs

## 📋 Checklist de vérification

- [ ] Variable `NEXT_PUBLIC_SITE_URL=https://helvetiforma.ch` ajoutée dans Vercel
- [ ] Site URL configuré dans Supabase : `https://helvetiforma.ch`
- [ ] Redirect URLs ajoutées dans Supabase
- [ ] Application redéployée
- [ ] Test d'inscription effectué
- [ ] Email de confirmation reçu avec la bonne URL
- [ ] Redirection fonctionne correctement

## 🚀 Résultat attendu

Après ces corrections, les emails de confirmation Supabase redirigeront correctement vers :
```
https://helvetiforma.ch/#access_token=...&refresh_token=...&expires_in=...
```

Au lieu de :
```
http://localhost:3000/#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```
