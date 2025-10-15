import Layout from '@/components/layout'
import Link from 'next/link'

export default function NotFound() {
  return (
    <Layout>
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="mb-4">
            <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
          </div>
          <h1 className="display-6 fw-bold text-warning mb-3">404 - Page Not Found</h1>
          <p className="text-muted mb-4">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <div className="d-flex gap-2 justify-content-center">
            <Link href="/" className="btn btn-gradient-primary btn-lg">
              <i className="bi bi-house me-2"></i>
              Go Home
            </Link>
            <Link href="/sessions" className="btn btn-outline-secondary btn-lg">
              <i className="bi bi-clipboard-data me-2"></i>
              View Sessions
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
