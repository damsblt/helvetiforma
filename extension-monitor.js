#!/usr/bin/env node

/**
 * Extension Monitor - Track malicious extension reinstalls
 */

const fs = require('fs');
const path = require('path');

function monitorExtensions() {
  console.log('🔍 Monitoring for Malicious Extension Reinstalls');
  console.log('===============================================');
  
  const chromePath = '/Users/damien/Library/Application Support/Google/Chrome/Default/Extensions';
  const maliciousId = 'pejdijmoenmkgeppbflobdenhhabjlaj';
  
  if (fs.existsSync(chromePath)) {
    const extensions = fs.readdirSync(chromePath);
    const maliciousExists = extensions.includes(maliciousId);
    
    console.log(`📊 Total extensions: ${extensions.length}`);
    console.log(`🚨 Malicious extension present: ${maliciousExists ? 'YES' : 'NO'}`);
    
    if (maliciousExists) {
      console.log('\n❌ MALICIOUS EXTENSION STILL EXISTS!');
      console.log('===================================');
      console.log('This means:');
      console.log('1. Chrome sync is restoring it');
      console.log('2. Another application is installing it');
      console.log('3. Malware is reinstalling it');
      console.log('4. You have multiple Chrome profiles');
      
      console.log('\n🔧 IMMEDIATE ACTIONS:');
      console.log('====================');
      console.log('1. Go to chrome://extensions/');
      console.log('2. Find and REMOVE the malicious extension');
      console.log('3. Go to chrome://settings/syncSetup');
      console.log('4. Turn OFF sync completely');
      console.log('5. Go to chrome://settings/clearBrowserData');
      console.log('6. Clear ALL data for ALL time');
      console.log('7. Restart Chrome');
      
      console.log('\n🔄 Alternative Solutions:');
      console.log('========================');
      console.log('1. Use Safari or Firefox to access WordPress');
      console.log('2. Use Chrome incognito mode');
      console.log('3. Create a new Chrome profile');
      console.log('4. Run antivirus scan for malware');
    } else {
      console.log('\n✅ Malicious extension not found');
      console.log('Try accessing WordPress now!');
    }
  } else {
    console.log('❌ Chrome extensions directory not found');
  }
}

// Run the monitor
if (require.main === module) {
  monitorExtensions();
}

module.exports = { monitorExtensions };

