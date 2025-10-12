# 📧 Guide de Migration du Calendrier - info@helvetiforma.ch

**Date:** 1 octobre 2025  
**Status:** ✅ **Migration Terminée - Configuration Azure AD Requise**

---

## 🎯 Changements Effectués

### ✅ Fichiers Mis à Jour

| Fichier | Changement |
|---------|------------|
| `env.example` | `MICROSOFT_CALENDAR_USER=info@helvetiforma.ch` |
| `src/lib/microsoft.ts` | Valeur par défaut mise à jour |
| `ENVIRONMENT_SETUP.md` | Documentation mise à jour |
| `AUTO_REGISTRATION_GUIDE.md` | Documentation mise à jour |
| `WEBINAR_REGISTRATION_SOLUTION.md` | Documentation mise à jour |

---

## ⚙️ Configuration Azure AD Requise

### 1. Ajouter info@helvetiforma.ch au Tenant Azure AD

1. **Se connecter au portail Azure** : https://portal.azure.com
2. **Aller à Azure Active Directory** → **Users**
3. **Cliquer "New user"** → **Create user**
4. **Remplir les informations** :
   - User name: `info@helvetiforma.ch`
   - Name: `HelvetiForma Info`
   - Password: [Générer un mot de passe sécurisé]
   - **IMPORTANT** : Cocher "Show password" et noter le mot de passe

### 2. Configurer les Permissions de l'Application

1. **Aller à Azure Active Directory** → **App registrations**
2. **Sélectionner votre application HelvetiForma**
3. **Aller à "API permissions"**
4. **Vérifier que ces permissions sont accordées** :
   - `Calendars.ReadWrite` - Lecture/écriture du calendrier
   - `OnlineMeetings.ReadWrite` - Gestion des réunions Teams
   - `User.Invite.All` - Invitation d'utilisateurs guest
   - `User.Read` - Lecture des informations utilisateur

### 3. Accorder l'Accès au Calendrier

1. **Se connecter avec info@helvetiforma.ch** sur https://outlook.office.com
2. **Aller aux paramètres** → **Mail** → **Calendar**
3. **Partager le calendrier** avec l'application :
   - **Permissions** : "Can edit"
   - **Détails** : "Can view all details"

### 4. Tester la Configuration

1. **Créer un fichier `.env.local`** dans la racine du projet :
   ```env
   MICROSOFT_CALENDAR_USER=info@helvetiforma.ch
   # ... autres variables
   ```

2. **Tester l'API** :
   ```bash
   curl http://localhost:3000/api/webinars
   ```

3. **Vérifier les logs** pour s'assurer que l'API utilise bien `info@helvetiforma.ch`

---

## 🔧 Variables d'Environnement à Mettre à Jour

### Production (.env)
```env
MICROSOFT_CALENDAR_USER=info@helvetiforma.ch
```

### Développement (.env.local)
```env
MICROSOFT_CALENDAR_USER=info@helvetiforma.ch
```

---

## 🧪 Tests de Validation

### 1. Test de Lecture du Calendrier
- ✅ L'API `/api/webinars` doit fonctionner
- ✅ Les événements doivent être récupérés depuis `info@helvetiforma.ch`

### 2. Test d'Inscription aux Événements
- ✅ L'inscription automatique doit fonctionner
- ✅ Les invitations doivent être envoyées depuis `info@helvetiforma.ch`

### 3. Test d'Ajout d'Invités
- ✅ L'ajout d'invités aux événements doit fonctionner
- ✅ Les invitations Teams doivent être créées

---

## ⚠️ Points d'Attention

### 1. Permissions Azure AD
- **Vérifier** que `info@helvetiforma.ch` a les permissions nécessaires
- **Tester** l'authentification avec ce compte

### 2. Partage du Calendrier
- **S'assurer** que le calendrier est partagé avec l'application
- **Vérifier** que les permissions sont correctes

### 3. Migration des Événements
- **Considérer** migrer les événements existants de `damien@helvetiforma.onmicrosoft.com`
- **Planifier** la transition pour éviter les interruptions

---

## 🎉 Résultat Final

Une fois la configuration Azure AD terminée, le système utilisera `info@helvetiforma.ch` pour :

- ✅ **Lecture des événements** du calendrier
- ✅ **Création d'événements** Teams
- ✅ **Gestion des invitations** aux webinaires
- ✅ **Ajout d'invités** aux événements

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifier les logs** de l'application
2. **Tester l'authentification** Azure AD
3. **Vérifier les permissions** du calendrier
4. **Consulter la documentation** Microsoft Graph API
