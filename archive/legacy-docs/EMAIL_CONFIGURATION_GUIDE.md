# 📧 Guide de Configuration Email - HelvetiForma v3

**Date:** 1 octobre 2025  
**Status:** 🔧 Configuration en cours

---

## 🎯 Problème Identifié

Le système email rencontre des erreurs SSL/TLS :
```
SSL routines:ssl3_get_record:wrong version number
```

## 🔧 Solution Appliquée

### 1. Configuration SSL/TLS Standardisée

J'ai standardisé la configuration email pour gérer correctement SSL/TLS :

```typescript
// Configuration dynamique SSL/TLS
const port = parseInt(process.env.EMAIL_SERVER_PORT || '587')
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: port,
  secure: port === 465,        // true pour port 465, false pour autres
  requireTLS: port !== 465,    // requireTLS pour ports non-SSL
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})
```

### 2. Variables d'Environnement Mises à Jour

Le fichier `env.example` a été mis à jour avec les bonnes variables :

```env
# Email Configuration (for contact form) - Hostpoint
EMAIL_SERVER_HOST=asmtp.mail.hostpoint.ch
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=contact@helvetiforma.ch
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=contact@helvetiforma.ch
```

---

## 🚀 Étapes de Configuration

### 1. Créer le fichier `.env.local`

Créez un fichier `.env.local` dans la racine du projet avec vos vraies valeurs :

```bash
# Copier le template
cp env.example .env.local

# Éditer avec vos vraies valeurs
nano .env.local
```

### 2. Configurer les Variables Email

Remplacez les valeurs suivantes dans `.env.local` :

```env
EMAIL_SERVER_HOST=asmtp.mail.hostpoint.ch
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=contact@helvetiforma.ch
EMAIL_SERVER_PASSWORD=VOTRE_VRAI_MOT_DE_PASSE_EMAIL
EMAIL_FROM=contact@helvetiforma.ch
```

### 3. Tester la Connexion

```bash
# Démarrer le serveur
npm run dev

# Tester la connexion email (dans un autre terminal)
curl http://localhost:3000/api/test-email-connection
```

### 4. Tester le Formulaire de Contact

1. Aller sur `http://localhost:3000/contact`
2. Remplir le formulaire
3. Vérifier que l'email est envoyé

---

## 🔍 Configuration Hostpoint

### Paramètres SMTP Hostpoint

- **Serveur SMTP:** `asmtp.mail.hostpoint.ch`
- **Port SSL:** `465` (recommandé)
- **Port STARTTLS:** `587` (alternative)
- **Sécurité:** SSL/TLS
- **Authentification:** Oui

### Configuration Recommandée

```env
EMAIL_SERVER_HOST=asmtp.mail.hostpoint.ch
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=contact@helvetiforma.ch
EMAIL_SERVER_PASSWORD=votre_mot_de_passe
EMAIL_FROM=contact@helvetiforma.ch
```

---

## 🧪 Tests de Validation

### 1. Test de Connexion

```bash
curl http://localhost:3000/api/test-email-connection
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Email server connection successful",
  "timestamp": "2025-10-01T..."
}
```

### 2. Test du Formulaire de Contact

1. Aller sur `/contact`
2. Remplir le formulaire
3. Soumettre
4. Vérifier les logs du serveur
5. Vérifier la réception de l'email

### 3. Test de l'Authentification Email

1. Aller sur `/login`
2. Entrer un email
3. Vérifier la réception du magic link
4. Tester la connexion

---

## 🐛 Dépannage

### Erreur "wrong version number"

**Cause:** Mismatch entre port et configuration SSL

**Solution:**
- Port 465 : `secure: true`
- Port 587 : `secure: false, requireTLS: true`

### Erreur "Connection timeout"

**Cause:** Mauvais serveur ou port

**Solution:**
- Vérifier `EMAIL_SERVER_HOST`
- Vérifier `EMAIL_SERVER_PORT`
- Tester avec port 587 si 465 ne fonctionne pas

### Erreur "Authentication failed"

**Cause:** Mauvais identifiants

**Solution:**
- Vérifier `EMAIL_SERVER_USER`
- Vérifier `EMAIL_SERVER_PASSWORD`
- S'assurer que le compte email existe

---

## 📊 Status des Tests

- [ ] **Connexion SMTP** : À tester
- [ ] **Formulaire de contact** : À tester  
- [ ] **Magic link auth** : À tester
- [ ] **Production** : À déployer

---

## 🎯 Prochaines Étapes

1. **Configurer `.env.local`** avec les vraies valeurs
2. **Tester la connexion** avec `/api/test-email-connection`
3. **Tester le formulaire** de contact
4. **Déployer en production** avec les bonnes variables
5. **Valider** que tout fonctionne en production

---

**Configuration email prête !** 🎉

Il ne reste plus qu'à configurer les vraies valeurs dans `.env.local` et tester.
