# Scripts de Migration Sanity → WordPress + TutorLMS

Ce dossier contient les scripts nécessaires pour migrer le contenu de Sanity vers WordPress avec TutorLMS.

## 📁 Fichiers

- `migrate-to-wordpress.js` - Script principal de migration
- `test-connections.js` - Script de test des connexions
- `rollback-migration.js` - Script de rollback en cas de problème
- `migration-config.example.js` - Exemple de configuration

## 🚀 Utilisation

### 1. Préparation

1. **Configurer WordPress + TutorLMS** (déjà fait selon vous)
2. **Configurer les variables d'environnement** dans `.env.local` :

```bash
# Sanity (déjà configuré)
NEXT_PUBLIC_SANITY_PROJECT_ID=xzzyyelh
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_token

# WordPress
WORDPRESS_URL=https://your-wordpress-site.com
WORDPRESS_USERNAME=admin
WORDPRESS_PASSWORD=your_password
WORDPRESS_APP_PASSWORD=your_app_password  # Optionnel mais recommandé
```

3. **Installer les dépendances** :
```bash
npm install axios wordpress-api
```

### 2. Test des connexions

Avant de migrer, testez les connexions :

```bash
node scripts/test-connections.js
```

Ce script vérifie :
- ✅ Connexion à Sanity
- ✅ Connexion à WordPress
- ✅ Disponibilité de TutorLMS
- ✅ Permissions d'écriture

### 3. Migration

Une fois les tests passés, lancez la migration :

```bash
node scripts/migrate-to-wordpress.js
```

### 4. Rollback (si nécessaire)

Si la migration ne se passe pas bien :

```bash
node scripts/rollback-migration.js
```

## 📊 Ce qui est migré

### Articles Sanity → Posts WordPress + Cours TutorLMS

**Articles gratuits** :
- Deviennent des posts WordPress normaux
- Accessibles à tous

**Articles premium** :
- Deviennent des posts WordPress
- + Cours TutorLMS payants
- Prix configuré dans TutorLMS

### Pages Sanity → Pages WordPress

- Contenu des sections converti en HTML
- Métadonnées préservées

### Utilisateurs Sanity → Users WordPress

- Emails et noms migrés
- Mots de passe temporaires générés
- Rôle "subscriber" par défaut

### Achats Sanity → Enrollments TutorLMS

- Historique des achats
- Liens utilisateur → cours
- Statuts préservés

## 🔧 Configuration avancée

Copiez `migration-config.example.js` vers `migration-config.js` et personnalisez :

```javascript
module.exports = {
  // Mapping des catégories
  categoryMapping: {
    'comptabilite': 'Comptabilité',
    'salaires': 'Salaires',
    // ...
  },
  
  // Options de migration
  migration: {
    dryRun: false,        // Test sans modification
    batchSize: 10,        // Nombre d'éléments par lot
    delayMs: 1000,        // Délai entre les lots
    skipExisting: true    // Ignorer les éléments existants
  }
};
```

## 📝 Logs et rapports

- `migration.log` - Log détaillé de la migration
- `migration-report.json` - Rapport JSON avec statistiques
- `rollback-report.json` - Rapport de rollback

## ⚠️ Précautions

1. **Sauvegarde** : Faites une sauvegarde de WordPress avant la migration
2. **Test** : Testez d'abord sur un environnement de développement
3. **Rollback** : Gardez le script de rollback à portée de main
4. **Mots de passe** : Les utilisateurs devront réinitialiser leurs mots de passe

## 🐛 Dépannage

### Erreur de connexion WordPress
- Vérifiez l'URL WordPress
- Vérifiez les identifiants
- Utilisez un "Application Password" si possible

### Erreur de connexion Sanity
- Vérifiez le token API
- Vérifiez les permissions du token

### TutorLMS non détecté
- Vérifiez que TutorLMS est installé et activé
- Vérifiez les permissions de l'utilisateur

### Permissions insuffisantes
- L'utilisateur WordPress doit avoir les droits :
  - `edit_posts`
  - `edit_users`
  - `manage_options` (recommandé)

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans `migration.log`
2. Consultez le rapport dans `migration-report.json`
3. Utilisez le script de rollback si nécessaire
