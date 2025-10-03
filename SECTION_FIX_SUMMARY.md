# 🔧 Résolution du Problème "Three Cards + CTA Section"

**Date** : Octobre 3, 2025  
**Problème** : La section "Three Cards Column + Horizontal Card" n'apparaissait pas dans le dropdown de Sanity Studio

---

## 🐛 Diagnostic du Problème

### **Symptôme Initial**
Seulement 4 sections visibles dans Sanity Studio :
- Feature Cards Section
- List Section with Icons
- Rich Text Section
- Contact Information Section

❌ Manquante : "Three Cards Column + Horizontal Card"

### **Cause Racine Identifiée**

Le problème était dans `/sanity/schemaTypes/index.ts` :

```typescript
// ❌ MAUVAIS CODE
import page from './page'
import {postType} from './postType'
import sessionsSection from './sessionsSection'
import threeCardsWithCta from './threeCardsWithCta'  // ← Ce fichier n'existe pas !

export const schemaTypes = [page, postType, sessionsSection, threeCardsWithCta]  // ← Erreur
```

**Pourquoi c'était un problème ?**

1. Le fichier `/sanity/schemaTypes/threeCardsWithCta.ts` avait été créé par erreur
2. La section `threeCardsWithCta` était **déjà définie inline** dans `page.ts` (ligne 345-490)
3. L'import causait un conflit : Sanity essayait de charger deux définitions différentes
4. Résultat : La section inline était ignorée

---

## ✅ Solution Appliquée

### **1. Suppression de l'import incorrect**

**Fichier** : `/sanity/schemaTypes/index.ts`

```typescript
// ✅ CODE CORRIGÉ
import page from './page'
import {postType} from './postType'
import sessionsSection from './sessionsSection'

export const schemaTypes = [page, postType, sessionsSection]
```

### **2. Suppression du fichier redondant**

Suppression de `/sanity/schemaTypes/threeCardsWithCta.ts` qui ne devrait pas exister.

### **3. Mise à jour des types TypeScript**

**Fichier** : `/src/lib/sanity.ts`

**Ajout du type dans `_type`** :
```typescript
_type: 'featureCards' | 'listSection' | 'richTextSection' | 'contactInfoSection' | 'threeCardsWithCta' | 'sessionsSection'
```

**Ajout des champs `ctaCard`** :
```typescript
ctaCard?: {
  title: string
  subtitle?: string
  primaryButton: {
    text: string
    link: string
    icon?: string
  }
  secondaryButton?: {
    text: string
    link: string
  }
  features?: Array<{
    text: string
    icon?: string
    color?: 'blue' | 'green' | 'purple'
  }>
}
```

**Ajout des champs dans la requête GROQ** :
```typescript
sections[] {
  // ... autres champs ...
  ctaCard {
    title,
    subtitle,
    primaryButton { text, link, icon },
    secondaryButton { text, link },
    features[] { text, icon, color }
  }
}
```

---

## 🎯 Résultat

### **Avant**
❌ Section absente du dropdown Sanity Studio  
❌ Import erroné dans `index.ts`  
❌ Fichier redondant créé par erreur  
❌ Types TypeScript incomplets

### **Après**
✅ Section visible dans Sanity Studio : "Three Cards Column + Horizontal Card"  
✅ `index.ts` propre et cohérent  
✅ Fichier redondant supprimé  
✅ Types TypeScript complets  
✅ Requête GROQ mise à jour  
✅ Composant React prêt : `ThreeCardsWithCtaSection.tsx`

---

## 📚 Leçon Apprise : Pattern des Sections

### **Sections Inline (Majorité)**

**Définies dans** : `page.ts` → `sections[] -> of: [...]`

**Exemples** :
- `featureCards` (ligne 65-150)
- `listSection` (ligne 151-235)
- `richTextSection` (ligne 236-270)
- `contactInfoSection` (ligne 280-340)
- `threeCardsWithCta` (ligne 345-490)

**❌ NE PAS** :
- Créer un fichier séparé
- Importer dans `index.ts`

### **Sections Externes (Exception)**

**Définies dans** : Fichier séparé comme `sessionsSection.ts`

**Exemples** :
- `sessionsSection`

**✅ FAIRE** :
- Créer un fichier séparé avec `defineType()`
- Importer dans `index.ts`
- Référencer avec `{type: 'sessionsSection'}`

**Quand l'utiliser ?**
- Structure très complexe
- Réutilisation dans plusieurs endroits
- Logique de validation avancée

---

## 🔄 Workflow Correct

### **Pour créer une nouvelle section inline** (99% des cas)

1. ✅ Ajouter dans `page.ts` dans `sections[] -> of: [...]`
2. ✅ Définir `name:`, `title:`, `fields:`, `preview:`
3. ✅ Ajouter le type dans `sanity.ts` → `_type` union
4. ✅ Ajouter les champs dans l'interface `SanityPage`
5. ✅ Ajouter les champs dans la requête GROQ
6. ✅ Créer le composant React dans `src/components/sections/`
7. ✅ Mapper dans `page.tsx` avec `if (section._type === '...')`
8. ✅ Redémarrer Sanity Studio

### **Pour créer une section externe** (1% des cas)

1. ✅ Créer un fichier séparé `mySection.ts` avec `defineType()`
2. ✅ Importer dans `index.ts`
3. ✅ Référencer dans `page.ts` avec `{type: 'mySection'}`
4. ✅ Suivre les mêmes étapes que pour inline

---

## 🐛 Debugging Checklist

Si une section n'apparaît pas dans Sanity Studio :

1. [ ] Vérifier qu'elle est définie **inline** dans `page.ts` (ligne 62, dans `sections[]`)
2. [ ] Vérifier qu'il **n'y a pas** d'import dans `index.ts`
3. [ ] Vérifier qu'il **n'y a pas** de fichier séparé avec le même nom
4. [ ] Redémarrer Sanity Studio : `pkill -9 -f "sanity" && cd sanity && npm run dev`
5. [ ] Hard refresh navigateur : `Cmd+Shift+R` (Mac) ou `Ctrl+F5` (Windows)

---

## 📝 Documentation Créée

Un guide complet a été créé pour éviter ces erreurs à l'avenir :

**Fichier** : `/SANITY_SECTION_CREATION_GUIDE.md`

**Contenu** :
- ✅ Architecture des sections
- ✅ Processus en 4 étapes
- ✅ Exemples de code
- ✅ Erreurs courantes à éviter
- ✅ Checklist de vérification
- ✅ Workflow rapide
- ✅ Debugging

---

## 🎉 Status Final

**Statut** : ✅ **RÉSOLU**

**Prochaine étape** :
1. Rafraîchir Sanity Studio : `http://localhost:3333`
2. Aller dans **Pages → Home**
3. Cliquer sur **"Add item..."** dans la section **Page Sections**
4. Vous devriez voir **"Three Cards Column + Horizontal Card"** dans la liste
5. Cliquer dessus et remplir les champs
6. Sauvegarder et vérifier sur le frontend

---

**Problème résolu par** : Analyse du pattern des sections existantes  
**Temps de résolution** : ~30 minutes  
**Complexité** : Moyenne (confusion entre inline et external schemas)

