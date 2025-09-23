#!/usr/bin/env node

/**
 * Check WordPress Database for 2FA Settings
 */

const https = require('https');

function checkDatabase2FA() {
  console.log('🗄️  Checking WordPress Database for 2FA Settings...');
  console.log('==================================================');
  
  // Check wp_options table for 2FA settings
  checkWPOptions();
  
  // Check wp_usermeta table for 2FA user settings
  checkUserMeta();
  
  // Check wp_posts table for any 2FA-related content
  checkPosts();
  
  // Check wp_postmeta table for 2FA metadata
  checkPostMeta();
}

function checkWPOptions() {
  console.log('\n📋 Checking wp_options table...');
  
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/options',
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
          const options = JSON.parse(data);
          console.log('✅ Retrieved wp_options data');
          
          // Look for any 2FA-related keys
          const keys = Object.keys(options);
          const mfaKeys = keys.filter(key => 
            key.toLowerCase().includes('2fa') || 
            key.toLowerCase().includes('two_factor') ||
            key.toLowerCase().includes('mfa') ||
            key.toLowerCase().includes('tfa') ||
            key.toLowerCase().includes('wordfence') ||
            key.toLowerCase().includes('ithemes') ||
            key.toLowerCase().includes('login') ||
            key.toLowerCase().includes('auth') ||
            key.toLowerCase().includes('security')
          );
          
          if (mfaKeys.length > 0) {
            console.log('🔍 Found security-related options:');
            mfaKeys.forEach(key => {
              const value = options[key];
              if (typeof value === 'string' && value.length > 100) {
                console.log(`   ${key}: ${value.substring(0, 100)}...`);
              } else {
                console.log(`   ${key}: ${JSON.stringify(value)}`);
              }
            });
          } else {
            console.log('❌ No security-related options found');
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

function checkUserMeta() {
  console.log('\n👥 Checking wp_usermeta table...');
  
  // Get all users first
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
          
          // Check each user's meta data
          users.forEach(user => {
            if (user.meta) {
              const metaKeys = Object.keys(user.meta);
              const mfaKeys = metaKeys.filter(key => 
                key.toLowerCase().includes('2fa') || 
                key.toLowerCase().includes('two_factor') ||
                key.toLowerCase().includes('mfa') ||
                key.toLowerCase().includes('tfa') ||
                key.toLowerCase().includes('wordfence') ||
                key.toLowerCase().includes('ithemes') ||
                key.toLowerCase().includes('login') ||
                key.toLowerCase().includes('auth')
              );
              
              if (mfaKeys.length > 0) {
                console.log(`🔍 User ${user.name} (ID: ${user.id}) has security-related meta:`);
                mfaKeys.forEach(key => {
                  const value = user.meta[key];
                  if (typeof value === 'string' && value.length > 50) {
                    console.log(`   ${key}: ${value.substring(0, 50)}...`);
                  } else {
                    console.log(`   ${key}: ${JSON.stringify(value)}`);
                  }
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

function checkPosts() {
  console.log('\n📝 Checking wp_posts table for 2FA content...');
  
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/posts?search=2FA&per_page=50',
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
          console.log(`✅ Found ${posts.length} posts with 2FA content`);
          
          posts.forEach(post => {
            if (post.content && post.content.rendered) {
              const content = post.content.rendered;
              if (content.includes('Login failed due to incorrect 2FA setup')) {
                console.log(`❌ Post "${post.title.rendered}" (ID: ${post.id}) contains the 2FA message!`);
                console.log(`   Content: ${content.substring(0, 200)}...`);
              }
            }
          });
        } catch (e) {
          console.log('❌ Error parsing posts:', e.message);
        }
      } else {
        console.log(`❌ Error getting posts: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error getting posts: ${error.message}`);
  });

  req.end();
}

function checkPostMeta() {
  console.log('\n🏷️  Checking wp_postmeta table...');
  
  // This is harder to check via REST API, but let's try to get posts with meta
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/posts?per_page=20&_embed=true',
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
          console.log(`✅ Retrieved ${posts.length} posts with embedded data`);
          
          // Check for any meta data that might contain 2FA settings
          posts.forEach(post => {
            if (post.meta) {
              const metaKeys = Object.keys(post.meta);
              const mfaKeys = metaKeys.filter(key => 
                key.toLowerCase().includes('2fa') || 
                key.toLowerCase().includes('two_factor') ||
                key.toLowerCase().includes('mfa') ||
                key.toLowerCase().includes('tfa') ||
                key.toLowerCase().includes('login') ||
                key.toLowerCase().includes('auth')
              );
              
              if (mfaKeys.length > 0) {
                console.log(`🔍 Post "${post.title.rendered}" (ID: ${post.id}) has security-related meta:`);
                mfaKeys.forEach(key => {
                  console.log(`   ${key}: ${JSON.stringify(post.meta[key])}`);
                });
              }
            }
          });
        } catch (e) {
          console.log('❌ Error parsing posts with meta:', e.message);
        }
      } else {
        console.log(`❌ Error getting posts with meta: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Error getting posts with meta: ${error.message}`);
  });

  req.end();
}

// Run the check
if (require.main === module) {
  checkDatabase2FA();
}

module.exports = { checkDatabase2FA };

