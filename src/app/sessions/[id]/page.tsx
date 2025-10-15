import Layout from '@/components/layout'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold gradient-text mb-2">
              <i className="bi bi-clipboard-check me-3"></i>
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
              Start Counting
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

        {/* Session Summary Card */}
        <div className="card card-enhanced">
          <div className="card-header bg-transparent border-0 pb-0">
            <h2 className="card-title h4 fw-bold mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Session Items Summary
            </h2>
          </div>
          
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-enhanced mb-0">
                <thead>
                  <tr>
                    <th className="border-0">SKU</th>
                    <th className="border-0">Device Type</th>
                    <th className="border-0">Colour</th>
                    <th className="border-0">Case Type</th>
                    <th className="border-0">Count Status</th>
                    <th className="border-0">Counts</th>
                  </tr>
                </thead>
                <tbody>
                  {session.items.map((sessionItem) => {
                    const counts = itemCounts[sessionItem.item.id] || []
                    const quantities = counts.map(c => c.quantity)
                    
                    return (
                      <tr key={sessionItem.id}>
                        <td className="fw-medium">{sessionItem.item.sku}</td>
                        <td>{sessionItem.item.deviceType}</td>
                        <td>{sessionItem.item.colour}</td>
                        <td>{sessionItem.item.caseType}</td>
                        <td>
                          {counts.length === 0 ? (
                            <span className="status-badge status-not-counted">
                              <i className="bi bi-x-circle me-1"></i>
                              Not Counted
                            </span>
                          ) : counts.length === 1 ? (
                            <span className="status-badge status-counting">
                              <i className="bi bi-1-circle me-1"></i>
                              Count 1 Complete
                            </span>
                          ) : counts.length === 2 ? (
                            quantities[0] === quantities[1] ? (
                              <span className="status-badge status-complete">
                                <i className="bi bi-check-circle me-1"></i>
                                Complete (2 counts match)
                              </span>
                            ) : (
                              <span className="status-badge status-counting">
                                <i className="bi bi-2-circle me-1"></i>
                                Count 2 Complete
                              </span>
                            )
                          ) : (
                            <span className="status-badge status-complete">
                              <i className="bi bi-check-circle-fill me-1"></i>
                              Complete (3 counts)
                            </span>
                          )}
                        </td>
                        <td>
                          {counts.length > 0 ? (
                            <div className="d-flex flex-column gap-1">
                              {counts.map((count) => (
                                <div key={count.id} className="badge bg-light text-dark">
                                  Count {count.countNumber}: {count.quantity}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted">No counts yet</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
