# Admin Role Issue - Cannot Grant Consent

## 🔴 Problem

You're seeing: **"Approbation administrateur requise"** when trying to grant consent for application permissions.

**Cause:** Your account needs one of these admin roles to grant consent for **Application permissions**:
- ✅ **Global Administrator** (Administrateur général)
- ✅ **Cloud Application Administrator**
- ✅ **Application Administrator**

Your current role: **"Administrateur d'IA et 3 autres rôles"** - This might not include the necessary permissions.

---

## ✅ Solution Option 1: Assign Yourself Global Admin (Recommended)

### Step 1: Check Your Current Roles

1. In Entra Admin Center, click on your name (top right)
2. Click **"View account"**
3. Check what roles you have

**OR**

1. Go to: **Entra ID** → **Rôles et administrateurs**
2. Search for: "Administrateur général" (Global Administrator)
3. Click on it
4. Check if **"Damien Balet"** is listed

---

### Step 2: Assign Global Administrator Role

**If you're the tenant owner:**

1. Go to: **Entra ID** → **Utilisateurs** → **Tous les utilisateurs**
2. Click on your user: **Damien Balet**
3. Click **"Rôles attribués"** (left sidebar)
4. Click **"+ Ajouter des attributions"**
5. Search for: **"Administrateur général"** (Global Administrator)
6. Check the box
7. Click **"Ajouter"**
8. **Wait 5-10 minutes** for the role to propagate
9. **Sign out and sign back in** to Azure Portal

---

## ✅ Solution Option 2: Use Another Admin Account

If you have another admin account in your tenant:

1. Ask that admin to:
   - Go to your app in Azure Portal
   - Go to API permissions
   - Click "Accorder un consentement d'administrateur"
   - Approve the permissions

---

## ✅ Solution Option 3: Alternative Approach (Workaround)

**Instead of using Application permissions, we can use Delegated permissions with your account:**

### What This Means:
- You log in once with your admin account
- The app stores your access token
- Uses your calendar to display events
- No public anonymous access, but simpler setup

**Would you like me to implement this workaround?**

---

## 📋 How to Check If You're Global Admin

### Method 1: Via Azure Portal
```
1. Go to: portal.azure.com
2. Azure Active Directory → Roles and administrators
3. Click: "Global Administrator"
4. Check if your name (Damien Balet) is in the list
```

### Method 2: Via Microsoft 365 Admin Center
```
1. Go to: admin.microsoft.com
2. Users → Active users
3. Click your user
4. Roles tab
5. Should show "Global administrator"
```

---

## 🎯 Recommended Action

**With Microsoft 365 Business Standard, you SHOULD be able to assign yourself Global Admin if you're the tenant owner.**

### Quick Steps:
1. Go to **admin.microsoft.com** (Microsoft 365 Admin Center)
2. **Utilisateurs** → **Utilisateurs actifs**
3. Click your user: **damien@helvetiforma.onmicrosoft.com**
4. Click **Gérer les rôles**
5. Select **"Administrateur général"**
6. **Save**
7. **Sign out** and **sign back in**
8. Go back to Azure Portal API permissions
9. The "Accorder un consentement" button should now work!

---

## ⚠️ If You Still Can't Assign Global Admin

This might mean:
1. You're not the tenant owner
2. Another account is the Global Admin
3. Your subscription has restrictions

**Contact Microsoft Support** or check who created the tenant originally.

---

## 💡 Quick Test

Try this URL to see your current roles:
```
https://portal.azure.com/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/UserRoles
```

This will show all your assigned admin roles.

---

Would you like me to:
1. Wait while you assign yourself Global Admin role?
2. Or implement the workaround approach using delegated permissions?



