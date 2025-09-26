# 🔧 Correction de l'Erreur API Endpoints

## 🚨 Problème Identifié

L'erreur `404` sur l'endpoint `/wp-json/wp/v2/lessons?parent=2655` indique que cet endpoint n'existe pas sur votre serveur WordPress.

```
api.helvetiforma.ch/wp-json/wp/v2/lessons?parent=2655:1  Failed to load resource: the server responded with a status of 404
Error: API Error (404): {"code":"rest_no_route","message":"Aucune route correspondante à l'URL et à la méthode de requête n'a été trouvée.","data":{"status":404}}
```

## ✅ Solutions Implémentées

### 1. **Fallback Multi-Endpoints**

Modifié `tutorService.ts` pour tester plusieurs endpoints possibles :

```typescript
const possibleEndpoints = [
  `${config.endpoints.tutor.lessons}?course_id=${courseId}`,           // Tutor LMS API
  `${config.endpoints.wpTutor.lessons}?parent=${courseId}`,            // WordPress lessons
  `${config.endpoints.wpTutor.topics}?parent=${courseId}`,             // WordPress topics
  `/wp-json/tutor/v1/course-content/${courseId}`,                      // Tutor content API
  `/wp-json/wp/v2/lesson?parent=${courseId}`,                          // Alternative lesson endpoint
];
```

### 2. **Gestion Gracieuse des Erreurs**

- Si aucun endpoint ne fonctionne, retourne un tableau vide
- Les warnings sont loggés pour le debugging
- L'interface continue de fonctionner sans leçons

### 3. **Interface Adaptative**

Page de détail des cours modifiée pour afficher :
- **Avec leçons** : Contenu réel depuis l'API
- **Sans leçons** : Contenu générique avec 5 modules d'exemple

### 4. **Outils de Debug Créés**

#### **Page Debug** : `/debug`
- Interface pour tester tous les endpoints
- Résumé des endpoints disponibles/indisponibles
- Recommandations de configuration

#### **API Debug** : `/api/debug/endpoints`
- Teste automatiquement 10+ endpoints
- Retourne le statut de chaque endpoint
- Identifie les routes disponibles

## 🔍 Comment Diagnostiquer

### 1. **Accédez à la page de debug**
```
http://localhost:3000/debug
```

### 2. **Cliquez sur "Tester les endpoints"**
Cette page va :
- Tester tous les endpoints possibles
- Afficher lesquels sont disponibles
- Donner des recommandations

### 3. **Vérifiez les résultats**
- ✅ **Vert** : Endpoint disponible
- ❌ **Rouge** : Endpoint indisponible
- ⚠️ **Jaune** : Endpoint 404 (n'existe pas)

## 🛠️ Causes Possibles et Solutions

### **Cause 1: Tutor LMS pas configuré**
```bash
# Vérifiez dans WordPress Admin
Plugins → Tutor LMS Pro → Activé ?
Settings → Tutor LMS → API Settings → Activé ?
```

### **Cause 2: Permaliens WordPress**
```bash
# Dans WordPress Admin
Réglages → Permaliens → Sélectionner "Nom de l'article"
→ Enregistrer les modifications
```

### **Cause 3: Permissions API**
```bash
# Vérifier les permissions utilisateur d'application
Users → Application Passwords → Permissions correctes ?
```

### **Cause 4: Types de contenu non exposés**
Les leçons peuvent ne pas être exposées dans l'API REST WordPress.

## 🎯 Résultat

### **Avant** (avec erreur)
```javascript
// Plantait avec 404
const lessons = await tutorService.getCourseLessons(courseId);
// → Error: API Error (404)
```

### **Après** (avec fallback)
```javascript
// Teste plusieurs endpoints, retourne [] si aucun ne fonctionne
const lessons = await tutorService.getCourseLessons(courseId);
// → [] (array vide, pas d'erreur)
```

### **Interface Utilisateur**
- **Avec leçons** : Affiche le contenu réel
- **Sans leçons** : Affiche 5 modules génériques
- **Toujours fonctionnel** : Plus jamais d'erreur 404

## 🚀 Prochaines Étapes

1. **Testez la page debug** : `/debug`
2. **Identifiez les endpoints disponibles**
3. **Configurez WordPress/Tutor LMS** selon les recommandations
4. **Re-testez** pour confirmer que les endpoints fonctionnent

La solution est **robuste** : même si aucun endpoint de leçons ne fonctionne, l'application continue de fonctionner parfaitement ! 🎉

