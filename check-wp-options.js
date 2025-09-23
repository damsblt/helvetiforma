#!/usr/bin/env node

/**
 * Check WordPress Options for 2FA Settings
 */

const https = require('https');

function checkWPOptions() {
  console.log('🔍 Checking WordPress Options for 2FA Settings...');
  console.log('================================================');
  
  // List of 2FA-related options to check
  const mfaOptions = [
    'two_factor_enabled',
    'wordfence_2fa_enabled', 
    'ithemes_2fa_enabled',
    'wp_2fa_enabled',
    '2fa_enabled',
    'mfa_enabled',
    'two_factor_auth_enabled',
    'tfa_enabled',
    'login_security_enabled',
    'two_factor_users',
    'wp_2fa_users',
    'wordfence_2fa_users',
    'ithemes_2fa_users'
  ];
  
  mfaOptions.forEach(option => {
    checkOption(option);
  });
  
  // Also check for any transients
  setTimeout(checkTransients, 2000);
}

function checkOption(optionName) {
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: `/wp-json/wp/v2/options/${optionName}`,
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
          const result = JSON.parse(data);
          if (result !== null && result !== undefined && result !== '') {
            console.log(`✅ Found option: ${optionName} = ${JSON.stringify(result)}`);
          }
        } catch (e) {
          console.log(`✅ Found option: ${optionName} = ${data}`);
        }
      } else if (res.statusCode === 404) {
        console.log(`❌ Option not found: ${optionName}`);
      } else {
        console.log(`⚠️  Error checking ${optionName}: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error checking ${optionName}: ${error.message}`);
  });

  req.end();
}

function checkTransients() {
  console.log('\n🕐 Checking for 2FA-related transients...');
  
  const transientOptions = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/options',
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('gibivawa:0FU5 nwzs hUZG Q065 0Iby 2USq').toString('base64'),
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(transientOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const options = JSON.parse(data);
          console.log('📋 All WordPress options retrieved');
          
          // Look for any 2FA-related keys
          const keys = Object.keys(options);
          const mfaKeys = keys.filter(key => 
            key.toLowerCase().includes('2fa') || 
            key.toLowerCase().includes('two_factor') ||
            key.toLowerCase().includes('mfa') ||
            key.toLowerCase().includes('tfa') ||
            key.toLowerCase().includes('wordfence') ||
            key.toLowerCase().includes('ithemes')
          );
          
          if (mfaKeys.length > 0) {
            console.log('🔍 Found 2FA-related options:');
            mfaKeys.forEach(key => {
              console.log(`   ${key}: ${JSON.stringify(options[key])}`);
            });
          } else {
            console.log('✅ No 2FA-related options found');
          }
        } catch (e) {
          console.log('❌ Error parsing options:', e.message);
        }
      } else {
        console.log(`❌ Error getting options: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error getting options: ${error.message}`);
  });

  req.end();
}

// Run the check
if (require.main === module) {
  checkWPOptions();
}

module.exports = { checkWPOptions };

