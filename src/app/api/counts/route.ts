import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, itemId, quantity, countNumber } = await request.json()

    // Check if this item already has 3 counts
    const existingCounts = await prisma.count.findMany({
      where: {
        sessionId,
        itemId,
      }
    })

    if (existingCounts.length >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 counts allowed per item' },
        { status: 400 }
      )
    }

    // Check if this count number already exists for this item
    const existingCount = await prisma.count.findFirst({
      where: {
        sessionId,
        itemId,
        countNumber,
      }
    })

    if (existingCount) {
      return NextResponse.json(
        { error: 'Count number already exists for this item' },
        { status: 400 }
      )
    }

    const count = await prisma.count.create({
      data: {
        sessionId,
        itemId,
        quantity,
        countNumber,
      },
    })

    return NextResponse.json(count)
  } catch (error) {
    console.error('Error creating count:', error)
    return NextResponse.json(
      { error: 'Failed to create count' },
      { status: 500 }
    )
  }
}
