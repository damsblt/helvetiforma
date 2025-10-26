# 🔧 Fix : "The mailbox is either inactive"

## Problème
Le compte `damien@helvetiforma.onmicrosoft.com` n'a pas de boîte aux lettres Exchange Online.

## Solutions

### Option 1 : Activer Exchange Online pour damien@

1. Aller sur https://portal.azure.com
2. Azure Active Directory → Users
3. Chercher `damien@helvetiforma.onmicrosoft.com`
4. Onglet "Licenses" ou "Licences"
5. Cliquer "Assignments"
6. Ajouter une licence Microsoft 365 (Business Basic, Standard, etc.)
7. Sauvegarder

**Attendre 5-10 minutes** que la boîte aux lettres soit créée.

### Option 2 : Utiliser un autre compte avec Exchange Online

Si vous avez déjà un compte avec Exchange Online (ex: `info@helvetiforma.ch` ou un autre employé):

1. Mettre à jour `.env.local`:
```env
MICROSOFT_CALENDAR_USER=info@helvetiforma.ch
```

2. Redémarrer le serveur

3. Tester l'API:
```bash
curl http://localhost:3000/api/webinars
```

### Option 3 : Créer un compte dédié

Créer un nouveau compte Microsoft 365 avec licence Exchange:

1. Azure Portal → Users → New user
2. Créer `events@helvetiforma.onmicrosoft.com`
3. Attribuer une licence Exchange Online
4. Mettre à jour `.env.local`:
```env
MICROSOFT_CALENDAR_USER=events@helvetiforma.onmicrosoft.com
```

## Vérification

Après avoir activé Exchange, testez:

```bash
curl http://localhost:3000/api/webinars
```

Vous devriez voir les 3 événements d'octobre 2025.

## Notes importantes

- Le compte DOIT avoir une licence Exchange Online
- Sinon l'API retournera "mailbox is either inactive"
- Attendez quelques minutes après l'activation de la licence
