# Calendrier des Formations - Helvetiforma

## Vue d'ensemble

Le système de calendrier FullCalendar.js a été intégré à Helvetiforma pour offrir une gestion complète des formations et sessions avec un système de filtrage par catégories. Il permet aux utilisateurs de visualiser les formations programmées par thème et de s'inscrire directement depuis le calendrier.

## Fonctionnalités

### 🗓️ **Calendrier Public** (`/calendar`)
- **Filtrage par catégories** : Salaires, Charges sociales, Impôt à la source
- **Vue mensuelle** : Vue d'ensemble de tous les mois
- **Vue hebdomadaire** : Détail des semaines avec horaires
- **Vue journalière** : Détail complet d'une journée
- **Vue liste** : Liste chronologique des sessions
- **Codes couleur par thème** : Chaque catégorie a sa couleur distinctive
- **Inscription directe** : Formulaire d'inscription intégré dans le modal des événements
- **Recherche textuelle** : Recherche par titre ou description
- **URL avec filtres** : Partage direct de vues filtrées

### 🔧 **Calendrier Administrateur** (`/admin/calendar`)
- **Gestion des sessions** : Création, modification, suppression
- **Drag & Drop** : Modification des horaires par glisser-déposer
- **Création rapide** : Ajout de nouvelles sessions en cliquant sur une date
- **Filtrage par catégories** : Même système que le calendrier public
- **Vues multiples** : Toutes les vues du calendrier public
- **Contraintes métier** : Heures de travail (8h-20h, lundi-vendredi)

### 📱 **Widget de Formation**
- **Intégration** : Peut être ajouté aux pages de formation
- **Vue compacte** : Liste des 3 prochaines sessions
- **Vue étendue** : Calendrier complet de la formation
- **Responsive** : Adapté aux mobiles et tablettes

### 🔗 **Liens vers le Calendrier**
- **Composant CalendarLink** : Liens directs vers le calendrier avec filtres
- **Filtrage automatique** : Chaque formation mène au calendrier avec le bon thème
- **Variantes multiples** : Bouton, lien ou icône selon vos besoins
- **Intégration dans les pages** : Remplace "Demander l'inscription" par "Voir les dates"

### 📝 **Formulaire d'Inscription**
- **Intégré au calendrier** : Apparaît dans le modal des événements
- **Informations complètes** : Données personnelles, professionnelles et complémentaires
- **Validation** : Vérification des champs obligatoires
- **Expérience utilisateur** : Processus d'inscription fluide et intuitif

## Workflow Utilisateur

### 1. **Découverte des Formations**
- L'utilisateur visite une page de formation
- Il voit le bouton "Voir les dates" au lieu de "Demander l'inscription"

### 2. **Navigation vers le Calendrier**
- Clic sur "Voir les dates" → Redirection vers `/calendar?category=Thème`
- Le calendrier s'ouvre automatiquement avec le bon filtre appliqué

### 3. **Sélection de Session**
- L'utilisateur clique sur un événement dans le calendrier
- Modal avec détails de la formation et bouton "S'inscrire à cette formation"

### 4. **Inscription**
- Clic sur "S'inscrire" → Ouverture du formulaire d'inscription
- Remplissage des informations personnelles et professionnelles
- Soumission et confirmation

## Catégories et Couleurs

### 🟢 **Salaires**
- **Couleur** : Vert (`#10B981`)
- **Description** : Formations liées à la gestion des salaires
- **Icône** : Symbole monétaire
- **URL** : `/calendar?category=salaires`

### 🟣 **Charges Sociales**
- **Couleur** : Violet (`#8B5CF6`)
- **Description** : Formations sur les assurances et charges sociales
- **Icône** : Bouclier de protection
- **URL** : `/calendar?category=charges-sociales`

### 🟠 **Impôt à la Source**
- **Couleur** : Orange (`#F59E0B`)
- **Description** : Formations sur la fiscalité et l'impôt à la source
- **Icône** : Document fiscal
- **URL** : `/calendar?category=impot-a-la-source`

## Utilisation

### Pour les Utilisateurs

1. **Accéder au calendrier** : Cliquer sur "Voir les dates" dans les pages de formation
2. **Filtrer par catégorie** : Utiliser les boutons de catégorie colorés
3. **Rechercher** : Utiliser la barre de recherche pour trouver des formations
4. **Changer de vue** : Utiliser les boutons de vue (Mois, Semaine, Jour, Liste)
5. **S'inscrire** : Cliquer sur un événement puis "S'inscrire à cette formation"
6. **Partager des vues** : Les filtres sont conservés dans l'URL

### Pour les Administrateurs

1. **Accéder au calendrier admin** : Aller dans `/admin/calendar`
2. **Filtrer par catégorie** : Utiliser le même système de filtrage
3. **Créer une session** : Cliquer sur une date vide
4. **Modifier une session** : Glisser-déposer l'événement
5. **Voir les détails** : Cliquer sur un événement existant

### Intégration dans les Pages de Formation

```tsx
import CalendarLink from '@/components/CalendarLink';

// Bouton simple "Voir les dates"
<CalendarLink theme="Salaire" />

// Lien avec texte personnalisé
<CalendarLink theme="Assurances sociales" variant="link">
  Voir toutes les sessions Charges Sociales
</CalendarLink>

// Icône compacte
<CalendarLink theme="Impôt à la source" variant="icon" />
```

## Structure des Données

### Formation
```typescript
interface Formation {
  id: number;
  attributes: {
    Title: string;
    Description: string;
    Type: 'Présentiel' | 'En ligne';
    Theme: 'Salaire' | 'Assurances sociales' | 'Impôt à la source';
    difficulty: string;
    estimatedDuration: number;
    sessions?: Session[];
  };
}
```

### Session
```typescript
interface Session {
  id: number;
  attributes: {
    date: string; // ISO date string
    formation?: Formation;
  };
}
```

### Formulaire d'Inscription
```typescript
interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  experience: string;
  expectations: string;
  dietaryRestrictions: string;
  specialNeeds: string;
}
```

## Personnalisation

### Couleurs des Événements
- **Salaires** : Vert (`#10B981`)
- **Charges Sociales** : Violet (`#8B5CF6`)
- **Impôt à la Source** : Orange (`#F59E0B`)
- **Présentiel** : Couleur du thème
- **En ligne** : Gris (`#6B7280`)

### Heures de Travail
- **Début** : 08:00
- **Fin** : 20:00
- **Jours** : Lundi à Vendredi

### Localisation
- **Langue** : Français
- **Format de date** : Français (ex: "lundi 15 janvier 2024")
- **Format d'heure** : 24h (ex: "14:30")

## Intégration

### Ajouter le Widget à une Page
```tsx
import FormationCalendarWidget from '@/components/FormationCalendarWidget';

// Dans votre composant
<FormationCalendarWidget 
  formation={formationData} 
  height="500px" 
/>
```

### Utiliser le Calendrier Complet
```tsx
import FormationCalendar from '@/components/FormationCalendar';

// Dans votre composant
<FormationCalendar
  formations={formations}
  onEventClick={handleEventClick}
  onDateSelect={handleDateSelect}
  view="timeGridWeek"
  height="600px"
/>
```

### Lier vers le Calendrier avec Filtres
```tsx
import CalendarLink from '@/components/CalendarLink';

// Lien direct vers le calendrier filtré
<CalendarLink theme="Salaire" variant="button">
  Voir le calendrier Salaires
</CalendarLink>

// Navigation programmatique
const navigateToCalendar = (theme: string) => {
  window.location.href = `/calendar?category=${encodeURIComponent(theme)}`;
};
```

### Formulaire d'Inscription
```tsx
import FormationRegistrationForm from '@/components/FormationRegistrationForm';

// Dans votre composant
<FormationRegistrationForm
  formationTitle="Gestion des Salaires"
  formationTheme="Salaire"
  sessionDate="lundi 15 janvier 2024"
  sessionTime="09:00 - 17:00"
  onClose={() => setShowForm(false)}
  onSubmit={handleRegistrationSubmit}
/>
```

## API Endpoints

### Formations
- `GET /api/formations?populate=*` - Récupérer toutes les formations avec sessions

### Sessions
- `POST /api/sessions` - Créer une nouvelle session
- `PUT /api/sessions/:id` - Modifier une session existante
- `DELETE /api/sessions/:id` - Supprimer une session

### Inscriptions
- `POST /api/registrations` - Créer une nouvelle inscription
- `GET /api/registrations` - Récupérer les inscriptions
- `PUT /api/registrations/:id` - Modifier une inscription

## URL et Filtres

### Structure des URLs
- **Toutes les catégories** : `/calendar`
- **Salaires uniquement** : `/calendar?category=salaires`
- **Charges sociales** : `/calendar?category=charges-sociales`
- **Impôt à la source** : `/calendar?category=impot-a-la-source`

### Persistance des Filtres
- Les filtres sont conservés dans l'URL
- Possibilité de partager des vues filtrées
- Navigation arrière/avant respecte les filtres
- Bouton "Effacer" pour supprimer tous les filtres

## Dépendances

```json
{
  "@fullcalendar/react": "^6.1.10",
  "@fullcalendar/core": "^6.1.10",
  "@fullcalendar/daygrid": "^6.1.10",
  "@fullcalendar/timegrid": "^6.1.10",
  "@fullcalendar/interaction": "^6.1.10",
  "@fullcalendar/list": "^6.1.10"
}
```

## Support

### Problèmes Courants

1. **Événements non affichés** : Vérifier que les formations ont des sessions avec des dates valides
2. **Erreurs de drag & drop** : S'assurer que `editable={true}` est défini
3. **Problèmes de responsive** : Vérifier la hauteur du calendrier sur mobile
4. **Filtres non appliqués** : Vérifier que l'URL contient les bons paramètres
5. **Formulaire d'inscription** : Vérifier que tous les champs obligatoires sont remplis

### Développement

Pour ajouter de nouvelles fonctionnalités :
1. Étendre les interfaces TypeScript
2. Modifier les composants de calendrier
3. Mettre à jour les gestionnaires d'événements
4. Tester sur différents appareils et navigateurs

## Roadmap

- [x] **Filtrage par catégories** : Salaires, Charges sociales, Impôt à la source
- [x] **Liens directs** : Formation → Calendrier avec filtres
- [x] **URL avec filtres** : Partage et navigation
- [x] **Formulaire d'inscription** : Intégré au calendrier
- [x] **Boutons "Voir les dates"** : Remplacement de "Demander l'inscription"
- [ ] **Notifications** : Rappels automatiques pour les sessions
- [ ] **Synchronisation** : Export vers Google Calendar, Outlook
- [ ] **Récurrence** : Sessions répétitives (hebdomadaires, mensuelles)
- [ ] **Gestion des conflits** : Détection automatique des chevauchements
- [ ] **Statistiques** : Graphiques de fréquentation et planification
- [ ] **Filtres avancés** : Par instructeur, par lieu, par niveau
- [ ] **Gestion des inscriptions** : Dashboard admin pour les inscriptions
