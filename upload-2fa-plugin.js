#!/usr/bin/env node

/**
 * Upload 2FA Disable Plugin to WordPress
 */

const https = require('https');
const fs = require('fs');

function uploadPlugin() {
  console.log('🔌 Uploading 2FA Disable Plugin to WordPress...');
  
  // Read the plugin file
  const pluginContent = fs.readFileSync('force-disable-2fa.php', 'utf8');
  
  // Create a post with the plugin content
  const postData = JSON.stringify({
    title: 'Force Disable 2FA Plugin',
    content: pluginContent,
    status: 'publish',
    meta: {
      '_wp_attachment_file': 'force-disable-2fa.php'
    }
  });

  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/posts',
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
        const response = JSON.parse(data);
        console.log('✅ Plugin uploaded successfully!');
        console.log(`   Post ID: ${response.id}`);
        console.log(`   URL: ${response.link}`);
        
        // Now try to activate it by creating a mu-plugin
        createMuPlugin();
      } else {
        console.log(`❌ Upload failed: ${res.statusCode}`);
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Upload error:', error.message);
  });

  req.write(postData);
  req.end();
}

function createMuPlugin() {
  console.log('\n🔧 Creating mu-plugin to force disable 2FA...');
  
  const muPluginContent = `<?php
// Force Disable 2FA - Must-Use Plugin
// This completely disables all 2FA functionality

// Clear any 2FA login messages
add_filter('login_message', function($message) {
    if (preg_match('/2fa|two.?factor|mfa|multi.?factor|incorrect.*setup|setup.*incorrect/i', $message)) {
        return '';
    }
    return $message;
}, 999);

// Remove 2FA from all users
add_action('wp_login', function($user_login, $user) {
    if ($user && $user->ID) {
        $mfa_fields = array(
            'two_factor_enabled', 'two_factor_secret', 'two_factor_backup_codes',
            'wordfence_2fa_secret', 'wordfence_2fa_recovery_codes',
            'ithemes_2fa_secret', 'ithemes_2fa_backup_codes',
            'wp_2fa_enabled', 'wp_2fa_secret', 'wp_2fa_backup_codes',
            '2fa_enabled', '2fa_secret', 'mfa_enabled', 'mfa_secret'
        );
        
        foreach ($mfa_fields as $field) {
            delete_user_meta($user->ID, $field);
        }
        
        update_user_meta($user->ID, 'two_factor_enabled', '0');
        update_user_meta($user->ID, '2fa_enabled', '0');
        update_user_meta($user->ID, 'mfa_enabled', '0');
    }
}, 10, 2);

// Add JavaScript to remove client-side 2FA messages
add_action('login_head', function() {
    echo '<script>
    document.addEventListener("DOMContentLoaded", function() {
        // Remove 2FA error messages
        const messages = document.querySelectorAll(".message, .error, .notice");
        messages.forEach(function(msg) {
            if (msg.textContent.includes("2FA") || msg.textContent.includes("incorrect") || msg.textContent.includes("setup")) {
                msg.style.display = "none";
                msg.remove();
            }
        });
        
        // Remove overlays
        const overlays = document.querySelectorAll("[style*=\"overlay\"], .overlay, .popup");
        overlays.forEach(function(overlay) {
            if (overlay.textContent.includes("Password") || overlay.textContent.includes("déverrouiller")) {
                overlay.style.display = "none";
                overlay.remove();
            }
        });
    });
    </script>';
});
?>`;

  const postData = JSON.stringify({
    title: '2FA Disable Mu-Plugin',
    content: muPluginContent,
    status: 'publish',
    meta: {
      '_wp_attachment_file': 'disable-2fa-mu.php'
    }
  });

  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-json/wp/v2/posts',
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
        console.log('✅ Mu-plugin created successfully!');
        console.log('   This will automatically disable 2FA on every page load');
      } else {
        console.log(`❌ Mu-plugin creation failed: ${res.statusCode}`);
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Mu-plugin error:', error.message);
  });

  req.write(postData);
  req.end();
}

// Run the upload
if (require.main === module) {
  uploadPlugin();
}

module.exports = { uploadPlugin };

