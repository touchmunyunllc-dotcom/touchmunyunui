#!/usr/bin/env node

/**
 * PWA Verification Script
 * Checks if all PWA requirements are met
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');
const manifestPath = path.join(publicDir, 'manifest.json');

console.log('🔍 Verifying PWA Setup...\n');

let hasErrors = false;
let hasWarnings = false;

// Check manifest.json
console.log('📄 Checking manifest.json...');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('  ✅ manifest.json exists');
    
    // Check required fields
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    requiredFields.forEach(field => {
      if (manifest[field]) {
        console.log(`  ✅ ${field} is set`);
      } else {
        console.log(`  ❌ ${field} is missing`);
        hasErrors = true;
      }
    });
    
    // Check theme colors
    if (manifest.theme_color === '#dc2626') {
      console.log('  ✅ theme_color matches red theme');
    } else {
      console.log(`  ⚠️  theme_color is ${manifest.theme_color} (should be #dc2626)`);
      hasWarnings = true;
    }
    
    if (manifest.background_color === '#0a0a0a') {
      console.log('  ✅ background_color matches premium black theme');
    } else {
      console.log(`  ⚠️  background_color is ${manifest.background_color} (should be #0a0a0a)`);
      hasWarnings = true;
    }
  } catch (error) {
    console.log('  ❌ manifest.json is invalid:', error.message);
    hasErrors = true;
  }
} else {
  console.log('  ❌ manifest.json not found');
  hasErrors = true;
}

// Check icons
console.log('\n🖼️  Checking PWA icons...');
const requiredIcons = [
  'icon-72x72.png',
  'icon-96x96.png',
  'icon-128x128.png',
  'icon-144x144.png',
  'icon-152x152.png',
  'icon-192x192.png',
  'icon-384x384.png',
  'icon-512x512.png',
];

if (!fs.existsSync(iconsDir)) {
  console.log('  ❌ icons directory not found');
  hasErrors = true;
} else {
  let missingIcons = [];
  requiredIcons.forEach(icon => {
    const iconPath = path.join(iconsDir, icon);
    if (fs.existsSync(iconPath)) {
      console.log(`  ✅ ${icon} exists`);
    } else {
      console.log(`  ❌ ${icon} missing`);
      missingIcons.push(icon);
      hasErrors = true;
    }
  });
  
  if (missingIcons.length > 0) {
    console.log(`\n  ⚠️  Missing ${missingIcons.length} icon(s). Generate them using:`);
    console.log('     npx pwa-asset-generator <logo.png> public/icons --manifest public/manifest.json');
  }
}

// Check service worker (after build)
console.log('\n⚙️  Checking service worker...');
const swPath = path.join(publicDir, 'sw.js');
if (fs.existsSync(swPath)) {
  console.log('  ✅ sw.js exists (app has been built)');
} else {
  console.log('  ⚠️  sw.js not found (run "npm run build" to generate)');
  hasWarnings = true;
}

// Check next.config.js
console.log('\n⚙️  Checking next.config.js...');
const configPath = path.join(__dirname, '..', 'next.config.js');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  if (configContent.includes('next-pwa')) {
    console.log('  ✅ next-pwa is configured');
  } else {
    console.log('  ❌ next-pwa not found in config');
    hasErrors = true;
  }
} else {
  console.log('  ❌ next.config.js not found');
  hasErrors = true;
}

// Check _app.tsx
console.log('\n📱 Checking _app.tsx...');
const appPath = path.join(__dirname, '..', 'pages', '_app.tsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  if (appContent.includes('serviceWorker')) {
    console.log('  ✅ Service worker registration found');
  } else {
    console.log('  ⚠️  Service worker registration not found');
    hasWarnings = true;
  }
  
  if (appContent.includes('InstallPWA')) {
    console.log('  ✅ InstallPWA component found');
  } else {
    console.log('  ⚠️  InstallPWA component not found');
    hasWarnings = true;
  }
  
  if (appContent.includes('manifest.json')) {
    console.log('  ✅ Manifest link found');
  } else {
    console.log('  ⚠️  Manifest link not found');
    hasWarnings = true;
  }
} else {
  console.log('  ❌ _app.tsx not found');
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ PWA setup has ERRORS that need to be fixed');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  PWA setup has WARNINGS (non-critical)');
  console.log('   Run "npm run build" to generate service worker');
  console.log('   Generate icons to complete setup');
  process.exit(0);
} else {
  console.log('✅ PWA setup looks good!');
  console.log('   Build the app and test in browser to verify');
  process.exit(0);
}

