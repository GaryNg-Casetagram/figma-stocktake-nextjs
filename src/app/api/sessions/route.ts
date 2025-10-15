import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, description, locationId } = await request.json()

    // Validate required fields
    if (!name || !description || !locationId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, and locationId are required' },
        { status: 400 }
      )
    }

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    })

    if (!location) {
      return NextResponse.json(
        { error: 'Invalid location ID' },
        { status: 400 }
      )
    }

    // Create the session
    const session = await prisma.session.create({
      data: {
        name,
        description,
        locationId,
      },
      include: {
        location: true
      }
    })

    // Add some default items to the session (first 5 items)
    const items = await prisma.item.findMany({
      take: 5,
    })

    for (const item of items) {
      await prisma.sessionItem.create({
        data: {
          sessionId: session.id,
          itemId: item.id,
        },
      })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
