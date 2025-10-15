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
        {/* Header - Responsive */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div className="mb-3 mb-md-0">
            <h1 className="display-6 fw-bold gradient-text mb-2">
              <i className="bi bi-clipboard-data me-2 me-md-3"></i>
              <span className="d-none d-sm-inline">Stock Take Sessions</span>
              <span className="d-inline d-sm-none">Sessions</span>
            </h1>
            <p className="text-muted lead d-none d-md-block">Manage and monitor your inventory counting sessions</p>
            <p className="text-muted d-block d-md-none">Manage your inventory sessions</p>
          </div>
          <Link href="/sessions/new" className="btn btn-gradient-primary btn-lg w-100 w-md-auto">
            <i className="bi bi-plus-circle me-2"></i>
            <span className="d-none d-sm-inline">Create New Session</span>
            <span className="d-inline d-sm-none">New Session</span>
          </Link>
        </div>

        {/* Sessions Grid - Responsive */}
        <div className="row g-3 g-md-4">
          {sessions.map((session) => (
            <div key={session.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="card card-enhanced h-100">
                <div className="card-header bg-transparent border-0 pb-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1 pe-2">
                      <h5 className="card-title fw-bold mb-1 fs-6">{session.name}</h5>
                      <p className="text-muted small mb-2 d-none d-sm-block">{session.description}</p>
                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center text-muted small">
                        <div className="d-flex align-items-center mb-1 mb-sm-0">
                          <i className="bi bi-geo-alt me-1"></i>
                          <span className="text-truncate">{session.location.name}</span>
                        </div>
                        <span className="d-none d-sm-inline mx-2">•</span>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-box me-1"></i>
                          <span>{session.items.length} items</span>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown">
                      <button className="btn btn-outline-secondary btn-sm" type="button" data-bs-toggle="dropdown">
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
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

                  {/* Status Badges - Responsive */}
                  <div className="d-flex flex-wrap gap-1 gap-sm-2 mb-3">
                    <span className="badge bg-success">Active</span>
                    <span className="badge bg-primary d-none d-sm-inline">Q1 2024</span>
                    <span className="badge bg-secondary d-none d-md-inline">Electronics</span>
                  </div>

                  {/* Action Buttons - Responsive */}
                  <div className="d-grid gap-2">
                    <Link
                      href={`/sessions/${session.id}`}
                      className="btn btn-gradient-success btn-sm"
                    >
                      <i className="bi bi-eye me-2"></i>
                      <span className="d-none d-sm-inline">View Summary</span>
                      <span className="d-inline d-sm-none">View</span>
                    </Link>
                    <Link
                      href={`/sessions/${session.id}/count`}
                      className="btn btn-gradient-primary btn-sm"
                    >
                      <i className="bi bi-play-circle me-2"></i>
                      <span className="d-none d-sm-inline">Start Counting</span>
                      <span className="d-inline d-sm-none">Start</span>
                    </Link>
                  </div>
                </div>

                <div className="card-footer bg-transparent border-0 pt-0">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center text-muted small">
                    <span className="mb-1 mb-sm-0">
                      <i className="bi bi-calendar me-1"></i>
                      <span className="d-none d-sm-inline">Created 2 days ago</span>
                      <span className="d-inline d-sm-none">2 days ago</span>
                    </span>
                    <span>
                      <i className="bi bi-person me-1"></i>
                      <span className="d-none d-sm-inline">John Smith</span>
                      <span className="d-inline d-sm-none">J. Smith</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State - Responsive */}
        {sessions.length === 0 && (
          <div className="text-center py-4 py-md-5">
            <div className="mb-3 mb-md-4">
              <i className="bi bi-clipboard-x" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
            </div>
            <h3 className="text-muted mb-2 mb-md-3 fs-4 fs-md-3">No Sessions Found</h3>
            <p className="text-muted mb-3 mb-md-4 px-3 px-md-0">
              <span className="d-none d-md-inline">Get started by creating your first stock take session</span>
              <span className="d-inline d-md-none">Create your first session</span>
            </p>
            <Link href="/sessions/new" className="btn btn-gradient-primary btn-lg w-100 w-md-auto">
              <i className="bi bi-plus-circle me-2"></i>
              <span className="d-none d-sm-inline">Create Your First Session</span>
              <span className="d-inline d-sm-none">Create Session</span>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}
