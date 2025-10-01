# Public Calendar with Microsoft Tenant Guest Invitation

## 🎯 New Workflow

1. ✅ Anyone can visit `/calendrier` (no login required)
2. ✅ View all upcoming webinars
3. 🔄 Click "S'inscrire maintenant" → Redirects to Microsoft tenant guest request form
4. ⏳ User submits request to join tenant as guest
5. ✅ Admin approves in Entra Admin Center
6. 📧 User receives invitation email
7. ✅ User accepts invitation and can join Teams meetings

---

## 📋 Part 1: Frontend Changes

### 1.1 Remove Middleware Protection

**File:** `src/middleware.ts`

**Change:**
```typescript
// Remove /calendrier from protected routes
export const config = {
  matcher: [
    // Remove this line:
    // '/calendrier/:path*',
    
    // Keep only if needed:
    '/admin/:path*',
  ],
}
```

### 1.2 Update Calendar Page

**File:** `src/app/(site)/calendrier/page.tsx`

**Changes:**
1. Remove authentication requirement
2. Change button to redirect to guest invitation
3. Show public information

```typescript
const handleRegister = async (webinarId: string, webinarTitle: string) => {
  // Option 1: Redirect to Microsoft guest invitation form
  const tenantId = '0c41c554-0d55-4550-8412-ba89c98481f0'
  const inviteUrl = `https://signup.microsoft.com/get-started/signup?sku=guest&ru=https://myaccount.microsoft.com/?tenantId=${tenantId}`
  
  // Store webinar info in sessionStorage for after registration
  sessionStorage.setItem('pendingWebinar', JSON.stringify({
    id: webinarId,
    title: webinarTitle
  }))
  
  // Redirect to Microsoft invitation
  window.location.href = inviteUrl
  
  // Option 2: Show modal with instructions
  // setShowInviteModal(true)
}
```

### 1.3 Update API Routes

**File:** `src/app/api/webinars/route.ts`

Use **application credentials** instead of user token:

```typescript
export async function GET(request: NextRequest) {
  // Use app-only authentication (no user session required)
  const accessToken = await getApplicationAccessToken()
  
  const webinars = await getTeamsWebinars({
    accessToken: accessToken,
    limit: limit ? parseInt(limit) : undefined,
  })
  
  return NextResponse.json({
    success: true,
    data: webinars,
    source: 'microsoft-graph-app',
  })
}
```

---

## 📋 Part 2: Azure AD / Entra Configuration

### 2.1 Enable External Collaboration

**Location:** [Entra Admin Center](https://entra.microsoft.com) → External Identities → External collaboration settings

**Steps:**
1. Go to **Azure Active Directory** > **External Identities** > **External collaboration settings**

2. **Guest user access:**
   - ✅ Set to: "Guest users have limited access to properties and memberships of directory objects"
   
3. **Guest invite settings:**
   - ✅ **Anyone in the organization can invite guest users including guests and non-admins**
   - Or restrict to: "Only users assigned to specific admin roles can invite guests"

4. **Collaboration restrictions:**
   - ✅ Select: "Allow invitations to be sent to any domain (most inclusive)"

5. Click **Save**

### 2.2 Configure Self-Service Sign Up

**Location:** Entra Admin Center → External Identities → User flows

**Steps:**
1. Go to **External Identities** > **User flows**

2. Click **+ New user flow**

3. Configure:
   - **Name:** WebinarGuestSignup
   - **Identity providers:** 
     - ✅ Email one-time passcode
     - ✅ Microsoft Account
     - ✅ Google (optional)
   
4. **User attributes:**
   - ✅ Display Name (required)
   - ✅ Email Address (required)
   - ✅ Given Name
   - ✅ Surname
   - ✅ Company (optional)

5. **Application integration:**
   - Select your application: "HelvetiForma v3"

6. Click **Create**

### 2.3 Create Guest Invitation Link

**Option A: Direct Invitation URL**

Use this URL format for your "S'inscrire" button:

```
https://signup.microsoft.com/get-started/signup?sku=guest&ru=https://myaccount.microsoft.com/?tenantId=0c41c554-0d55-4550-8412-ba89c98481f0
```

**Option B: Custom Invitation Page**

Create a form that calls Microsoft Graph API to send invitations:

```typescript
// API endpoint: POST /api/invite-guest
async function inviteGuest(email: string, displayName: string, webinarId: string) {
  const response = await fetch('https://graph.microsoft.com/v1.0/invitations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${appToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      invitedUserEmailAddress: email,
      invitedUserDisplayName: displayName,
      inviteRedirectUrl: `https://helvetiforma.ch/calendrier?registered=${webinarId}`,
      sendInvitationMessage: true,
      invitedUserMessageInfo: {
        customizedMessageBody: `Vous êtes invité à rejoindre HelvetiForma pour participer au webinaire "${webinarTitle}". Cliquez sur le lien ci-dessous pour accepter l'invitation.`
      }
    })
  })
  
  return response.json()
}
```

### 2.4 Configure App Registration for Guest Invitations

**Location:** Entra Admin Center → App registrations → Your App

**API Permissions needed:**
1. Go to **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph** > **Application permissions**
4. Add:
   - ✅ `User.Invite.All` (Send guest invitations)
   - ✅ `User.Read.All` (Read guest users)
   - ✅ `Calendars.Read` (Read calendars - app-only)
   - ✅ `OnlineMeetings.Read.All` (Read meetings - app-only)

5. Click **Grant admin consent** ✅

### 2.5 Manage Guest Users

**Location:** Entra Admin Center → Users → All users

**To approve pending guests:**
1. Filter by **User type: Guest**
2. See pending invitations
3. Click on user to view details
4. Can delete if spam/invalid

**Auto-approve settings:**
1. Go to **External Identities** > **External collaboration settings**
2. Enable **Email one-time passcode** for automatic guest access

---

## 📋 Part 3: Implementation Code

### 3.1 Remove Middleware Protection

```typescript
// src/middleware.ts
import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // Only protect admin routes
  if (pathname.startsWith('/admin') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return Response.redirect(loginUrl)
  }

  return undefined
})

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
```

### 3.2 Update Calendar Page Component

```typescript
// src/app/(site)/calendrier/page.tsx

const handleRegister = async (webinarId: string, webinarTitle: string) => {
  try {
    setRegistering(webinarId)
    
    // Store webinar info for after guest registration
    sessionStorage.setItem('pendingWebinar', JSON.stringify({
      id: webinarId,
      title: webinarTitle,
      timestamp: Date.now()
    }))
    
    // Redirect to guest invitation form
    const tenantId = process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || '0c41c554-0d55-4550-8412-ba89c98481f0'
    const redirectUrl = `${window.location.origin}/calendrier?registered=pending`
    
    // Option 1: Microsoft self-service signup
    const signupUrl = `https://signup.microsoft.com/get-started/signup?sku=guest&ru=${encodeURIComponent(`https://myaccount.microsoft.com/?tenantId=${tenantId}`)}`
    
    // Option 2: Custom invitation page (if you create one)
    // window.location.href = `/invite?webinar=${encodeURIComponent(webinarId)}`
    
    window.location.href = signupUrl
    
  } catch (err) {
    console.error(err)
    alert('Erreur lors de la redirection vers l\'inscription')
    setRegistering(null)
  }
}

// Update button text
<button onClick={() => handleRegister(webinar.id, webinar.title)}>
  Demander l'accès
</button>
```

### 3.3 Create Invitation API Endpoint (Optional)

```typescript
// src/app/api/invite-guest/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, displayName, webinarId, webinarTitle } = await request.json()
    
    // Get app-only token
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      }
    )
    
    const { access_token } = await tokenResponse.json()
    
    // Send invitation
    const inviteResponse = await fetch('https://graph.microsoft.com/v1.0/invitations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invitedUserEmailAddress: email,
        invitedUserDisplayName: displayName,
        inviteRedirectUrl: `${process.env.NEXTAUTH_URL}/calendrier?registered=${webinarId}`,
        sendInvitationMessage: true,
        invitedUserMessageInfo: {
          customizedMessageBody: `Bienvenue sur HelvetiForma ! Vous êtes invité à participer au webinaire "${webinarTitle}".`
        }
      }),
    })
    
    const invitation = await inviteResponse.json()
    
    return NextResponse.json({
      success: true,
      data: invitation,
    })
  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
```

### 3.4 Update Webinars API for Public Access

```typescript
// src/app/api/webinars/route.ts
export async function GET(request: NextRequest) {
  try {
    // Use application token (no user login required)
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      }
    )
    
    const { access_token } = await tokenResponse.json()
    
    // Fetch webinars with app token
    const webinars = await getTeamsWebinars({
      accessToken: access_token,
      limit: 50,
    })
    
    return NextResponse.json({
      success: true,
      data: webinars,
      count: webinars.length,
      source: 'microsoft-graph-public',
    })
  } catch (error) {
    console.error('Error fetching webinars:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webinars' },
      { status: 500 }
    )
  }
}
```

---

## 🎨 Part 4: UI Updates

### Update Button Text and Style

```typescript
// Change button text to indicate guest access
<button
  onClick={() => handleRegister(webinar.id, webinar.title)}
  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl"
>
  <span>Demander l'accès</span>
  <span className="text-xs opacity-75 block mt-1">
    Invitation Microsoft requise
  </span>
</button>
```

### Add Information Banner

```typescript
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
  <h3 className="font-semibold text-blue-900 mb-2">
    Comment participer aux webinaires ?
  </h3>
  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
    <li>Cliquez sur "Demander l'accès" sur le webinaire souhaité</li>
    <li>Créez un compte invité Microsoft (gratuit)</li>
    <li>Attendez l'approbation de votre demande (quelques minutes)</li>
    <li>Recevez votre invitation par email</li>
    <li>Rejoignez le webinaire via Microsoft Teams</li>
  </ol>
</div>
```

---

## ✅ Implementation Checklist

### Frontend (Code Changes)
- [ ] Remove `/calendrier` from middleware protection
- [ ] Update calendar page to work without authentication
- [ ] Change button action to redirect to guest invitation
- [ ] Add information banner explaining the process
- [ ] Update API to use application credentials
- [ ] (Optional) Create custom invitation form

### Azure AD / Entra Configuration
- [ ] Enable external collaboration
- [ ] Configure guest user access settings
- [ ] Set up self-service sign-up user flow
- [ ] Add `User.Invite.All` API permission
- [ ] Add `Calendars.Read` (app-only) permission
- [ ] Grant admin consent for permissions
- [ ] Test guest invitation flow

### Testing
- [ ] Visit `/calendrier` without login - should work
- [ ] Click "Demander l'accès" - should redirect to Microsoft
- [ ] Complete guest signup process
- [ ] Verify guest appears in Entra Admin Center
- [ ] Accept invitation email
- [ ] Verify guest can access Teams meeting links

---

## 🔗 Useful Links

- **Entra Admin Center:** https://entra.microsoft.com
- **Azure Portal:** https://portal.azure.com
- **Microsoft Graph Explorer:** https://developer.microsoft.com/graph/graph-explorer
- **Guest Invitation API Docs:** https://learn.microsoft.com/graph/api/invitation-post

---

## 📝 Notes

1. **Guest users vs Members:** Guests have limited permissions by default
2. **Email verification:** Guests verify via email one-time passcode
3. **Approval:** Can be automatic or require admin approval
4. **Cost:** Guest users are free in Azure AD
5. **Limits:** 50,000 guest users per tenant (Free tier)

---

Would you like me to implement these changes now?

