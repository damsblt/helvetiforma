# 🖼️ Guide de Configuration des Images - Helvetiforma

## 📋 **Images Requises**

### **Images Principales (Hero)**
Ces images doivent être de haute qualité et optimisées pour le web :

#### **1. Hero Background (`hero-bg.jpg`)**
- **Dimensions recommandées** : 1920x1080px (16:9)
- **Format** : JPG
- **Taille max** : 500KB
- **Usage** : Arrière-plan principal de la page d'accueil
- **Contenu suggéré** : Formation professionnelle, bureau moderne, équipe au travail

#### **2. Concept Hero (`concept-hero.jpg`)**
- **Dimensions recommandées** : 1920x800px
- **Format** : JPG
- **Taille max** : 400KB
- **Usage** : Arrière-plan de la page Concept
- **Contenu suggéré** : Apprentissage, collaboration, innovation

#### **3. Contact Hero (`contact-hero.jpg`)**
- **Dimensions recommandées** : 1920x800px
- **Format** : JPG
- **Taille max** : 400KB
- **Usage** : Arrière-plan de la page Contact
- **Contenu suggéré** : Communication, service client, équipe

### **Images de Contenu**

#### **4. Learning Approach (`learning-approach.jpg`)**
- **Dimensions recommandées** : 800x600px
- **Format** : JPG
- **Taille max** : 200KB
- **Usage** : Section "Notre approche" de la page d'accueil
- **Contenu suggéré** : Formation en ligne, e-learning, technologie

#### **5. Philosophy Image (`philosophy-image.jpg`)**
- **Dimensions recommandées** : 800x600px
- **Format** : JPG
- **Taille max** : 200KB
- **Usage** : Section "Notre philosophie" de la page Concept
- **Contenu suggéré** : Réflexion, apprentissage, développement personnel

#### **6. Stats Background (`stats-bg.jpg`)**
- **Dimensions recommandées** : 1920x800px
- **Format** : JPG
- **Taille max** : 300KB
- **Usage** : Arrière-plan de la section statistiques
- **Contenu suggéré** : Données, graphiques, succès

#### **7. Concept CTA Background (`concept-cta-bg.jpg`)**
- **Dimensions recommandées** : 1200x600px
- **Format** : JPG
- **Taille max** : 250KB
- **Usage** : Arrière-plan de la section CTA de la page Concept
- **Contenu suggéré** : Action, motivation, formation

### **Icônes (PNG avec transparence)**

#### **Icônes Principales (64x64px)**
- `certification-icon.png` - Diplôme/certificat
- `flexibility-icon.png` - Horloge/flexibilité
- `support-icon.png` - Support/assistance
- `blended-learning-icon.png` - Formation hybride

#### **Icônes Secondaires (32x32px)**
- `quality-icon.png` - Qualité/excellence
- `online-learning-icon.png` - Formation en ligne
- `onsite-learning-icon.png` - Formation en présentiel

#### **Icônes de Contact (24x24px)**
- `location-icon.png` - Localisation/pin
- `phone-icon.png` - Téléphone
- `email-icon.png` - Email/enveloppe
- `clock-icon.png` - Horloge/horaires

## 🎨 **Spécifications Techniques**

### **Formats Recommandés**
- **Photos** : JPG (qualité 85-90%)
- **Icônes** : PNG avec transparence
- **Logos** : SVG (vectoriel) ou PNG haute résolution

### **Optimisation**
- **Compression** : Utilisez des outils comme TinyPNG, ImageOptim
- **Responsive** : Toutes les images doivent être responsives
- **Lazy Loading** : Implémenté automatiquement par Next.js Image

### **Accessibilité**
- **Alt Text** : Chaque image doit avoir un texte alternatif descriptif
- **Contraste** : Assurez-vous que le texte reste lisible sur les images d'arrière-plan

## 📁 **Structure des Dossiers**

```
public/
└── images/
    ├── hero-bg.jpg
    ├── concept-hero.jpg
    ├── contact-hero.jpg
    ├── learning-approach.jpg
    ├── philosophy-image.jpg
    ├── stats-bg.jpg
    ├── concept-cta-bg.jpg
    ├── certification-icon.png
    ├── flexibility-icon.png
    ├── support-icon.png
    ├── blended-learning-icon.png
    ├── quality-icon.png
    ├── online-learning-icon.png
    ├── onsite-learning-icon.png
    ├── location-icon.png
    ├── phone-icon.png
    ├── email-icon.png
    └── clock-icon.png
```

## 🚀 **Comment Ajouter vos Images**

### **Étape 1 : Préparer vos Images**
1. Créez ou sélectionnez vos images selon les spécifications ci-dessus
2. Optimisez-les pour le web (compression, redimensionnement)
3. Nommez-les exactement comme indiqué dans la liste

### **Étape 2 : Placer les Images**
1. Copiez toutes vos images dans le dossier `public/images/`
2. Vérifiez que les noms correspondent exactement
3. Assurez-vous que les formats sont corrects

### **Étape 3 : Vérifier l'Affichage**
1. Redémarrez votre serveur de développement
2. Vérifiez que toutes les images s'affichent correctement
3. Testez la responsivité sur différents écrans

## 🛠️ **Outils Recommandés**

### **Édition d'Images**
- **Gratuits** : GIMP, Canva, Pixlr
- **Payants** : Adobe Photoshop, Affinity Photo

### **Optimisation**
- **En ligne** : TinyPNG, Compressor.io
- **Applications** : ImageOptim (Mac), FileOptimizer (Windows)

### **Redimensionnement**
- **Batch** : IrfanView, XnConvert
- **En ligne** : ResizeImage.net

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### **Images Responsives**
- Utilisez `sizes` pour optimiser le chargement
- Les images s'adaptent automatiquement à la taille de l'écran
- Lazy loading pour améliorer les performances

## 🔧 **Configuration Next.js**

### **Image Component**
```tsx
import Image from 'next/image';

<Image
  src="/images/hero-bg.jpg"
  alt="Description de l'image"
  fill
  className="object-cover"
  priority={true}
/>
```

### **Optimisations Automatiques**
- **Compression automatique** : Next.js optimise automatiquement les images
- **Formats modernes** : WebP automatique pour les navigateurs compatibles
- **Lazy loading** : Chargement différé pour améliorer les performances

## 📊 **Performance**

### **Bonnes Pratiques**
- **Taille des fichiers** : Gardez les images sous 500KB
- **Dimensions** : Utilisez les bonnes dimensions pour éviter le redimensionnement
- **Formats** : JPG pour les photos, PNG pour les icônes avec transparence

### **Monitoring**
- **Lighthouse** : Vérifiez les scores de performance
- **Core Web Vitals** : Surveillez LCP, FID, CLS
- **PageSpeed Insights** : Analysez les performances

## 🆘 **Dépannage**

### **Images qui ne s'affichent pas**
1. Vérifiez le chemin dans `public/images/`
2. Vérifiez le nom exact du fichier
3. Vérifiez les permissions du fichier
4. Redémarrez le serveur de développement

### **Images de mauvaise qualité**
1. Vérifiez la résolution d'origine
2. Optimisez la compression
3. Utilisez des formats appropriés

### **Performance lente**
1. Compressez davantage les images
2. Utilisez des dimensions appropriées
3. Implémentez le lazy loading

## 📞 **Support**

Si vous avez des questions ou des problèmes avec la configuration des images :
1. Vérifiez ce guide en premier
2. Consultez la documentation Next.js Image
3. Contactez l'équipe de développement

---

**Note** : Ce guide est conçu pour optimiser l'expérience utilisateur et les performances de votre site Helvetiforma. Suivez ces recommandations pour un résultat optimal.
