// Placeholder image generator for items
// This creates simple colored rectangles as placeholder images

const fs = require('fs')
const path = require('path')

// Item data with colors for placeholder images
const items = [
  { sku: 'CTF-C-CIM-252888G63PBLK', color: '#000000', name: 'Impact Case Black' },
  { sku: 'CTF-C-CBU-252886G63PMBL', color: '#2C2C2C', name: 'Bounce Case Matte Black' },
  { sku: 'CTF-C-CIM-252887G63BLK', color: '#000000', name: 'Impact Case Black' },
  { sku: 'CTF-C-CBU-252886G63PBLK', color: '#000000', name: 'Bounce Case Black' },
  { sku: 'CTF-C-CIM-252887G63PMBL', color: '#2C2C2C', name: 'Impact Case Matte Black' },
  { sku: 'CTF-C-CIM-252887G63PBLK', color: '#000000', name: 'Impact Case Black' },
  { sku: 'CTF-C-CET-252895G63PBLK', color: '#000000', name: 'Compact Case Black' },
  { sku: 'CTF-C-CET-252895G69BLK', color: '#000000', name: 'Compact Case Black' },
  { sku: 'CTF-C-CMT-252891G63PBLK', color: '#000000', name: 'Material Grip Case Black' },
  { sku: 'CTF-C-CWS-252900G63PPKX', color: '#FF69B4', name: 'Ripple Case Pink' },
  { sku: 'CTF-C-CWS-252900G63PBLK', color: '#000000', name: 'Ripple Case Black' },
  { sku: 'CTF-C-CWS-252900G63PWHX', color: '#FFFFFF', name: 'Ripple Case White' },
  { sku: 'CTF-C-CWS-252900G63PCRE', color: '#D2B48C', name: 'Ripple Case Oat' },
  { sku: 'CTF-C-CIM-252887G69BLK', color: '#000000', name: 'Impact Case Black' },
  { sku: 'CTF-C-CIM-252887G63PPKX', color: '#FF69B4', name: 'Impact Case Pink' }
]

// Create SVG placeholder images
function createPlaceholderImage(sku, color, name) {
  const svg = `
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="${color}" stroke="#ddd" stroke-width="2"/>
  <rect x="50" y="50" width="200" height="200" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
  <text x="150" y="160" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${name}</text>
  <text x="150" y="180" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="10">${sku}</text>
</svg>`
  
  const filename = `${sku}.svg`
  const filepath = path.join(__dirname, '..', 'public', 'images', 'items', filename)
  
  fs.writeFileSync(filepath, svg)
  console.log(`Created placeholder image: ${filename}`)
}

// Generate all placeholder images
console.log('Generating placeholder images for items...')
items.forEach(item => {
  createPlaceholderImage(item.sku, item.color, item.name)
})

console.log('✅ All placeholder images created!')
