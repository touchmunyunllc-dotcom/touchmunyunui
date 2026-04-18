#!/usr/bin/env node

/**
 * PWA Icon Generator
 * Generates all required PWA icon sizes from a source image or creates default icons
 */

const fs = require('fs');
const path = require('path');

// Try to use sharp if available, otherwise use a simple approach
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp not found. Installing...');
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const requiredSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIconFromSource(sourcePath, size) {
  if (!sharp) {
    throw new Error('Sharp is required for icon generation from source');
  }
  
  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  await sharp(sourcePath)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 10, g: 10, b: 10, alpha: 1 } // Premium black background
    })
    .png()
    .toFile(outputPath);
  
  console.log(`  ✅ Generated icon-${size}x${size}.png`);
}

async function generateDefaultIcon(size) {
  // Create a premium icon with red/black theme and shopping bag icon
  const padding = size * 0.15;
  const iconSize = size - (padding * 2);
  const strokeWidth = Math.max(2, size * 0.04);
  
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#b91c1c;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow${size}">
      <feDropShadow dx="0" dy="${size * 0.02}" stdDeviation="${size * 0.03}" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#0a0a0a" rx="${size * 0.25}"/>
  <!-- Main icon container with gradient -->
  <rect x="${padding}" y="${padding}" width="${iconSize}" height="${iconSize}" fill="url(#grad${size})" rx="${size * 0.2}" filter="url(#shadow${size})"/>
  <!-- Shopping bag icon -->
  <g transform="translate(${size * 0.5}, ${size * 0.5})">
    <path d="M ${-iconSize * 0.25} ${-iconSize * 0.15} L ${-iconSize * 0.25} ${-iconSize * 0.35} A ${iconSize * 0.1} ${iconSize * 0.1} 0 0 1 ${-iconSize * 0.15} ${-iconSize * 0.4} L ${iconSize * 0.15} ${-iconSize * 0.4} A ${iconSize * 0.1} ${iconSize * 0.1} 0 0 1 ${iconSize * 0.25} ${-iconSize * 0.35} L ${iconSize * 0.25} ${-iconSize * 0.15} Z" 
          fill="none" 
          stroke="white" 
          stroke-width="${strokeWidth}" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
    <rect x="${-iconSize * 0.25}" y="${-iconSize * 0.15}" width="${iconSize * 0.5}" height="${iconSize * 0.5}" 
          fill="none" 
          stroke="white" 
          stroke-width="${strokeWidth}" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          rx="${size * 0.02}"/>
    <line x1="${-iconSize * 0.15}" y1="${iconSize * 0.15}" x2="${-iconSize * 0.15}" y2="${iconSize * 0.25}" 
          stroke="white" 
          stroke-width="${strokeWidth}" 
          stroke-linecap="round"/>
    <line x1="${iconSize * 0.15}" y1="${iconSize * 0.15}" x2="${iconSize * 0.15}" y2="${iconSize * 0.25}" 
          stroke="white" 
          stroke-width="${strokeWidth}" 
          stroke-linecap="round"/>
  </g>
</svg>`;

  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // Convert SVG to PNG using sharp
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  console.log(`  ✅ Generated icon-${size}x${size}.png`);
}

async function main() {
  const sourcePath = process.argv[2];
  
  console.log('🎨 Generating PWA Icons...\n');
  
  if (sourcePath && fs.existsSync(sourcePath)) {
    console.log(`📸 Using source image: ${sourcePath}\n`);
    
    if (!sharp) {
      console.log('❌ Sharp library is required to generate icons from source image.');
      console.log('   Install it with: npm install --save-dev sharp');
      console.log('   Or generate default icons without source image.');
      process.exit(1);
    }
    
    for (const size of requiredSizes) {
      await generateIconFromSource(sourcePath, size);
    }
  } else {
    console.log('📝 Generating default icons with TouchMunyun branding...\n');
    console.log('   Creating premium red/black themed icons with shopping bag icon\n');
    console.log('   (To use your own logo, run: node scripts/generate-icons.js path/to/your/logo.png)\n');
    
    for (const size of requiredSizes) {
      await generateDefaultIcon(size);
    }
  }
  
  console.log('\n✅ All icons generated successfully!');
  console.log('   Icons saved to: public/icons/');
}

main().catch(error => {
  console.error('❌ Error generating icons:', error.message);
  process.exit(1);
});

