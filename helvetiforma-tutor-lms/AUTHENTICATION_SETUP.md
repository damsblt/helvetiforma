# 🔐 Authentication Setup Guide

## 🚨 Current Issue

**Error**: `api.helvetiforma.ch/wp-json/tutor/v1/course-content/3633:1 Failed to load resource: the server responded with a status of 404 ()`

**Root Cause**: The error is actually **401 Unauthorized**, not 404. The Tutor LMS endpoints exist but require authentication.

## ✅ Solution: WordPress Application Password

### Step 1: Create Application Password

1. **Login to WordPress Admin**
   ```
   https://api.helvetiforma.ch/wp-admin
   ```

2. **Navigate to User Profile**
   - Go to **Users → Profile** (or **Users → All Users → gibivawa**)
   - Scroll down to **Application Passwords** section

3. **Generate New Password**
   - **Application Name**: `HelvetiForma Next.js App`
   - Click **Add New Application Password**
   - **Copy the generated password** (format: `xxxx xxxx xxxx xxxx xxxx xxxx`)

### Step 2: Update Environment Variables

Add the application password to your `.env.local` file:

```env
# WordPress Application Password (REQUIRED)
WORDPRESS_APP_PASSWORD=1234 5678 9012 3456 7890 1234

# Other required variables
WORDPRESS_APP_USER=gibivawa
NEXT_PUBLIC_WORDPRESS_URL=https://api.helvetiforma.ch
```

### Step 3: Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Test Authentication

Visit the debug page to verify all endpoints work:
```
http://localhost:3000/debug
```

All endpoints should now return **200 OK** instead of **401 Unauthorized**.

## 🔧 Alternative Solutions

### Option A: Public Endpoints Only

If Application Passwords don't work, modify `src/lib/wordpress.ts`:

```typescript
export function getAuthHeaders(credentials?: any): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Skip authentication for public endpoints
  return headers;
}
```

### Option B: Cookie-Based Authentication

For user-specific content, implement cookie-based auth:

```typescript
// In login flow, extract WordPress cookies
const cookies = extractCookiesFromResponse(loginResponse);
localStorage.setItem('wp_cookies', cookies);

// Use cookies in API calls
headers.Cookie = localStorage.getItem('wp_cookies') || '';
```

### Option C: JWT Authentication

Install **JWT Authentication for WP REST API** plugin:

```typescript
// Get JWT token on login
const jwtResponse = await fetch('/wp-json/jwt-auth/v1/token', {
  method: 'POST',
  body: JSON.stringify({ username, password })
});

// Use JWT token in headers
headers.Authorization = `Bearer ${jwtToken}`;
```

## 🧪 Testing Endpoints

### Debug Page
- **URL**: `http://localhost:3000/debug`
- **Purpose**: Test all Tutor LMS endpoints
- **Expected**: All endpoints return 200 OK after authentication fix

### Manual Testing
```bash
# Test with curl (replace with your actual password)
curl -H "Authorization: Basic $(echo -n 'gibivawa:1234 5678 9012 3456 7890 1234' | base64)" \
  https://api.helvetiforma.ch/wp-json/tutor/v1/course-content/3633
```

## 📋 Endpoint Status After Fix

| Endpoint | Before | After | Purpose |
|----------|--------|-------|---------|
| `/wp-json/tutor/v1/` | 401 | 200 | API Discovery |
| `/wp-json/tutor/v1/courses` | 401 | 200 | Course List |
| `/wp-json/tutor/v1/course-content/{id}` | 401 | 200 | **Course Content** |
| `/wp-json/tutor/v1/lessons` | 401 | 200 | Lessons |
| `/wp-json/tutor/v1/topics` | 401 | 200 | Topics |

## 🔍 Troubleshooting

### Still Getting 401 Errors?

1. **Check Application Password Format**
   - Must include spaces: `1234 5678 9012 3456 7890 1234`
   - Not URL encoded or modified

2. **Verify User Permissions**
   - User `gibivawa` must have appropriate roles
   - Check WordPress user capabilities

3. **Test Direct API Call**
   ```bash
   curl -v -H "Authorization: Basic $(echo -n 'gibivawa:YOUR_APP_PASSWORD' | base64)" \
     https://api.helvetiforma.ch/wp-json/wp/v2/users/me
   ```

### Getting 403 Forbidden?

- User lacks permissions for specific endpoints
- Tutor LMS Pro might not be properly activated
- Check WordPress user roles and capabilities

### Getting 404 Not Found?

- Tutor LMS plugin not installed/activated
- Permalinks need to be refreshed in WordPress
- Custom post types not exposed to REST API

## 🎯 Expected Behavior After Fix

1. **Course Content Loads**: `/wp-json/tutor/v1/course-content/3633` returns curriculum data
2. **No More 401 Errors**: All authenticated endpoints work
3. **Fallback Still Works**: If specific course has no content, fallback curriculum displays
4. **Debug Page Green**: All endpoints show as available

---

**📅 Created**: September 26, 2025  
**🔧 Issue**: Authentication for Tutor LMS API endpoints  
**✅ Status**: Ready for implementation
