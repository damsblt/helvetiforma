# Debug des Inscriptions - Synchronisation WordPress ↔ Next.js

## Problème Identifié

L'utilisateur `baletdamien@gmail.com` voit des formations incorrectes dans son tableau de bord Next.js :
- **WordPress/Tutor LMS** : Inscrit uniquement à "Charges sociales - Test 123"
- **Next.js** : Affiche 3 formations différentes qui ne correspondent pas

## Cause Racine

**Désynchronisation des données** :
1. L'application Next.js utilise un fichier local `data/enrollments.json` 
2. Ce fichier contenait des données de test/développement (utilisateurs 180, 182, 183)
3. Ces données ne correspondent pas aux vraies inscriptions WordPress/Tutor LMS

## Solutions Implémentées

### 1. **API de Synchronisation WordPress** (`/api/tutor/enrollments/sync`)

- ✅ Récupère les vraies inscriptions depuis WordPress/Tutor LMS
- ✅ Teste plusieurs méthodes d'accès aux données
- ✅ Fallback intelligent en cas d'échec

### 2. **API de Debug WordPress** (`/api/tutor/enrollments/wordpress`)

- ✅ Endpoint dédié pour interroger directement WordPress
- ✅ Logs détaillés pour identifier les problèmes
- ✅ Teste différentes sources de données (posts, meta, API Tutor)

### 3. **Service Tutor Amélioré**

- ✅ Priorise la synchronisation WordPress en premier
- ✅ Fallback vers les données locales si nécessaire
- ✅ Logs de debug pour traçabilité

### 4. **Tableau de Bord avec Debug**

- ✅ Affichage des informations de debug en développement
- ✅ Comparaison entre données WordPress et Next.js
- ✅ Logs console détaillés

### 5. **Nettoyage des Données Test**

- ✅ Fichier `enrollments.json` vidé des données de test
- ✅ Seules les vraies inscriptions seront maintenant affichées

## Test de la Solution

### Étape 1: Vérifier la Synchronisation

1. **Se connecter** en tant que `baletdamien@gmail.com`
2. **Aller** sur `/tableau-de-bord`
3. **Ouvrir** la console développeur (F12)
4. **Chercher** les logs de debug :

```javascript
// Logs attendus dans la console :
"Enrollments synced from WordPress: {data: [...], source: '...'}"
"Debug info: {wordpress_data: {...}, nextjs_data: [...], user: {...}}"
```

### Étape 2: Analyser les Données Debug

En mode développement, un panneau de debug s'affiche :

```
🐛 Debug Info (Development)
User ID: [ID utilisateur]
User Email: baletdamien@gmail.com  
Next.js Enrollments: [nombre d'inscriptions locales]
WordPress Enrollments: [nombre d'inscriptions WordPress]
WP Source: [source des données WordPress]
```

### Étape 3: Tester les Endpoints Directement

**Test de synchronisation :**
```bash
curl -X POST http://localhost:3000/api/tutor/enrollments/sync \
  -H "Content-Type: application/json" \
  -d '{"user_id": [USER_ID]}'
```

**Test WordPress direct :**
```bash
curl "http://localhost:3000/api/tutor/enrollments/wordpress?user_id=[USER_ID]"
```

## Méthodes de Récupération des Inscriptions

L'API teste plusieurs approches dans l'ordre :

### 1. **Posts Tutor LMS** (`tutor_enrolled`)
```
GET /wp-json/wp/v2/tutor_enrolled?author=[USER_ID]
```

### 2. **Meta Utilisateur WordPress**
```
GET /wp-json/wp/v2/users/[USER_ID]?context=edit
```
Recherche les champs meta :
- `tutor_enrolled_courses`
- `_tutor_enrolled_courses`
- `enrolled_courses`
- `_enrolled_courses`

### 3. **API Tutor Personnalisée**
```
GET /wp-json/tutor/v1/enrollments?user_id=[USER_ID]
```

### 4. **Endpoint Tutor Standard**
```
GET /wp-json/tutor/v1/enrollments?user_id=[USER_ID]
```

## Résultat Attendu

Après correction, l'utilisateur `baletdamien@gmail.com` devrait voir :
- **Formations inscrites** : 1 (seulement "Charges sociales - Test 123")
- **Formations terminées** : 1 (si le statut est "Terminé")
- **En cours** : 0 ou 1 selon le statut
- **Progression moyenne** : Selon les données WordPress

## Dépannage

### Problème : Aucune inscription trouvée

**Causes possibles :**
1. L'utilisateur n'existe pas dans WordPress
2. Les inscriptions ne sont pas stockées dans les formats attendus
3. Problèmes d'authentification API

**Solutions :**
1. Vérifier l'ID utilisateur dans WordPress
2. Examiner la structure des données Tutor LMS
3. Contrôler les credentials API

### Problème : Données incorrectes

**Causes possibles :**
1. Mapping incorrect des champs
2. Statuts d'inscription non standard
3. IDs de cours incorrects

**Solutions :**
1. Vérifier le mapping dans les APIs
2. Ajuster la logique de statuts
3. Valider les IDs de cours

### Problème : Performance lente

**Causes possibles :**
1. Trop d'appels API séquentiels
2. Données WordPress volumineuses
3. Timeout des requêtes

**Solutions :**
1. Implémenter la mise en cache
2. Pagination des résultats
3. Optimiser les requêtes WordPress

## Logs de Debug

### Console Navigateur
```javascript
// Synchronisation réussie
"Enrollments synced from WordPress: {success: true, data: [...], source: 'wordpress_user_meta'}"

// Échec de synchronisation
"WordPress sync failed: 404"
"Custom enrollments API failed: 500"
```

### Serveur Next.js
```bash
# Logs détaillés dans la console serveur
"Fetching WordPress enrollments for user: 123"
"Found enrollments: [{...}]"
"User data received: {meta: {...}}"
```

## Monitoring

### Métriques à Surveiller
- Taux de succès de synchronisation WordPress
- Temps de réponse des APIs d'inscription
- Nombre d'utilisateurs avec données manquantes
- Erreurs d'authentification WordPress

### Alertes à Configurer
- Échec de synchronisation > 10%
- Temps de réponse > 5 secondes
- Erreurs 500 sur les endpoints d'inscription
- Utilisateurs sans inscriptions trouvées

La solution est maintenant prête à être testée et déployée !
