# Guide de Sauvegarde Complète WordPress

## 🎯 Objectif
Créer une sauvegarde complète du site WordPress avant le transfert de propriété.

## 📋 Checklist de Sauvegarde

### 1. Sauvegarde via API (Script automatique)
```bash
# Exécuter le script de sauvegarde
cd /Users/damien/Documents/Oksan/helvetiforma_combine/helvetiforma_v3
node scripts/wordpress-backup.js
```

**Ce que récupère le script :**
- ✅ Toutes les pages et articles
- ✅ Tous les médias (images, documents)
- ✅ Utilisateurs et rôles
- ✅ Commentaires
- ✅ Catégories et tags
- ✅ Menus (si disponibles)
- ✅ Configuration du site

### 2. Sauvegarde des Fichiers (FTP/cPanel)
**Accès requis :** FTP ou cPanel File Manager

**Dossiers à récupérer :**
```
/wp-content/themes/          # Thème personnalisé
/wp-content/plugins/         # Plugins installés
/wp-content/uploads/         # Médias uploadés
/wp-config.php              # Configuration WordPress
.htaccess                   # Règles Apache
```

**Méthode recommandée :**
1. Se connecter via FTP (FileZilla, WinSCP)
2. Télécharger tout le dossier `/wp-content/`
3. Récupérer `wp-config.php` et `.htaccess`

### 3. Sauvegarde de la Base de Données
**Accès requis :** phpMyAdmin ou accès MySQL

**Étapes :**
1. Se connecter à phpMyAdmin
2. Sélectionner la base de données WordPress
3. Exporter → "Exporter" → "SQL"
4. Sauvegarder le fichier `.sql`

### 4. Sauvegarde des Certificats SSL
**Si applicable :**
- Certificat SSL (.crt, .key)
- Configuration HTTPS

## 🔧 Script de Sauvegarde Automatique

Le script `wordpress-backup.js` utilise vos variables d'environnement :

```bash
# Variables requises
NEXT_PUBLIC_WORDPRESS_API_URL="https://api.helvetiforma.ch/wp-json"
NEXT_PUBLIC_WORDPRESS_URL="https://api.helvetiforma.ch"
WORDPRESS_APP_USER="damien.balet@me.com"
WORDPRESS_APP_PASSWORD="EchU Msw4 5veB hETM aJvb Omcw"
```

## 📁 Structure de Sauvegarde

```
backup/
└── wordpress-backup-YYYY-MM-DD/
    ├── site-info.json          # Informations générales
    ├── pages.json              # Toutes les pages
    ├── posts.json              # Tous les articles
    ├── media.json              # Métadonnées des médias
    ├── users.json              # Utilisateurs et rôles
    ├── comments.json           # Commentaires
    ├── taxonomies.json         # Catégories et tags
    ├── menus.json              # Menus (si disponibles)
    ├── settings.json           # Configuration (si disponible)
    ├── backup-report.json      # Rapport de sauvegarde
    └── media/                  # Fichiers média téléchargés
        ├── image1.jpg
        ├── document1.pdf
        └── ...
```

## ⚠️ Limitations de la Sauvegarde API

**Ce que l'API NE peut PAS récupérer :**
- ❌ Fichiers du serveur (thème, plugins)
- ❌ Base de données complète
- ❌ Configuration serveur (.htaccess, wp-config.php)
- ❌ Plugins et leurs données
- ❌ Thème personnalisé et ses fichiers

## 🚀 Exécution du Script

```bash
# 1. Aller dans le dossier du projet
cd /Users/damien/Documents/Oksan/helvetiforma_combine/helvetiforma_v3

# 2. Charger les variables d'environnement
export NEXT_PUBLIC_WORDPRESS_API_URL="https://api.helvetiforma.ch/wp-json"
export NEXT_PUBLIC_WORDPRESS_URL="https://api.helvetiforma.ch"
export WORDPRESS_APP_USER="damien.balet@me.com"
export WORDPRESS_APP_PASSWORD="EchU Msw4 5veB hETM aJvb Omcw"

# 3. Exécuter le script
node scripts/wordpress-backup.js
```

## 📋 Checklist de Transfert

### Avant de vous retirer :
- [ ] Sauvegarde API exécutée
- [ ] Fichiers récupérés via FTP
- [ ] Base de données exportée
- [ ] Documentation technique créée
- [ ] Accès transférés (domaine, hébergement)
- [ ] Formation de la nouvelle personne

### Documentation à fournir :
- [ ] Guide d'administration
- [ ] Liste des plugins et leurs configurations
- [ ] Modifications personnalisées apportées
- [ ] Procédures de maintenance
- [ ] Contacts techniques (hébergeur, etc.)

## 🔒 Protection de la Propriété Intellectuelle

**À conserver :**
- Code source de vos développements
- Documentation de vos modifications
- Preuve de votre travail

**À transférer :**
- Configuration du site
- Contenu (pages, articles, médias)
- Accès techniques

## 📞 Support Post-Transfert

**Options :**
1. **Contrat de maintenance** : Support technique continu
2. **Formation** : Session de formation pour la nouvelle équipe
3. **Documentation** : Guide complet d'administration
4. **Support ponctuel** : Tarif horaire pour interventions

---

**Note importante :** Cette sauvegarde est une protection de votre travail et une preuve de livraison complète. Gardez-en une copie sécurisée.
