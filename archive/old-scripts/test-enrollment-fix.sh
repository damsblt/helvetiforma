#!/bin/bash

# Test script for enrollment and article product creation fixes
# Run this script to verify both fixes are working

echo "========================================"
echo "Testing Course Enrollment Fix"
echo "========================================"

# Test 1: Create enrollment via API
echo ""
echo "Test 1: Creating enrollment for user 224 in course 3633..."
ENROLLMENT_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/tutor-lms/enrollments" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "3633",
    "userId": "224",
    "amount": 30,
    "paymentMethod": "stripe",
    "paymentIntentId": "test_enrollment_fix"
  }')

echo "Response: $ENROLLMENT_RESPONSE"

# Check if enrollment was successful
if echo "$ENROLLMENT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Enrollment API call successful"
else
    echo "❌ Enrollment API call failed"
fi

echo ""
echo "========================================"
echo "Testing Article Product Creation"
echo "========================================"

# Test 2: Check if article product exists
echo ""
echo "Test 2: Checking WooCommerce products for article SKUs..."

# You need to replace this with an actual article ID from your WordPress
ARTICLE_ID=1
SKU="article-${ARTICLE_ID}"

echo "Looking for product with SKU: $SKU"

PRODUCT_SEARCH=$(curl -s "https://api.helvetiforma.ch/wp-json/wc/v3/products?sku=$SKU" \
  -u "ck_1939e665683edacf50304f61bc822287fa1755c8:cs_cfad39187d28b2debc6687e3e2a00af449412f01")

if echo "$PRODUCT_SEARCH" | grep -q '"id"'; then
    echo "✅ WooCommerce product found for article $ARTICLE_ID"
    echo "$PRODUCT_SEARCH" | jq '.[0] | {id, name, price, sku, status}'
else
    echo "⚠️  No WooCommerce product found for article $ARTICLE_ID"
    echo "This is expected if the article hasn't been saved with premium access + price yet"
fi

echo ""
echo "========================================"
echo "Checking WordPress Logs"
echo "========================================"
echo ""
echo "Recent HelvetiForma log entries (if available):"
echo "Check your WordPress error log for these patterns:"
echo "  - 'HelvetiForma ACF: Article #'"
echo "  - 'HelvetiForma: Produit WooCommerce créé'"
echo "  - 'HelvetiForma: Order #'"
echo ""

echo "========================================"
echo "Checking Next.js Logs"
echo "========================================"
echo ""
echo "Check your Next.js terminal for these patterns:"
echo "  - '✅ TutorLMS enrollment created:'"
echo "  - '📋 Extracted enrollment ID:'"
echo "  - '✅ Enrollment marked as completed:'"
echo ""

echo "========================================"
echo "Manual Testing Steps"
echo "========================================"
echo ""
echo "Course Enrollment:"
echo "  1. Go to http://localhost:3000/courses/charges-sociales-test-123-2/checkout"
echo "  2. Complete checkout with test card: 4242 4242 4242 4242"
echo "  3. Check Next.js terminal for enrollment logs"
echo "  4. Verify enrollment status in WordPress: Tutor LMS → Enrollments"
echo ""
echo "Article Product Creation:"
echo "  1. Go to WordPress admin → Posts"
echo "  2. Edit an article (or create new one)"
echo "  3. Set ACF field 'access' = 'premium'"
echo "  4. Set ACF field 'price' = 25"
echo "  5. Click Update/Publish"
echo "  6. Check WordPress error log for 'HelvetiForma ACF' messages"
echo "  7. Check WooCommerce → Products for new product with SKU 'article-[ID]'"
echo "  8. Visit article in app to see purchase overlay"
echo ""

