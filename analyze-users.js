#!/usr/bin/env node

/**
 * WordPress User Analysis
 * This script analyzes all registered users in WordPress
 */

const https = require('https');

function analyzeUsers() {
  console.log('👥 WordPress User Analysis');
  console.log('==========================');
  
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
        const users = JSON.parse(data);
        
        console.log(`📊 Total Users Found: ${users.length}`);
        console.log('');
        
        // Categorize users
        const admins = users.filter(u => {
          if (Array.isArray(u.roles)) {
            return u.roles.includes('administrator');
          } else if (typeof u.roles === 'object' && u.roles !== null) {
            return Object.values(u.roles).includes('administrator');
          }
          return false;
        });
        
        const subscribers = users.filter(u => {
          if (Array.isArray(u.roles)) {
            return u.roles.includes('subscriber');
          } else if (typeof u.roles === 'object' && u.roles !== null) {
            return Object.values(u.roles).includes('subscriber');
          }
          return false;
        });
        
        const customers = users.filter(u => {
          if (Array.isArray(u.roles)) {
            return u.roles.includes('customer');
          } else if (typeof u.roles === 'object' && u.roles !== null) {
            return Object.values(u.roles).includes('customer');
          }
          return false;
        });
        
        const instructors = users.filter(u => {
          if (Array.isArray(u.roles)) {
            return u.roles.includes('tutor_instructor');
          } else if (typeof u.roles === 'object' && u.roles !== null) {
            return Object.values(u.roles).includes('tutor_instructor');
          }
          return false;
        });
        
        console.log('🔑 ADMINISTRATORS:');
        console.log('=================');
        admins.forEach(user => {
          console.log(`  ID: ${user.id}`);
          console.log(`  Name: ${user.name}`);
          console.log(`  Email: ${user.email || 'Not available'}`);
          console.log(`  Slug: ${user.slug}`);
          console.log(`  Roles: ${Array.isArray(user.roles) ? user.roles.join(', ') : JSON.stringify(user.roles)}`);
          console.log(`  Registered: ${user.registered || 'Not available'}`);
          console.log(`  Link: ${user.link}`);
          console.log('');
        });
        
        console.log('👨‍🏫 TUTOR INSTRUCTORS:');
        console.log('======================');
        instructors.forEach(user => {
          console.log(`  ID: ${user.id}`);
          console.log(`  Name: ${user.name}`);
          console.log(`  Email: ${user.email || 'Not available'}`);
          console.log(`  Slug: ${user.slug}`);
          console.log(`  Roles: ${Array.isArray(user.roles) ? user.roles.join(', ') : JSON.stringify(user.roles)}`);
          console.log('');
        });
        
        console.log('👤 SUBSCRIBERS:');
        console.log('===============');
        subscribers.forEach(user => {
          console.log(`  ID: ${user.id}`);
          console.log(`  Name: ${user.name}`);
          console.log(`  Email: ${user.email || 'Not available'}`);
          console.log(`  Slug: ${user.slug}`);
          console.log(`  Registered: ${user.registered || 'Not available'}`);
          console.log('');
        });
        
        console.log('🛒 CUSTOMERS:');
        console.log('=============');
        customers.forEach(user => {
          console.log(`  ID: ${user.id}`);
          console.log(`  Name: ${user.name}`);
          console.log(`  Email: ${user.email || 'Not available'}`);
          console.log(`  Slug: ${user.slug}`);
          console.log(`  Roles: ${JSON.stringify(user.roles)}`);
          console.log('');
        });
        
        // Security analysis
        console.log('🔍 SECURITY ANALYSIS:');
        console.log('====================');
        
        const suspiciousUsers = users.filter(user => 
          user.name?.toLowerCase().includes('test') ||
          user.slug?.includes('test') ||
          user.name?.toLowerCase().includes('admin') ||
          user.slug?.includes('admin')
        );
        
        if (suspiciousUsers.length > 0) {
          console.log('⚠️  Potentially suspicious users:');
          suspiciousUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.slug}) - ID: ${user.id}`);
          });
        } else {
          console.log('✅ No obviously suspicious users found');
        }
        
        // Check for duplicate names
        const nameGroups = {};
        users.forEach(user => {
          if (user.name) {
            if (!nameGroups[user.name]) {
              nameGroups[user.name] = [];
            }
            nameGroups[user.name].push(user);
          }
        });
        
        const duplicates = Object.entries(nameGroups).filter(([name, users]) => users.length > 1);
        if (duplicates.length > 0) {
          console.log('\n🔄 Duplicate user names:');
          duplicates.forEach(([name, users]) => {
            console.log(`  "${name}": ${users.length} users`);
            users.forEach(user => {
              console.log(`    - ID: ${user.id}, Slug: ${user.slug}`);
            });
          });
        }
        
        console.log('\n🎯 SUMMARY:');
        console.log('===========');
        console.log(`Total Users: ${users.length}`);
        console.log(`Administrators: ${admins.length}`);
        console.log(`Tutor Instructors: ${instructors.length}`);
        console.log(`Subscribers: ${subscribers.length}`);
        console.log(`Customers: ${customers.length}`);
        console.log(`Suspicious Users: ${suspiciousUsers.length}`);
        console.log(`Duplicate Names: ${duplicates.length}`);
        
      } else {
        console.log('❌ Failed to fetch users');
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.end();
}

// Run the analysis
if (require.main === module) {
  analyzeUsers();
}

module.exports = { analyzeUsers };
