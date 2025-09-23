#!/usr/bin/env node

/**
 * WordPress Security Investigation
 * This script investigates the sudden 2FA appearance
 */

const https = require('https');

function investigateSecurity() {
  console.log('🔍 WordPress Security Investigation');
  console.log('==================================');
  
  const options = {
    hostname: 'api.helvetiforma.ch',
    port: 443,
    path: '/wp-login.php',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📡 Status Code: ${res.statusCode}`);
    console.log(`📡 Server: ${res.headers.server || 'Unknown'}`);
    console.log(`📡 Content-Type: ${res.headers['content-type'] || 'Unknown'}`);
    
    // Check for security headers
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'strict-transport-security',
      'content-security-policy',
      'x-2fa-required',
      'x-security-level'
    ];
    
    console.log('\n🛡️ Security Headers:');
    securityHeaders.forEach(header => {
      if (res.headers[header]) {
        console.log(`  ${header}: ${res.headers[header]}`);
      }
    });
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📄 Response Analysis:');
      console.log('====================');
      
      // Check for 2FA references
      const twoFactorPatterns = [
        /2FA/gi,
        /two.factor/gi,
        /two.factor.authentication/gi,
        /wordfence/gi,
        /security.plugin/gi,
        /login.failed/gi,
        /incorrect.2FA/gi
      ];
      
      let foundPatterns = [];
      twoFactorPatterns.forEach(pattern => {
        const matches = data.match(pattern);
        if (matches) {
          foundPatterns.push(pattern.source + ': ' + matches.length + ' matches');
        }
      });
      
      if (foundPatterns.length > 0) {
        console.log('🚨 Security Patterns Found:');
        foundPatterns.forEach(pattern => console.log(`  - ${pattern}`));
      } else {
        console.log('✅ No obvious security patterns detected');
      }
      
      // Check for plugin references
      const pluginPatterns = [
        /wordfence/gi,
        /ithemes.security/gi,
        /sucuri/gi,
        /jetpack/gi,
        /security.plugin/gi
      ];
      
      let foundPlugins = [];
      pluginPatterns.forEach(pattern => {
        const matches = data.match(pattern);
        if (matches) {
          foundPlugins.push(pattern.source + ': ' + matches.length + ' matches');
        }
      });
      
      if (foundPlugins.length > 0) {
        console.log('🔌 Plugin References Found:');
        foundPlugins.forEach(plugin => console.log(`  - ${plugin}`));
      }
      
      // Check for suspicious content
      if (data.includes('Login failed due to incorrect 2FA setup')) {
        console.log('🚨 CONFIRMED: 2FA Error Message Present');
        console.log('   This suggests either:');
        console.log('   1. A security plugin was activated');
        console.log('   2. Hosting provider enabled 2FA');
        console.log('   3. WordPress was compromised');
        console.log('   4. A plugin update triggered 2FA');
      }
      
      // Check for WordPress version and potential vulnerabilities
      const wpVersion = data.match(/WordPress\s+([0-9.]+)/i);
      if (wpVersion) {
        console.log(`📝 WordPress Version: ${wpVersion[1]}`);
      }
      
      console.log('\n🎯 Investigation Summary:');
      console.log('=========================');
      if (data.includes('Login failed due to incorrect 2FA setup')) {
        console.log('❌ 2FA issue confirmed - this is likely:');
        console.log('   1. A security plugin (Wordfence, iThemes Security, etc.)');
        console.log('   2. Hosting provider security feature');
        console.log('   3. WordPress compromise requiring immediate action');
        console.log('   4. Plugin update that enabled 2FA automatically');
        console.log('\n🔧 Immediate Actions Needed:');
        console.log('   1. Check hosting provider security settings');
        console.log('   2. Review recently activated plugins');
        console.log('   3. Check for unauthorized admin users');
        console.log('   4. Review WordPress error logs');
        console.log('   5. Consider restoring from backup');
      } else {
        console.log('✅ No obvious security issues detected');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Investigation failed:', error.message);
  });

  req.end();
}

// Run the investigation
if (require.main === module) {
  investigateSecurity();
}

module.exports = { investigateSecurity };

