import Layout from '@/components/layout'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ReceivingVerification from '@/components/ReceivingVerification'
import SessionItemsSummary from '@/components/SessionItemsSummary'

async function getSession(id: string) {
  return await prisma.session.findUnique({
    where: { id },
    include: {
      location: true,
      items: {
        include: {
          item: true
        }
      },
      counts: {
        include: {
          session: true
        }
      }
    }
  })
}

export default async function SessionSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession(id)

  if (!session) {
    return (
      <Layout>
        <div className="container-fluid py-5">
          <div className="text-center">
            <div className="mb-4">
              <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
            </div>
            <h1 className="display-6 fw-bold text-danger mb-3">Session Not Found</h1>
            <p className="text-muted mb-4">The session you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href="/sessions" className="btn btn-gradient-primary btn-lg">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Sessions
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  // Group counts by item
  const itemCounts = session.counts.reduce((acc, count) => {
    if (!acc[count.itemId]) {
      acc[count.itemId] = []
    }
    acc[count.itemId].push(count)
    return acc
  }, {} as Record<string, typeof session.counts>)

  // Transform items for the new components
  const sessionItems = session.items.map(sessionItem => ({
    id: sessionItem.item.id,
    sku: sessionItem.item.sku,
    deviceType: sessionItem.item.deviceType,
    colour: sessionItem.item.colour,
    caseType: sessionItem.item.caseType,
    counts: (itemCounts[sessionItem.item.id] || []).map(count => ({
      id: count.id,
      quantity: count.quantity,
      countNumber: count.countNumber,
      createdAt: count.createdAt?.toISOString() || new Date().toISOString()
    }))
  }))

  // Check if this is a Receiving Verification session
  const isReceivingVerification = session.name.toLowerCase().includes('receiving')

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold gradient-text mb-2">
              <i className={`bi ${isReceivingVerification ? 'bi-truck' : 'bi-clipboard-check'} me-3`}></i>
              {session.name}
            </h1>
            <p className="text-muted lead mb-2">{session.description}</p>
            <div className="d-flex align-items-center text-muted">
              <i className="bi bi-geo-alt me-2"></i>
              <span>{session.location.name} - {session.location.locale}</span>
              <span className="mx-3">•</span>
              <i className="bi bi-box me-2"></i>
              <span>{session.items.length} items</span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link
              href={`/sessions/${session.id}/count`}
              className="btn btn-gradient-success btn-lg"
            >
              <i className="bi bi-play-circle me-2"></i>
              {isReceivingVerification ? 'Start Verification' : 'Start Counting'}
            </Link>
            <Link
              href="/sessions"
              className="btn btn-outline-secondary btn-lg"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Sessions
            </Link>
          </div>
        </div>

        {/* Receiving Verification Section */}
        {isReceivingVerification && (
          <div className="mb-5">
            <ReceivingVerification
              items={sessionItems.map(item => ({
                id: item.id,
                sku: item.sku,
                deviceType: item.deviceType,
                colour: item.colour,
                caseType: item.caseType,
                expectedQuantity: 1, // This would come from purchase orders in a real system
                receivedQuantity: item.counts.length > 0 ? item.counts[0].quantity : 0,
                status: item.counts.length === 0 ? 'pending' : 
                       item.counts.length === 1 ? 'verified' : 'discrepancy',
                notes: ''
              }))}
              onItemVerified={(itemId, quantity, notes) => {
                // This would make an API call to update the item verification
                console.log('Item verified:', { itemId, quantity, notes })
              }}
            />
          </div>
        )}

        {/* Session Items Summary */}
        <SessionItemsSummary
          items={sessionItems}
          onItemClick={(item) => {
            // This could open a detailed view or start counting for that specific item
            console.log('Item clicked:', item)
          }}
        />
      </div>
    </Layout>
  )
}
