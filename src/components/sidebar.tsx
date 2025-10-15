'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: '🏠',
    description: 'Overview & Analytics'
  },
  {
    title: 'Sessions',
    href: '/sessions',
    icon: '📋',
    description: 'Manage Stock Takes'
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: '📦',
    description: 'Item Management'
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: '📊',
    description: 'Analytics & Reports'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: '⚙️',
    description: 'System Configuration'
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="sidebar-enhanced d-flex flex-column h-100" style={{ width: '280px' }}>
      {/* Header */}
      <div className="p-4 border-bottom border-secondary">
        <div className="d-flex align-items-center">
          <div className="me-3">
            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" 
                 style={{ width: '40px', height: '40px' }}>
              <span className="fs-4">📊</span>
            </div>
          </div>
          <div>
            <h4 className="mb-0 text-white fw-bold">StockTake</h4>
            <small className="text-light opacity-75">Pro System</small>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 p-3">
        <ul className="nav nav-pills flex-column">
          {sidebarItems.map((item) => (
            <li key={item.href} className="nav-item mb-2">
              <Link
                href={item.href}
                className={`nav-link nav-link-enhanced d-flex align-items-center p-3 ${
                  pathname === item.href ? 'active' : ''
                }`}
              >
                <span className="me-3 fs-5">{item.icon}</span>
                <div className="flex-grow-1">
                  <div className="fw-semibold">{item.title}</div>
                  <small className="opacity-75">{item.description}</small>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-top border-secondary">
        <div className="glass-effect rounded-3 p-3 text-center">
          <div className="d-flex align-items-center justify-content-center mb-2">
            <div className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
            <small className="text-white">System Online</small>
          </div>
          <small className="text-light opacity-75">v2.0.1</small>
        </div>
      </div>
    </div>
  )
}
