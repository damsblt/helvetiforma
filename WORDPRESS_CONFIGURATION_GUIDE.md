# 🎓 WordPress/TutorLMS Configuration Guide

**Date:** October 1, 2025  
**Status:** Ready for Configuration  
**Integration:** Next.js Frontend ↔ WordPress/TutorLMS Backend

---

## 📋 Overview

Your HelvetiForma v3 project has a complete WordPress/TutorLMS integration ready for configuration. The system is designed to:

- **Display courses** from WordPress on your Next.js frontend
- **Handle user authentication** between Next.js and WordPress
- **Process enrollments** and course access
- **Manage payments** through TutorLMS native system
- **Fallback gracefully** to mock data if WordPress is unavailable

---

## 🏗️ Current Integration Status

### ✅ What's Already Built
- **Complete API Integration** (`src/lib/wordpress.ts`)
- **TypeScript Types** (`src/types/wordpress.ts`)
- **API Routes** (`src/app/(site)/api/wordpress/courses/`)
- **Fallback System** with mock data
- **Authentication System** with JWT support
- **Course Display Components** ready for real data

### 🔧 What Needs Configuration
1. **WordPress Installation** with TutorLMS plugin
2. **Application Password** for API authentication
3. **Environment Variables** setup
4. **Course Content** creation
5. **Payment Gateway** configuration (optional)

---

## 🚀 Step-by-Step Configuration

### Step 1: WordPress Installation & Setup

#### Option A: Use Existing WordPress Site
If you already have `https://cms.helvetiforma.ch`:
1. **Access WordPress Admin**: `https://cms.helvetiforma.ch/wp-admin`
2. **Install TutorLMS Plugin**:
   - Go to Plugins → Add New
   - Search for "Tutor LMS"
   - Install and activate

#### Option B: Set Up New WordPress Site
1. **Choose Hosting**: Any WordPress hosting provider
2. **Install WordPress**: Standard WordPress installation
3. **Install TutorLMS**: Plugin installation
4. **Configure Domain**: Point `cms.helvetiforma.ch` to your WordPress site

### Step 2: TutorLMS Configuration

#### Basic Setup
1. **Go to TutorLMS Settings**: WordPress Admin → Tutor LMS → Settings
2. **Configure General Settings**:
   - Course URL structure: `/courses/`
   - Enable course categories
   - Set default course settings

#### Payment Configuration (Optional)
1. **Payment Methods**: Enable desired payment gateways
2. **Pricing**: Set up course pricing structure
3. **Currency**: Configure for Swiss Franc (CHF)

### Step 3: Create Application Password

#### WordPress Application Password Setup
1. **Go to WordPress Admin**: `https://cms.helvetiforma.ch/wp-admin`
2. **Navigate to**: Users → Your Profile
3. **Scroll Down**: Find "Application Passwords" section
4. **Create New Password**:
   - Application Name: `HelvetiForma v3 API`
   - Click "Add New Application Password"
   - **Copy the generated password** (you won't see it again!)

#### Alternative: Create Service Account User
1. **Create New User**: Users → Add New
2. **User Details**:
   - Username: `helvetiforma-api`
   - Email: `api@helvetiforma.ch`
   - Role: `Editor` (for course access)
   - Strong password
3. **Generate Application Password** for this user

### Step 4: Environment Variables Configuration

#### Update Your Environment Variables
Add these to your `.env.local` file:

```bash
# WordPress/TutorLMS Integration
NEXT_PUBLIC_WORDPRESS_URL=https://cms.helvetiforma.ch
WORDPRESS_APP_USER=helvetiforma-api
WORDPRESS_APP_PASSWORD=your-generated-application-password-here
```

#### For Production (Vercel)
Add the same variables to your Vercel dashboard:
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add:
   - `WORDPRESS_APP_USER`
   - `WORDPRESS_APP_PASSWORD`

### Step 5: Test the Integration

#### Test API Connection
1. **Start your development server**: `npm run dev`
2. **Visit**: `http://localhost:3000/api/wordpress/courses`
3. **Expected Response**: JSON with course data or mock data fallback

#### Test Course Display
1. **Visit**: `http://localhost:3000`
2. **Check**: PopularCoursesSection should display real courses
3. **Console Check**: Look for "Fetching courses from WordPress" messages

---

## 📚 Creating Course Content

### Step 1: Create Your First Course
1. **Go to TutorLMS**: WordPress Admin → Tutor LMS → Courses
2. **Add New Course**:
   - **Title**: "Comptabilité Suisse Fondamentale"
   - **Description**: Course description
   - **Price**: Set pricing (e.g., 299 CHF)
   - **Duration**: Set course duration
   - **Level**: Beginner/Intermediate/Advanced
   - **Category**: Create "Comptabilité" category

### Step 2: Add Course Content
1. **Course Builder**: Use TutorLMS course builder
2. **Add Lessons**: Create lessons with content
3. **Add Quizzes**: Optional assessments
4. **Set Prerequisites**: If needed
5. **Publish**: Make course live

### Step 3: Configure Course Settings
1. **Featured Image**: Upload course thumbnail
2. **Course Settings**: Configure enrollment, pricing
3. **SEO**: Add meta description
4. **Access**: Set public/private access

---

## 🔧 Advanced Configuration

### JWT Authentication Setup (Optional)
If you want user authentication between Next.js and WordPress:

1. **Install JWT Plugin**: 
   - Install "JWT Authentication for WP REST API"
   - Configure JWT settings

2. **Update WordPress Configuration**:
   ```php
   // Add to wp-config.php
   define('JWT_AUTH_SECRET_KEY', 'your-secret-key');
   define('JWT_AUTH_CORS_ENABLE', true);
   ```

### Custom Course Fields (Optional)
To extend course data:

1. **Custom Fields Plugin**: Install ACF or similar
2. **Add Fields**: Duration, Level, Prerequisites
3. **Update API**: Modify `src/lib/wordpress.ts` to include custom fields

### Payment Integration (Optional)
For paid courses:

1. **TutorLMS Payment**: Configure payment gateways
2. **Stripe/PayPal**: Set up payment processing
3. **Webhooks**: Configure payment confirmations

---

## 🧪 Testing & Troubleshooting

### Test API Endpoints

#### 1. Test Course Listing
```bash
curl -X GET "https://cms.helvetiforma.ch/wp-json/tutor/v1/courses" \
  -H "Authorization: Basic $(echo -n 'username:password' | base64)"
```

#### 2. Test Authentication
```bash
curl -X POST "https://cms.helvetiforma.ch/wp-json/jwt-auth/v1/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}'
```

### Common Issues & Solutions

#### Issue 1: 401 Unauthorized
**Cause**: Incorrect application password or username
**Solution**: 
- Regenerate application password
- Verify username in WordPress
- Check environment variables

#### Issue 2: 404 Not Found
**Cause**: TutorLMS plugin not activated or API not enabled
**Solution**:
- Activate TutorLMS plugin
- Check TutorLMS settings for API access
- Verify WordPress REST API is enabled

#### Issue 3: CORS Errors
**Cause**: Cross-origin requests blocked
**Solution**:
- Install CORS plugin for WordPress
- Or add CORS headers in WordPress theme

#### Issue 4: Fallback to Mock Data
**Cause**: WordPress API not responding
**Solution**:
- Check WordPress site accessibility
- Verify API endpoints
- Check application password permissions

### Debug Mode
Enable debug logging in your Next.js app:

```typescript
// Add to src/lib/wordpress.ts
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('WordPress API URL:', url)
  console.log('Headers:', headers)
}
```

---

## 📊 Expected Results

### After Successful Configuration

#### 1. API Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Comptabilité Suisse Fondamentale",
      "description": "Maîtrisez les bases de la comptabilité...",
      "price": 299,
      "instructor": "Marie Dubois",
      "thumbnail": "https://cms.helvetiforma.ch/wp-content/uploads/...",
      "enrollment_url": "https://cms.helvetiforma.ch/courses/comptabilite-suisse",
      "status": "publish"
    }
  ]
}
```

#### 2. Frontend Display
- Real courses appear on homepage
- Course thumbnails load correctly
- Pricing displays properly
- Links redirect to WordPress course pages

#### 3. Console Logs
```
✅ Fetching courses from WordPress: https://cms.helvetiforma.ch/wp-json/tutor/v1/courses
✅ Successfully fetched 5 courses from WordPress
✅ Course data mapped successfully
```

---

## 🎯 Next Steps After Configuration

### 1. Content Creation
- Create 3-5 sample courses
- Add course categories
- Upload course thumbnails
- Set up pricing structure

### 2. User Testing
- Test course enrollment flow
- Verify payment processing (if enabled)
- Test user authentication
- Check mobile responsiveness

### 3. Production Optimization
- Set up caching for WordPress API
- Configure CDN for course images
- Set up monitoring for API health
- Configure backup system

### 4. Advanced Features (Optional)
- Set up course completion certificates
- Configure email notifications
- Add course reviews/ratings
- Set up affiliate system

---

## 📞 Support & Resources

### Documentation
- **TutorLMS Docs**: https://docs.themeum.com/tutor-lms/
- **WordPress REST API**: https://developer.wordpress.org/rest-api/
- **Application Passwords**: https://wordpress.org/support/article/application-passwords/

### Your Integration Files
- **API Library**: `src/lib/wordpress.ts`
- **TypeScript Types**: `src/types/wordpress.ts`
- **API Routes**: `src/app/(site)/api/wordpress/courses/`
- **Environment Template**: `env.example`

### Testing URLs
- **Local API**: `http://localhost:3000/api/wordpress/courses`
- **WordPress API**: `https://cms.helvetiforma.ch/wp-json/tutor/v1/courses`
- **WordPress Admin**: `https://cms.helvetiforma.ch/wp-admin`

---

## ✅ Configuration Checklist

### WordPress Setup
- [ ] WordPress installed and accessible
- [ ] TutorLMS plugin installed and activated
- [ ] Application password created
- [ ] Test API endpoint accessible

### Environment Configuration
- [ ] `NEXT_PUBLIC_WORDPRESS_URL` set correctly
- [ ] `WORDPRESS_APP_USER` configured
- [ ] `WORDPRESS_APP_PASSWORD` set
- [ ] Environment variables deployed to Vercel

### Content Creation
- [ ] At least one course created
- [ ] Course categories set up
- [ ] Course thumbnails uploaded
- [ ] Pricing configured

### Testing
- [ ] API returns real course data
- [ ] Frontend displays courses correctly
- [ ] No console errors
- [ ] Fallback system works when needed

---

**Status:** Ready for WordPress configuration  
**Estimated Time:** 1-2 hours  
**Next Priority:** Set up WordPress site and create application password

Once configured, your Next.js frontend will seamlessly integrate with WordPress/TutorLMS for a complete e-learning platform! 🎉
