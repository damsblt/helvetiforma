# Helvetiforma API Routing Guide

## Overview

This document describes the API routing structure and payment workflow for the Helvetiforma e-learning platform. The system integrates Stripe payments, WordPress user management, WooCommerce orders, and Tutor LMS enrollment.

## Core Payment Workflow

The main payment success flow is orchestrated server-side through a single API endpoint that handles the complete post-payment process:

### 1. Payment Success API (`/api/payment-success`)

**Endpoint:** `POST /api/payment-success`

**Purpose:** Orchestrates the complete post-payment workflow server-side.

**Flow:**
1. **Stripe Verification** - Verifies payment intent with Stripe API
2. **WordPress User Creation** - Creates or finds WordPress subscriber
3. **WooCommerce Integration** - Creates customer and order linked to WP user
4. **Tutor LMS Enrollment** - Enrolls user in purchased courses with 'completed' status
5. **Email Notification** - Sends welcome email with login credentials

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "cartData": {
    "items": [
      {
        "product_id": 300,
        "course_id": 299,
        "name": "Course Name",
        "price": 500,
        "total": 500,
        "quantity": 1
      }
    ],
    "total": 500,
    "currency": "CHF",
    "item_count": 1
  },
  "userData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "paymentMethod": "stripe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Paiement réussi ! Compte créé et 1/1 formation(s) suivie(s).",
  "data": {
    "order_id": 359,
    "woo_order_id": 359,
    "customer_id": 167,
    "user_id": 167,
    "username": "john_1234567890",
    "email": "john@example.com",
    "enrollments": [
      {
        "course_id": 299,
        "product_name": "Course Name",
        "success": true,
        "enrollment_id": 360
      }
    ],
    "payment_intent_id": "pi_xxx"
  }
}
```

## Supporting API Endpoints

### 2. WordPress User Management (`/api/users/ensure-subscriber`)

**Endpoint:** `POST /api/users/ensure-subscriber`

**Purpose:** Creates or finds WordPress users with subscriber role enforcement.

**Features:**
- Find existing user by email
- Create new user with subscriber role
- Role enforcement guards to prevent role changes
- Username generation with timestamp

### 3. WooCommerce Order Management (`/api/woocommerce/order`)

**Endpoint:** `POST /api/woocommerce/order`

**Purpose:** Creates WooCommerce orders and customers.

**Features:**
- Customer creation/linking to WordPress users
- Order creation with proper line items
- String amount formatting for WooCommerce compatibility
- Guest order fallback

### 4. Tutor LMS Enrollment (`/api/enrollment`)

**Endpoint:** `POST /api/enrollment`

**Purpose:** Handles Tutor LMS course enrollment with resilient strategies.

**Features:**
- Multiple enrollment strategies with fallbacks
- Automatic student approval
- Status management (completed, pending, etc.)
- Retry logic for failed enrollments

## Integration Points

### WordPress Integration
- **REST API:** User creation, role management, password reset
- **Application Passwords:** Authentication for API calls
- **User Roles:** Subscriber role enforcement for Tutor LMS compatibility

### WooCommerce Integration
- **REST API:** Customer and order management
- **Consumer Keys:** API authentication
- **Order Status:** Completed orders for paid courses

### Tutor LMS Integration
- **REST API:** Course enrollment and student management
- **Client/Secret:** API authentication
- **Enrollment Status:** Completed status for immediate access

### Stripe Integration
- **Payment Intents:** Payment verification
- **Webhooks:** Payment status updates
- **Amount Validation:** Currency and total verification

## Environment Variables

### Required Environment Variables

```bash
# WordPress
WORDPRESS_URL=https://api.helvetiforma.ch
WORDPRESS_APP_USER=gibivawa
WORDPRESS_APP_PASSWORD=your_app_password

# WooCommerce
WOOCOMMERCE_CONSUMER_KEY=ck_xxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxx

# Tutor LMS
TUTOR_API_URL=https://api.helvetiforma.ch
TUTOR_CLIENT_ID=key_xxx
TUTOR_SECRET_KEY=secret_xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Email
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxx
NEXT_PUBLIC_EMAILJS_SERVICE_ID=xxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=xxx
```

## Error Handling

The system includes comprehensive error handling:

1. **Stripe Verification Failures** - Returns payment verification errors
2. **WordPress User Creation Failures** - Handles duplicate emails, role conflicts
3. **WooCommerce Order Failures** - Manages customer linking issues
4. **Tutor LMS Enrollment Failures** - Implements retry strategies and fallbacks

## Security Considerations

1. **Role Enforcement** - Multiple guards ensure users maintain subscriber role
2. **API Authentication** - All external APIs use proper authentication
3. **Input Validation** - All user inputs are validated and sanitized
4. **Error Logging** - Comprehensive logging for debugging without exposing sensitive data

## Frontend Integration

The frontend only needs to call the single `/api/payment-success` endpoint after Stripe payment completion. All orchestration is handled server-side, simplifying the frontend implementation.

## Testing

The system can be tested using the Vercel CLI:

```bash
# Test the complete payment workflow
curl -X POST https://your-deployment.vercel.app/api/payment-success \
  -H 'Content-Type: application/json' \
  -d '{
    "paymentIntentId": "pi_test_xxx",
    "cartData": { ... },
    "userData": { ... }
  }'
```

## Deployment

The application is deployed on Vercel with automatic deployments from the main branch. Environment variables are managed through the Vercel dashboard or CLI.

## File Structure

```
src/app/api/
├── payment-success/route.ts    # Main orchestration endpoint
├── users/
│   └── ensure-subscriber/route.ts
├── woocommerce/
│   └── order/route.ts
└── enrollment/route.ts
```

## Maintenance

- Monitor Vercel logs for API errors
- Check WordPress, WooCommerce, and Tutor LMS API health
- Verify environment variables are properly set
- Test payment workflow after any plugin updates
