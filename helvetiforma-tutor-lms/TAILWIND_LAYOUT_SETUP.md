# Configuration du Layout Tailwind CSS

Ce document explique comment reconstituer la configuration Tailwind CSS utilisée dans ce projet sur un autre site.

## Dépendances requises

Installer les dépendances suivantes dans votre projet :

```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "next": "^15.5.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4"
  }
}
```

## Configuration PostCSS

Créez un fichier `postcss.config.mjs` à la racine du projet avec le contenu suivant :

```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

## Configuration des styles globaux

Créez un fichier `globals.css` dans votre dossier `src/app` avec le contenu suivant :

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

## Utilisation dans les composants

Pour utiliser Tailwind CSS dans vos composants :

1. Importez les styles globaux dans votre fichier `layout.tsx` :
```typescript
import './globals.css';
```

2. Utilisez les classes Tailwind directement dans vos composants :
```jsx
<div className="flex flex-col items-center justify-center min-h-screen">
  <h1 className="text-4xl font-bold">Mon titre</h1>
</div>
```

## Thème et variables personnalisées

Le projet utilise un système de thème clair/sombre avec des variables CSS personnalisées et des couleurs Tailwind prédéfinies :

### Variables CSS de base
- `--background` : Couleur de fond
- `--foreground` : Couleur du texte
- `--font-sans` : Police principale (Geist Sans)
- `--font-mono` : Police monospace (Geist Mono)

### Couleurs de thème Tailwind
- Bleu : `bg-blue-50`, `text-blue-600`, `border-blue-200`
- Vert : `bg-green-50`, `text-green-600`, `border-green-200`
- Jaune : `bg-yellow-50`, `text-yellow-600`, `border-yellow-200`
- Violet : `bg-purple-50`, `text-purple-600`, `border-purple-200`
- Gris : `bg-gray-50`, `text-gray-600`, `border-gray-200`

### Emojis et icônes
Le projet utilise une combinaison d'emojis et d'icônes SVG :

1. Emojis pour les éléments de debug et les messages système :
```jsx
// Exemple de debug avec emoji
<h3 className="text-sm font-semibold text-yellow-800 mb-2">🐛 Debug Info</h3>
```

2. Icônes SVG pour les éléments d'interface :
```jsx
// Exemple d'icône SVG
<svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477..." />
</svg>
```

### Gradients
Le projet inclut également des dégradés pour certains éléments visuels :
```jsx
// Exemple de gradient
<div className="bg-gradient-to-br from-blue-500 to-indigo-600">
```

Ces variables et styles sont accessibles via les classes Tailwind ou directement en CSS via `var(--variable)`.

## Mode sombre

Le mode sombre est géré automatiquement via `prefers-color-scheme` avec des valeurs spécifiques pour les variables de couleur. Pour le personnaliser, modifiez les valeurs dans le bloc `@media (prefers-color-scheme: dark)`.

## Notes importantes

1. Assurez-vous que votre projet Next.js est configuré pour utiliser TypeScript si vous souhaitez conserver le typage strict.
2. Les polices Geist sont utilisées par défaut - assurez-vous de les inclure ou de les remplacer par vos propres polices.
3. Le système de thème utilise des variables CSS natives pour une meilleure performance et une maintenance plus facile.
