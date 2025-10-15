import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CSV data from the user
const csvData = [
  {
    sku: 'CTF-C-CIM-252888G63PBLK',
    deviceType: 'iPhone 17 Pro',
    caseType: 'Impact Case (Non-Magsafe)',
    colour: 'Black',
    description: 'iPhone 6.3 Pro (2025) RECASETiFY Impact Case - Black',
    itemOption: '16009397',
    isRfidItem: true,
    image: '/images/items/CTF-C-CIM-252888G63PBLK.jpg'
  },
  {
    sku: 'CTF-C-CBU-252886G63PMBL',
    deviceType: 'iPhone 17 Pro',
    caseType: 'Bounce Case',
    colour: 'Matte Black',
    description: 'iPhone 6.3 Pro (2025) RECASETiFY Bounce Case MagSafe Compatible - Matte Black',
    itemOption: '16009371',
    isRfidItem: true,
    image: '/images/items/CTF-C-CBU-252886G63PMBL.jpg'
  },
  {
    sku: 'CTF-C-CIM-252887G63BLK',
    deviceType: 'iPhone 17',
    caseType: 'Impact Case',
    colour: 'Black',
    description: 'iPhone 6.3 (2025) RECASETiFY Impact Case MagSafe Compatible - Black',
    itemOption: '16009380',
    isRfidItem: true,
    image: '/images/items/CTF-C-CIM-252887G63BLK.jpg'
  },
  {
    sku: 'CTF-C-CBU-252886G63PBLK',
    deviceType: 'iPhone 17 Pro',
    caseType: 'Bounce Case',
    colour: 'Black',
    description: 'iPhone 6.3 Pro (2025) RECASETiFY Bounce Case MagSafe Compatible - Black',
    itemOption: '16009370',
    isRfidItem: true,
    image: '/images/items/CTF-C-CBU-252886G63PBLK.jpg'
  },
  {
    sku: 'CTF-C-CIM-252887G63PMBL',
    deviceType: 'iPhone 17 Pro',
    caseType: 'Impact Case',
    colour: 'Matte Black',
    description: 'iPhone 6.3 Pro (2025) RECASETiFY Impact Case MagSafe Compatible - Matte Black',
    itemOption: '16009387',
    isRfidItem: true,
    image: '/images/items/CTF-C-CIM-252887G63PMBL.jpg'
  },
  {
    sku: 'CTF-C-CIM-252887G63PBLK',
    deviceType: 'iPhone 17 Pro',
    caseType: 'Impact Case',
    colour: 'Black',
    description: 'iPhone 6.3 Pro (2025) RECASETiFY Impact Case MagSafe Compatible - Black',
    itemOption: '16009386',
    isRfidItem: true,
    image: '/images/items/CTF-C-CIM-252887G63PBLK.jpg'
  },
  {
    sku: 'CTF-C-CET-252895G63PBLK',
    deviceType: 'iPhone 17 Pro',
    caseType: 'Compact Case 2.0',
    colour: 'Black',
    description: 'iPhone 6.3 Pro (2025) Compact Case 2.0 MagSafe Compatible - Black',
    itemOption: '16009424',
    isRfidItem: true,
    image: '/images/items/CTF-C-CET-252895G63PBLK.jpg'
  },
  {
    sku: 'CTF-C-CET-252895G69BLK',
    deviceType: 'iPhone 17 Pro Max',
    caseType: 'Compact Case 2.0',
    colour: 'Black',
    description: 'iPhone 6.9 (2025) Compact Case 2.0 MagSafe Compatible - Black',
    itemOption: '16009425',
    isRfidItem: true,
    image: '/images/items/CTF-C-CET-252895G69BLK.jpg'
  },
  {
    sku: 'CTF-C-CMT-252891G63PBLK',
    deviceType: 'iPhone 17 Pro',
    caseType: 'Material Grip Case Bumper',
    colour: 'Black',
    description: 'iPhone 6.3 Pro (2025) RECASETiFY Material Grip Case Bumper MagSafe Compatible (with 3M sticker) - Black',
    itemOption: 'Multiple',
    isRfidItem: true,
    image: '/images/items/CTF-C-CMT-252891G63PBLK.jpg'
  },
  {
    sku: 'CTF-C-CWS-252900G63PPKX',
    deviceType: 'iPhone 17 Pro',
    caseType: 'The Ripple Case',
    colour: 'Primrose Pink',
    description: 'iPhone 6.3 Pro (2025) The Ripple Case MagSafe Compatible - Primrose Pink',
    itemOption: '16009774',
    isRfidItem: false,
    image: '/images/items/CTF-C-CWS-252900G63PPKX.jpg'
  },
  {
    sku: 'CTF-C-CWS-252900G63PBLK',
    deviceType: 'iPhone 17 Pro',
    caseType: 'The Ripple Case',
    colour: 'Black',
    description: 'iPhone 6.3 Pro (2025) The Ripple Case MagSafe Compatible - Black',
    itemOption: '16009452',
    isRfidItem: false,
    image: '/images/items/CTF-C-CWS-252900G63PBLK.jpg'
  },
  {
    sku: 'CTF-C-CWS-252900G63PWHX',
    deviceType: 'iPhone 17 Pro',
    caseType: 'The Ripple Case',
    colour: 'White',
    description: 'iPhone 6.3 Pro (2025) The Ripple Case MagSafe Compatible - White',
    itemOption: '16009451',
    isRfidItem: false,
    image: '/images/items/CTF-C-CWS-252900G63PWHX.jpg'
  },
  {
    sku: 'CTF-C-CWS-252900G63PCRE',
    deviceType: 'iPhone 17 Pro',
    caseType: 'The Ripple Case',
    colour: 'Oat',
    description: 'iPhone 6.3 Pro (2025) The Ripple Case MagSafe Compatible - Oat',
    itemOption: '16009453',
    isRfidItem: false,
    image: '/images/items/CTF-C-CWS-252900G63PCRE.jpg'
  },
  {
    sku: 'CTF-C-CIM-252887G69BLK',
    deviceType: 'iPhone 17 Pro Max',
    caseType: 'Impact Case',
    colour: 'Black',
    description: 'iPhone 6.9 (2025) RECASETiFY Impact Case MagSafe Compatible - Black',
    itemOption: '16009391',
    isRfidItem: true,
    image: '/images/items/CTF-C-CIM-252887G69BLK.jpg'
  },
  {
    sku: 'CTF-C-CIM-252887G63PPKX',
    deviceType: 'iPhone 17 Pro',
    caseType: 'Impact Case',
    colour: 'Pink',
    description: 'iPhone 6.3 Pro (2025) RECASETiFY Impact Case MagSafe Compatible - Pink',
    itemOption: '16009389',
    isRfidItem: true,
    image: '/images/items/CTF-C-CIM-252887G63PPKX.jpg'
  }
]

async function migrateCsvData() {
  try {
    console.log('Starting CSV data migration...')
    
    // Clear existing items first (optional - remove if you want to keep existing data)
    console.log('Clearing existing data...')
    
    // Clear related data first to avoid foreign key constraints
    await prisma.count.deleteMany({})
    await prisma.sessionItem.deleteMany({})
    await prisma.item.deleteMany({})
    
    // Insert new items
    console.log('Inserting new items...')
    for (const itemData of csvData) {
      try {
        const item = await prisma.item.create({
          data: {
            sku: itemData.sku,
            deviceType: itemData.deviceType,
            colour: itemData.colour,
            caseType: itemData.caseType,
            description: itemData.description,
            itemOption: itemData.itemOption,
            isRfidItem: itemData.isRfidItem,
            image: itemData.image
          }
        })
        console.log(`✅ Created item: ${item.sku}`)
      } catch (error) {
        console.error(`❌ Error creating item ${itemData.sku}:`, error)
      }
    }
    
    console.log('✅ CSV data migration completed successfully!')
    
    // Verify the migration
    const totalItems = await prisma.item.count()
    console.log(`📊 Total items in database: ${totalItems}`)
    
    // Show some sample items
    const sampleItems = await prisma.item.findMany({
      take: 5,
      select: {
        sku: true,
        deviceType: true,
        colour: true,
        caseType: true,
        isRfidItem: true
      }
    })
    
    console.log('📋 Sample items:')
    sampleItems.forEach(item => {
      console.log(`  - ${item.sku}: ${item.deviceType} ${item.caseType} (${item.colour}) ${item.isRfidItem ? '[RFID]' : '[Non-RFID]'}`)
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateCsvData()
