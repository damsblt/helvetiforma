#!/usr/bin/env node

/**
 * Check WordPress Hooks for 2FA Message
 */

const https = require('https');

function checkWPHooks() {
  console.log('🔍 Checking WordPress Hooks for 2FA Message...');
  console.log('==============================================');
  
  // Check if there's a login_message filter or hook
  checkLoginMessageHook();
  
  // Check for any custom login page modifications
  checkCustomLoginPage();
  
  // Check for any error handling
  checkErrorHandling();
}

function checkLoginMessageHook() {
  console.log('\n📝 Checking login_message hook...');
  
  // Try to trigger a login message by making a failed login attempt
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-login.php',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  };

  const postData = 'log=test&pwd=wrongpassword&wp-submit=Log+In&redirect_to=&testcookie=1';

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Login attempt response: ${res.statusCode}`);
      
      if (data.includes('Login failed due to incorrect 2FA setup')) {
        console.log('❌ 2FA message found in failed login response!');
        
        // Find the exact location
        const lines = data.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('Login failed due to incorrect 2FA setup')) {
            console.log(`   Line ${index + 1}: ${line.trim()}`);
          }
        });
      } else {
        console.log('✅ No 2FA message in failed login response');
        
        // Check what error message we do get
        const errorPatterns = [
          /<div[^>]*class="[^"]*error[^"]*"[^>]*>([^<]+)<\/div>/gi,
          /<div[^>]*class="[^"]*message[^"]*"[^>]*>([^<]+)<\/div>/gi,
          /<p[^>]*class="[^"]*error[^"]*"[^>]*>([^<]+)<\/p>/gi
        ];
        
        errorPatterns.forEach((pattern, index) => {
          const matches = data.match(pattern);
          if (matches) {
            console.log(`🔍 Found error message pattern ${index + 1}:`);
            matches.forEach(match => {
              console.log(`   ${match}`);
            });
          }
        });
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error making login attempt: ${error.message}`);
  });

  req.write(postData);
  req.end();
}

function checkCustomLoginPage() {
  console.log('\n🎨 Checking for custom login page modifications...');
  
  // Check if there's a custom login page or theme modifications
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-login.php?action=lostpassword',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (data.includes('Login failed due to incorrect 2FA setup')) {
        console.log('❌ 2FA message found on lost password page!');
      } else {
        console.log('✅ No 2FA message on lost password page');
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error checking lost password page: ${error.message}`);
  });

  req.end();
}

function checkErrorHandling() {
  console.log('\n⚠️  Checking WordPress error handling...');
  
  // Check if there are any custom error pages or handlers
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-login.php?error=invalid_username',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (data.includes('Login failed due to incorrect 2FA setup')) {
        console.log('❌ 2FA message found with error parameter!');
      } else {
        console.log('✅ No 2FA message with error parameter');
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error checking error handling: ${error.message}`);
  });

  req.end();
}

// Run the check
if (require.main === module) {
  checkWPHooks();
}

module.exports = { checkWPHooks };

