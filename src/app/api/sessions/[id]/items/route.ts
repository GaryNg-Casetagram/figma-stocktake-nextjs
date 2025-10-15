import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, itemSku } = await request.json()

    // Validate required fields
    if (!sessionId || !itemSku) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId and itemSku are required' },
        { status: 400 }
      )
    }

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Find item by SKU
    const item = await prisma.item.findUnique({
      where: { sku: itemSku }
    })

    if (!item) {
      return NextResponse.json(
        { error: `Item with SKU "${itemSku}" not found` },
        { status: 404 }
      )
    }

    // Check if item is already in session
    const existingSessionItem = await prisma.sessionItem.findUnique({
      where: {
        sessionId_itemId: {
          sessionId: sessionId,
          itemId: item.id
        }
      }
    })

    if (existingSessionItem) {
      return NextResponse.json(
        { error: `Item "${itemSku}" is already in this session` },
        { status: 409 }
      )
    }

    // Add item to session
    const sessionItem = await prisma.sessionItem.create({
      data: {
        sessionId: sessionId,
        itemId: item.id,
      },
      include: {
        item: true
      }
    })

    return NextResponse.json({
      message: `Item "${itemSku}" added to session successfully`,
      sessionItem
    })

  } catch (error) {
    console.error('Error adding item to session:', error)
    return NextResponse.json(
      { error: 'Failed to add item to session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { sessionId, itemSku } = await request.json()

    // Validate required fields
    if (!sessionId || !itemSku) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId and itemSku are required' },
        { status: 400 }
      )
    }

    // Find item by SKU
    const item = await prisma.item.findUnique({
      where: { sku: itemSku }
    })

    if (!item) {
      return NextResponse.json(
        { error: `Item with SKU "${itemSku}" not found` },
        { status: 404 }
      )
    }

    // Remove item from session
    const deletedSessionItem = await prisma.sessionItem.deleteMany({
      where: {
        sessionId: sessionId,
        itemId: item.id
      }
    })

    if (deletedSessionItem.count === 0) {
      return NextResponse.json(
        { error: `Item "${itemSku}" is not in this session` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: `Item "${itemSku}" removed from session successfully`
    })

  } catch (error) {
    console.error('Error removing item from session:', error)
    return NextResponse.json(
      { error: 'Failed to remove item from session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
