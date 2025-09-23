#!/usr/bin/env node

/**
 * Chrome Extension Security Checker
 * This script helps identify malicious Chrome extensions
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function checkChromeExtensions() {
  console.log('🔍 Chrome Extension Security Check');
  console.log('==================================');
  
  const homeDir = os.homedir();
  const chromeExtensionsPath = path.join(homeDir, 'Library', 'Application Support', 'Google', 'Chrome', 'Default', 'Extensions');
  
  console.log(`📁 Checking Chrome extensions in: ${chromeExtensionsPath}`);
  
  if (!fs.existsSync(chromeExtensionsPath)) {
    console.log('❌ Chrome extensions directory not found');
    console.log('💡 Try checking: chrome://extensions/ in your browser');
    return;
  }
  
  try {
    const extensions = fs.readdirSync(chromeExtensionsPath);
    console.log(`📊 Found ${extensions.length} extension directories`);
    
    const suspiciousExtensions = [];
    const knownMaliciousIds = [
      'pejdijmoenmkgeppbflobdenhhabjlaj', // The one we found
      'nmmhkkegccagdldgiimedpiccmgmieda', // Common malicious ID
      'aapocclcgogkmnckokdopfmjonfmglg', // Another common one
      'aohghmighlieiainnegkcijnfilokake', // Another common one
    ];
    
    console.log('\n🔍 Checking for suspicious extensions...');
    
    extensions.forEach(extId => {
      const extPath = path.join(chromeExtensionsPath, extId);
      const manifestPath = path.join(extPath, 'manifest.json');
      
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          
          // Check for suspicious patterns
          const isSuspicious = 
            knownMaliciousIds.includes(extId) ||
            !manifest.name ||
            !manifest.version ||
            manifest.permissions?.includes('tabs') ||
            manifest.permissions?.includes('activeTab') ||
            manifest.permissions?.includes('storage') ||
            manifest.permissions?.includes('cookies') ||
            manifest.permissions?.includes('webRequest') ||
            manifest.permissions?.includes('webRequestBlocking') ||
            manifest.content_scripts?.length > 0 ||
            manifest.web_accessible_resources?.length > 0;
          
          if (isSuspicious) {
            suspiciousExtensions.push({
              id: extId,
              name: manifest.name || 'Unknown',
              version: manifest.version || 'Unknown',
              permissions: manifest.permissions || [],
              contentScripts: manifest.content_scripts || [],
              webAccessibleResources: manifest.web_accessible_resources || []
            });
          }
        } catch (error) {
          console.log(`⚠️  Could not read manifest for ${extId}: ${error.message}`);
        }
      }
    });
    
    if (suspiciousExtensions.length > 0) {
      console.log('\n🚨 SUSPICIOUS EXTENSIONS FOUND:');
      console.log('================================');
      
      suspiciousExtensions.forEach(ext => {
        console.log(`\n🔴 Extension ID: ${ext.id}`);
        console.log(`   Name: ${ext.name}`);
        console.log(`   Version: ${ext.version}`);
        console.log(`   Permissions: ${ext.permissions.join(', ')}`);
        
        if (ext.contentScripts.length > 0) {
          console.log(`   Content Scripts: ${ext.contentScripts.length} found`);
        }
        
        if (ext.webAccessibleResources.length > 0) {
          console.log(`   Web Accessible Resources: ${ext.webAccessibleResources.length} found`);
        }
        
        // Check if this is the specific malicious one we found
        if (ext.id === 'pejdijmoenmkgeppbflobdenhhabjlaj') {
          console.log('   🚨 THIS IS THE MALICIOUS EXTENSION CAUSING THE 2FA ERROR!');
        }
      });
      
      console.log('\n🔧 IMMEDIATE ACTIONS REQUIRED:');
      console.log('==============================');
      console.log('1. Go to chrome://extensions/');
      console.log('2. Find and REMOVE the suspicious extensions above');
      console.log('3. Pay special attention to the one causing 2FA errors');
      console.log('4. Clear all browser data after removal');
      console.log('5. Restart Chrome');
      
    } else {
      console.log('\n✅ No obviously suspicious extensions found');
      console.log('💡 The malicious extension might be:');
      console.log('   - Hidden or disguised');
      console.log('   - Installed as a different type of software');
      console.log('   - Browser hijacker or malware');
    }
    
    console.log('\n🔍 Additional Security Checks:');
    console.log('==============================');
    console.log('1. Check chrome://extensions/ for any extensions you don\'t recognize');
    console.log('2. Look for extensions with generic names like "Helper", "Assistant", "Tool"');
    console.log('3. Check for extensions that ask for excessive permissions');
    console.log('4. Run a full antivirus scan');
    console.log('5. Check for browser hijackers or adware');
    
  } catch (error) {
    console.error('❌ Error checking extensions:', error.message);
  }
}

// Run the check
if (require.main === module) {
  checkChromeExtensions();
}

module.exports = { checkChromeExtensions };

