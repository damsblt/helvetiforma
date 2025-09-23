#!/usr/bin/env node

/**
 * Remove 2FA via WordPress API
 * This script attempts to remove all 2FA settings from WordPress
 */

const https = require('https');

function remove2FA() {
  console.log('🔧 Removing 2FA Settings via WordPress API');
  console.log('==========================================');
  
  // First, get all users
  getUsers().then(users => {
    console.log(`📊 Found ${users.length} users to process...\n`);
    
    // Process each user
    users.forEach((user, index) => {
      setTimeout(() => {
        removeUser2FA(user);
      }, index * 1000); // Stagger requests
    });
    
    // Also try to remove global 2FA settings
    setTimeout(removeGlobal2FA, users.length * 1000 + 2000);
    
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

function removeUser2FA(user) {
  console.log(`🔧 Removing 2FA for: ${user.name} (ID: ${user.id})`);
  
  // List of 2FA-related meta fields to remove
  const mfaFieldsToRemove = [
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
    'mfa_secret',
    'two_factor_auth_enabled',
    'two_factor_auth_secret',
    'two_factor_auth_backup_codes',
    'tfa_enabled',
    'tfa_secret',
    'tfa_backup_codes'
  ];
  
  // Try to remove each 2FA field
  mfaFieldsToRemove.forEach(field => {
    removeUserMeta(user.id, field);
  });
  
  // Also try to set 2FA as disabled
  setTimeout(() => {
    setUserMeta(user.id, 'two_factor_enabled', '0');
    setUserMeta(user.id, '2fa_enabled', '0');
    setUserMeta(user.id, 'mfa_enabled', '0');
    setUserMeta(user.id, 'wp_2fa_enabled', '0');
  }, 500);
}

function removeUserMeta(userId, metaKey) {
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: `/wp-json/wp/v2/users/${userId}`,
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('gibivawa:0FU5 nwzs hUZG Q065 0Iby 2USq').toString('base64'),
      'Content-Type': 'application/json'
    }
  };

  const postData = JSON.stringify({
    meta: {
      [metaKey]: ''
    }
  });

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`   ✅ Removed ${metaKey} for user ${userId}`);
      } else {
        console.log(`   ⚠️  Could not remove ${metaKey} for user ${userId} (${res.statusCode})`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`   ❌ Error removing ${metaKey} for user ${userId}: ${error.message}`);
  });

  req.write(postData);
  req.end();
}

function setUserMeta(userId, metaKey, metaValue) {
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: `/wp-json/wp/v2/users/${userId}`,
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('gibivawa:0FU5 nwzs hUZG Q065 0Iby 2USq').toString('base64'),
      'Content-Type': 'application/json'
    }
  };

  const postData = JSON.stringify({
    meta: {
      [metaKey]: metaValue
    }
  });

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`   ✅ Set ${metaKey}=${metaValue} for user ${userId}`);
      } else {
        console.log(`   ⚠️  Could not set ${metaKey} for user ${userId} (${res.statusCode})`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`   ❌ Error setting ${metaKey} for user ${userId}: ${error.message}`);
  });

  req.write(postData);
  req.end();
}

function removeGlobal2FA() {
  console.log('\n🌐 Attempting to remove global 2FA settings...');
  
  // Try to disable 2FA plugins via options
  const optionsToDisable = [
    'two_factor_enabled',
    'wordfence_2fa_enabled',
    'ithemes_2fa_enabled',
    'wp_2fa_enabled',
    '2fa_enabled',
    'mfa_enabled'
  ];
  
  optionsToDisable.forEach(option => {
    disableGlobalOption(option);
  });
}

function disableGlobalOption(optionName) {
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/options',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('gibivawa:0FU5 nwzs hUZG Q065 0Iby 2USq').toString('base64'),
      'Content-Type': 'application/json'
    }
  };

  const postData = JSON.stringify({
    [optionName]: '0'
  });

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`   ✅ Disabled global option: ${optionName}`);
      } else {
        console.log(`   ⚠️  Could not disable ${optionName} (${res.statusCode})`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`   ❌ Error disabling ${optionName}: ${error.message}`);
  });

  req.write(postData);
  req.end();
}

// Also try to create a temporary mu-plugin to disable 2FA
function createDisable2FAPlugin() {
  console.log('\n🔌 Creating temporary 2FA disable plugin...');
  
  const pluginCode = `<?php
/**
 * Temporary 2FA Disable Plugin
 * This plugin disables all 2FA functionality
 */

// Disable 2FA for all users
add_action('init', function() {
    // Remove 2FA requirements
    remove_action('login_form', 'wp_2fa_login_form');
    remove_action('wp_login', 'wp_2fa_wp_login');
    remove_action('login_init', 'wp_2fa_login_init');
    
    // Disable Wordfence 2FA
    if (class_exists('wfConfig')) {
        wfConfig::set('loginSecurityEnabled', false);
        wfConfig::set('twoFactor', false);
    }
    
    // Disable iThemes Security 2FA
    if (class_exists('ITSEC_Two_Factor')) {
        remove_action('login_form', array('ITSEC_Two_Factor', 'login_form'));
    }
});

// Clear any 2FA login messages
add_filter('login_message', function($message) {
    if (strpos($message, '2FA') !== false || strpos($message, 'two factor') !== false) {
        return '';
    }
    return $message;
}, 999);

// Force disable 2FA for all users
add_action('wp_login', function($user_login, $user) {
    delete_user_meta($user->ID, 'two_factor_enabled');
    delete_user_meta($user->ID, 'two_factor_secret');
    delete_user_meta($user->ID, 'two_factor_backup_codes');
    delete_user_meta($user->ID, 'wordfence_2fa_secret');
    delete_user_meta($user->ID, 'ithemes_2fa_secret');
    delete_user_meta($user->ID, 'wp_2fa_secret');
}, 10, 2);
?>`;

  // Try to create the plugin via API (this might not work due to file permissions)
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/posts',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('gibivawa:0FU5 nwzs hUZG Q065 0Iby 2USq').toString('base64'),
      'Content-Type': 'application/json'
    }
  };

  const postData = JSON.stringify({
    title: '2FA Disable Plugin',
    content: pluginCode,
    status: 'draft'
  });

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 201) {
        console.log('   ✅ Created 2FA disable plugin draft');
      } else {
        console.log(`   ⚠️  Could not create plugin via API (${res.statusCode})`);
        console.log('   💡 You may need to create this plugin manually via FTP');
      }
    });
  });

  req.on('error', (error) => {
    console.log(`   ❌ Error creating plugin: ${error.message}`);
  });

  req.write(postData);
  req.end();
}

// Run the 2FA removal
if (require.main === module) {
  remove2FA();
  setTimeout(createDisable2FAPlugin, 10000); // Create plugin after user processing
}

module.exports = { remove2FA };

