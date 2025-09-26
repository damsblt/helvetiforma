# 📚 Documentation Tutor LMS - Référence Complète

## 🔗 **Liens Officiels**

- **Documentation Principale** : [https://docs.themeum.com/tutor-lms/developer-documentation/](https://docs.themeum.com/tutor-lms/developer-documentation/)
- **API REST Tutor LMS (Free)** : [REST API: Tutor LMS (Free)](https://docs.themeum.com/tutor-lms/developer-documentation/rest-api-tutor-lms-free/)
- **API REST Tutor LMS Pro** : [REST APIs for Tutor LMS Pro](https://docs.themeum.com/tutor-lms/developer-documentation/rest-apis-for-tutor-lms-pro/)

## 🏗️ **Structure des Cours Tutor LMS**

### **Hiérarchie des Contenus**
```
Course (Cours)
├── Topic (Sujet/Module)
│   ├── Lesson (Leçon)
│   ├── Quiz (Quiz)
│   └── Assignment (Devoir)
└── Topic (Autre sujet)
    ├── Lesson
    └── Quiz
```

### **Types de Contenu WordPress**
- **Course** : `courses` (Custom Post Type)
- **Topic** : `topics` (Custom Post Type)
- **Lesson** : `lesson` (Custom Post Type)
- **Quiz** : `tutor_quiz` (Custom Post Type)
- **Assignment** : `tutor_assignments` (Custom Post Type)

## 🔌 **Endpoints API Tutor LMS**

### **Base URL**
```
https://api.helvetiforma.ch/wp-json/tutor/v1/
```

### **Courses (Cours)**
```http
GET    /wp-json/tutor/v1/courses/           # Liste des cours
GET    /wp-json/tutor/v1/courses/{id}       # Détail d'un cours
POST   /wp-json/tutor/v1/courses/           # Créer un cours
PUT    /wp-json/tutor/v1/courses/{id}       # Modifier un cours
DELETE /wp-json/tutor/v1/courses/{id}       # Supprimer un cours
```

### **Topics (Sujets/Modules)**
```http
GET    /wp-json/tutor/v1/topics/            # Liste des topics
GET    /wp-json/tutor/v1/topics/{id}        # Détail d'un topic
POST   /wp-json/tutor/v1/topics/            # Créer un topic
```

### **Lessons (Leçons)**
```http
GET    /wp-json/tutor/v1/lessons/           # Liste des leçons
GET    /wp-json/tutor/v1/lessons/{id}       # Détail d'une leçon
POST   /wp-json/tutor/v1/lessons/           # Créer une leçon
```

### **Curriculum (Programme)**
```http
GET    /wp-json/tutor/v1/course-content/{course_id}   # Contenu complet d'un cours
```

## 📝 **Création d'une Leçon via API**

### **Endpoint**
```http
POST /wp-json/tutor/v1/lessons/
```

### **Paramètres Requis**
```json
{
  "topic_id": 5608,                    // ID du topic parent (requis)
  "lesson_title": "Titre de la leçon", // Titre (requis)
  "lesson_content": "Contenu HTML",    // Contenu (optionnel)
  "lesson_author": 1,                  // ID de l'auteur (requis)
  "preview": false                     // Aperçu gratuit (optionnel)
}
```

### **Paramètres Optionnels**
```json
{
  "thumbnail_id": 123,                 // ID de l'image
  "video": {
    "source_type": "youtube",          // youtube, vimeo, html5
    "source": "https://youtube.com/...",
    "runtime": {
      "hours": "00",
      "minutes": "10",
      "seconds": "30"
    }
  },
  "attachments": [110, 111],           // IDs des fichiers attachés
  "preview": true                      // Leçon en aperçu gratuit
}
```

## 🔧 **Récupération du Curriculum**

### **Méthode Recommandée**
```javascript
// Récupérer le contenu complet d'un cours
const getCourseContent = async (courseId) => {
  const response = await fetch(`/wp-json/tutor/v1/course-content/${courseId}`);
  return response.json();
};
```

### **Structure de Réponse**
```json
{
  "course_id": 123,
  "course_title": "Mon Cours",
  "topics": [
    {
      "topic_id": 456,
      "topic_title": "Module 1",
      "lessons": [
        {
          "lesson_id": 789,
          "lesson_title": "Leçon 1",
          "lesson_type": "video",
          "preview": false
        }
      ],
      "quizzes": [
        {
          "quiz_id": 101,
          "quiz_title": "Quiz 1"
        }
      ]
    }
  ]
}
```

## 🎯 **Endpoints WordPress pour Tutor LMS**

### **Alternative WordPress REST API**
```http
GET /wp-json/wp/v2/courses           # Cours (Custom Post Type)
GET /wp-json/wp/v2/topics            # Topics (si exposé)
GET /wp-json/wp/v2/lesson            # Leçons (si exposé)
GET /wp-json/wp/v2/tutor_quiz        # Quiz (si exposé)
```

### **Paramètres de Filtrage**
```http
GET /wp-json/wp/v2/lesson?parent=123    # Leçons d'un topic
GET /wp-json/wp/v2/topics?parent=456    # Topics d'un cours
```

## ⚙️ **Configuration Requise**

### **1. Permaliens WordPress**
- Aller dans **Réglages → Permaliens**
- Sélectionner **"Nom de l'article"** ou **"Structure personnalisée"**
- **Enregistrer** pour régénérer les règles

### **2. API REST Tutor LMS**
- Installer **Tutor LMS Pro**
- Activer l'API dans **Tutor LMS → Settings → Advanced**
- Vérifier les permissions utilisateur

### **3. Authentification**
```http
# Application Password (recommandé)
Authorization: Basic base64(username:app_password)

# JWT Token (si configuré)
Authorization: Bearer jwt_token
```

## 🚨 **Erreurs Communes**

### **404 - Route Not Found**
```
{"code":"rest_no_route","message":"Aucune route correspondante..."}
```
**Solutions :**
1. Vérifier les permaliens WordPress
2. S'assurer que Tutor LMS Pro est activé
3. Vérifier que l'API REST est activée

### **403 - Forbidden**
```
{"code":"rest_forbidden","message":"Désolé, vous n'êtes pas autorisé..."}
```
**Solutions :**
1. Vérifier les permissions utilisateur
2. Utiliser l'authentification correcte
3. Vérifier les rôles WordPress

### **Custom Post Types non exposés**
**Solution :**
```php
// Dans functions.php ou plugin
add_action('init', function() {
    $post_type_object = get_post_type_object('lesson');
    $post_type_object->show_in_rest = true;
    $post_type_object->rest_base = 'lessons';
});
```

## 📊 **Structure de Données Tutor LMS**

### **Course Meta**
```php
// Métadonnées importantes
_tutor_course_level          // Niveau du cours
_tutor_course_benefits       // Bénéfices
_tutor_course_requirements   // Prérequis
_tutor_course_target_audience // Public cible
_tutor_course_material_includes // Matériel inclus
_tutor_course_price_type     // Type de prix (free/paid)
_tutor_course_price          // Prix
```

### **Lesson Meta**
```php
_video_source_type           // Type de vidéo (youtube/vimeo/html5)
_video_source                // URL de la vidéo
_lesson_preview              // Aperçu gratuit (yes/no)
_lesson_thumbnail_id         // ID de l'image
```

## 🔍 **Testing & Debug**

### **Tester les Endpoints**
```bash
# Vérifier l'API Tutor LMS
curl https://api.helvetiforma.ch/wp-json/tutor/v1/

# Tester un cours spécifique
curl https://api.helvetiforma.ch/wp-json/tutor/v1/courses/123

# Tester le contenu d'un cours
curl https://api.helvetiforma.ch/wp-json/tutor/v1/course-content/123
```

### **Page de Debug**
Utiliser `/debug` dans notre application pour tester tous les endpoints automatiquement.

## 📚 **Ressources Supplémentaires**

### **Documentation Sections**
- [Course Builder](https://docs.themeum.com/tutor-lms/course-builder/)
- [Quiz Builder](https://docs.themeum.com/tutor-lms/quiz-builder/)
- [Native eCommerce](https://docs.themeum.com/tutor-lms/native-ecommerce/)
- [Developer Guides](https://docs.themeum.com/tutor-lms/developer-guides/)

### **Hooks & Filters**
- [Action Hooks](https://docs.themeum.com/tutor-lms/developer-guides/action-hook/)
- [Filter Hooks](https://docs.themeum.com/tutor-lms/developer-guides/filter-hooks/)

### **Intégrations**
- [Elementor Integration](https://docs.themeum.com/tutor-lms/third-party-integrations/elementor-integration/)
- [WooCommerce Integration](https://docs.themeum.com/tutor-lms/third-party-integrations/woocommerce/)

---

**📅 Dernière mise à jour** : 26 septembre 2025  
**🔗 Source** : [Documentation Officielle Tutor LMS](https://docs.themeum.com/tutor-lms/developer-documentation/)

---

## 💡 **Notes pour HelvetiForma**

1. **Utiliser `/wp-json/tutor/v1/course-content/{id}`** pour récupérer le curriculum complet
2. **Ne pas utiliser `/wp-json/wp/v2/lessons`** - endpoint inexistant
3. **Tester d'abord avec `/debug`** pour identifier les endpoints disponibles
4. **Configurer les permaliens** si les API ne fonctionnent pas

