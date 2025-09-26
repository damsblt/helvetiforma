# Helvetiforma App Structure

This document provides an overview of the Helvetiforma application structure, a Next.js-based learning management system with WordPress integration.

## Project Overview

Helvetiforma is a comprehensive e-learning platform built with:
- **Frontend**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **Backend Integration**: WordPress with TutorLMS
- **Database**: Supabase
- **Payments**: Stripe
- **Deployment**: Vercel with Netlify functions

## Root Directory Structure

```
helvetiforma/
├── src/                          # Main application source code
├── data/                         # WordPress theme and assets
├── mu-plugins/                   # WordPress must-use plugins
├── netlify/functions/            # Netlify serverless functions
├── public/                       # Static assets
├── helvetiforma-registration/    # Custom registration plugin
└── Configuration files
```

## Source Code Structure (`src/`)

### Application Routes (`src/app/`)

#### Public Pages
```
app/
├── page.tsx                      # Homepage
├── formations/                   # Course listings and details
│   ├── page.tsx                 # Main formations page
│   ├── FormationList.tsx        # Course list component
│   ├── all/                     # All formations view
│   ├── charges-sociales/        # Social charges course
│   ├── impot-a-la-source/      # Tax at source course
│   └── salaires/               # Salary course
├── formation/[slug]/            # Individual formation pages
├── courses/                     # Course management
│   ├── page.tsx
│   └── [id]/                   # Individual course pages
├── calendar/                    # Event calendar
├── contact/                     # Contact page
├── concept/                     # About/concept page
└── cart/                       # Shopping cart
```

#### Authentication & User Management
```
app/
├── login/                       # General login
├── student-login/              # Student-specific login
├── admin-login/                # Admin login
├── inscription-apprenant/      # Student registration
├── setup-password/             # Password setup
├── mon-compte/                 # User account management
└── personal-space/             # Personal user space
```

#### Student Area
```
app/
├── dashboard/                   # Main dashboard
│   ├── page.tsx
│   ├── student/               # Student-specific dashboard
│   ├── student-access/        # Student access management
│   └── subscriptions/         # Subscription management
├── student-dashboard/          # Alternative student dashboard
└── elearning/                 # E-learning interface
```

#### Admin Area
```
app/admin/
├── layout.tsx                  # Admin layout wrapper
├── page.tsx                   # Admin dashboard
├── dashboard/                 # Admin dashboard
├── users/                     # User management
├── formations/                # Formation management
├── sessions/                  # Session management
├── training-sessions/         # Training session management
├── registrations/             # Registration management
├── calendar/                  # Calendar management
├── content/                   # Content management
├── elearning/                 # E-learning admin
├── inperson/                  # In-person training admin
├── sync-courses/              # Course synchronization
├── api-control/               # API control panel
└── webhooks/                  # Webhook management
```

#### WordPress Integration
```
app/
├── wp/                        # WordPress integration pages
├── wp-dashboard/              # WordPress dashboard
└── wp-cart/                   # WordPress cart integration
```

#### Documentation & Support
```
app/
├── docs/                      # Documentation system
│   ├── page.tsx
│   ├── DocsList.tsx
│   └── [id]/                 # Individual document pages
├── _formation-docs/           # Formation documentation
│   ├── page.tsx
│   ├── FormationDocList.tsx
│   └── [id]/                 # Individual formation docs
├── cgu/                       # Terms and conditions
├── mentions/                  # Legal mentions
└── reseaux-sociaux/          # Social networks
```

#### E-commerce & Payments
```
app/
├── checkout/                  # Checkout process
│   ├── page.tsx
│   ├── CheckoutForm.tsx
│   └── CheckoutWrapper.tsx
├── payment-success/           # Payment confirmation
├── subscribe/                 # Subscription management
└── training-sessions/         # Training session booking
```

#### API Routes (`src/app/api/`)
The API contains 61 endpoints organized by functionality:
- Authentication and user management
- Course and formation management
- Payment processing
- WordPress integration
- Data synchronization
- Webhook handling

### Components (`src/components/`)

#### Navigation & Layout
- `Navigation.tsx` - Main navigation component
- `AdminNavbar.tsx` - Admin navigation
- `HeaderButtons.tsx` - Header action buttons

#### E-commerce
- `CartIcon.tsx` - Shopping cart icon
- `CartDropdown.tsx` - Cart dropdown menu
- `CoursePurchaseCard.tsx` - Course purchase interface
- `EnhancedCheckoutFlow.tsx` - Advanced checkout process

#### Course Management
- `FormationDetails.tsx` - Course detail display
- `FormationRegistrationForm.tsx` - Registration form
- `EditableFormationCard.tsx` - Editable course cards
- `FormationCalendar.tsx` - Course calendar
- `FormationCalendarWidget.tsx` - Calendar widget

#### User Interface
- `StudentDashboard.tsx` - Student dashboard
- `AdminCalendar.tsx` - Admin calendar view
- `EditableContent.tsx` - Content editing interface
- `SubscriptionManager.tsx` - Subscription management
- `SubscriptionEnrollment.tsx` - Enrollment interface
- `InPersonSubscription.tsx` - In-person training subscriptions

#### WordPress Integration
- `WpEmbeddedIframe.tsx` - Embedded WordPress content
- `WpFullScreenIframe.tsx` - Full-screen WordPress view
- `WpIframeWithFallback.tsx` - WordPress iframe with fallback

#### Utilities
- `StructuredData.tsx` - SEO structured data
- `CalendarLink.tsx` - Calendar link generation

### Services (`src/services/`)

#### Core Services
- `apiService.ts` - Main API communication
- `authService.ts` - Authentication handling
- `contentService.ts` - Content management

#### E-learning Integration
- `lmsService.ts` - Learning Management System
- `tutorLmsService.ts` - TutorLMS integration
- `courseSyncService.ts` - Course synchronization
- `enrollmentSyncService.ts` - Enrollment synchronization

#### E-commerce
- `woocommerceService.ts` - WooCommerce integration
- `woocommerceCartService.ts` - Cart management
- `productSyncService.ts` - Product synchronization

#### Communication
- `emailService.ts` - Email handling
- `registrationService.ts` - User registration

### Contexts (`src/contexts/`)
- `CartContext.tsx` - Shopping cart state management
- `ProductsContext.tsx` - Product data management
- `BlogContext.tsx` - Blog/content state management

### Configuration & Utilities

#### Configuration (`src/config/`)
- `emailjs.ts` - Email service configuration
- `images.ts` - Image handling configuration

#### Libraries (`src/lib/`)
- `supabase.ts` - Supabase database client
- `stripe.ts` - Stripe payment integration
- `wordpress.ts` - WordPress API client

#### Utilities (`src/utils/`)
- `productCache.ts` - Product caching system

## WordPress Integration (`data/`)

### Child Theme
```
data/helvetiforma-child/
├── functions.php              # Theme functions and hooks
├── style.css                 # Theme styles
├── page-helvetiforma-app.php # Custom page template
└── assets/
    └── helvetiforma-app.css  # Additional styles
```

### Must-Use Plugins (`mu-plugins/`)
- `helvetiforma-send-password-reset.php` - Password reset functionality
- `helvetiforma-tutor-webhooks.php` - TutorLMS webhook integration

### Custom Plugin
- `helvetiforma-registration/` - Custom registration system

## Deployment & Infrastructure

### Netlify Functions (`netlify/functions/`)
- `api-proxy.js` - API proxy for serverless functions

### Configuration Files
- `next.config.ts` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment configuration
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS configuration

## Key Features

### 🎓 Learning Management
- Course creation and management
- Student enrollment and progress tracking
- Training session scheduling
- Documentation system

### 💳 E-commerce Integration
- Stripe payment processing
- WooCommerce integration
- Shopping cart functionality
- Subscription management

### 👥 User Management
- Multi-role authentication (students, admins)
- Registration and onboarding
- Personal dashboards
- Access control

### 🔗 WordPress Integration
- TutorLMS synchronization
- Content management
- Theme integration
- Webhook handling

### 📊 Administration
- Admin dashboard
- User management
- Content management
- Analytics and reporting

## Development Workflow

The application uses:
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ESLint** for code quality
- **Git** for version control (currently on `TutorLMS_embedded` branch)

## Current Development Status

Based on git status, active development includes:
- WordPress integration improvements
- Dashboard enhancements
- Iframe component refinements
- Console error testing and debugging

---

*This structure documentation reflects the current state of the Helvetiforma application as of the latest analysis.*
