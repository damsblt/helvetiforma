# 🗄️ Configuration du Schéma Supabase - Correction des Profils

## 🚨 **Problème identifié :**
Lors de l'inscription, aucun profil n'est créé dans la table `profiles` car le trigger automatique n'est pas configuré.

## ✅ **Solution :**

### 1. **Exécuter le schéma SQL dans Supabase**

1. **Allez dans Supabase Dashboard** → Votre projet
2. **Cliquez sur "SQL Editor"** dans le menu de gauche
3. **Copiez et collez** le contenu du fichier `setup-supabase-schema.sql`
4. **Cliquez sur "Run"** pour exécuter le script

### 2. **Vérifier l'exécution**

Après l'exécution, vous devriez voir :
```
Schema setup completed successfully!
```

### 3. **Tester l'inscription**

1. **Allez sur** `https://helvetiforma.ch/register`
2. **Inscrivez-vous** avec un nouvel email
3. **Vérifiez dans Supabase** → Table Editor → `profiles`
4. **Le profil devrait apparaître** automatiquement

## 🔧 **Ce que fait le script :**

### Tables créées :
- ✅ `profiles` : Profils utilisateurs
- ✅ `purchases` : Achats d'articles

### Triggers automatiques :
- ✅ `on_auth_user_created` : Crée un profil à l'inscription
- ✅ `on_auth_user_updated` : Met à jour le profil lors des changements

### Sécurité (RLS) :
- ✅ Politiques de sécurité pour protéger les données
- ✅ Utilisateurs ne peuvent voir que leurs propres données

## 🧪 **Test de validation :**

### Script de test
```bash
# Dans le terminal du projet
node check-supabase-schema.js
```

### Résultat attendu :
```
✅ Table profiles existe
✅ Table purchases existe
✅ Utilisateurs auth trouvés: X
```

## 🔍 **Debugging si problème persiste :**

### 1. Vérifier les logs Supabase
- Allez dans Supabase → Logs
- Filtrez par "Database"
- Cherchez les erreurs de trigger

### 2. Vérifier les permissions
- Assurez-vous que l'utilisateur a les permissions pour créer des triggers
- Vérifiez que les fonctions sont créées avec `SECURITY DEFINER`

### 3. Test manuel
```sql
-- Dans Supabase SQL Editor
SELECT * FROM profiles;
SELECT * FROM auth.users;
```

## 📋 **Checklist de vérification :**

- [ ] Script SQL exécuté dans Supabase
- [ ] Message "Schema setup completed successfully!" affiché
- [ ] Tables `profiles` et `purchases` existent
- [ ] Triggers créés et actifs
- [ ] Test d'inscription effectué
- [ ] Profil créé automatiquement dans la table `profiles`
- [ ] RLS (Row Level Security) activé

## 🚀 **Résultat attendu :**

Après cette configuration :
1. ✅ **Inscription** : Crée automatiquement un profil
2. ✅ **Connexion** : Récupère le profil existant
3. ✅ **Sécurité** : Données protégées par RLS
4. ✅ **Achats** : Système de paiement fonctionnel

## 🆘 **Si le problème persiste :**

1. **Vérifiez les logs** dans Supabase
2. **Testez manuellement** l'insertion d'un profil
3. **Vérifiez les permissions** de l'utilisateur Supabase
4. **Contactez le support** si nécessaire

Le problème est maintenant résolu avec ce schéma complet !
