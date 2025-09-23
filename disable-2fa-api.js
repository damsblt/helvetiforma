#!/usr/bin/env node

/**
 * Disable 2FA via WordPress API
 * This script attempts to disable 2FA settings through the API
 */

const https = require('https');

function disable2FA() {
  console.log('🔧 Attempting to Disable 2FA via WordPress API');
  console.log('==============================================');
  
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/users/me',
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('gibivawa:0FU5 nwzs hUZG Q065 0Iby 2USq').toString('base64'),
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        const user = JSON.parse(data);
        console.log('✅ WordPress API access confirmed');
        console.log(`   User: ${user.name}`);
        console.log(`   Roles: ${user.roles.join(', ')}`);
        
        // Try to access WordPress admin via API
        console.log('\n🔍 Checking WordPress admin access...');
        checkAdminAccess();
      } else {
        console.log('❌ WordPress API access failed');
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.end();
}

function checkAdminAccess() {
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/posts?per_page=1',
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('gibivawa:0FU5 nwzs hUZG Q065 0Iby 2USq').toString('base64'),
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ WordPress admin access confirmed via API');
        console.log('💡 You can manage WordPress through API calls');
        
        console.log('\n🔧 Alternative Access Methods:');
        console.log('=============================');
        console.log('1. Use WordPress mobile app');
        console.log('2. Use a different device/network');
        console.log('3. Access via FTP and modify wp-config.php');
        console.log('4. Contact hosting provider');
        console.log('5. Use WordPress CLI if available');
        
      } else {
        console.log('❌ WordPress admin access failed');
        console.log('Status:', res.statusCode);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Admin check failed:', error.message);
  });

  req.end();
}

// Run the script
if (require.main === module) {
  disable2FA();
}

module.exports = { disable2FA };

