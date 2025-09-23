#!/usr/bin/env node

/**
 * Check Deployment Impact on WordPress Security
 * This script will help identify if the recent deployment triggered security measures
 */

const https = require('https');

function checkDeploymentImpact() {
  console.log('🔍 Checking Deployment Impact on WordPress Security...');
  console.log('====================================================');
  
  // Check if there are any security-related plugins or settings
  checkSecurityPlugins();
  
  // Check WordPress error logs for security events
  checkErrorLogs();
  
  // Check if there are any rate limiting or security measures
  checkRateLimiting();
  
  // Check WordPress database for security events
  checkSecurityEvents();
}

function checkSecurityPlugins() {
  console.log('\n🔒 Checking for security plugins...');
  
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/plugins',
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
          const plugins = JSON.parse(data);
          console.log('✅ Retrieved plugins list');
          
          const securityPlugins = plugins.filter(plugin => 
            plugin.name.toLowerCase().includes('security') ||
            plugin.name.toLowerCase().includes('wordfence') ||
            plugin.name.toLowerCase().includes('ithemes') ||
            plugin.name.toLowerCase().includes('login') ||
            plugin.name.toLowerCase().includes('2fa') ||
            plugin.name.toLowerCase().includes('mfa') ||
            plugin.name.toLowerCase().includes('firewall') ||
            plugin.name.toLowerCase().includes('protection')
          );
          
          if (securityPlugins.length > 0) {
            console.log('🔍 Found security-related plugins:');
            securityPlugins.forEach(plugin => {
              console.log(`   - ${plugin.name} (${plugin.status})`);
            });
          } else {
            console.log('❌ No security plugins found');
          }
        } catch (e) {
          console.log('❌ Error parsing plugins:', e.message);
        }
      } else {
        console.log(`❌ Error getting plugins: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error getting plugins: ${error.message}`);
  });

  req.end();
}

function checkErrorLogs() {
  console.log('\n📋 Checking for error logs...');
  
  // Try to access common error log locations
  const logPaths = [
    '/wp-content/debug.log',
    '/wp-content/uploads/debug.log',
    '/error_log',
    '/wp-content/error_log'
  ];
  
  logPaths.forEach(path => {
    checkLogFile(path);
  });
}

function checkLogFile(path) {
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: path,
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
      if (res.statusCode === 200) {
        console.log(`✅ Found log file: ${path}`);
        
        // Check for security-related entries
        const lines = data.split('\n');
        const securityLines = lines.filter(line => 
          line.toLowerCase().includes('security') ||
          line.toLowerCase().includes('2fa') ||
          line.toLowerCase().includes('mfa') ||
          line.toLowerCase().includes('login') ||
          line.toLowerCase().includes('auth') ||
          line.toLowerCase().includes('failed') ||
          line.toLowerCase().includes('blocked')
        );
        
        if (securityLines.length > 0) {
          console.log(`   🔍 Found ${securityLines.length} security-related entries:`);
          securityLines.slice(-5).forEach(line => {
            console.log(`   ${line.trim()}`);
          });
        }
      } else if (res.statusCode === 404) {
        console.log(`❌ Log file not found: ${path}`);
      } else {
        console.log(`⚠️  Error accessing ${path}: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error accessing ${path}: ${error.message}`);
  });

  req.end();
}

function checkRateLimiting() {
  console.log('\n⏱️  Checking for rate limiting...');
  
  // Make multiple rapid requests to see if we get rate limited
  let requestCount = 0;
  const maxRequests = 5;
  
  function makeRequest() {
    const options = {
      hostname: 'api.helvetiforma.ch',
      port: 443,
      path: '/wp-json/wp/v2/users',
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
        requestCount++;
        console.log(`   Request ${requestCount}: ${res.statusCode}`);
        
        if (res.statusCode === 429) {
          console.log('🚨 RATE LIMITED! This might explain the 2FA issue.');
        } else if (res.statusCode === 403) {
          console.log('🚨 FORBIDDEN! This might explain the 2FA issue.');
        }
        
        if (requestCount < maxRequests) {
          setTimeout(makeRequest, 100); // 100ms between requests
        } else {
          console.log('✅ Rate limiting test completed');
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request ${requestCount + 1} error: ${error.message}`);
      requestCount++;
      if (requestCount < maxRequests) {
        setTimeout(makeRequest, 100);
      }
    });

    req.end();
  }
  
  makeRequest();
}

function checkSecurityEvents() {
  console.log('\n🔍 Checking for security events in database...');
  
  // Check for any posts or options that might contain security events
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/posts?search=security&per_page=20',
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
              if (content.includes('2fa') || content.includes('login') || content.includes('auth')) {
                console.log(`   🔍 Post "${post.title.rendered}" contains security-related content`);
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

// Run the check
if (require.main === module) {
  checkDeploymentImpact();
}

module.exports = { checkDeploymentImpact };

