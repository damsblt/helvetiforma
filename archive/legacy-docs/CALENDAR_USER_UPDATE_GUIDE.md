# 📅 Guide de Mise à Jour - Utilisateur Calendrier Teams

**Date:** $(date)  
**Status:** ✅ **Configuration Code Terminée - Configuration Azure AD Requise**

---

## 🎯 Changements Effectués

### ✅ Fichiers Mis à Jour

| Fichier | Changement |
|---------|------------|
| `env.example` | `MICROSOFT_CALENDAR_USER=damien@helvetiforma.onmicrosoft.com` |
| `src/lib/microsoft.ts` | Valeur par défaut mise à jour |
| `.env.local` | Variable ajoutée avec la nouvelle adresse |

---

## ⚙️ Configuration Azure AD Requise

### 1. Vérifier que l'utilisateur existe dans Azure AD

1. **Se connecter au portail Azure** : https://portal.azure.com
2. **Aller à Azure Active Directory** → **Users**
3. **Rechercher** : `damien@helvetiforma.onmicrosoft.com`
4. **Vérifier** que l'utilisateur existe et est actif

### 2. Configurer les Permissions de l'Application

1. **Aller à Azure Active Directory** → **App registrations**
2. **Sélectionner votre application HelvetiForma** (ID: `0b45a3d3-e00b-4647-8e00-acca949e1931`)
3. **Aller à "API permissions"**
4. **Vérifier que ces permissions sont accordées** :
   - ✅ `Calendars.Read` (Application) - Lecture des calendriers
   - ✅ `OnlineMeetings.Read.All` (Application) - Lecture des réunions Teams
   - ✅ `User.Read` (Application) - Lecture des informations utilisateur

### 3. Accorder l'Accès au Calendrier

1. **Se connecter avec damien@helvetiforma.onmicrosoft.com** sur https://outlook.office.com
2. **Aller aux paramètres** → **Mail** → **Calendar**
3. **Partager le calendrier** avec l'application :
   - **Permissions** : "Can edit"
   - **Détails** : "Can view all details"

### 4. Tester la Configuration

1. **Redémarrer l'application** :
   ```bash
   npm run dev
   ```

2. **Vérifier les événements** :
   - Aller sur `/calendrier`
   - Les événements Teams de `damien@helvetiforma.onmicrosoft.com` devraient s'afficher

---

## 🔍 Vérification du Fonctionnement

### Test API Direct

```bash
# Tester l'API des webinaires
curl http://localhost:3000/api/webinars
```

### Logs à Surveiller

Dans la console de développement, vous devriez voir :
- ✅ "Using calendar user: damien@helvetiforma.onmicrosoft.com"
- ✅ Événements récupérés depuis le bon calendrier

---

## 🚨 Dépannage

### Problème : "Access denied" ou "User not found"

**Solution :**
1. Vérifier que `damien@helvetiforma.onmicrosoft.com` existe dans Azure AD
2. Vérifier que l'application a les permissions `Calendars.Read`
3. Vérifier que l'utilisateur a partagé son calendrier

### Problème : Aucun événement affiché

**Solution :**
1. Vérifier que l'utilisateur a des événements Teams dans son calendrier
2. Vérifier que les événements commencent par "HF" (filtre appliqué)
3. Vérifier les logs de l'API

### Problème : Erreur d'authentification

**Solution :**
1. Vérifier que `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, et `MICROSOFT_TENANT_ID` sont corrects
2. Vérifier que l'application est configurée pour utiliser les permissions d'application

---

## 📊 Configuration Actuelle

```env
MICROSOFT_CLIENT_ID=0b45a3d3-e00b-4647-8e00-acca949e1931
MICROSOFT_TENANT_ID=0c41c554-0d55-4550-8412-ba89c98481f0
MICROSOFT_CALENDAR_USER=damien@helvetiforma.onmicrosoft.com
```

---

## ✅ Prochaines Étapes

1. **Vérifier Azure AD** - S'assurer que l'utilisateur existe
2. **Tester l'application** - Redémarrer et vérifier `/calendrier`
3. **Créer des événements test** - Ajouter des événements Teams dans le calendrier de Damien
4. **Vérifier les permissions** - S'assurer que l'application peut accéder au calendrier

---

**Note :** Cette configuration utilise les permissions d'application, donc l'utilisateur n'a pas besoin de se connecter pour voir les événements. L'application accède directement au calendrier de `damien@helvetiforma.onmicrosoft.com`.

