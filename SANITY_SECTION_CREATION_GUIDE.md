# 📘 Guide de Création de Sections dans Sanity CMS

## 🎯 Vue d'Ensemble

Ce guide explique **étape par étape** comment créer une nouvelle section de page éditable dans Sanity Studio pour HelvetiForma v3.

---

## 🏗️ Architecture des Sections

Les sections sont des composants modulaires qui peuvent être ajoutés aux pages via Sanity Studio. Elles suivent un pattern spécifique :

```
📁 Sanity Schema (Backend)
   └── sanity/schemaTypes/page.ts
       └── sections[] array
           └── Inline object definitions

📁 React Components (Frontend)
   └── src/components/sections/
       └── MyNewSection.tsx

📁 TypeScript Types
   └── src/lib/sanity.ts
       └── SanityPage interface

📁 Page Rendering
   └── src/app/(site)/page.tsx
       └── Section type mapping
```

---

## 📋 Processus Complet : 4 Étapes

### ✅ **Étape 1 : Définir le Schéma dans Sanity**

**Fichier** : `/sanity/schemaTypes/page.ts`

**Emplacement** : Dans le tableau `of: [...]` du champ `sections`

**Pattern à suivre** :

```typescript
// Dans le tableau sections[] -> of: [...]
{
  type: 'object',
  name: 'myNewSection',  // ⚠️ Nom technique unique (camelCase)
  title: 'My New Section',  // 🎨 Titre visible dans Sanity Studio
  fields: [
    {
      name: 'title', 
      type: 'string', 
      title: 'Section Title',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'subtitle', 
      type: 'text', 
      title: 'Section Subtitle',
      rows: 3
    },
    // ... autres champs
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle'
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'My New Section',
        subtitle: subtitle || 'No subtitle'
      }
    }
  }
}
```

**💡 Types de Champs Disponibles** :
- `string` : Texte court
- `text` : Texte long (avec `rows: 3` pour textarea)
- `array` : Liste d'éléments
- `object` : Objet imbriqué
- `boolean` : Oui/Non
- `number` : Nombre
- `image` : Image uploadée

**💡 Validation** :
```typescript
validation: (Rule) => Rule.required()
validation: (Rule) => Rule.min(1).max(5)
```

---

### ✅ **Étape 2 : Ajouter les Types TypeScript**

**Fichier** : `/src/lib/sanity.ts`

**1. Ajouter le type dans `_type`** :

```typescript
export interface SanityPage {
  // ...
  sections?: Array<{
    _key: string
    _type: 'featureCards' | 'listSection' | 'myNewSection'  // ← Ajouter ici
    // ...
  }>
}
```

**2. Ajouter les champs spécifiques** :

```typescript
export interface SanityPage {
  sections?: Array<{
    _key: string
    _type: 'featureCards' | 'listSection' | 'myNewSection'
    title?: string
    subtitle?: string
    
    // Champs spécifiques à myNewSection
    myField?: string
    myArray?: Array<{
      name: string
      value: number
    }>
  }>
}
```

**3. Mettre à jour la requête GROQ** :

```typescript
export async function getPageBySlug(slug: string): Promise<SanityPage | null> {
  const query = `*[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    // ...
    sections[] {
      _key,
      _type,
      title,
      subtitle,
      
      // Ajouter les champs de myNewSection
      myField,
      myArray[] {
        name,
        value
      }
    }
  }`
  
  const page = await sanityClient.fetch(query, { slug })
  return page
}
```

---

### ✅ **Étape 3 : Créer le Composant React**

**Fichier** : `/src/components/sections/MyNewSection.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'

interface MyNewSectionProps {
  title: string
  subtitle?: string
  myField?: string
  myArray?: Array<{
    name: string
    value: number
  }>
}

export default function MyNewSection({ 
  title, 
  subtitle,
  myField,
  myArray 
}: MyNewSectionProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-900 mb-6"
          >
            {title}
          </motion.h2>
          
          {subtitle && (
            <p className="text-xl text-gray-600 mb-8">
              {subtitle}
            </p>
          )}
          
          {myField && (
            <div className="mb-8">
              <p>{myField}</p>
            </div>
          )}
          
          {myArray && myArray.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {myArray.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

**💡 Bonnes Pratiques** :
- ✅ Utiliser `'use client'` si le composant utilise Framer Motion ou hooks React
- ✅ Utiliser des animations Framer Motion pour un effet professionnel
- ✅ Toujours gérer les cas où les props sont `undefined` avec `?` et `&&`
- ✅ Utiliser Tailwind CSS pour le styling
- ✅ Responsive design avec `md:` et `lg:` breakpoints

---

### ✅ **Étape 4 : Mapper la Section dans la Page**

**Fichier** : `/src/app/(site)/page.tsx` (ou autre page)

```typescript
import MyNewSection from '@/components/sections/MyNewSection'

export default async function HomePage() {
  const content = await getPageBySlug('home')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {content?.hero && <HeroSection hero={content.hero} />}
      
      {/* Dynamic Sections from Sanity CMS */}
      {content?.sections?.map((section: any) => {
        
        // ... autres sections existantes ...
        
        // My New Section
        if (section._type === 'myNewSection') {
          return (
            <MyNewSection
              key={section._key}
              title={section.title}
              subtitle={section.subtitle}
              myField={section.myField}
              myArray={section.myArray}
            />
          )
        }
        
        return null
      })}
    </div>
  )
}
```

**💡 Pattern de Mapping** :
```typescript
if (section._type === 'sectionName') {
  return <SectionComponent key={section._key} {...section} />
}
```

---

## ⚠️ Erreurs Courantes à Éviter

### ❌ **Erreur 1 : Créer un fichier séparé pour une section inline**

**Mauvais** :
```typescript
// ❌ NE PAS créer un fichier séparé pour les sections inline
// sanity/schemaTypes/myNewSection.ts
export default defineType({
  name: 'myNewSection',
  type: 'object',
  // ...
})

// ❌ NE PAS l'importer dans index.ts
import myNewSection from './myNewSection'
export const schemaTypes = [page, postType, myNewSection]  // ❌ MAUVAIS
```

**Bon** :
```typescript
// ✅ Définir directement dans page.ts dans le tableau sections[] -> of: [...]
{
  type: 'object',
  name: 'myNewSection',
  fields: [...]
}
```

**💡 Quand créer un fichier séparé ?**
- Uniquement pour les sections qui doivent être référencées avec `{type: 'nomDeLaSection'}`
- Exemple : `sessionsSection` car il a une structure complexe et réutilisable

---

### ❌ **Erreur 2 : Oublier d'ajouter le type dans sanity.ts**

Si vous oubliez d'ajouter `'myNewSection'` dans le type `_type`, TypeScript ne reconnaîtra pas la section.

**Solution** : Toujours ajouter le nouveau type dans :
```typescript
_type: 'featureCards' | 'listSection' | 'myNewSection'  // ← Ajouter ici
```

---

### ❌ **Erreur 3 : Oublier d'ajouter les champs dans la requête GROQ**

Si les champs ne sont pas dans la requête GROQ, ils ne seront pas récupérés.

**Solution** : Ajouter tous les champs dans `sections[] { ... }` :
```typescript
sections[] {
  _key,
  _type,
  title,
  subtitle,
  myField,      // ← Ajouter ici
  myArray[] {   // ← Et les sous-champs
    name,
    value
  }
}
```

---

### ❌ **Erreur 4 : Ne pas redémarrer Sanity Studio après modification du schéma**

**Solution** : Toujours redémarrer Sanity Studio :
```bash
cd sanity
npm run dev
```

Puis **hard refresh** dans le navigateur : `Cmd+Shift+R` (Mac) ou `Ctrl+F5` (Windows)

---

## 🔄 Checklist de Vérification

Avant de tester dans Sanity Studio, vérifiez :

- [ ] ✅ Section définie **inline** dans `page.ts` dans `sections[] -> of: [...]`
- [ ] ✅ `name:` unique et en camelCase
- [ ] ✅ `title:` descriptif pour Sanity Studio
- [ ] ✅ `preview:` défini pour affichage dans la liste
- [ ] ✅ Type ajouté dans `_type` union dans `sanity.ts`
- [ ] ✅ Champs ajoutés dans l'interface `SanityPage`
- [ ] ✅ Champs ajoutés dans la requête GROQ
- [ ] ✅ Composant React créé dans `src/components/sections/`
- [ ] ✅ Mapping ajouté dans `page.tsx` avec `if (section._type === '...')`
- [ ] ✅ Sanity Studio redémarré
- [ ] ✅ Hard refresh dans le navigateur

---

## 📚 Exemples de Sections Existantes

### **1. Feature Cards Section** (Simple)

**Schéma** : `page.ts` ligne 65-150
**Composant** : `FeatureCardsSection.tsx`
**Usage** : Cartes avec icônes et descriptions

### **2. List Section with Icons** (Moyen)

**Schéma** : `page.ts` ligne 151-235
**Composant** : `ListIconSection.tsx`
**Usage** : Liste d'items avec icônes et CTA

### **3. Contact Information Section** (Complexe)

**Schéma** : `page.ts` ligne 280-340
**Composant** : `ContactInfoSection.tsx`
**Usage** : Section avec contactItems, liens, et CTA

### **4. Sessions Section** (Externe)

**Schéma** : `sessionsSection.ts` (fichier séparé)
**Composant** : `SanitySessionsSection.tsx`
**Usage** : Section complexe avec cartes et CTA imbriqué

---

## 🎨 Conventions de Nommage

| Type | Convention | Exemple |
|------|-----------|---------|
| Nom technique (`name:`) | camelCase | `myNewSection` |
| Titre Sanity (`title:`) | Title Case | `My New Section` |
| Nom de fichier composant | PascalCase | `MyNewSection.tsx` |
| Type TypeScript | Same as name | `'myNewSection'` |

---

## 🚀 Workflow Rapide

1. **Modifier** : `sanity/schemaTypes/page.ts` → Ajouter dans `sections[] -> of: [...]`
2. **Typer** : `src/lib/sanity.ts` → Ajouter type + champs + requête GROQ
3. **Créer** : `src/components/sections/MyNewSection.tsx`
4. **Mapper** : `src/app/(site)/page.tsx` → Ajouter `if (section._type === '...')`
5. **Tester** : Redémarrer Sanity Studio + Hard refresh

---

## 🐛 Debugging

### La section n'apparaît pas dans le dropdown ?

1. Vérifiez que la section est **inline** dans `page.ts`
2. Vérifiez qu'il n'y a pas d'import dans `index.ts`
3. Redémarrez Sanity Studio : `pkill -9 -f "sanity" && cd sanity && npm run dev`
4. Hard refresh : `Cmd+Shift+R`

### La section ne s'affiche pas sur le site ?

1. Vérifiez que le type est dans `_type` union dans `sanity.ts`
2. Vérifiez que les champs sont dans la requête GROQ
3. Vérifiez que le mapping existe dans `page.tsx`
4. Vérifiez la console navigateur pour les erreurs

### TypeScript Errors ?

1. Vérifiez que tous les champs sont optionnels avec `?`
2. Vérifiez que le composant gère les valeurs `undefined`
3. Vérifiez que les types correspondent entre Sanity et le composant

---

## 📞 Support

Si vous rencontrez des problèmes, consultez :
- Les sections existantes dans `page.ts`
- Les composants existants dans `src/components/sections/`
- La documentation Sanity : https://www.sanity.io/docs

---

**Dernière mise à jour** : Octobre 3, 2025

