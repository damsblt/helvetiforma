#!/usr/bin/env node

/**
 * Debug 2FA Message Source
 * This script will help identify exactly where the 2FA message is coming from
 */

const https = require('https');

function debug2FASource() {
  console.log('🔍 Debugging 2FA Message Source...');
  console.log('==================================');
  
  // Get the login page HTML
  getLoginPage().then(html => {
    console.log('📄 Login page HTML retrieved');
    console.log(`   Length: ${html.length} characters`);
    
    // Check for 2FA message in HTML
    if (html.includes('Login failed due to incorrect 2FA setup')) {
      console.log('❌ 2FA message found in server HTML!');
      
      // Find the exact location
      const lines = html.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('Login failed due to incorrect 2FA setup')) {
          console.log(`   Line ${index + 1}: ${line.trim()}`);
          
          // Show context
          console.log('   Context:');
          for (let i = Math.max(0, index - 3); i <= Math.min(lines.length - 1, index + 3); i++) {
            const marker = i === index ? '>>> ' : '    ';
            console.log(`${marker}${i + 1}: ${lines[i].trim()}`);
          }
        }
      });
    } else {
      console.log('✅ No 2FA message in server HTML');
      
      // Check for any error messages
      const errorPatterns = [
        /class="[^"]*error[^"]*"/gi,
        /class="[^"]*message[^"]*"/gi,
        /class="[^"]*notice[^"]*"/gi,
        /id="[^"]*error[^"]*"/gi,
        /id="[^"]*message[^"]*"/gi
      ];
      
      errorPatterns.forEach((pattern, index) => {
        const matches = html.match(pattern);
        if (matches) {
          console.log(`🔍 Found error/message elements: ${matches.length}`);
          matches.forEach(match => {
            console.log(`   ${match}`);
          });
        }
      });
      
      // Check for any JavaScript that might inject the message
      const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi);
      if (scriptMatches) {
        console.log(`🔍 Found ${scriptMatches.length} script tags`);
        scriptMatches.forEach((script, index) => {
          if (script.includes('2FA') || script.includes('incorrect') || script.includes('setup')) {
            console.log(`   Script ${index + 1} contains 2FA-related content:`);
            console.log(`   ${script.substring(0, 200)}...`);
          }
        });
      }
    }
    
    // Check for any PHP errors or warnings
    if (html.includes('Warning:') || html.includes('Notice:') || html.includes('Fatal error:')) {
      console.log('⚠️  PHP errors/warnings found in HTML');
      const errorLines = html.split('\n').filter(line => 
        line.includes('Warning:') || line.includes('Notice:') || line.includes('Fatal error:')
      );
      errorLines.forEach(line => {
        console.log(`   ${line.trim()}`);
      });
    }
    
  }).catch(error => {
    console.error('❌ Error getting login page:', error.message);
  });
}

function getLoginPage() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.helvetiforma.ch',
      port: 443,
      path: '/wp-login.php',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Also check if there are any active mu-plugins
function checkMuPlugins() {
  console.log('\n🔌 Checking for active mu-plugins...');
  
  // Try to access common mu-plugin files
  const commonMuPlugins = [
    'helvetiforma-tutor-woo-fix.php',
    'disable-2fa.php',
    'force-disable-2fa.php',
    '2fa-disable.php',
    'login-fix.php'
  ];
  
  commonMuPlugins.forEach(plugin => {
    checkMuPlugin(plugin);
  });
}

function checkMuPlugin(pluginName) {
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: `/wp-content/mu-plugins/${pluginName}`,
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
        console.log(`✅ Found mu-plugin: ${pluginName}`);
        
        // Check if it contains 2FA-related code
        if (data.includes('2FA') || data.includes('incorrect') || data.includes('setup')) {
          console.log(`   ⚠️  ${pluginName} contains 2FA-related code!`);
          
          // Show relevant lines
          const lines = data.split('\n');
          lines.forEach((line, index) => {
            if (line.includes('2FA') || line.includes('incorrect') || line.includes('setup')) {
              console.log(`   Line ${index + 1}: ${line.trim()}`);
            }
          });
        }
      } else if (res.statusCode === 404) {
        console.log(`❌ Mu-plugin not found: ${pluginName}`);
      } else {
        console.log(`⚠️  Error checking ${pluginName}: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error checking ${pluginName}: ${error.message}`);
  });

  req.end();
}

// Run the debug
if (require.main === module) {
  debug2FASource();
  setTimeout(checkMuPlugins, 2000);
}

module.exports = { debug2FASource };

