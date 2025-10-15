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

    console.log('API search for:', query)

    // Clean the query for better matching
    const cleanQuery = query.trim().toUpperCase()
    
    // Build multiple search conditions for better matching
    const searchConditions = [
      // Exact matches (highest priority)
      { sku: { equals: cleanQuery, mode: 'insensitive' } },
      { sku: { equals: query, mode: 'insensitive' } },
      
      // Contains matches
      { sku: { contains: cleanQuery, mode: 'insensitive' } },
      { sku: { contains: query, mode: 'insensitive' } },
      
      // Remove hyphens and search
      { sku: { contains: cleanQuery.replace(/-/g, ''), mode: 'insensitive' } },
      
      // Search by parts (for hyphenated SKUs)
      ...cleanQuery.split('-').map(part => ({
        sku: { contains: part, mode: 'insensitive' }
      })),
      
      // Other field searches
      { deviceType: { contains: cleanQuery, mode: 'insensitive' } },
      { deviceType: { contains: query, mode: 'insensitive' } },
      { colour: { contains: cleanQuery, mode: 'insensitive' } },
      { colour: { contains: query, mode: 'insensitive' } },
      { caseType: { contains: cleanQuery, mode: 'insensitive' } },
      { caseType: { contains: query, mode: 'insensitive' } },
      { description: { contains: cleanQuery, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } }
    ]

    // Remove duplicates from search conditions
    const uniqueConditions = searchConditions.filter((condition, index, self) => 
      index === self.findIndex(c => JSON.stringify(c) === JSON.stringify(condition))
    )

    console.log('Search conditions:', uniqueConditions.length)

    // Search items with enhanced conditions
    const items = await prisma.item.findMany({
      where: {
        OR: uniqueConditions
      },
      take: limit * 2, // Get more results to sort properly
      orderBy: {
        sku: 'asc'
      }
    })

    // Sort results by relevance
    const sortedItems = items.sort((a, b) => {
      const aSku = a.sku.toUpperCase()
      const bSku = b.sku.toUpperCase()
      
      // Exact match gets highest priority
      if (aSku === cleanQuery) return -1
      if (bSku === cleanQuery) return 1
      
      // Original query exact match
      if (aSku === query.toUpperCase()) return -1
      if (bSku === query.toUpperCase()) return 1
      
      // Contains match gets second priority
      if (aSku.includes(cleanQuery) && !bSku.includes(cleanQuery)) return -1
      if (bSku.includes(cleanQuery) && !aSku.includes(cleanQuery)) return 1
      
      // Starts with gets third priority
      if (aSku.startsWith(cleanQuery) && !bSku.startsWith(cleanQuery)) return -1
      if (bSku.startsWith(cleanQuery) && !aSku.startsWith(cleanQuery)) return 1
      
      // Alphabetical order for ties
      return aSku.localeCompare(bSku)
    }).slice(0, limit) // Limit the final results

    console.log('API search results:', sortedItems.length)

    return NextResponse.json({
      items: sortedItems,
      count: sortedItems.length,
      query,
      cleanQuery
    })

  } catch (error) {
    console.error('Error searching items:', error)
    return NextResponse.json(
      { error: 'Failed to search items', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
