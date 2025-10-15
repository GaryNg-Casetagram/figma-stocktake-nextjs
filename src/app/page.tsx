import Layout from '@/components/layout'

export default function Home() {
  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Hero Section */}
        <div className="hero-section text-center mb-5">
          <div className="container">
            <h1 className="display-4 fw-bold mb-3">
              Welcome to StockTake Pro
            </h1>
            <p className="lead mb-4">
              Advanced inventory management and stock counting solution for modern businesses
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-gradient-primary btn-lg px-4">
                <i className="bi bi-play-circle me-2"></i>
                Get Started
              </button>
              <button className="btn btn-outline-light btn-lg px-4">
                <i className="bi bi-info-circle me-2"></i>
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card card-enhanced text-center h-100">
              <div className="card-body">
                <div className="text-primary mb-3">
                  <i className="bi bi-graph-up" style={{ fontSize: '2rem' }}></i>
                </div>
                <h5 className="card-title">Active Sessions</h5>
                <h2 className="text-primary fw-bold">12</h2>
                <small className="text-muted">Currently running</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card card-enhanced text-center h-100">
              <div className="card-body">
                <div className="text-success mb-3">
                  <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
                </div>
                <h5 className="card-title">Items Counted</h5>
                <h2 className="text-success fw-bold">1,247</h2>
                <small className="text-muted">This month</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card card-enhanced text-center h-100">
              <div className="card-body">
                <div className="text-warning mb-3">
                  <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
                </div>
                <h5 className="card-title">Discrepancies</h5>
                <h2 className="text-warning fw-bold">23</h2>
                <small className="text-muted">Require attention</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card card-enhanced text-center h-100">
              <div className="card-body">
                <div className="text-info mb-3">
                  <i className="bi bi-speedometer2" style={{ fontSize: '2rem' }}></i>
                </div>
                <h5 className="card-title">Efficiency</h5>
                <h2 className="text-info fw-bold">94%</h2>
                <small className="text-muted">Accuracy rate</small>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card card-enhanced">
              <div className="card-header bg-transparent border-0 pb-0">
                <h3 className="card-title gradient-text mb-0">
                  <i className="bi bi-rocket-takeoff me-2"></i>
                  Quick Start Guide
                </h3>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '40px', height: '40px' }}>
                        <span className="fw-bold">1</span>
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">Create Session</h6>
                        <p className="text-muted small mb-0">Set up a new stock take session with location and items.</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start">
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '40px', height: '40px' }}>
                        <span className="fw-bold">2</span>
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">Start Counting</h6>
                        <p className="text-muted small mb-0">Use barcode scanning or manual search to count items.</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start">
                      <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '40px', height: '40px' }}>
                        <span className="fw-bold">3</span>
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">Review Results</h6>
                        <p className="text-muted small mb-0">Analyze discrepancies and generate reports.</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-start">
                      <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '40px', height: '40px' }}>
                        <span className="fw-bold">4</span>
                      </div>
                      <div>
                        <h6 className="fw-semibold mb-1">Export Data</h6>
                        <p className="text-muted small mb-0">Download reports and update your inventory system.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card card-enhanced">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title mb-0">
                  <i className="bi bi-lightning-charge text-warning me-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-gradient-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    New Session
                  </button>
                  <button className="btn btn-gradient-secondary">
                    <i className="bi bi-search me-2"></i>
                    Find Items
                  </button>
                  <button className="btn btn-gradient-success">
                    <i className="bi bi-file-earmark-bar-graph me-2"></i>
                    View Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
