#!/usr/bin/env node

/**
 * Check Deployment Security Impact
 * This script will check if the recent deployment changes triggered security measures
 */

const https = require('https');

function checkDeploymentSecurityImpact() {
  console.log('🔍 Checking Deployment Security Impact...');
  console.log('==========================================');
  
  // Check if the revalidation calls are causing issues
  checkRevalidationCalls();
  
  // Check WordPress security logs
  checkWordPressSecurityLogs();
  
  // Check if there are any failed authentication attempts
  checkFailedAuthAttempts();
  
  // Check if the REVALIDATE_SECRET is causing issues
  checkRevalidateSecret();
}

function checkRevalidationCalls() {
  console.log('\n🔄 Checking revalidation calls...');
  
  // Test the revalidation endpoint with different secrets
  const testSecrets = ['test', 'invalid', 'your-secret-key', ''];
  
  testSecrets.forEach(secret => {
    testRevalidationSecret(secret);
  });
}

function testRevalidationSecret(secret) {
  const url = secret ? `https://helvetiforma.ch/api/revalidate?secret=${secret}` : 'https://helvetiforma.ch/api/revalidate';
  
  const options = {
    hostname: 'helvetiforma.ch',
    port: 443,
    path: secret ? `/api/revalidate?secret=${secret}` : '/api/revalidate',
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
      console.log(`   Secret "${secret}": ${res.statusCode} - ${data.substring(0, 100)}`);
    });
  });

  req.on('error', (error) => {
    console.log(`   Secret "${secret}": Error - ${error.message}`);
  });

  req.end();
}

function checkWordPressSecurityLogs() {
  console.log('\n🔒 Checking WordPress security logs...');
  
  // Check for any security-related posts or options
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/posts?search=security&per_page=10',
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
        try {
          const posts = JSON.parse(data);
          console.log(`✅ Found ${posts.length} posts with "security" content`);
          
          posts.forEach(post => {
            if (post.content && post.content.rendered) {
              const content = post.content.rendered.toLowerCase();
              if (content.includes('2fa') || content.includes('login') || content.includes('auth') || content.includes('failed')) {
                console.log(`   🔍 Post "${post.title.rendered}" contains security-related content`);
                console.log(`   Content: ${content.substring(0, 200)}...`);
              }
            }
          });
        } catch (e) {
          console.log('❌ Error parsing security posts:', e.message);
        }
      } else {
        console.log(`❌ Error getting security posts: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error getting security posts: ${error.message}`);
  });

  req.end();
}

function checkFailedAuthAttempts() {
  console.log('\n🚫 Checking for failed authentication attempts...');
  
  // Check if there are any recent failed login attempts
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/users?per_page=100',
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
        try {
          const users = JSON.parse(data);
          console.log(`✅ Retrieved ${users.length} users`);
          
          // Check for any users with recent failed login attempts
          users.forEach(user => {
            if (user.meta) {
              const metaKeys = Object.keys(user.meta);
              const securityKeys = metaKeys.filter(key => 
                key.toLowerCase().includes('failed') ||
                key.toLowerCase().includes('attempt') ||
                key.toLowerCase().includes('login') ||
                key.toLowerCase().includes('security') ||
                key.toLowerCase().includes('blocked')
              );
              
              if (securityKeys.length > 0) {
                console.log(`🔍 User ${user.name} (ID: ${user.id}) has security-related meta:`);
                securityKeys.forEach(key => {
                  console.log(`   ${key}: ${JSON.stringify(user.meta[key])}`);
                });
              }
            }
          });
        } catch (e) {
          console.log('❌ Error parsing users:', e.message);
        }
      } else {
        console.log(`❌ Error getting users: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error getting users: ${error.message}`);
  });

  req.end();
}

function checkRevalidateSecret() {
  console.log('\n🔐 Checking REVALIDATE_SECRET impact...');
  
  // Check if the revalidation calls are causing WordPress security issues
  console.log('   The recent deployment added revalidation calls that might be triggering security measures.');
  console.log('   These calls are made to: https://helvetiforma.ch/api/revalidate');
  console.log('   With secret: REVALIDATE_SECRET (added 10 hours ago)');
  console.log('   This could be causing WordPress to enable 2FA as a security measure.');
  
  // Test if the revalidation calls are being blocked
  const options = {
    hostname: 'helvetiforma.ch',
    port: 443,
    path: '/api/revalidate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  };

  const postData = JSON.stringify({});

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`   POST to /api/revalidate: ${res.statusCode}`);
      console.log(`   Response: ${data.substring(0, 200)}`);
      
      if (res.statusCode === 401 || res.statusCode === 403) {
        console.log('   🚨 This could be triggering WordPress security measures!');
      }
    });
  });

  req.on('error', (error) => {
    console.log(`   ❌ Error testing revalidation: ${error.message}`);
  });

  req.write(postData);
  req.end();
}

// Run the check
if (require.main === module) {
  checkDeploymentSecurityImpact();
}

module.exports = { checkDeploymentSecurityImpact };

