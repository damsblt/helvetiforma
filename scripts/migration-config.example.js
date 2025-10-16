/**
 * Configuration pour la migration Sanity → WordPress + TutorLMS
 * 
 * Copiez ce fichier vers migration-config.js et configurez vos paramètres
 */

module.exports = {
  // Configuration Sanity (déjà dans .env.local)
  sanity: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN
  },

  // Configuration WordPress
  wordpress: {
    url: process.env.WORDPRESS_URL || 'https://your-wordpress-site.com',
    username: process.env.WORDPRESS_USERNAME || 'admin',
    password: process.env.WORDPRESS_PASSWORD || 'password',
    appPassword: process.env.WORDPRESS_APP_PASSWORD || ''
  },

  // Configuration TutorLMS
  tutorlms: {
    enabled: process.env.TUTORLMS_ENABLED === 'true',
    courseCategory: process.env.TUTORLMS_COURSE_CATEGORY || 'formations',
    defaultPrice: 0,
    currency: 'CHF'
  },

  // Options de migration
  migration: {
    dryRun: process.env.MIGRATION_DRY_RUN === 'true',
    batchSize: parseInt(process.env.MIGRATION_BATCH_SIZE) || 10,
    delayMs: parseInt(process.env.MIGRATION_DELAY_MS) || 1000,
    skipExisting: true,
    createBackup: true
  },

  // Mapping des catégories Sanity → WordPress
  categoryMapping: {
    'comptabilite': 'Comptabilité',
    'salaires': 'Salaires',
    'fiscalite': 'Fiscalité',
    'rh': 'Ressources Humaines',
    'gestion': 'Gestion',
    'autre': 'Autre'
  },

  // Mapping des niveaux d'accès Sanity → TutorLMS
  accessLevelMapping: {
    'public': 'free',
    'members': 'membership',
    'premium': 'paid'
  }
};
