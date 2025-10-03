# Guide Complet: Articles avec Vidéos et Contenu Payant

Ce guide explique comment utiliser le nouveau système d'articles Sanity avec support vidéo et contenu premium.

## 🎯 Recommandation: Pourquoi Sanity?

**Sanity CMS** est le meilleur choix pour votre cas d'usage:

### ✅ Avantages de Sanity
- **Vidéos natives**: Support intégré pour YouTube, Vimeo, et MP4
- **Contrôle d'accès flexible**: Système personnalisable pour contenu payant
- **Performance optimale**: Architecture moderne avec Next.js
- **Intégration parfaite**: S'intègre avec votre système d'authentification existant
- **Expérience éditeur**: Interface moderne et intuitive
- **TypeScript natif**: Typage complet pour éviter les erreurs

### ❌ Limitations de WordPress
- Plugins payants nécessaires pour contenu premium
- Performance moins bonne avec vidéos
- Complexité d'intégration avec Next.js
- Maintenance plus lourde

---

## 📋 Fonctionnalités Implémentées

### 1. **Support Vidéo Complet** 📹
- **YouTube**: Intégration automatique avec URL
- **Vimeo**: Intégration automatique avec URL  
- **Vidéos MP4**: Upload direct de fichiers vidéo
- **Ratios d'aspect**: 16:9, 4:3, 1:1, 21:9
- **Légendes**: Ajoutez des descriptions aux vidéos

### 2. **Système de Contenu Payant** 💎
Trois niveaux d'accès:
- **🌐 Public**: Accessible à tous gratuitement
- **🔒 Membres**: Réservé aux utilisateurs connectés
- **💎 Premium**: Contenu payant avec prix

### 3. **Upload de PDFs** 📄
- Upload direct de fichiers PDF
- Titre et description pour chaque document
- Option "Premium" pour verrouiller certains PDFs
- Affichage de la taille du fichier
- Bouton de téléchargement élégant

### 4. **Rich Content dans Articles**
- **Images**: Avec alt text et légendes
- **Vidéos**: Intégration dans le contenu
- **Fichiers téléchargeables**: PDFs, docs, etc.
- **Mise en forme riche**: Titres, listes, citations, etc.

### 5. **SEO Optimisé** 🔍
- Meta title et description
- Open Graph tags
- Keywords
- Images optimisées

---

## 🚀 Utilisation dans Sanity Studio

### Créer un Article

1. **Ouvrez Sanity Studio**: `http://localhost:3333` (ou votre URL Sanity)

2. **Créez un nouveau Post**:
   - Cliquez sur "Post" dans le menu
   - Cliquez sur "Create new"

### Onglet "Contenu"

#### Informations de base:
```
✏️ Titre: "Guide Complet de la Comptabilité Suisse 2024"
🔗 Slug: Généré automatiquement (cliquez "Generate")
📝 Résumé: "Découvrez tout ce qu'il faut savoir..."
📅 Date de publication: Aujourd'hui
🖼️ Image principale: Upload une image
📂 Catégorie: Sélectionnez (Comptabilité, Salaires, etc.)
🏷️ Tags: Ajoutez des mots-clés
```

#### Documents PDF:
```
1. Cliquez sur "Add item" sous "Documents PDF"
2. Upload votre PDF
3. Titre: "Guide pratique 2024"
4. Description: "Document complet de 50 pages"
5. Cochez "Fichier premium uniquement" si nécessaire
```

#### Contenu (Body):
Ajoutez du contenu riche:

**Texte normal**:
- Tapez directement dans l'éditeur
- Utilisez les styles: Gras, Italique, Liens

**Ajouter une image**:
- Cliquez sur l'icône image
- Upload et ajoutez alt text + légende

**Ajouter une vidéo**:
```
1. Cliquez sur l'icône + → "Vidéo intégrée"
2. URL de la vidéo:
   - YouTube: https://www.youtube.com/watch?v=VIDEO_ID
   - Vimeo: https://vimeo.com/VIDEO_ID
   - MP4 direct: https://example.com/video.mp4
3. Ajoutez une légende
4. Choisissez le ratio d'aspect (16:9 recommandé)
```

**Ajouter un fichier téléchargeable**:
```
1. Cliquez sur l'icône + → "Fichier téléchargeable"
2. Upload le fichier
3. Titre: "Formulaire de déclaration"
4. Description: "Format PDF à remplir"
```

### Onglet "Accès & Tarification"

#### Contenu Public (Gratuit):
```
Niveau d'accès: 🌐 Public (Gratuit)
```

#### Contenu Membres:
```
Niveau d'accès: 🔒 Membres uniquement
Abonnement requis: Basic / Pro / Enterprise
```

#### Contenu Premium (Payant):
```
Niveau d'accès: 💎 Premium (Payant)
Prix (CHF): 49.00
Aperçu gratuit: 
  - Rédigez un extrait visible avant achat
  - 2-3 paragraphes recommandés
```

### Onglet "SEO"

```
Titre Meta: "Guide Comptabilité Suisse 2024 | HelvetiForma" (60 car. max)
Description Meta: "Guide complet et pratique..." (160 car. max)
Mots-clés: ["comptabilité", "suisse", "2024", "guide"]
```

---

## 💻 Côté Frontend (Next.js)

### Affichage des Articles

Les articles s'affichent automatiquement sur `/posts/[slug]` avec:

#### Design Moderne:
- Hero section avec gradient
- Badge de niveau d'accès (Public/Membres/Premium)
- Catégories et tags
- Image principale en grand format

#### Contrôle d'Accès Automatique:
```typescript
// Public: Tout le monde voit tout
// Membres: Seulement les utilisateurs connectés
// Premium: Seulement ceux qui ont acheté
```

#### Vidéos Intégrées:
- Chargement lazy (performance)
- Player responsive
- Support plein écran
- Légendes sous les vidéos

#### PDFs Téléchargeables:
- Section dédiée en bas d'article
- Icône PDF rouge distinctive
- Badge "Premium" si verrouillé
- Bouton "Télécharger" avec icône

#### Gating du Contenu:
Si l'utilisateur n'a pas accès:
```
┌─────────────────────────────┐
│    🔒 Contenu Premium       │
│                             │
│  Pour accéder à cet article │
│  premium (49 CHF)...        │
│                             │
│  [Se connecter] [Contact]   │
└─────────────────────────────┘
```

---

## 🔐 Logique d'Accès

### Dans `page.tsx`:

```typescript
// Détermine si l'utilisateur a accès
const hasAccess = 
  accessLevel === 'public' ||                                    // Public: OK
  (accessLevel === 'members' && session?.user) ||               // Membres: Connecté
  (accessLevel === 'premium' && session?.user?.hasPurchased?.[post._id])  // Premium: Acheté

// Affiche le bon contenu
const contentToShow = hasAccess ? post.body : post.previewContent
```

### Pour les PDFs:

```typescript
// Chaque PDF peut être premium indépendamment
const isPdfPremium = pdf.isPremium && !hasAccess

// Affiche soit "Télécharger" soit "Verrouillé"
```

---

## 🎨 Personnalisation

### Modifier les Catégories

Dans `sanity/schemaTypes/postType.ts`:
```typescript
options: {
  list: [
    {title: 'Ma Catégorie', value: 'ma-categorie'},
    // Ajoutez plus...
  ],
}
```

### Modifier les Niveaux d'Abonnement

```typescript
options: {
  list: [
    {title: 'Starter', value: 'starter'},
    {title: 'Business', value: 'business'},
    // Ajoutez plus...
  ],
}
```

### Changer les Couleurs

Dans `page.tsx`, modifiez les classes Tailwind:
```typescript
// Gradient hero
from-primary-600 to-primary-800

// Badge premium
from-yellow-400 to-orange-500
```

---

## 🔌 Intégration Paiement (À venir)

Pour activer les paiements, vous devrez:

### 1. Ajouter Stripe/PayPal

```bash
npm install @stripe/stripe-js stripe
```

### 2. Créer l'API de Paiement

```typescript
// src/app/api/checkout/route.ts
export async function POST(req: Request) {
  const { postId, userId } = await req.json()
  
  // Créer session de paiement Stripe
  const session = await stripe.checkout.sessions.create({
    // Configuration...
  })
  
  return Response.json({ url: session.url })
}
```

### 3. Sauvegarder les Achats

Ajoutez dans la base de données:
```typescript
// Table: user_purchases
{
  userId: string
  postId: string
  amount: number
  purchasedAt: timestamp
}
```

### 4. Vérifier l'Accès

Modifiez la logique:
```typescript
const hasPurchased = await checkUserPurchase(session.user.id, post._id)
const hasAccess = accessLevel === 'premium' && hasPurchased
```

---

## 📊 Exemples d'Utilisation

### Article Gratuit avec Vidéo
```
Titre: "Introduction à la Comptabilité"
Niveau d'accès: Public
Contenu:
  - Texte d'introduction
  - Vidéo YouTube explicative
  - Images illustratives
  - PDF gratuit: Checklist de base
```

### Article Premium
```
Titre: "Formation Complète: Salaires 2024"
Niveau d'accès: Premium
Prix: 99 CHF
Aperçu gratuit: 
  - Introduction (3 paragraphes)
  - Vidéo teaser (2 min)
Contenu complet:
  - 10 modules vidéo
  - 5 PDFs téléchargeables (premium)
  - Exercices pratiques
  - Templates Excel
```

### Article Membres
```
Titre: "Actualités Fiscales Mensuelles"
Niveau d'accès: Membres
Abonnement: Basic
Contenu:
  - Dernières actualités
  - Vidéo récapitulative
  - PDF résumé mensuel
```

---

## 🐛 Troubleshooting

### Les vidéos ne s'affichent pas
- Vérifiez l'URL de la vidéo
- Testez dans un navigateur directement
- Vérifiez les CORS si MP4 direct

### Les PDFs ne se téléchargent pas
- Vérifiez que `file.asset.url` existe
- Testez l'URL dans un navigateur
- Vérifiez les permissions Sanity

### Le contenu premium s'affiche quand même
- Vérifiez `session?.user` dans les dev tools
- Testez la logique `hasAccess`
- Regardez les logs console

### Erreur TypeScript
```bash
# Rebuild Sanity types
cd sanity
npm run build
```

---

## 📚 Ressources

- [Sanity Portable Text](https://www.sanity.io/docs/presenting-block-text)
- [Next.js Authentication](https://next-auth.js.org/)
- [Stripe Integration](https://stripe.com/docs/payments/checkout)
- [Video Embedding Best Practices](https://web.dev/patterns/media/video/)

---

## 🎯 Prochaines Étapes

1. **Testez dans Sanity Studio**:
   ```bash
   cd sanity
   npm run dev
   ```
   Ouvrez http://localhost:3333

2. **Créez votre premier article** avec vidéo et PDFs

3. **Testez les 3 niveaux d'accès**:
   - Public (déconnecté)
   - Membres (connecté)
   - Premium (à implémenter)

4. **Personnalisez** selon vos besoins

5. **Ajoutez Stripe** pour les paiements

---

## ✨ Résumé des Fichiers Modifiés

```
sanity/schemaTypes/postType.ts           ← Schema Sanity complet
src/components/ui/PortableTextComponents.tsx  ← Composants vidéo/PDF
src/app/(site)/posts/[slug]/page.tsx     ← Page article avec gating
```

**Vous êtes prêt à créer des articles riches avec vidéos et contenu payant!** 🚀

