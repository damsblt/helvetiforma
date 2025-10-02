# Convention de Naming HF pour les Événements Teams

## Vue d'ensemble

Cette documentation explique la convention de naming utilisée pour filtrer les événements Teams qui doivent être affichés sur la page Calendrier de l'application HelvetiForma.

## Règle de Filtrage

**Seuls les événements Teams dont le titre contient "HF" (insensible à la casse) sont affichés sur l'application.**

### Exemples d'événements VALIDES :
- ✅ `HF - Introduction à la Comptabilité Suisse`
- ✅ `hf - Gestion des Salaires`
- ✅ `Formation HF - Nouveautés 2024`
- ✅ `HF Session Q&A avec les Experts`

### Exemples d'événements FILTRÉS (non affichés) :
- ❌ `Introduction à la Comptabilité Suisse`
- ❌ `Gestion des Salaires : Nouveautés 2024`
- ❌ `Session Q&A avec les Experts`
- ❌ `Réunion équipe`

## Implémentation Technique

### Fonction de Validation
```typescript
function isValidHFEvent(title: string): boolean {
  if (!title) return false
  
  // Vérifier si le titre contient "HF" (insensible à la casse)
  return title.toLowerCase().includes('hf')
}
```

### Filtrage Automatique
Le filtrage est appliqué automatiquement dans les fonctions suivantes :
- `getTeamsWebinars()` - Liste tous les événements
- `getTeamsWebinar(id)` - Récupère un événement spécifique
- `createTeamsWebinar()` - Ajoute automatiquement le préfixe "HF" si absent

### Logs de Filtrage
L'application génère des logs pour tracer les événements filtrés :
```
Événement filtré (pas de préfixe HF): "Introduction à la Comptabilité Suisse"
Filtrage HF: 10 événements trouvés, 3 événements avec préfixe HF conservés
```

## Création d'Événements

### Via l'API
Lors de la création d'un événement via l'API, le préfixe "HF" est automatiquement ajouté si absent :

```typescript
// Si le titre ne contient pas "HF", il sera automatiquement préfixé
const titleWithHF = webinarData.title.toLowerCase().includes('hf') 
  ? webinarData.title 
  : `HF - ${webinarData.title}`
```

### Via Microsoft Teams
Pour créer des événements directement dans Teams qui apparaîtront sur l'application :

1. Créer un nouvel événement dans le calendrier Teams
2. **OBLIGATOIRE** : Inclure "HF" dans le titre de l'événement
3. L'événement apparaîtra automatiquement sur la page Calendrier

## Avantages de cette Convention

1. **Sécurité** : Seuls les événements officiels HelvetiForma sont affichés
2. **Simplicité** : Convention claire et facile à suivre
3. **Flexibilité** : "HF" peut être placé n'importe où dans le titre
4. **Automatisation** : Filtrage automatique sans intervention manuelle

## Maintenance

### Vérification des Événements
Pour vérifier quels événements sont filtrés, consulter les logs de l'application :
- Les événements filtrés sont loggés avec le message : `Événement filtré (pas de préfixe HF)`
- Le nombre total d'événements trouvés vs conservés est affiché

### Modification de la Convention
Si la convention doit être modifiée, mettre à jour la fonction `isValidHFEvent()` dans `src/lib/microsoft.ts`.

## Exemples d'Utilisation

### Titres Recommandés
```
HF - Webinaire Comptabilité Débutant
HF Formation Salaires 2024
HF Session Q&A Experts
HF - Atelier Pratique
```

### Événements de Test
Les données mock incluent des exemples avec le préfixe HF pour les tests de développement.

---

**Note** : Cette convention s'applique uniquement aux événements Teams synchronisés avec l'application HelvetiForma. Les autres événements du calendrier restent privés et ne sont pas affectés.
