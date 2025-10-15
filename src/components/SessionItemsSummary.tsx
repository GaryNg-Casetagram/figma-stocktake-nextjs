'use client'

import { useState } from 'react'

interface SessionItem {
  id: string
  sku: string
  deviceType: string
  colour: string
  caseType: string
  description?: string
  itemOption?: string
  isRfidItem?: boolean
  image?: string
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

                 {/* Filters and Controls - Responsive */}
                 <div className="d-flex flex-column flex-lg-row gap-2 mb-3">
                   <div className="btn-group flex-wrap" role="group">
                     <button
                       className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                       onClick={() => setFilterStatus('all')}
                     >
                       <span className="d-none d-sm-inline">All ({stats.total})</span>
                       <span className="d-inline d-sm-none">All</span>
                     </button>
                     <button
                       className={`btn btn-sm ${filterStatus === 'not-counted' ? 'btn-warning' : 'btn-outline-warning'}`}
                       onClick={() => setFilterStatus('not-counted')}
                     >
                       <span className="d-none d-sm-inline">Not Counted ({stats.notCounted})</span>
                       <span className="d-inline d-sm-none">Pending</span>
                     </button>
                     <button
                       className={`btn btn-sm ${filterStatus === 'counting' ? 'btn-info' : 'btn-outline-info'}`}
                       onClick={() => setFilterStatus('counting')}
                     >
                       <span className="d-none d-sm-inline">In Progress ({stats.counting})</span>
                       <span className="d-inline d-sm-none">Progress</span>
                     </button>
                     <button
                       className={`btn btn-sm ${filterStatus === 'complete' ? 'btn-success' : 'btn-outline-success'}`}
                       onClick={() => setFilterStatus('complete')}
                     >
                       <span className="d-none d-sm-inline">Complete ({stats.complete})</span>
                       <span className="d-inline d-sm-none">Done</span>
                     </button>
                   </div>
                   
                   <div className="btn-group flex-wrap" role="group">
                     <button
                       className={`btn btn-sm ${sortBy === 'sku' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                       onClick={() => setSortBy('sku')}
                     >
                       <i className="bi bi-sort-alpha-down me-1"></i>
                       <span className="d-none d-sm-inline">SKU</span>
                     </button>
                     <button
                       className={`btn btn-sm ${sortBy === 'status' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                       onClick={() => setSortBy('status')}
                     >
                       <i className="bi bi-sort-down me-1"></i>
                       <span className="d-none d-sm-inline">Status</span>
                     </button>
                     <button
                       className={`btn btn-sm ${sortBy === 'counts' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                       onClick={() => setSortBy('counts')}
                     >
                       <i className="bi bi-sort-numeric-down me-1"></i>
                       <span className="d-none d-sm-inline">Counts</span>
                     </button>
                   </div>
                 </div>
        </div>
      </div>

      {/* Items List */}
      <div className="card card-enhanced">
        <div className="card-header bg-transparent border-0">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Items ({filteredItems.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {filteredItems.map((item, index) => {
            const { label, variant } = getItemStatus(item)
            const progress = getItemProgress(item)
            const isExpanded = expandedItem === item.id

            return (
              <div 
                key={item.id} 
                className={`border-bottom ${index === filteredItems.length - 1 ? 'border-0' : ''}`}
              >
                <div 
                  className={`p-3 ${onItemClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onItemClick?.(item)}
                  style={{ cursor: onItemClick ? 'pointer' : 'default' }}
                >
                  <div className="row align-items-center">
                    {/* Item Info */}
                    <div className="col-12 col-md-4 col-lg-3 mb-2 mb-md-0">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          {/* Item Image */}
                          <div className="position-relative">
                            <div className={`bg-${variant} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`} 
                                 style={{ width: '40px', height: '40px' }}>
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.sku}
                                  className="rounded-circle"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                              ) : (
                                <i className={`bi bi-${variant === 'warning' ? 'clock' : variant === 'info' ? 'arrow-repeat' : 'check-circle'} text-${variant}`}></i>
                              )}
                            </div>
                            {/* RFID Indicator */}
                            {item.isRfidItem && (
                              <div className="position-absolute top-0 end-0">
                                <i className="bi bi-wifi text-primary" style={{ fontSize: '10px' }} title="RFID Item"></i>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">
                            {item.sku}
                            {item.isRfidItem && (
                              <i className="bi bi-wifi text-primary ms-1" style={{ fontSize: '12px' }} title="RFID Item"></i>
                            )}
                          </h6>
                          <small className="text-muted d-none d-md-block">
                            {item.deviceType} - {item.colour} - {item.caseType}
                          </small>
                          <small className="text-muted d-block d-md-none">
                            {item.deviceType} - {item.colour}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-6 col-md-2 col-lg-2 mb-2 mb-md-0">
                      <span className={`badge bg-${variant} w-100`}>{label}</span>
                    </div>

                    {/* Progress */}
                    <div className="col-6 col-md-3 col-lg-3 mb-2 mb-md-0">
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1 me-2">
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className={`progress-bar bg-${variant}`}
                              role="progressbar" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <small className="text-muted fw-medium">{progress}%</small>
                      </div>
                    </div>

                    {/* Counts */}
                    <div className="col-6 col-md-2 col-lg-2 mb-2 mb-md-0">
                      <div className="text-center">
                        <span className="fw-bold text-primary fs-5">{item.counts.length}</span>
                        <small className="text-muted d-block">/ 3 counts</small>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-6 col-md-1 col-lg-2 text-end mb-2 mb-md-0">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedItem(isExpanded ? null : item.id)
                        }}
                      >
                        <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-top">
                      <div className="row">
                        <div className="col-12">
                          {/* Item Details */}
                          <div className="mb-3">
                            <h6 className="fw-medium mb-2">Item Details</h6>
                            <div className="row g-2">
                              <div className="col-md-6">
                                <small className="text-muted">Description:</small>
                                <div className="small">{item.description || 'No description available'}</div>
                              </div>
                              <div className="col-md-3">
                                <small className="text-muted">Item Option:</small>
                                <div className="small">{item.itemOption || 'N/A'}</div>
                              </div>
                              <div className="col-md-3">
                                <small className="text-muted">Type:</small>
                                <div className="small">
                                  {item.isRfidItem ? (
                                    <span className="badge bg-primary">RFID Item</span>
                                  ) : (
                                    <span className="badge bg-secondary">Non-RFID</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <h6 className="fw-medium mb-3">Count Details</h6>
                          {item.counts.length > 0 ? (
                            <div className="row g-2">
                              {item.counts.map((count) => (
                                <div key={count.id} className="col-md-4">
                                  <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                                    <span className="small">
                                      <i className="bi bi-1-circle me-1"></i>
                                      Count {count.countNumber}
                                    </span>
                                    <span className="badge bg-primary">
                                      {count.quantity}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted py-3">
                              <i className="bi bi-dash-circle me-1"></i>
                              No counts recorded yet
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
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