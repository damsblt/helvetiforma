# WordPress App Password Fix Guide

## Problem
The WordPress App Password `*25BFHthGkDtOIWUXO!Kum$9` is invalid, preventing TutorLMS API authentication.

## Error Message
```
Le mot de passe fourni n'est pas un mot de passe d'application valide.
```

## Solution Steps

### 1. Access WordPress Admin
1. Go to `https://api.helvetiforma.ch/wp-admin`
2. Login with admin credentials

### 2. Create New Application Password
1. Go to **Users** → **Profile** (or **Users** → **All Users** → **Admin**)
2. Scroll down to **Application Passwords** section
3. Enter a name like "HelvetiForma API"
4. Click **Add New Application Password**
5. Copy the generated password (it will look like `xxxx xxxx xxxx xxxx xxxx xxxx`)

### 3. Update Environment Variables
1. Update the `WORDPRESS_APP_PASSWORD` in Vercel:
   ```bash
   vercel env add WORDPRESS_APP_PASSWORD
   # Enter the new password when prompted
   ```

2. Or update in Vercel dashboard:
   - Go to project settings
   - Environment Variables
   - Update `WORDPRESS_APP_PASSWORD`

### 4. Test the Fix
After updating the password, test with:
```bash
node -e "
const axios = require('axios');
const WORDPRESS_URL = 'https://api.helvetiforma.ch';
const NEW_APP_PASSWORD = 'your-new-app-password';

axios.get(\`\${WORDPRESS_URL}/wp-json/wp/v2/users/me\`, {
  headers: {
    'Authorization': \`Basic \${Buffer.from(\`admin:\${NEW_APP_PASSWORD}\`).toString('base64')}\`,
    'Content-Type': 'application/json'
  }
}).then(response => {
  console.log('✅ App Password works!', response.data);
}).catch(error => {
  console.log('❌ App Password failed:', error.response?.data);
});
"
```

## Current Workaround
Until the App Password is fixed, the system uses WooCommerce API for enrollments, which works perfectly and creates enrollment orders with proper metadata.

## Benefits of Fixing App Password
- Direct TutorLMS API integration
- Real-time enrollment sync
- Better student management
- Course progress tracking
