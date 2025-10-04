# 🚀 Test de Configuration Supabase

## ✅ **Configuration Actuelle**

Vos clés Supabase sont configurées :
- **URL** : `https://qdylfeltqwvfhrnxjrek.supabase.co`
- **Clé Anon** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Tables** : Créées ✅

## 🔧 **Étapes de Test**

### **1. Vérifier la Connexion Supabase**

Ouvrez votre navigateur et allez sur :
- **URL** : `https://qdylfeltqwvfhrnxjrek.supabase.co`
- **Vérifier** : Que le projet est accessible

### **2. Tester l'API Supabase**

Dans l'éditeur SQL de Supabase, exécutez :
```sql
-- Test de connexion
SELECT 'Supabase connecté' as status;

-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'purchases');
```

### **3. Tester l'Authentification**

Dans l'éditeur SQL, testez l'inscription :
```sql
-- Vérifier les utilisateurs existants
SELECT * FROM auth.users LIMIT 5;

-- Vérifier les profils
SELECT * FROM profiles LIMIT 5;
```

### **4. Tester l'Application**

1. **Redémarrer le serveur** :
   ```bash
   npm run dev
   ```

2. **Tester l'inscription** :
   - Aller sur `http://localhost:3000/register`
   - Remplir le formulaire
   - Vérifier qu'un utilisateur est créé dans Supabase

3. **Tester la connexion** :
   - Aller sur `http://localhost:3000/login`
   - Se connecter avec les mêmes identifiants
   - Vérifier la redirection

## 🐛 **Dépannage**

### **Erreur 500 sur /login**
- Vérifier que les variables d'environnement sont chargées
- Vérifier que le serveur est redémarré
- Vérifier les logs du serveur

### **Erreur de connexion Supabase**
- Vérifier que l'URL est correcte
- Vérifier que la clé anon est correcte
- Vérifier que les tables existent

### **Erreur d'authentification**
- Vérifier que l'email de confirmation n'est pas requis
- Vérifier les politiques RLS
- Vérifier les triggers

## 🎯 **Résultat Attendu**

Après configuration :
- ✅ Page d'inscription fonctionne
- ✅ Page de connexion fonctionne
- ✅ Utilisateurs créés dans Supabase
- ✅ Profils créés automatiquement
- ✅ Redirection après connexion

## 📊 **Statut Système**

Le composant SystemStatus devrait afficher :
```
Statut du Système
Supabase    ✅ connected
Stripe      ⚠️ not-configured  
Sanity      ✅ configured
Système prêt ✅
```

## 🚀 **Prochaines Étapes**

1. **Tester** l'inscription et la connexion
2. **Configurer** Stripe pour les paiements
3. **Tester** le flux complet
4. **Déployer** en production

Le système est maintenant configuré avec Supabase ! 🎉
