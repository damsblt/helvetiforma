#!/usr/bin/env node

/**
 * Test WordPress Login Access
 * This script tests if the 2FA issue is resolved
 */

const https = require('https');

function testWordPressLogin() {
  console.log('🔍 Testing WordPress Login Access...');
  console.log('====================================');
  
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-login.php',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📡 Status Code: ${res.statusCode}`);
    console.log(`📡 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📄 Response Analysis:');
      console.log('====================');
      
      // Check for 2FA errors
      if (data.includes('2FA') || data.includes('two.factor') || data.includes('incorrect 2FA')) {
        console.log('❌ 2FA Error still present');
        console.log('Error content:', data.match(/2FA[^<]*/i)?.[0] || 'Not found');
      } else {
        console.log('✅ No 2FA errors detected');
      }
      
      // Check for login form
      if (data.includes('wp-login') || data.includes('loginform')) {
        console.log('✅ Login form is present');
      } else {
        console.log('❌ Login form not found');
      }
      
      // Check for WordPress
      if (data.includes('WordPress') || data.includes('wp-login')) {
        console.log('✅ WordPress login page is accessible');
      } else {
        console.log('❌ WordPress login page not accessible');
      }
      
      console.log('\n🎯 Summary:');
      console.log('===========');
      if (data.includes('2FA') || data.includes('two.factor')) {
        console.log('❌ 2FA issue still present - try browser access');
      } else {
        console.log('✅ 2FA issue appears to be resolved!');
        console.log('💡 Try accessing https://api.helvetiforma.ch/wp-login.php in your browser');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.end();
}

// Run the test
if (require.main === module) {
  testWordPressLogin();
}

module.exports = { testWordPressLogin };

