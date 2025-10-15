'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/layout'
import Link from 'next/link'
import ReceivingVerification from '@/components/ReceivingVerification'
import SessionItemsSummary from '@/components/SessionItemsSummary'

interface Session {
  id: string
  name: string
  description: string
  location: {
    id: string
    name: string
    locale: string
  }
  items: Array<{
    id: string
    item: {
      id: string
      sku: string
      deviceType: string
      colour: string
      caseType: string
    }
  }>
  counts: Array<{
    id: string
    itemId: string
    quantity: number
    countNumber: number
    createdAt: string
  }>
}

export default function SessionSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  useEffect(() => {
    const getSessionId = async () => {
      try {
        const resolvedParams = await params
        console.log('Resolved params:', resolvedParams)
        setId(resolvedParams.id)
      } catch (error) {
        console.error('Error resolving params:', error)
        setError('Failed to load session ID')
        setLoading(false)
      }
    }
    getSessionId()
  }, [params])

  useEffect(() => {
    if (!id) return

    const fetchSession = async () => {
      try {
        console.log('Fetching session for ID:', id)
        const response = await fetch(`/api/sessions/${id}`)
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Session data:', data)
          setSession(data)
        } else {
          setError('Session not found')
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        setError('Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [id])

  if (loading) {
    return (
      <Layout>
        <div className="container-fluid py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading session...</p>
            {id && <p className="text-muted small">Session ID: {id}</p>}
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container-fluid py-5">
          <div className="text-center">
            <div className="mb-4">
              <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
            </div>
            <h1 className="display-6 fw-bold text-danger mb-3">Error</h1>
            <p className="text-muted mb-4">{error}</p>
            <Link href="/sessions" className="btn btn-gradient-primary btn-lg">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Sessions
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

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
      createdAt: count.createdAt
    }))
  }))

  // Check if this is a Receiving Verification session
  const isReceivingVerification = session.name.toLowerCase().includes('receiving')

  const handleItemVerified = (itemId: string, quantity: number, notes?: string) => {
    console.log('Item verified:', { itemId, quantity, notes })
    // TODO: Implement API call to update item verification
  }

  const handleItemClick = (item: { id: string; sku: string; deviceType: string; colour: string; caseType: string; counts: Array<{ id: string; quantity: number; countNumber: number; createdAt: string }> }) => {
    console.log('Item clicked:', item)
    // TODO: Implement item click functionality
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleSearchItems = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(`/api/items/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.items)
      } else {
        showNotification('error', 'Failed to search items')
      }
    } catch (error) {
      console.error('Search error:', error)
      showNotification('error', 'Failed to search items')
    } finally {
      setSearching(false)
    }
  }

  const handleAddItemToSession = async (itemSku: string) => {
    try {
      const response = await fetch(`/api/sessions/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, itemSku })
      })

      if (response.ok) {
        showNotification('success', `Item "${itemSku}" added to session successfully`)
        // Refresh session data
        const sessionResponse = await fetch(`/api/sessions/${id}`)
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json()
          setSession(sessionData)
        }
        setShowAddItemModal(false)
        setSearchQuery('')
        setSearchResults([])
      } else {
        const errorData = await response.json()
        showNotification('error', errorData.error || 'Failed to add item to session')
      }
    } catch (error) {
      console.error('Add item error:', error)
      showNotification('error', 'Failed to add item to session')
    }
  }

  return (
    <Layout>
      {/* Notification */}
      {notification && (
        <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`} 
             style={{ top: '20px', right: '20px', zIndex: 9999, minWidth: '300px' }}>
          <div className="d-flex align-items-center">
            <i className={`bi ${notification.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
            <span>{notification.message}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setNotification(null)}></button>
        </div>
      )}

      <div className="animate-fade-in">
               {/* Header - Responsive */}
               <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4">
                 <div className="mb-3 mb-lg-0 flex-grow-1">
                   <h1 className="display-6 fw-bold gradient-text mb-2">
                     <i className={`bi ${isReceivingVerification ? 'bi-truck' : 'bi-clipboard-check'} me-2 me-lg-3`}></i>
                     <span className="d-none d-sm-inline">{session.name}</span>
                     <span className="d-inline d-sm-none text-truncate">{session.name}</span>
                   </h1>
                   <p className="text-muted lead mb-2 d-none d-md-block">{session.description}</p>
                   <p className="text-muted mb-2 d-block d-md-none">{session.description}</p>
                   <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center text-muted">
                     <div className="d-flex align-items-center mb-1 mb-sm-0">
                       <i className="bi bi-geo-alt me-2"></i>
                       <span className="text-truncate">{session.location.name} - {session.location.locale}</span>
                     </div>
                     <span className="d-none d-sm-inline mx-3">•</span>
                     <div className="d-flex align-items-center">
                       <i className="bi bi-box me-2"></i>
                       <span>{session.items.length} items</span>
                     </div>
                   </div>
                 </div>
                 <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-lg-auto">
                   <button
                     className="btn btn-gradient-primary btn-lg order-1"
                     onClick={() => setShowAddItemModal(true)}
                   >
                     <i className="bi bi-plus-circle me-2"></i>
                     <span className="d-none d-sm-inline">Add Items</span>
                     <span className="d-inline d-sm-none">Add</span>
                   </button>
                   <Link
                     href={`/sessions/${session.id}/count`}
                     className="btn btn-gradient-success btn-lg order-2"
                     style={{ opacity: session.items.length === 0 ? 0.5 : 1 }}
                   >
                     <i className="bi bi-play-circle me-2"></i>
                     <span className="d-none d-sm-inline">{isReceivingVerification ? 'Start Verification' : 'Start Counting'}</span>
                     <span className="d-inline d-sm-none">{isReceivingVerification ? 'Start Verify' : 'Start Count'}</span>
                   </Link>
                   <Link
                     href="/sessions"
                     className="btn btn-outline-secondary btn-lg order-3"
                   >
                     <i className="bi bi-arrow-left me-2"></i>
                     <span className="d-none d-sm-inline">Back to Sessions</span>
                     <span className="d-inline d-sm-none">Back</span>
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
              onItemVerified={handleItemVerified}
            />
          </div>
        )}

        {/* Empty State */}
        {session.items.length === 0 && (
          <div className="card card-enhanced">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
              <h3 className="text-muted mt-3 mb-3">No Items in Session</h3>
              <p className="text-muted mb-4">
                This session is empty. Add items by scanning barcodes or searching for products.
              </p>
              <button
                className="btn btn-gradient-primary btn-lg"
                onClick={() => setShowAddItemModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Items to Session
              </button>
            </div>
          </div>
        )}

        {/* Session Items Summary */}
        {session.items.length > 0 && (
          <SessionItemsSummary
            items={sessionItems}
            onItemClick={handleItemClick}
          />
        )}

        {/* Add Item Modal */}
        {showAddItemModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Items to Session
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowAddItemModal(false)
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-4">
                    <label htmlFor="searchInput" className="form-label fw-medium">
                      Search Items by SKU, Device Type, Color, or Case Type
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        id="searchInput"
                        className="form-control form-control-lg"
                        placeholder="Enter SKU or search term..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          handleSearchItems(e.target.value)
                        }}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => handleSearchItems(searchQuery)}
                      >
                        <i className="bi bi-search"></i>
                      </button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {searching && (
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Searching...</span>
                      </div>
                      <p className="mt-2 text-muted">Searching items...</p>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-medium mb-3">Search Results ({searchResults.length})</h6>
                      <div className="row g-3">
                        {searchResults.map((item) => (
                          <div key={item.id} className="col-md-6">
                            <div className="card h-100">
                              <div className="card-body">
                                <div className="d-flex align-items-start">
                                  <div className="me-3">
                                    {item.image ? (
                                      <img 
                                        src={item.image} 
                                        alt={item.sku}
                                        className="rounded"
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <div className="bg-light rounded d-flex align-items-center justify-content-center" 
                                           style={{ width: '50px', height: '50px' }}>
                                        <i className="bi bi-box text-muted"></i>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow-1">
                                    <h6 className="fw-bold mb-1">{item.sku}</h6>
                                    <p className="text-muted small mb-2">
                                      {item.deviceType} - {item.colour} - {item.caseType}
                                    </p>
                                    {item.isRfidItem && (
                                      <span className="badge bg-primary small">RFID</span>
                                    )}
                                  </div>
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleAddItemToSession(item.sku)}
                                  >
                                    <i className="bi bi-plus"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchQuery && !searching && searchResults.length === 0 && (
                    <div className="text-center py-4">
                      <i className="bi bi-search text-muted" style={{ fontSize: '2rem' }}></i>
                      <p className="text-muted mt-2">No items found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddItemModal(false)
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
