# Articles Page - Guide Complet

## 🎉 Nouvelle Page Créée: `/articles`

Une nouvelle page a été créée qui duplique la fonctionnalité de `/coins-des-docs` mais qui **récupère les articles depuis Sanity** au lieu de WordPress.

---

## ✨ Fonctionnalités

### 1. **Affichage Automatique des Articles Sanity**
- Récupère tous les articles publiés depuis Sanity
- Affichage sous forme de cartes élégantes
- Tri par date de publication (du plus récent au plus ancien)

### 2. **Cartes d'Articles Riches**
Chaque carte affiche:
- ✅ **Image principale** (si disponible)
- ✅ **Badge d'accès** (Public/Membres/Premium)
- ✅ **Catégorie** (Comptabilité, Salaires, etc.)
- ✅ **Titre** de l'article
- ✅ **Résumé/Excerpt** (3 lignes max)
- ✅ **Tags** (3 premiers tags)
- ✅ **Date de publication**
- ✅ **Prix** (pour articles premium)

### 3. **Badges d'Accès Visuels**
- 🌐 **Aucun badge** = Article public (gratuit)
- 🔒 **Badge bleu "Membres"** = Réservé aux membres
- 💎 **Badge gradient "Premium"** = Article payant

### 4. **CTA vers les Articles**
Chaque carte a un bouton "Lire l'article" qui mène vers:
```
/posts/[slug-de-l-article]
```

### 5. **Design Responsive**
- **Mobile**: 1 colonne
- **Tablet**: 2 colonnes
- **Desktop**: 3 colonnes

---

## 🚀 Accès à la Page

### URL:
```
http://localhost:3000/articles
```

### Navigation:
La page a été ajoutée au menu principal:
- **Header**: Accueil > Concept > **Articles** > Coin des docs > Sessions
- **Footer**: Section "Support" > Articles

---

## 📊 Structure de la Page

### 1. Hero Section
Peut être personnalisé via Sanity CMS (page "articles") avec:
- Titre personnalisable
- Sous-titre
- Image de fond
- Bouton CTA

**Fallback automatique** si pas de contenu Sanity:
- Titre: "Articles & Ressources"
- Gradient bleu/indigo
- Compteur d'articles
- Information "Mis à jour régulièrement"

### 2. Sections Dynamiques (Optionnel)
Si vous créez une page "articles" dans Sanity, vous pouvez ajouter:
- Feature Cards (catégories)
- Rich Text sections (texte formaté)
- Autres sections personnalisées

### 3. Grille d'Articles (Toujours affichée)
Affichage automatique de tous les articles Sanity avec:
- Filtrage automatique (seulement articles publiés)
- Tri par date
- Cartes interactives avec hover effects

### 4. Call-to-Action
Section fixe en bas:
- "Besoin d'aide personnalisée ?"
- Bouton "Nous contacter"
- Bouton "Voir nos sessions"

---

## 🎨 Exemples de Cartes

### Article Public
```
┌─────────────────────────────────────┐
│  [Image de l'article]               │
│                                     │
│  [Comptabilité]                     │
│  Guide de la Comptabilité Suisse   │
│                                     │
│  Découvrez les bases de la compta-  │
│  bilité selon les normes suisses... │
│                                     │
│  #comptabilité #guide #suisse       │
│  ─────────────────────────────────  │
│  📅 3 oct. 2024    Lire l'article → │
└─────────────────────────────────────┘
```

### Article Premium
```
┌─────────────────────────────────────┐
│  [Image]              [💎 Premium]  │
│                                     │
│  [Salaires]                         │
│  Formation Complète: Salaires 2024  │
│                                     │
│  Formation détaillée sur le calcul  │
│  des salaires et charges sociales...│
│                                     │
│  #salaires #formation #premium      │
│  ─────────────────────────────────  │
│  📅 1 oct. 2024    Lire l'article → │
│  ─────────────────────────────────  │
│  Prix              99 CHF           │
└─────────────────────────────────────┘
```

### Article Membres
```
┌─────────────────────────────────────┐
│  [Image]              [🔒 Membres]  │
│                                     │
│  [RH]                               │
│  Newsletter RH Octobre 2024         │
│                                     │
│  Les dernières actualités RH et     │
│  modifications légales du mois...   │
│                                     │
│  #newsletter #rh #actualités        │
│  ─────────────────────────────────  │
│  📅 1 oct. 2024    Lire l'article → │
└─────────────────────────────────────┘
```

---

## 🔧 Configuration dans Sanity

### Option A: Utiliser le Fallback (Recommandé pour commencer)
**Rien à faire!** La page fonctionne déjà parfaitement avec le design fallback.

### Option B: Créer une Page Personnalisée dans Sanity

1. **Ouvrez Sanity Studio**: https://helvetiforma.sanity.studio/

2. **Créez une nouvelle Page**:
   - Cliquez sur "Page" dans le menu
   - "Create new"
   - Titre: "Articles & Ressources"
   - Slug: `articles`

3. **Configurez le Hero**:
   ```
   Titre: "Articles & Ressources"
   Sous-titre: "Explorez notre bibliothèque d'articles..."
   Bouton CTA:
     - Texte: "Parcourir les articles"
     - Lien: "#articles"
   ```

4. **Ajoutez des Sections** (optionnel):
   - Feature Cards pour les catégories
   - Rich Text pour des descriptions
   - Etc.

5. **SEO**:
   ```
   Meta Title: "Articles & Ressources | HelvetiForma"
   Description: "Découvrez nos articles sur..."
   Keywords: comptabilité, salaires, guides, etc.
   ```

6. **Publiez** ✅

---

## 📝 Comment les Articles Apparaissent

### Conditions pour qu'un Article Apparaisse:
1. ✅ Type: "post"
2. ✅ Slug défini
3. ✅ Publié (pas en draft)

### Informations Affichées:
Les articles utilisent ces champs Sanity:
```typescript
{
  title: string           // Titre de la carte
  slug: string           // Pour le lien
  excerpt: string        // Description courte (optionnel)
  publishedAt: date      // Date affichée
  image: image           // Image de la carte (optionnel)
  category: string       // Badge catégorie (optionnel)
  tags: string[]         // Tags affichés (optionnel)
  accessLevel: string    // Pour le badge (public/members/premium)
  price: number          // Prix si premium (optionnel)
}
```

---

## 🎯 Différence avec `/coins-des-docs`

| Fonctionnalité | `/coins-des-docs` | `/articles` |
|----------------|-------------------|-------------|
| **Source de données** | WordPress | Sanity |
| **Type de contenu** | Courses/Posts WP | Articles Sanity |
| **Lien de destination** | `/docs/[slug]` | `/posts/[slug]` |
| **Badges d'accès** | ❌ Non | ✅ Oui (Public/Members/Premium) |
| **Catégories visuelles** | ❌ Texte uniquement | ✅ Badge coloré |
| **Tags** | ❌ Non | ✅ Oui |
| **Prix affiché** | ❌ Non | ✅ Oui (pour premium) |
| **Image article** | ⚠️ Limitée | ✅ Optimisée |

---

## 🔗 Liens entre Pages

### Flow Utilisateur:
```
/articles
   │
   ├─→ Clic sur carte
   │
   └─→ /posts/[slug]
         │
         ├─→ Lecture article (si accès)
         │
         └─→ Paywall (si premium sans accès)
               │
               └─→ /contact (pour s'inscrire)
```

---

## 💡 Cas d'Utilisation

### 1. **Blog d'Entreprise**
```
- Articles gratuits pour attirer
- Articles membres pour fidéliser
- Articles premium pour monétiser
```

### 2. **Centre de Ressources**
```
- Guides gratuits de base
- Tutoriels membres avancés
- Formations premium complètes
```

### 3. **Base de Connaissances**
```
- FAQ publiques
- Documentation membres
- Guides premium détaillés
```

---

## 📈 Prochaines Étapes

### 1. **Créez des Articles Tests**
Dans Sanity Studio:
```
Article 1: Public
- Titre: "Introduction à la Comptabilité Suisse"
- Catégorie: Comptabilité
- Accès: Public

Article 2: Premium
- Titre: "Formation Complète: Gestion des Salaires"
- Catégorie: Salaires
- Accès: Premium
- Prix: 99 CHF
```

### 2. **Testez la Page**
```bash
# Démarrez le serveur
npm run dev

# Visitez
http://localhost:3000/articles
```

### 3. **Vérifiez les Liens**
- Cliquez sur une carte
- Vérifiez la redirection vers `/posts/[slug]`
- Testez avec un article public
- Testez avec un article premium

### 4. **Personnalisez dans Sanity** (optionnel)
- Créez la page "articles"
- Ajoutez des sections personnalisées
- Modifiez le hero

---

## 🎨 Personnalisation des Couleurs

### Badge Premium:
```typescript
// Fichier: src/app/(site)/articles/page.tsx
className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
```

### Badge Membres:
```typescript
className: 'bg-blue-600 text-white'
```

### Badge Catégorie:
```typescript
className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
```

---

## 🐛 Troubleshooting

### Les articles ne s'affichent pas?
**Vérifiez:**
1. Articles publiés dans Sanity (pas en draft)
2. Slug défini sur chaque article
3. Console du navigateur pour erreurs

### Les images ne se chargent pas?
**Vérifiez:**
1. Image uploadée dans Sanity
2. Configuration CORS de Sanity
3. URLs générées par `urlFor()`

### Les liens ne fonctionnent pas?
**Vérifiez:**
1. Slug de l'article correct
2. Route `/posts/[slug]` existe
3. Pas d'espace dans le slug

---

## ✅ Résumé

Vous avez maintenant:
- ✅ Une page `/articles` fonctionnelle
- ✅ Récupération automatique depuis Sanity
- ✅ Cartes élégantes avec badges d'accès
- ✅ Liens vers les articles complets
- ✅ Support public/membres/premium
- ✅ Design responsive
- ✅ Navigation intégrée

**La page est prête à l'emploi!** 🚀

Créez simplement vos articles dans Sanity et ils apparaîtront automatiquement sur `/articles`.

