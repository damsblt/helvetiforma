#!/usr/bin/env node

/**
 * WordPress MFA Configuration Checker
 * This script checks MFA/2FA settings for all users
 */

const https = require('https');

function checkMFAConfig() {
  console.log('🔐 WordPress MFA Configuration Check');
  console.log('====================================');
  
  // First, get all users
  getUsers().then(users => {
    console.log(`📊 Checking MFA config for ${users.length} users...\n`);
    
    // Check each user's MFA settings
    users.forEach((user, index) => {
      setTimeout(() => {
        checkUserMFA(user);
      }, index * 500); // Stagger requests to avoid rate limiting
    });
  }).catch(error => {
    console.error('❌ Error fetching users:', error.message);
  });
}

function getUsers() {
  return new Promise((resolve, reject) => {
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
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function checkUserMFA(user) {
  console.log(`🔍 Checking MFA for: ${user.name} (ID: ${user.id})`);
  console.log(`   Slug: ${user.slug}`);
  console.log(`   Roles: ${Array.isArray(user.roles) ? user.roles.join(', ') : JSON.stringify(user.roles)}`);
  
  // Check user meta for MFA-related settings
  checkUserMeta(user.id).then(meta => {
    console.log(`   📧 Email: ${meta.email || 'Not available'}`);
    
    // Look for MFA-related meta fields
    const mfaFields = [
      'two_factor_enabled',
      'two_factor_secret',
      'two_factor_backup_codes',
      'wordfence_2fa_secret',
      'wordfence_2fa_recovery_codes',
      'ithemes_2fa_secret',
      'ithemes_2fa_backup_codes',
      'wp_2fa_enabled',
      'wp_2fa_secret',
      'wp_2fa_backup_codes',
      '2fa_enabled',
      '2fa_secret',
      'mfa_enabled',
      'mfa_secret'
    ];
    
    const foundMFAFields = [];
    mfaFields.forEach(field => {
      if (meta[field]) {
        foundMFAFields.push(field);
      }
    });
    
    if (foundMFAFields.length > 0) {
      console.log(`   🚨 MFA ENABLED! Fields found:`);
      foundMFAFields.forEach(field => {
        console.log(`      - ${field}: ${meta[field] ? 'Set' : 'Not set'}`);
      });
    } else {
      console.log(`   ✅ No MFA fields found`);
    }
    
    // Check for security-related plugins
    const securityFields = [
      'wordfence_security',
      'ithemes_security',
      'wp_security',
      'login_security',
      'two_factor_auth'
    ];
    
    const foundSecurityFields = [];
    securityFields.forEach(field => {
      if (meta[field]) {
        foundSecurityFields.push(field);
      }
    });
    
    if (foundSecurityFields.length > 0) {
      console.log(`   🔒 Security plugin fields:`);
      foundSecurityFields.forEach(field => {
        console.log(`      - ${field}: ${meta[field] ? 'Set' : 'Not set'}`);
      });
    }
    
    console.log(''); // Empty line for readability
    
  }).catch(error => {
    console.log(`   ❌ Error checking meta: ${error.message}\n`);
  });
}

function checkUserMeta(userId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.helvetiforma.ch',
      port: 443,
      path: `/wp-json/wp/v2/users/${userId}`,
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
          resolve({
            email: user.email,
            ...user.meta
          });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Also check for MFA-related plugins
function checkMFAPlugins() {
  console.log('\n🔌 Checking for MFA-related plugins...');
  
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
        const plugins = JSON.parse(data);
        const mfaPlugins = plugins.filter(plugin => 
          plugin.name.toLowerCase().includes('2fa') ||
          plugin.name.toLowerCase().includes('two factor') ||
          plugin.name.toLowerCase().includes('mfa') ||
          plugin.name.toLowerCase().includes('wordfence') ||
          plugin.name.toLowerCase().includes('ithemes') ||
          plugin.name.toLowerCase().includes('security')
        );
        
        if (mfaPlugins.length > 0) {
          console.log('🚨 MFA/Security plugins found:');
          mfaPlugins.forEach(plugin => {
            console.log(`   - ${plugin.name} (${plugin.status})`);
            console.log(`     Version: ${plugin.version}`);
            console.log(`     Description: ${plugin.description || 'No description'}`);
          });
        } else {
          console.log('✅ No obvious MFA/Security plugins found');
        }
      } else {
        console.log('❌ Error checking plugins');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Plugin check failed:', error.message);
  });

  req.end();
}

// Run the checks
if (require.main === module) {
  checkMFAConfig();
  setTimeout(checkMFAPlugins, 2000); // Check plugins after user checks
}

module.exports = { checkMFAConfig, checkMFAPlugins };

