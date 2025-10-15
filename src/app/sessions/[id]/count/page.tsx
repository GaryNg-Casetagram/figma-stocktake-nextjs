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
  const [showItemPreview, setShowItemPreview] = useState(false)
  const [previewItem, setPreviewItem] = useState<any>(null)
  const [previewQuantity, setPreviewQuantity] = useState('1')

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
    
    console.log('Scanned barcode:', barcode)
    
    // Clean and normalize the barcode - more aggressive cleaning
    const cleanBarcode = barcode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
    console.log('Cleaned barcode:', cleanBarcode)
    
    // Enhanced search function for better matching
    const findItemInSession = (sessionItems: any[], searchTerm: string) => {
      return sessionItems.find(sessionItem => {
        const itemSku = sessionItem.item.sku.toUpperCase()
        console.log('Checking item SKU:', itemSku, 'against:', searchTerm)
        
        // 1. Direct exact match
        if (itemSku === searchTerm) {
          console.log('Direct match found:', itemSku)
          return true
        }
        
        // 2. Case-insensitive exact match
        if (itemSku.toLowerCase() === searchTerm.toLowerCase()) {
          console.log('Case-insensitive match found:', itemSku)
          return true
        }
        
        // 3. Contains match (both directions)
        if (itemSku.includes(searchTerm) || searchTerm.includes(itemSku)) {
          console.log('Contains match found:', itemSku)
          return true
        }
        
        // 4. Remove all non-alphanumeric characters and compare
        const cleanSku = itemSku.replace(/[^A-Z0-9]/g, '')
        const cleanSearch = searchTerm.replace(/[^A-Z0-9]/g, '')
        if (cleanSku === cleanSearch) {
          console.log('Clean match found:', itemSku)
          return true
        }
        
        // 5. Partial match for hyphenated patterns
        const skuParts = itemSku.split('-')
        const searchParts = searchTerm.split('-')
        
        // Check if all search parts are found in SKU parts
        const allPartsMatch = searchParts.every((searchPart: string) => 
          skuParts.some((skuPart: string) => 
            skuPart.includes(searchPart) || searchPart.includes(skuPart)
          )
        )
        
        if (allPartsMatch && searchParts.length > 1) {
          console.log('Partial hyphenated match found:', itemSku)
          return true
        }
        
        // 6. Fuzzy matching for common OCR errors
        const fuzzyMatch = (str1: string, str2: string) => {
          const longer = str1.length > str2.length ? str1 : str2
          const shorter = str1.length > str2.length ? str2 : str1
          const editDistance = levenshteinDistance(longer, shorter)
          return editDistance <= 2 && longer.length > 5 // Allow 2 character differences for longer strings
        }
        
        if (fuzzyMatch(itemSku, searchTerm)) {
          console.log('Fuzzy match found:', itemSku)
          return true
        }
        
        return false
      })
    }
    
    // Simple Levenshtein distance function for fuzzy matching
    const levenshteinDistance = (str1: string, str2: string) => {
      const matrix = []
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i]
      }
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j
      }
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1]
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            )
          }
        }
      }
      return matrix[str2.length][str1.length]
    }
    
    // First, try to find in session items
    const foundItem = findItemInSession(session.items, cleanBarcode)
    
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
      showNotification('success', `✅ Item found and auto-selected: ${foundItem.item.sku}. Ready to count!`)
    } else {
      // Item not found in session, search globally with enhanced search
      console.log('Item not found in session, searching globally...')
      showNotification('error', `❌ Item "${cleanBarcode}" not found in session. Searching global database...`)
      
      // Enhanced global search with the same matching logic
      const searchResults = await handleGlobalSearch(cleanBarcode)
      
      // If we found items in global search, show the first one for preview
      if (searchResults.length > 0) {
        console.log('Found items in global search:', searchResults.length)
        setPreviewItem(searchResults[0])
        setPreviewQuantity('1')
        setShowItemPreview(true)
        showNotification('success', `✅ Found item in global database: ${searchResults[0].sku}`)
      } else {
        // No items found, show add modal for manual search
        console.log('No items found in global search')
        showNotification('error', `❌ No items found matching "${cleanBarcode}". Please try manual search.`)
        setShowAddItemModal(true)
      }
    }
  }

  const handleScanError = (error: string) => {
    console.error('Barcode scan error:', error)
  }

  const handleGlobalSearch = async (query: string): Promise<any[]> => {
    if (!query.trim()) {
      setGlobalSearchResults([])
      return []
    }

    console.log('Global search for:', query)
    setSearchingGlobal(true)
    try {
      // Single search query - let the API handle multiple strategies
      const response = await fetch(`/api/items/search?q=${encodeURIComponent(query)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        console.log('Global search results:', data.items.length)
        setGlobalSearchResults(data.items)
        return data.items
      } else {
        console.error('Search API error:', response.status)
        setGlobalSearchResults([])
        return []
      }
    } catch (error) {
      console.error('Global search error:', error)
      showNotification('error', 'Failed to search items')
      setGlobalSearchResults([])
      return []
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

  const handleConfirmAddItem = async () => {
    if (!session || !previewItem) return

    try {
      const response = await fetch(`/api/sessions/${session.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, itemSku: previewItem.sku })
      })

      if (response.ok) {
        showNotification('success', `Item "${previewItem.sku}" added to session successfully`)
        // Refresh session data
        await fetchSession()
        setShowItemPreview(false)
        setPreviewItem(null)
        setPreviewQuantity('1')
        
        // Auto-select the item for counting
        setSelectedItem({
          id: previewItem.id,
          sku: previewItem.sku,
          deviceType: previewItem.deviceType,
          colour: previewItem.colour,
          caseType: previewItem.caseType
        })
        setQuantity(previewQuantity)
        setSearchTerm(previewItem.sku)
      } else {
        const errorData = await response.json()
        showNotification('error', errorData.error || 'Failed to add item to session')
      }
    } catch (error) {
      console.error('Add item error:', error)
      showNotification('error', 'Failed to add item to session')
    }
  }

  const handleCancelAddItem = () => {
    setShowItemPreview(false)
    setPreviewItem(null)
    setPreviewQuantity('1')
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
                      <span className="d-none d-sm-inline">Start Scan</span>
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

      {/* Item Preview Modal */}
      {showItemPreview && previewItem && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-eye me-2"></i>
                  Item Found - Confirm Addition
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCancelAddItem}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  {/* Item Image */}
                  <div className="col-md-4 text-center">
                    {previewItem.image ? (
                      <img 
                        src={previewItem.image} 
                        alt={previewItem.sku}
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: '200px' }}
                      />
                    ) : (
                      <div className="bg-light rounded d-flex align-items-center justify-content-center mx-auto" 
                           style={{ width: '200px', height: '200px' }}>
                        <i className="bi bi-box text-muted" style={{ fontSize: '4rem' }}></i>
                      </div>
                    )}
                  </div>
                  
                  {/* Item Details */}
                  <div className="col-md-8">
                    <h4 className="fw-bold mb-3">{previewItem.sku}</h4>
                    
                    <div className="row g-3 mb-4">
                      <div className="col-sm-6">
                        <label className="form-label fw-medium text-muted">Device Type</label>
                        <p className="mb-0">{previewItem.deviceType}</p>
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label fw-medium text-muted">Color</label>
                        <p className="mb-0">{previewItem.colour}</p>
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label fw-medium text-muted">Case Type</label>
                        <p className="mb-0">{previewItem.caseType}</p>
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label fw-medium text-muted">Type</label>
                        <p className="mb-0">
                          {previewItem.isRfidItem ? (
                            <span className="badge bg-primary">RFID Item</span>
                          ) : (
                            <span className="badge bg-secondary">Non-RFID</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {previewItem.description && (
                      <div className="mb-4">
                        <label className="form-label fw-medium text-muted">Description</label>
                        <p className="mb-0">{previewItem.description}</p>
                      </div>
                    )}

                    {/* Quantity Input */}
                    <div className="mb-4">
                      <label htmlFor="previewQuantity" className="form-label fw-medium">
                        Quantity to Count
                      </label>
                      <input
                        type="number"
                        id="previewQuantity"
                        className="form-control form-control-lg"
                        value={previewQuantity}
                        onChange={(e) => setPreviewQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={handleCancelAddItem}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-gradient-success"
                  onClick={handleConfirmAddItem}
                  disabled={!previewQuantity || parseInt(previewQuantity) < 1}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Add to Session & Count
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
