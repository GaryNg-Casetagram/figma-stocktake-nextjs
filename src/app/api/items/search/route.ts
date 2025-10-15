import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    // Search items by SKU, device type, color, or case type
    const items = await prisma.item.findMany({
      where: {
        OR: [
          { sku: { contains: query, mode: 'insensitive' } },
          { deviceType: { contains: query, mode: 'insensitive' } },
          { colour: { contains: query, mode: 'insensitive' } },
          { caseType: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: {
        sku: 'asc'
      }
    })

    return NextResponse.json({
      items,
      count: items.length,
      query
    })

  } catch (error) {
    console.error('Error searching items:', error)
    return NextResponse.json(
      { error: 'Failed to search items', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
