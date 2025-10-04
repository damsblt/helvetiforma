# 🔍 Diagnostic Email Supabase - Problème Résolu

## ✅ **Test effectué :**
- ✅ Code fonctionne correctement
- ✅ Supabase accepte l'envoi d'emails
- ✅ URL de redirection `https://helvetiforma.ch/reset-password` est valide

## 🚨 **Problème identifié :**
Les emails ne sont plus envoyés après la configuration Supabase. Cela indique un problème de configuration des URLs autorisées.

## 🔧 **Solutions à appliquer :**

### 1. **Vérifier la configuration Supabase**

Allez dans Supabase → Authentication → URL Configuration et vérifiez :

#### Site URL
```
https://helvetiforma.ch
```

#### Redirect URLs (AJOUTEZ TOUTES CES URLs)
```
https://helvetiforma.ch
https://helvetiforma.ch/
https://helvetiforma.ch/auth/callback
https://helvetiforma.ch/reset-password
https://helvetiforma.ch/posts
https://helvetiforma.ch/login
https://helvetiforma.ch/register
http://localhost:3000
http://localhost:3000/
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
```

### 2. **Ajouter la variable Vercel**

Dans Vercel → Settings → Environment Variables :

```bash
NEXT_PUBLIC_SITE_URL=https://helvetiforma.ch
```

**Important :** Définissez cette variable pour **Production**, **Preview**, et **Development**.

### 3. **Vérifier les templates d'email**

Dans Supabase → Authentication → Email Templates :

#### Confirm signup
- Vérifiez que le template utilise `{{ .SiteURL }}`
- L'URL doit pointer vers `https://helvetiforma.ch`

#### Reset password
- Vérifiez que le template utilise `{{ .SiteURL }}`
- L'URL doit pointer vers `https://helvetiforma.ch`

### 4. **Redéployer l'application**

Après avoir ajouté la variable Vercel :
1. Allez dans Vercel → Deployments
2. Cliquez sur "Redeploy" pour la dernière version
3. Attendez que le déploiement soit terminé

### 5. **Tester l'envoi d'email**

1. Allez sur `https://helvetiforma.ch/login`
2. Cliquez sur "Mot de passe oublié ?"
3. Entrez un email valide
4. Vérifiez que l'email arrive

## 🔍 **Debugging avancé**

Si le problème persiste, vérifiez :

### Logs Supabase
1. Allez dans Supabase → Logs
2. Filtrez par "Auth"
3. Cherchez les erreurs liées aux emails

### Logs Vercel
1. Allez dans Vercel → Functions
2. Vérifiez les logs de l'API
3. Cherchez les erreurs d'envoi d'email

### Test manuel
```bash
# Dans le terminal du projet
node test-email-sending.js
```

## 📋 **Checklist de vérification**

- [ ] Site URL dans Supabase : `https://helvetiforma.ch`
- [ ] Redirect URLs ajoutées dans Supabase
- [ ] Variable `NEXT_PUBLIC_SITE_URL=https://helvetiforma.ch` dans Vercel
- [ ] Application redéployée sur Vercel
- [ ] Templates d'email vérifiés
- [ ] Test d'envoi d'email effectué
- [ ] Email reçu avec la bonne URL

## 🚀 **Résultat attendu**

Après ces corrections :
1. ✅ Les emails sont envoyés correctement
2. ✅ Les liens pointent vers `https://helvetiforma.ch`
3. ✅ La redirection fonctionne sans erreur
4. ✅ L'authentification est complète

## 🆘 **Si le problème persiste**

1. **Vérifiez les logs Supabase** pour des erreurs spécifiques
2. **Testez avec un autre email** pour éliminer les problèmes de spam
3. **Vérifiez la configuration SMTP** si vous utilisez un service externe
4. **Contactez le support Supabase** si nécessaire

Le code est correct, le problème est dans la configuration Supabase ou Vercel !
