#!/usr/bin/env node

/**
 * Create New Admin User via WordPress API
 * This will create a new admin user that can login without 2FA restrictions
 */

const https = require('https');

function createNewAdminUser() {
  console.log('👤 Creating New Admin User via WordPress API...');
  console.log('==============================================');
  
  // Generate a random username and password
  const timestamp = Date.now();
  const username = `admin_${timestamp}`;
  const password = generateSecurePassword();
  const email = `admin_${timestamp}@helvetiforma.ch`;
  
  console.log(`📝 New User Details:`);
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password}`);
  console.log(`   Email: ${email}`);
  console.log(`   Role: Administrator`);
  console.log('');
  
  const userData = {
    username: username,
    email: email,
    password: password,
    roles: ['administrator'],
    first_name: 'Admin',
    last_name: 'User',
    description: 'Emergency admin user created to bypass 2FA restrictions'
  };

  const postData = JSON.stringify(userData);

  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/users',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('gibivawa:0FU5 nwzs hUZG Q065 0Iby 2USq').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 201) {
        try {
          const user = JSON.parse(data);
          console.log('✅ New admin user created successfully!');
          console.log(`   User ID: ${user.id}`);
          console.log(`   Username: ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Roles: ${user.roles.join(', ')}`);
          console.log('');
          console.log('🔑 LOGIN CREDENTIALS:');
          console.log(`   Username: ${username}`);
          console.log(`   Password: ${password}`);
          console.log('');
          console.log('🌐 Login URL: https://api.helvetiforma.ch/wp-login.php');
          console.log('');
          console.log('⚠️  IMPORTANT: Save these credentials securely!');
          console.log('   This user has full admin access to your WordPress site.');
          
          // Also try to remove any 2FA settings for this new user
          setTimeout(() => {
            remove2FAForUser(user.id);
          }, 1000);
          
        } catch (e) {
          console.log('❌ Error parsing user response:', e.message);
          console.log('Raw response:', data);
        }
      } else {
        console.log(`❌ User creation failed: ${res.statusCode}`);
        console.log('Response:', data);
        
        // Try to parse error message
        try {
          const error = JSON.parse(data);
          if (error.message) {
            console.log(`Error message: ${error.message}`);
          }
        } catch (e) {
          console.log('Could not parse error response');
        }
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.write(postData);
  req.end();
}

function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
  
  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

function remove2FAForUser(userId) {
  console.log(`\n🔧 Removing any 2FA settings for new user ${userId}...`);
  
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
  
  mfaFields.forEach(field => {
    removeUserMeta(userId, field);
  });
  
  // Set explicit disable flags
  setTimeout(() => {
    setUserMeta(userId, 'two_factor_enabled', '0');
    setUserMeta(userId, '2fa_enabled', '0');
    setUserMeta(userId, 'mfa_enabled', '0');
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

// Run the user creation
if (require.main === module) {
  createNewAdminUser();
}

module.exports = { createNewAdminUser };

