import Layout from '@/components/layout'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getSessions() {
  return await prisma.session.findMany({
    include: {
      location: true,
      items: {
        include: {
          item: true
        }
      }
    }
  })
}

export default async function SessionsPage() {
  const sessions = await getSessions()

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold gradient-text mb-2">
              <i className="bi bi-clipboard-data me-3"></i>
              Stock Take Sessions
            </h1>
            <p className="text-muted lead">Manage and monitor your inventory counting sessions</p>
          </div>
          <Link href="/sessions/new" className="btn btn-gradient-primary btn-lg">
            <i className="bi bi-plus-circle me-2"></i>
            Create New Session
          </Link>
        </div>

        {/* Sessions Grid */}
        <div className="row g-4">
          {sessions.map((session) => (
            <div key={session.id} className="col-lg-6 col-xl-4">
              <div className="card card-enhanced h-100">
                <div className="card-header bg-transparent border-0 pb-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h5 className="card-title fw-bold mb-1">{session.name}</h5>
                      <p className="text-muted small mb-2">{session.description}</p>
                      <div className="d-flex align-items-center text-muted small">
                        <i className="bi bi-geo-alt me-1"></i>
                        <span>{session.location.name}</span>
                        <span className="mx-2">•</span>
                        <i className="bi bi-box me-1"></i>
                        <span>{session.items.length} items</span>
                      </div>
                    </div>
                    <div className="dropdown">
                      <button className="btn btn-outline-secondary btn-sm" type="button" data-bs-toggle="dropdown">
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li><a className="dropdown-item" href="#"><i className="bi bi-eye me-2"></i>View Details</a></li>
                        <li><a className="dropdown-item" href="#"><i className="bi bi-pencil me-2"></i>Edit</a></li>
                        <li><hr className="dropdown-divider"/></li>
                        <li><a className="dropdown-item text-danger" href="#"><i className="bi bi-trash me-2"></i>Delete</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="card-body pt-3">
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Progress</small>
                      <small className="text-muted">75%</small>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div className="progress-bar bg-gradient" role="progressbar" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-success">Active</span>
                    <span className="badge bg-primary">Q1 2024</span>
                    <span className="badge bg-secondary">Electronics</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-grid gap-2">
                    <Link
                      href={`/sessions/${session.id}`}
                      className="btn btn-gradient-success"
                    >
                      <i className="bi bi-eye me-2"></i>
                      View Summary
                    </Link>
                    <Link
                      href={`/sessions/${session.id}/count`}
                      className="btn btn-gradient-primary"
                    >
                      <i className="bi bi-play-circle me-2"></i>
                      Start Counting
                    </Link>
                  </div>
                </div>

                <div className="card-footer bg-transparent border-0 pt-0">
                  <div className="d-flex justify-content-between align-items-center text-muted small">
                    <span>
                      <i className="bi bi-calendar me-1"></i>
                      Created 2 days ago
                    </span>
                    <span>
                      <i className="bi bi-person me-1"></i>
                      John Smith
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="bi bi-clipboard-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
            </div>
            <h3 className="text-muted mb-3">No Sessions Found</h3>
            <p className="text-muted mb-4">Get started by creating your first stock take session</p>
            <Link href="/sessions/new" className="btn btn-gradient-primary btn-lg">
              <i className="bi bi-plus-circle me-2"></i>
              Create Your First Session
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}
