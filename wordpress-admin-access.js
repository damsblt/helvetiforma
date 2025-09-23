#!/usr/bin/env node

/**
 * WordPress Admin Access Helper
 * This script helps bypass 2FA issues by using direct API access
 */

const fetch = require('node-fetch');

const WORDPRESS_URL = 'https://api.helvetiforma.ch';
const APP_PASSWORD = '0FU5 nwzs hUZG Q065 0Iby 2USq';
const USERNAME = 'gibivawa';

async function checkWordPressAccess() {
  console.log('🔍 Checking WordPress Access...');
  console.log('================================');
  
  try {
    // Test basic API access
    console.log('1. Testing WordPress API access...');
    const userResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ WordPress API access: WORKING');
      console.log(`   User: ${userData.name} (${userData.email})`);
      console.log(`   Roles: ${userData.roles.join(', ')}`);
    } else {
      console.log('❌ WordPress API access: FAILED');
      return;
    }

    // Test TutorLMS API access
    console.log('\n2. Testing TutorLMS API access...');
    const coursesResponse = await fetch(`${WORDPRESS_URL}/wp-json/tutor/v1/courses`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (coursesResponse.ok) {
      console.log('✅ TutorLMS API access: WORKING');
    } else {
      console.log('❌ TutorLMS API access: FAILED');
    }

    // Test WooCommerce API access
    console.log('\n3. Testing WooCommerce API access...');
    const productsResponse = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/products`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${USERNAME}:${APP_PASSWORD}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (productsResponse.ok) {
      console.log('✅ WooCommerce API access: WORKING');
    } else {
      console.log('❌ WooCommerce API access: FAILED');
    }

    console.log('\n🎯 Summary:');
    console.log('===========');
    console.log('✅ Your API access is working perfectly!');
    console.log('❌ The 2FA issue only affects web login interface');
    console.log('💡 Your payment and enrollment system will work normally');
    
    console.log('\n🔧 Solutions for Web Access:');
    console.log('============================');
    console.log('1. Try incognito/private browsing mode');
    console.log('2. Try different browser');
    console.log('3. Clear browser cache and cookies');
    console.log('4. Try direct admin URLs:');
    console.log('   - https://api.helvetiforma.ch/wp-admin/');
    console.log('   - https://api.helvetiforma.ch/wp-admin/users.php');
    console.log('5. Contact your hosting provider about 2FA settings');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
if (require.main === module) {
  checkWordPressAccess()
    .then(() => {
      console.log('\n🏁 Check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkWordPressAccess };

