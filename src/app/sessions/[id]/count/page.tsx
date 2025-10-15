'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/layout'
import Link from 'next/link'
import BarcodeScanner from '@/components/BarcodeScanner'

interface Item {
  id: string
  sku: string
  deviceType: string
  colour: string
  caseType: string
}

interface Session {
  id: string
  name: string
  description: string
  location: {
    name: string
    locale: string
  }
  items: {
    id: string
    item: Item
  }[]
  counts: {
    id: string
    itemId: string
    quantity: number
    countNumber: number
  }[]
}

export default function CountPage({ params }: { params: Promise<{ id: string }> }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [quantity, setQuantity] = useState('')
  const [scanMode, setScanMode] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [autoSelectedSku, setAutoSelectedSku] = useState<string | null>(null)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([])
  const [searchingGlobal, setSearchingGlobal] = useState(false)

  const fetchSession = useCallback(async () => {
    try {
      const { id } = await params
      const response = await fetch(`/api/sessions/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    // Auto-clear notification after 4 seconds
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  const handleManualSearch = () => {
    if (!session || !searchTerm) return
    
    const item = session.items.find(si => 
      si.item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      si.item.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      si.item.colour.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    if (item) {
      setSelectedItem(item.item)
    }
  }

  const handleSubmitCount = async () => {
    if (!selectedItem || !quantity || !session) return

    const existingCounts = session.counts.filter(c => c.itemId === selectedItem.id)
    const nextCountNumber = existingCounts.length + 1

    if (nextCountNumber > 3) {
      alert('Maximum 3 counts allowed per item')
      return
    }

    try {
      const response = await fetch('/api/counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          itemId: selectedItem.id,
          quantity: parseInt(quantity),
          countNumber: nextCountNumber,
        }),
      })

      if (response.ok) {
        // Refresh session data
        await fetchSession()
        setSelectedItem(null)
        setQuantity('')
        setSearchTerm('')
      }
    } catch (error) {
      console.error('Error submitting count:', error)
    }
  }

  const handleBarcodeScan = () => {
    setShowScanner(true)
  }

  const handleScanResult = async (barcode: string) => {
    setShowScanner(false)
    
    if (!session) return
    
    // Clean and normalize the barcode
    const cleanBarcode = barcode.trim().toUpperCase()
    
    // Find item by SKU with multiple matching strategies
    const foundItem = session.items.find(sessionItem => {
      const itemSku = sessionItem.item.sku.toUpperCase()
      
      // Direct match
      if (itemSku === cleanBarcode) return true
      
      // Contains match
      if (itemSku.includes(cleanBarcode) || cleanBarcode.includes(itemSku)) return true
      
      // Partial match for common barcode patterns
      const skuParts = itemSku.split('-')
      const barcodeParts = cleanBarcode.split('-')
      
      // Check if any part matches
      return skuParts.some(part => 
        barcodeParts.some(barcodePart => 
          part.includes(barcodePart) || barcodePart.includes(part)
        )
      )
    })
    
    if (foundItem) {
      // Auto-select the item and show success feedback
      setAutoSelectedSku(foundItem.item.sku)
      setSelectedItem(foundItem.item)
      setSearchTerm(foundItem.item.sku)
      setQuantity('1') // Default quantity
      
      // Clear auto-selection highlight after 3 seconds
      setTimeout(() => {
        setAutoSelectedSku(null)
      }, 3000)
      
      // Show success notification
      showNotification('success', `Item auto-selected: ${foundItem.item.sku}. Ready to count! Quantity set to 1.`)
    } else {
      // Item not found in session, search globally
      showNotification('error', `Barcode "${barcode}" not found in session. Searching global database...`)
      await handleGlobalSearch(barcode)
      setShowAddItemModal(true)
    }
  }

  const handleScanError = (error: string) => {
    console.error('Barcode scan error:', error)
  }

  const handleGlobalSearch = async (query: string) => {
    if (!query.trim()) {
      setGlobalSearchResults([])
      return
    }

    setSearchingGlobal(true)
    try {
      const response = await fetch(`/api/items/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setGlobalSearchResults(data.items)
      } else {
        showNotification('error', 'Failed to search items')
      }
    } catch (error) {
      console.error('Global search error:', error)
      showNotification('error', 'Failed to search items')
    } finally {
      setSearchingGlobal(false)
    }
  }

  const handleAddItemToSession = async (itemSku: string) => {
    if (!session) return

    try {
      const response = await fetch(`/api/sessions/${session.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, itemSku })
      })

      if (response.ok) {
        showNotification('success', `Item "${itemSku}" added to session successfully`)
        // Refresh session data
        await fetchSession()
        setShowAddItemModal(false)
        setSearchTerm('')
        setGlobalSearchResults([])
      } else {
        const errorData = await response.json()
        showNotification('error', errorData.error || 'Failed to add item to session')
      }
    } catch (error) {
      console.error('Add item error:', error)
      showNotification('error', 'Failed to add item to session')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-fluid py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading session...</p>
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

  const filteredItems = session.items.filter(si =>
    si.item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    si.item.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    si.item.colour.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold gradient-text mb-2">
              <i className="bi bi-calculator me-3"></i>
              {session.name}
            </h1>
            <p className="text-muted lead mb-2">{session.description}</p>
            <div className="d-flex align-items-center text-muted">
              <i className="bi bi-geo-alt me-2"></i>
              <span>{session.location.name} - {session.location.locale}</span>
            </div>
          </div>
          <Link
            href={`/sessions/${session.id}`}
            className="btn btn-outline-secondary btn-lg"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Summary
          </Link>
        </div>

        <div className="row g-4">
          {/* Search and Scan Section */}
          <div className="col-lg-6">
            <div className="card card-enhanced h-100">
              <div className="card-header bg-transparent border-0 pb-0">
                <h2 className="card-title h4 fw-bold mb-0">
                  <i className="bi bi-search me-2"></i>
                  Scan or Search Item
                </h2>
              </div>
              
              <div className="card-body">
                <div className="d-grid gap-3">
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => setShowScanner(true)}
                      className="btn btn-gradient-success"
                    >
                      <i className="bi bi-upc-scan me-2"></i>
                      <span className="d-none d-sm-inline">Start Barcode Scan</span>
                      <span className="d-inline d-sm-none">Scan</span>
                    </button>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="btn btn-gradient-primary"
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      <span className="d-none d-sm-inline">Add Item</span>
                      <span className="d-inline d-sm-none">Add</span>
                    </button>
                  </div>


                  <div>
                    <label htmlFor="search" className="form-label fw-medium">
                      Search by SKU, Device Type, or Colour
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        id="search"
                        className="form-control search-enhanced"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                        placeholder="Enter SKU, device type, or colour..."
                      />
                      <button
                        onClick={handleManualSearch}
                        className="btn btn-gradient-primary"
                      >
                        <i className="bi bi-search me-1"></i>
                        Search
                      </button>
                    </div>
                  </div>

                  {searchTerm && (
                    <div className="border rounded-3 overflow-hidden" style={{ maxHeight: '300px' }}>
                      <div className="overflow-y-auto">
                        {filteredItems.map((sessionItem) => (
                          <div
                            key={sessionItem.id}
                            onClick={() => setSelectedItem(sessionItem.item)}
                            className={`p-3 border-bottom cursor-pointer transition-all ${
                              selectedItem?.id === sessionItem.item.id ? 'bg-primary bg-opacity-10' : 'hover-bg-light'
                            }`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="fw-medium">{sessionItem.item.sku}</div>
                            <div className="text-muted small">
                              {sessionItem.item.deviceType} - {sessionItem.item.colour} - {sessionItem.item.caseType}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Count Input Section */}
          <div className="col-lg-6">
            <div className="card card-enhanced h-100">
              <div className="card-header bg-transparent border-0 pb-0">
                <h2 className="card-title h4 fw-bold mb-0">
                  <i className="bi bi-plus-circle me-2"></i>
                  Count Item
                </h2>
              </div>
              
              <div className="card-body">
                {selectedItem ? (
                  <div className="d-grid gap-3">
                    <div className={`p-3 rounded-3 ${
                      autoSelectedSku === selectedItem.sku 
                        ? 'bg-primary bg-opacity-10 border border-primary border-2' 
                        : 'bg-light'
                    }`}>
                      <h5 className="fw-medium mb-1">
                        {selectedItem.sku}
                        {autoSelectedSku === selectedItem.sku && (
                          <i className="bi bi-check-circle-fill text-primary ms-2" title="Auto-selected via scan"></i>
                        )}
                      </h5>
                      <p className="text-muted small mb-0">
                        {selectedItem.deviceType} - {selectedItem.colour} - {selectedItem.caseType}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="quantity" className="form-label fw-medium">
                        Quantity Counted
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        className="form-control form-control-lg"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        min="0"
                      />
                    </div>

                    {session.counts.filter(c => c.itemId === selectedItem.id).length > 0 && (
                      <div className="bg-light p-3 rounded-3">
                        <h6 className="fw-medium mb-2">Previous counts:</h6>
                        {session.counts
                          .filter(c => c.itemId === selectedItem.id)
                          .map((count) => (
                            <div key={count.id} className="d-flex justify-content-between">
                              <span>Count {count.countNumber}:</span>
                              <span className="fw-medium">{count.quantity}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    <button
                      onClick={handleSubmitCount}
                      disabled={!quantity}
                      className="btn btn-gradient-success btn-lg"
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Submit Count
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-cursor" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-3 mb-0">Select an item to start counting</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Item to Session
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowAddItemModal(false)
                    setSearchTerm('')
                    setGlobalSearchResults([])
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <label htmlFor="globalSearchInput" className="form-label fw-medium">
                    Search Items by SKU, Device Type, Color, or Case Type
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      id="globalSearchInput"
                      className="form-control form-control-lg"
                      placeholder="Enter SKU or search term..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        handleGlobalSearch(e.target.value)
                      }}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => handleGlobalSearch(searchTerm)}
                    >
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </div>

                {/* Search Results */}
                {searchingGlobal && (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Searching...</span>
                    </div>
                    <p className="mt-2 text-muted">Searching items...</p>
                  </div>
                )}

                {globalSearchResults.length > 0 && (
                  <div className="mb-3">
                    <h6 className="fw-medium mb-3">Search Results ({globalSearchResults.length})</h6>
                    <div className="row g-3">
                      {globalSearchResults.map((item) => (
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

                {searchTerm && !searchingGlobal && globalSearchResults.length === 0 && (
                  <div className="text-center py-4">
                    <i className="bi bi-search text-muted" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted mt-2">No items found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddItemModal(false)
                    setSearchTerm('')
                    setGlobalSearchResults([])
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
        onError={handleScanError}
        defaultFormat="barcode"
      />
    </Layout>
  )
}
