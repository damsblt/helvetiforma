# 🎯 Azure AD Application Permissions - Step by Step

## ⚠️ IMPORTANT: You Need APPLICATION Permissions, Not Delegated!

**Current Problem:** You have **Delegated permissions** (Déléguée) but need **Application permissions** (Application)

**Delegated vs Application:**
- **Déléguée** = User must be logged in, access their own data
- **Application** = App acts on its own, no user login required ✅ **THIS IS WHAT WE NEED**

---

## 📋 Step-by-Step Guide

### Step 1: Click "+ Ajouter une autorisation"

In your current screen, click the blue **"+ Ajouter une autorisation"** button at the top.

---

### Step 2: Select Microsoft Graph

1. Click **"Microsoft Graph"**
2. **DO NOT** select "Autorisations déléguées"
3. **CLICK:** **"Autorisations d'application"** ⬅️ **IMPORTANT!**

---

### Step 3: Search and Add These Permissions

In the search box, type each permission and check the box:

#### Permission 1: Calendars.Read
```
Search: "Calendars.Read"
Find: Calendars.Read (Application)
Description: Read calendars in all mailboxes
☑️ CHECK THIS BOX
```

#### Permission 2: OnlineMeetings.Read.All
```
Search: "OnlineMeetings.Read"
Find: OnlineMeetings.Read.All (Application)
Description: Read all online meetings
☑️ CHECK THIS BOX
```

#### Permission 3: User.Read.All (for future use)
```
Search: "User.Read.All"
Find: User.Read.All (Application)
Description: Read all users' full profiles
☑️ CHECK THIS BOX (optional)
```

---

### Step 4: Click "Ajouter des autorisations"

Bottom of the modal, click the blue button.

---

### Step 5: **CRITICAL** - Grant Admin Consent

⚠️ **Without this step, permissions won't work!**

1. You'll see your new permissions in the list
2. Status will show: "Pas accordé pour HelvetiForma.ch" (orange warning)
3. **Click the button at the top:** **"Accorder un consentement d'administrateur pour HelvetiForma.ch"**
4. Confirm the dialog
5. Status should change to: **"Accordé pour HelvetiForma.ch"** ✅ (green checkmark)

---

### Step 6: You Can Remove Old Delegated Permissions (Optional)

The delegated permissions you have now (`Calendars.ReadWrite`, `OnlineMeetings.ReadWrite`) can be removed since we're using application permissions.

**To remove:**
1. Click the **"..."** menu on the right of each permission
2. Select **"Supprimer l'autorisation"**

**Keep only:**
- ✅ `openid` (Déléguée) - for admin login
- ✅ `profile` (Déléguée) - for admin login
- ✅ `email` (Déléguée) - for admin login
- ✅ `User.Read` (Déléguée) - for admin login
- ✅ `Calendars.Read` **(Application)** - NEW
- ✅ `OnlineMeetings.Read.All` **(Application)** - NEW
- 🟡 `User.Invite.All` (Déléguée) - Keep but grant consent if you want guest invitations

---

## 🔧 Fix User.Invite.All Warning

I see `User.Invite.All` has "Pas accordé pour HelvetiForma.ch" with warning icon.

**To fix:**
1. Just click **"Accorder un consentement d'administrateur"** at the top
2. This will grant consent for ALL permissions at once

---

## 📊 Final Permissions List Should Look Like:

| Permission | Type | Status |
|------------|------|--------|
| openid | Déléguée | Accordé ✅ |
| profile | Déléguée | Accordé ✅ |
| email | Déléguée | Accordé ✅ |
| User.Read | Déléguée | Accordé ✅ |
| **Calendars.Read** | **Application** | **Accordé ✅** |
| **OnlineMeetings.Read.All** | **Application** | **Accordé ✅** |

---

## 🧪 After Adding Permissions

1. **Save and close** Azure AD
2. **Refresh** your calendar page: http://localhost:3000/calendrier
3. **Check** browser console for: "Fetching webinars with application token (public access)"
4. **Should see** real events from damien@helvetiforma.onmicrosoft.com calendar!

---

## 🎯 Quick Summary

**What to do RIGHT NOW:**

1. ✅ Click **"+ Ajouter une autorisation"**
2. ✅ Select **Microsoft Graph**
3. ✅ Click **"Autorisations d'application"** (NOT déléguées!)
4. ✅ Search and add **"Calendars.Read"** (Application)
5. ✅ Search and add **"OnlineMeetings.Read.All"** (Application)
6. ✅ Click **"Ajouter des autorisations"**
7. ✅ Click **"Accorder un consentement d'administrateur pour HelvetiForma.ch"** ⬅️ **CRITICAL!**
8. ✅ Refresh your calendar page

---

**Once you grant admin consent, the real calendar events from damien@helvetiforma.onmicrosoft.com will appear!** 🎉

