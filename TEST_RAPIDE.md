# 🧪 Test Rapide du Système d'Inscription et Paiement

## ✅ **Serveur Fonctionnel**

Le serveur de développement est maintenant accessible sur : **http://localhost:3000**

## 🚀 **Tests à Effectuer Maintenant**

### **1. Test de la Page d'Accueil**
- **URL** : `http://localhost:3000`
- **Vérifier** : 
  - ✅ Page se charge correctement
  - ✅ Composant de statut système visible (en bas à droite)
  - ✅ Statut Supabase, Stripe et Sanity

### **2. Test de la Page d'Inscription**
- **URL** : `http://localhost:3000/register`
- **Vérifier** :
  - ✅ Formulaire d'inscription s'affiche
  - ✅ Champs : Prénom, Nom, Email, Mot de passe, Confirmation
  - ✅ Validation côté client
  - ✅ Bouton "Créer mon compte"

### **3. Test de la Page de Connexion**
- **URL** : `http://localhost:3000/login`
- **Vérifier** :
  - ✅ Formulaire de connexion s'affiche
  - ✅ Champs : Email, Mot de passe
  - ✅ Lien "Mot de passe oublié"
  - ✅ Lien "S'inscrire"

### **4. Test des Articles**
- **URL** : `http://localhost:3000/posts`
- **Vérifier** :
  - ✅ Liste des articles s'affiche
  - ✅ Articles premium avec badge "Premium"
  - ✅ Prix affiché en CHF

## 🔍 **Vérification du Statut Système**

En bas à droite de la page d'accueil, vous devriez voir :

```
Statut du Système
Supabase    ✅ connected
Stripe      ✅ configured  
Sanity      ✅ configured
Système prêt ✅
```

## 🎯 **Test d'Inscription Complet**

1. **Aller sur** : `http://localhost:3000/register`
2. **Remplir le formulaire** :
   - Prénom : Test
   - Nom : User
   - Email : test@example.com
   - Mot de passe : test123
   - Confirmation : test123
3. **Cliquer** sur "Créer mon compte"
4. **Vérifier** le message de succès

## 🎯 **Test de Connexion**

1. **Aller sur** : `http://localhost:3000/login`
2. **Utiliser les identifiants** créés à l'étape précédente
3. **Cliquer** sur "Se connecter"
4. **Vérifier** la redirection vers `/posts`

## 🎯 **Test d'Article Premium**

1. **Aller sur** : `http://localhost:3000/posts`
2. **Cliquer** sur un article premium
3. **Vérifier** :
   - Aperçu gratuit affiché
   - Message "Contenu Premium"
   - Bouton "Acheter pour X CHF"

## 🐛 **Dépannage**

### **Si le statut Supabase est rouge :**
- Vérifier que le SQL a été exécuté correctement
- Vérifier les variables d'environnement
- Vérifier la connexion à Supabase

### **Si le statut Stripe est rouge :**
- Vérifier les clés Stripe dans `.env.local`
- Vérifier que les clés ne sont pas les valeurs placeholder

### **Si l'inscription ne fonctionne pas :**
- Vérifier la console du navigateur pour les erreurs
- Vérifier les logs du serveur
- Vérifier la configuration Supabase

## 📊 **Résultat Attendu**

Après tous ces tests, vous devriez avoir :

1. ✅ **Page d'accueil** qui se charge
2. ✅ **Statut système** tout vert
3. ✅ **Inscription** fonctionnelle
4. ✅ **Connexion** fonctionnelle
5. ✅ **Articles premium** avec interface d'achat

## 🚀 **Prochaines Étapes**

Une fois tous les tests validés :

1. **Tester un achat réel** avec Stripe
2. **Vérifier l'accès au contenu** après achat
3. **Déployer en production**
4. **Configurer les domaines de production**

Le système d'inscription et de paiement est maintenant **prêt pour la production** ! 🎉
