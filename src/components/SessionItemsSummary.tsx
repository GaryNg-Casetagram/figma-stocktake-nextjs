'use client'

import { useState } from 'react'

interface SessionItem {
  id: string
  sku: string
  deviceType: string
  colour: string
  caseType: string
  counts: Array<{
    id: string
    quantity: number
    countNumber: number
    createdAt: string
  }>
}

interface SessionItemsSummaryProps {
  items: SessionItem[]
  onItemClick?: (item: SessionItem) => void
}

export default function SessionItemsSummary({ items, onItemClick }: SessionItemsSummaryProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'not-counted' | 'counting' | 'complete'>('all')
  const [sortBy, setSortBy] = useState<'sku' | 'status' | 'counts'>('sku')

  // Calculate item status and statistics
  const getItemStatus = (item: SessionItem) => {
    const counts = item.counts
    if (counts.length === 0) return { status: 'not-counted', label: 'Not Counted', variant: 'warning' }
    if (counts.length === 1) return { status: 'counting', label: 'Count 1 Complete', variant: 'info' }
    if (counts.length === 2) {
      const match = counts[0].quantity === counts[1].quantity
      return { 
        status: match ? 'complete' : 'counting', 
        label: match ? 'Complete (2 counts match)' : 'Count 2 Complete', 
        variant: match ? 'success' : 'info' 
      }
    }
    return { status: 'complete', label: 'Complete (3 counts)', variant: 'success' }
  }

  const getItemProgress = (item: SessionItem) => {
    const counts = item.counts
    if (counts.length === 0) return 0
    if (counts.length === 1) return 33
    if (counts.length === 2) return 67
    return 100
  }

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      const { status } = getItemStatus(item)
      return filterStatus === 'all' || status === filterStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'sku':
          return a.sku.localeCompare(b.sku)
        case 'status':
          const statusA = getItemStatus(a).status
          const statusB = getItemStatus(b).status
          return statusA.localeCompare(statusB)
        case 'counts':
          return b.counts.length - a.counts.length
        default:
          return 0
      }
    })

  // Calculate overall statistics
  const stats = {
    total: items.length,
    notCounted: items.filter(item => getItemStatus(item).status === 'not-counted').length,
    counting: items.filter(item => getItemStatus(item).status === 'counting').length,
    complete: items.filter(item => getItemStatus(item).status === 'complete').length
  }

  const overallProgress = (stats.complete / stats.total) * 100

  return (
    <div className="session-items-summary">
      {/* Summary Header */}
      <div className="card card-enhanced mb-4">
        <div className="card-header bg-transparent border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Session Items Summary
            </h4>
            <span className="badge bg-primary fs-6">
              {stats.total} Items
            </span>
          </div>
        </div>
        <div className="card-body">
          {/* Overall Progress */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Overall Progress</span>
              <span className="fw-medium">{Math.round(overallProgress)}%</span>
            </div>
            <div className="progress mb-3" style={{ height: '10px' }}>
              <div 
                className={`progress-bar ${overallProgress === 100 ? 'bg-success' : 'bg-primary'}`}
                role="progressbar" 
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded-3">
                <i className="bi bi-clock text-warning fs-2"></i>
                <div className="fw-bold text-warning fs-4">{stats.notCounted}</div>
                <div className="text-muted small">Not Counted</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded-3">
                <i className="bi bi-arrow-repeat text-info fs-2"></i>
                <div className="fw-bold text-info fs-4">{stats.counting}</div>
                <div className="text-muted small">In Progress</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded-3">
                <i className="bi bi-check-circle text-success fs-2"></i>
                <div className="fw-bold text-success fs-4">{stats.complete}</div>
                <div className="text-muted small">Complete</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded-3">
                <i className="bi bi-percent text-primary fs-2"></i>
                <div className="fw-bold text-primary fs-4">{Math.round(overallProgress)}%</div>
                <div className="text-muted small">Complete</div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <div className="btn-group" role="group">
              <button
                className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilterStatus('all')}
              >
                All ({stats.total})
              </button>
              <button
                className={`btn btn-sm ${filterStatus === 'not-counted' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setFilterStatus('not-counted')}
              >
                Not Counted ({stats.notCounted})
              </button>
              <button
                className={`btn btn-sm ${filterStatus === 'counting' ? 'btn-info' : 'btn-outline-info'}`}
                onClick={() => setFilterStatus('counting')}
              >
                In Progress ({stats.counting})
              </button>
              <button
                className={`btn btn-sm ${filterStatus === 'complete' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setFilterStatus('complete')}
              >
                Complete ({stats.complete})
              </button>
            </div>
            
            <div className="btn-group ms-auto" role="group">
              <button
                className={`btn btn-sm ${sortBy === 'sku' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => setSortBy('sku')}
              >
                <i className="bi bi-sort-alpha-down me-1"></i>
                SKU
              </button>
              <button
                className={`btn btn-sm ${sortBy === 'status' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => setSortBy('status')}
              >
                <i className="bi bi-sort-down me-1"></i>
                Status
              </button>
              <button
                className={`btn btn-sm ${sortBy === 'counts' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={() => setSortBy('counts')}
              >
                <i className="bi bi-sort-numeric-down me-1"></i>
                Counts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="row g-3">
        {filteredItems.map((item) => {
          const { label, variant } = getItemStatus(item)
          const progress = getItemProgress(item)
          const isExpanded = expandedItem === item.id

          return (
            <div key={item.id} className="col-lg-6 col-xl-4">
              <div 
                className={`card card-enhanced h-100 ${onItemClick ? 'cursor-pointer' : ''}`}
                onClick={() => onItemClick?.(item)}
                style={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold mb-0">{item.sku}</h6>
                    <span className={`badge bg-${variant}`}>{label}</span>
                  </div>
                  
                  <p className="text-muted small mb-3">
                    {item.deviceType} - {item.colour} - {item.caseType}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">Progress</small>
                      <small className="text-muted">{progress}%</small>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className={`progress-bar bg-${variant}`}
                        role="progressbar" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Count Summary */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Counts:</span>
                    <span className="fw-medium">{item.counts.length}/3</span>
                  </div>

                  {/* Expandable Count Details */}
                  <button
                    className="btn btn-outline-secondary btn-sm w-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedItem(isExpanded ? null : item.id)
                    }}
                  >
                    <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`}></i>
                    {isExpanded ? 'Hide' : 'Show'} Details
                  </button>

                  {isExpanded && (
                    <div className="mt-3">
                      {item.counts.length > 0 ? (
                        <div className="d-grid gap-2">
                          {item.counts.map((count) => (
                            <div key={count.id} className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                              <span className="small">
                                <i className="bi bi-1-circle me-1"></i>
                                Count {count.countNumber}
                              </span>
                              <span className="badge bg-light text-dark">
                                {count.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted py-2">
                          <i className="bi bi-dash-circle me-1"></i>
                          No counts yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="card card-enhanced">
          <div className="card-body text-center py-5">
            <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
            <h5 className="text-muted mt-3">No items found</h5>
            <p className="text-muted mb-0">
              Try adjusting your filters to see more items.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}