import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.count.deleteMany()
  await prisma.sessionItem.deleteMany()
  await prisma.session.deleteMany()
  await prisma.item.deleteMany()
  await prisma.location.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Smith',
        access: 'admin',
        title: 'Warehouse Manager'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        access: 'manager',
        title: 'Operations Manager'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Mike Wilson',
        access: 'operator',
        title: 'Stock Controller'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Lisa Brown',
        access: 'operator',
        title: 'Inventory Specialist'
      }
    }),
    prisma.user.create({
      data: {
        name: 'David Lee',
        access: 'supervisor',
        title: 'Team Lead'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Emma Davis',
        access: 'operator',
        title: 'Stock Auditor'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Tom Anderson',
        access: 'manager',
        title: 'Department Head'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Rachel Green',
        access: 'operator',
        title: 'Inventory Clerk'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Chris Taylor',
        access: 'supervisor',
        title: 'Shift Supervisor'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Amy White',
        access: 'admin',
        title: 'System Administrator'
      }
    })
  ])

  // Create Locations
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Main Warehouse',
        locale: 'Building A, Floor 1'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Storage Room 1',
        locale: 'Building A, Floor 2'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Cold Storage',
        locale: 'Building B, Floor 1'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Electronics Section',
        locale: 'Building A, Floor 3'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Returns Area',
        locale: 'Building C, Floor 1'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Quality Control',
        locale: 'Building A, Floor 2'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Shipping Dock',
        locale: 'Building D, Floor 1'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Receiving Bay',
        locale: 'Building D, Floor 1'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Overflow Storage',
        locale: 'Building B, Floor 2'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Secure Vault',
        locale: 'Building A, Basement'
      }
    })
  ])

  // Create Items
  const items = await Promise.all([
    prisma.item.create({
      data: {
        sku: 'IPHONE15-128-BLK',
        deviceType: 'iPhone 15',
        colour: 'Black',
        caseType: 'Standard'
      }
    }),
    prisma.item.create({
      data: {
        sku: 'IPHONE15-256-WHT',
        deviceType: 'iPhone 15',
        colour: 'White',
        caseType: 'Standard'
      }
    }),
    prisma.item.create({
      data: {
        sku: 'IPHONE15-512-BLU',
        deviceType: 'iPhone 15',
        colour: 'Blue',
        caseType: 'Standard'
      }
    }),
    prisma.item.create({
      data: {
        sku: 'IPHONE14-128-PNK',
        deviceType: 'iPhone 14',
        colour: 'Pink',
        caseType: 'Standard'
      }
    }),
    prisma.item.create({
      data: {
        sku: 'IPHONE14-256-PRP',
        deviceType: 'iPhone 14',
        colour: 'Purple',
        caseType: 'Standard'
      }
    }),
    prisma.item.create({
      data: {
        sku: 'SAMSUNG-S24-128-GRY',
        deviceType: 'Samsung Galaxy S24',
        colour: 'Gray',
        caseType: 'Standard'
      }
    }),
    prisma.item.create({
      data: {
        sku: 'SAMSUNG-S24-256-BLK',
        deviceType: 'Samsung Galaxy S24',
        colour: 'Black',
        caseType: 'Standard'
      }
    }),
    prisma.item.create({
      data: {
        sku: 'GOOGLE-P8-128-WHT',
        deviceType: 'Google Pixel 8',
        colour: 'White',
        caseType: 'Standard'
      }
    }),
    prisma.item.create({
      data: {
        sku: 'ONEPLUS-12-256-GRN',
        deviceType: 'OnePlus 12',
        colour: 'Green',
        caseType: 'Standard'
      }
    }),
    prisma.item.create({
      data: {
        sku: 'XIAOMI-14-512-SLV',
        deviceType: 'Xiaomi 14',
        colour: 'Silver',
        caseType: 'Standard'
      }
    })
  ])

  // Create Sessions
  const sessions = await Promise.all([
    prisma.session.create({
      data: {
        name: 'Q1 2024 Stock Take',
        description: 'Quarterly inventory count for Q1 2024',
        locationId: locations[0].id
      }
    }),
    prisma.session.create({
      data: {
        name: 'Electronics Audit',
        description: 'Monthly electronics inventory audit',
        locationId: locations[3].id
      }
    }),
    prisma.session.create({
      data: {
        name: 'iPhone Stock Count',
        description: 'Weekly iPhone inventory count',
        locationId: locations[0].id
      }
    }),
    prisma.session.create({
      data: {
        name: 'Samsung Devices Check',
        description: 'Bi-weekly Samsung device inventory',
        locationId: locations[3].id
      }
    }),
    prisma.session.create({
      data: {
        name: 'End of Month Count',
        description: 'Monthly end-of-month inventory count',
        locationId: locations[1].id
      }
    }),
    prisma.session.create({
      data: {
        name: 'Returns Processing',
        description: 'Daily returns inventory count',
        locationId: locations[4].id
      }
    }),
    prisma.session.create({
      data: {
        name: 'Quality Control Check',
        description: 'Quality control inventory verification',
        locationId: locations[5].id
      }
    }),
    prisma.session.create({
      data: {
        name: 'Shipping Preparation',
        description: 'Pre-shipping inventory count',
        locationId: locations[6].id
      }
    }),
    prisma.session.create({
      data: {
        name: 'Receiving Verification',
        description: 'New stock receiving verification',
        locationId: locations[7].id
      }
    }),
    prisma.session.create({
      data: {
        name: 'Secure Vault Audit',
        description: 'High-value items vault audit',
        locationId: locations[9].id
      }
    })
  ])

  // Add items to sessions
  for (const session of sessions) {
    const sessionItems = items.slice(0, 5) // Add first 5 items to each session
    for (const item of sessionItems) {
      await prisma.sessionItem.create({
        data: {
          sessionId: session.id,
          itemId: item.id
        }
      })
    }
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
