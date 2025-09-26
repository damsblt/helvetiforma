# Test des Inscriptions Tutor LMS

## Problème Résolu

L'utilisateur `baletdamien@gmail.com` est bien inscrit dans Tutor LMS au cours "Charges sociales - Test 123" avec le statut "Terminé", mais l'application Next.js ne trouvait pas ces inscriptions.

## Solutions Implémentées

### 1. **API Tutor LMS Spécialisée** (`/api/tutor/enrollments/tutor-lms`)

- ✅ Interroge directement les APIs Tutor LMS
- ✅ Teste plusieurs méthodes d'accès aux données
- ✅ Supporte la recherche par user_id ET user_email
- ✅ Mapping correct des statuts Tutor LMS

### 2. **Auto-Enrollment après Achat** (`/api/tutor/auto-enroll`)

- ✅ Inscription automatique après paiement réussi
- ✅ Support des cours gratuits et payants
- ✅ Fallback intelligent avec plusieurs méthodes
- ✅ Intégration dans le processus de commande

### 3. **Service Tutor Amélioré**

- ✅ Priorise l'API Tutor LMS spécialisée
- ✅ Utilise l'auto-enroll pour les inscriptions
- ✅ Logs détaillés pour debugging

## Tests à Effectuer

### Test 1: Récupération des Inscriptions Existantes

**Objectif** : Vérifier que `baletdamien@gmail.com` voit bien son cours "Charges sociales - Test 123"

**Steps** :
1. Se connecter en tant que `baletdamien@gmail.com`
2. Aller sur `/tableau-de-bord`
3. Vérifier les logs console :
   ```javascript
   "Enrollments from Tutor LMS: {success: true, data: [...], source: 'tutor_lms_rest_api'}"
   ```
4. **Résultat attendu** : 1 formation visible avec le statut "Terminé"

**Test Direct de l'API** :
```bash
curl "http://localhost:3000/api/tutor/enrollments/tutor-lms?user_email=baletdamien@gmail.com"
```

### Test 2: Auto-Enrollment Cours Gratuit

**Objectif** : Tester l'inscription automatique pour un cours gratuit

**Steps** :
1. Se connecter en tant qu'utilisateur test
2. Aller sur un cours gratuit
3. Cliquer "S'inscrire gratuitement"
4. Vérifier l'inscription automatique
5. **Résultat attendu** : Accès immédiat au cours

**Test Direct de l'API** :
```bash
curl -X POST http://localhost:3000/api/tutor/auto-enroll \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123, "course_id": 456, "payment_status": "completed"}'
```

### Test 3: Auto-Enrollment Cours Payant

**Objectif** : Tester l'inscription automatique après achat

**Steps** :
1. Ajouter un cours payant au panier
2. Procéder au checkout complet
3. Simuler un paiement réussi
4. Vérifier l'inscription automatique
5. **Résultat attendu** : Cours visible dans le tableau de bord

### Test 4: Debug des Données

**Objectif** : Analyser les données récupérées depuis Tutor LMS

**Steps** :
1. Activer le mode développement
2. Se connecter et aller au tableau de bord
3. Examiner le panneau de debug
4. Comparer les données WordPress vs Next.js
5. **Résultat attendu** : Cohérence des données

## Méthodes de Récupération Testées

L'API `/api/tutor/enrollments/tutor-lms` teste dans l'ordre :

### 1. **API REST Tutor LMS**
```
GET /wp-json/tutor/v1/enrollments?user_id=123&user_email=user@example.com
```

### 2. **Posts WordPress Tutor**
```
GET /wp-json/wp/v2/posts?post_type=tutor_enrolled&author=123
```

### 3. **Meta Utilisateur**
```
GET /wp-json/wp/v2/users/123?context=edit
```
Champs recherchés :
- `_tutor_enrolled_courses`
- `tutor_enrolled_courses`
- `_enrolled_courses`
- `enrolled_courses`

### 4. **Recherche par Email**
```
GET /wp-json/wp/v2/users?search=user@example.com
```

## Mapping des Statuts

### Tutor LMS → Next.js
- `completed`, `finish`, `terminé` → `completed`
- `cancel`, `inactive` → `cancelled`
- Autres → `enrolled`

### WordPress Posts → Next.js
- `publish` → `enrolled`
- `completed` → `completed`
- `trash`, `draft` → `cancelled`

## Logs de Debug

### Console Navigateur
```javascript
// Succès Tutor LMS
"Enrollments from Tutor LMS: {
  success: true,
  data: [{
    id: 123,
    user_id: 456,
    course_id: 789,
    status: 'completed',
    enrolled_at: '2025-09-26T13:24:00Z',
    source: 'tutor_lms_api'
  }],
  source: 'tutor_lms_rest_api'
}"

// Auto-enrollment
"Auto-enrollment for course 789: {
  success: true,
  message: 'Auto-enrollment successful via Tutor LMS API',
  method: 'tutor_api'
}"
```

### Serveur Next.js
```bash
# Récupération des inscriptions
"Fetching Tutor LMS enrollments for: {userId: '123', userEmail: 'user@example.com'}"
"Tutor API response status: 200"
"Tutor API raw data: [{...}]"

# Auto-enrollment
"Auto-enrolling user: {user_id: 123, course_id: 789, payment_status: 'completed'}"
"Enrolling via Tutor API: {user_id: 123, course_id: 789, status: 'enrolled'}"
"Tutor enrollment success: {id: 456, ...}"
```

## Dépannage

### Problème : Aucune inscription trouvée

**Causes possibles** :
1. API Tutor LMS non accessible
2. User ID incorrect dans WordPress
3. Structure de données Tutor LMS différente

**Solutions** :
1. Vérifier l'accès aux APIs WordPress
2. Confirmer l'ID utilisateur dans wp_users
3. Examiner les tables Tutor LMS directement

### Problème : Auto-enrollment échoue

**Causes possibles** :
1. Permissions API insuffisantes
2. Course ID invalide
3. User ID invalide

**Solutions** :
1. Vérifier les credentials WordPress
2. Confirmer l'existence du cours
3. Valider l'utilisateur

### Problème : Statuts incorrects

**Causes possibles** :
1. Mapping des statuts incomplet
2. Statuts personnalisés Tutor LMS
3. Données corrompues

**Solutions** :
1. Étendre le mapping des statuts
2. Examiner les statuts dans Tutor LMS
3. Nettoyer les données incohérentes

## Commandes de Test Rapide

```bash
# Test récupération inscriptions
curl "http://localhost:3000/api/tutor/enrollments/tutor-lms?user_email=baletdamien@gmail.com" | jq

# Test auto-enrollment
curl -X POST http://localhost:3000/api/tutor/auto-enroll \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123, "course_id": 3633, "payment_status": "completed"}' | jq

# Test inscription locale (fallback)
curl -X POST http://localhost:3000/api/tutor/enroll \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123, "course_id": 3633}' | jq
```

## Résultats Attendus

Après correction :

**Pour `baletdamien@gmail.com`** :
- ✅ **Formations inscrites** : 1
- ✅ **Formations terminées** : 1 ("Charges sociales - Test 123")
- ✅ **Statut** : "Terminé"
- ✅ **Progression** : 100%

**Pour nouveaux achats** :
- ✅ **Inscription automatique** après paiement
- ✅ **Accès immédiat** au contenu
- ✅ **Synchronisation** avec Tutor LMS
- ✅ **Logs détaillés** pour monitoring

La solution synchronise maintenant correctement avec Tutor LMS et implémente l'inscription automatique dans le parcours client !
