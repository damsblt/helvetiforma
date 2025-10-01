# Microsoft Teams Integration Guide

## 🎯 Overview

The Microsoft Teams integration allows users to:
- Browse upcoming webinars
- Register for webinars with their Microsoft account
- Receive automatic Teams meeting invitations
- Manage their webinar registrations

## 🏗️ Architecture

### Components Created

1. **Authentication** (`/src/auth.ts`)
   - NextAuth.js v5 configuration
   - Microsoft Entra ID provider
   - Session management with access tokens

2. **API Routes**
   - `/api/auth/[...nextauth]` - Authentication endpoints
   - `/api/webinars` - List and create webinars
   - `/api/webinars/[id]` - Get webinar details
   - `/api/webinars/[id]/register` - Register/unregister for webinars

3. **Pages**
   - `/login` - Microsoft authentication page
   - `/calendrier` - Webinar calendar and listing

4. **Middleware** (`/src/middleware.ts`)
   - Protects calendar routes
   - Redirects unauthenticated users to login

## 🔐 Azure AD Setup

### Step 1: Create Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: HelvetiForma v3
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Platform: Web
     - URL: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
     - Production: `https://your-domain.com/api/auth/callback/microsoft-entra-id`

### Step 2: Configure API Permissions

1. Go to **API permissions** in your app
2. Click **Add a permission** > **Microsoft Graph**
3. Select **Delegated permissions**
4. Add the following permissions:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
   - `Calendars.ReadWrite`
   - `OnlineMeetings.ReadWrite`
5. Click **Grant admin consent** (if you're an admin)

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: "HelvetiForma v3 Production"
4. Select expiration: 24 months (recommended)
5. Copy the **Value** immediately (you won't see it again!)

### Step 4: Get Tenant ID

1. Go to **Overview** in your Azure AD
2. Copy the **Directory (tenant) ID**

## 📝 Environment Variables

Create a `.env.local` file in your project root:

```bash
# Microsoft Graph API
MICROSOFT_CLIENT_ID=your-application-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret-value
MICROSOFT_TENANT_ID=your-tenant-id

# NextAuth.js Configuration
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

### Generate AUTH_SECRET

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and use it as your `AUTH_SECRET`.

## 🧪 Testing

### Local Development

1. Start the development server:
```bash
npm run dev
```

2. Visit `http://localhost:3000/calendrier`

3. You'll be redirected to `/login`

4. Click "Se connecter avec Microsoft"

5. Authenticate with your Microsoft account

6. You'll be redirected back to the calendar page

### Mock Data

In development mode, the API uses mock webinar data. You can test the registration flow without needing real Microsoft Graph API credentials.

## 🚀 Production Deployment

### Vercel Environment Variables

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add all the variables from `.env.local`:
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_CLIENT_SECRET`
   - `MICROSOFT_TENANT_ID`
   - `AUTH_SECRET`
   - `AUTH_URL` (use your production domain)
   - `NEXTAUTH_URL` (use your production domain)

### Update Azure AD Redirect URIs

1. Go back to your Azure AD app registration
2. Add production redirect URI:
   - `https://your-domain.com/api/auth/callback/microsoft-entra-id`

## 📊 API Documentation

### GET /api/webinars

List all available webinars.

**Query Parameters:**
- `limit` (optional): Number of webinars to return
- `startDate` (optional): Filter webinars starting after this date
- `endDate` (optional): Filter webinars ending before this date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "webinar1",
      "title": "Introduction à la Comptabilité Suisse",
      "description": "...",
      "startDate": "2025-10-08T10:00:00Z",
      "endDate": "2025-10-08T12:00:00Z",
      "meetingUrl": "https://teams.microsoft.com/...",
      "attendees": ["user@example.com"],
      "maxAttendees": 100,
      "registrationCount": 23,
      "status": "scheduled",
      "isPublic": true,
      "tags": ["comptabilité", "débutant"]
    }
  ],
  "count": 1
}
```

### GET /api/webinars/[id]

Get details of a specific webinar.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "webinar1",
    "title": "Introduction à la Comptabilité Suisse",
    ...
  }
}
```

### POST /api/webinars/[id]/register

Register the authenticated user for a webinar.

**Headers:**
- `Authorization`: Session token (handled automatically)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "webinar1_user@example.com",
    "webinarId": "webinar1",
    "userEmail": "user@example.com",
    "userName": "John Doe",
    "registeredAt": "2025-10-01T12:00:00Z",
    "status": "confirmed"
  },
  "message": "Successfully registered for webinar"
}
```

### DELETE /api/webinars/[id]/register

Unregister the authenticated user from a webinar.

**Response:**
```json
{
  "success": true,
  "message": "Successfully unregistered from webinar"
}
```

## 🔧 Troubleshooting

### "Authentication required" error

Make sure you're logged in. The `/calendrier` route requires authentication.

### "Failed to fetch webinars" error

Check your Microsoft Graph API credentials in `.env.local`. In development mode, mock data should still work.

### "OAuthCallback" error

1. Verify redirect URIs in Azure AD match your application URLs
2. Check that all environment variables are set correctly
3. Ensure `AUTH_SECRET` is properly generated

### Webinar registration fails

1. Check Microsoft Graph API permissions are granted
2. Verify the user's access token has the required scopes
3. Check network logs for detailed error messages

## 🎨 Customization

### Adding More Webinar Fields

1. Update types in `/src/types/microsoft.ts`
2. Modify the mapping in `/src/lib/microsoft.ts`
3. Update the UI in `/src/app/(site)/calendrier/page.tsx`

### Changing the UI

The calendar page uses Tailwind CSS and Framer Motion. You can customize:
- Colors: Update the `primary` color in Tailwind config
- Animations: Modify Framer Motion variants
- Layout: Adjust the grid layout in the webinars section

## 📚 Resources

- [NextAuth.js Documentation](https://authjs.dev/)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Teams Online Meetings API](https://docs.microsoft.com/en-us/graph/api/resources/onlinemeeting)

## ✅ Checklist

- [x] NextAuth.js installed and configured
- [x] Microsoft Entra ID provider set up
- [x] API routes created
- [x] Calendar page created
- [x] Login page created
- [x] Middleware protection added
- [ ] Azure AD application created
- [ ] API permissions granted
- [ ] Environment variables configured
- [ ] Production redirect URIs added
- [ ] Tested in development
- [ ] Tested in production

---

**Created:** October 1, 2025  
**Last Updated:** October 1, 2025  
**Status:** ✅ Complete - Ready for Azure AD configuration

