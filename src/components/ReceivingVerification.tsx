'use client'

import { useState } from 'react'

interface ReceivingItem {
  id: string
  sku: string
  deviceType: string
  colour: string
  caseType: string
  expectedQuantity: number
  receivedQuantity: number
  status: 'pending' | 'verified' | 'discrepancy'
  notes?: string
}

interface ReceivingVerificationProps {
  items: ReceivingItem[]
  onItemVerified: (itemId: string, quantity: number, notes?: string) => void
}

export default function ReceivingVerification({ items, onItemVerified }: ReceivingVerificationProps) {
  const [currentItem, setCurrentItem] = useState<ReceivingItem | null>(null)
  const [receivedQuantity, setReceivedQuantity] = useState<number>(0)
  const [notes, setNotes] = useState<string>('')
  const [showModal, setShowModal] = useState(false)

  const pendingItems = items.filter(item => item.status === 'pending')
  const verifiedItems = items.filter(item => item.status === 'verified')
  const discrepancyItems = items.filter(item => item.status === 'discrepancy')
  const progressPercentage = (verifiedItems.length / items.length) * 100

  const handleItemSelect = (item: ReceivingItem) => {
    setCurrentItem(item)
    setReceivedQuantity(item.expectedQuantity)
    setNotes('')
    setShowModal(true)
  }

  const handleVerify = () => {
    if (currentItem) {
      onItemVerified(currentItem.id, receivedQuantity, notes)
      setShowModal(false)
      setCurrentItem(null)
    }
  }

  const handleBarcodeScan = () => {
    // In a real implementation, this would integrate with a barcode scanner
    setTimeout(() => {
      const randomItem = pendingItems[Math.floor(Math.random() * pendingItems.length)]
      if (randomItem) {
        handleItemSelect(randomItem)
      }
    }, 1000)
  }

  return (
    <div className="receiving-verification">
      {/* Progress Overview */}
      <div className="card card-enhanced mb-4">
        <div className="card-header bg-transparent border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="bi bi-clipboard-check me-2"></i>
              Receiving Verification Progress
            </h4>
            <span className="badge bg-primary fs-6">
              {verifiedItems.length} / {items.length} Verified
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Overall Progress</span>
              <span className="fw-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="progress mb-3" style={{ height: '8px' }}>
              <div 
                className={`progress-bar ${progressPercentage === 100 ? 'bg-success' : 'bg-primary'}`}
                role="progressbar" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="row g-3">
            <div className="col-md-4">
              <div className="text-center p-3 bg-light rounded-3">
                <i className="bi bi-clock text-warning fs-2"></i>
                <div className="fw-bold text-warning fs-4">{pendingItems.length}</div>
                <div className="text-muted small">Pending</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center p-3 bg-light rounded-3">
                <i className="bi bi-check-circle text-success fs-2"></i>
                <div className="fw-bold text-success fs-4">{verifiedItems.length}</div>
                <div className="text-muted small">Verified</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center p-3 bg-light rounded-3">
                <i className="bi bi-exclamation-triangle text-danger fs-2"></i>
                <div className="fw-bold text-danger fs-4">{discrepancyItems.length}</div>
                <div className="text-muted small">Discrepancies</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Responsive */}
      <div className="d-flex flex-column flex-sm-row gap-2 mb-4">
        <button 
          className="btn btn-gradient-success btn-lg flex-fill flex-sm-grow-0"
          onClick={handleBarcodeScan}
          disabled={pendingItems.length === 0}
        >
          <i className="bi bi-upc-scan me-2"></i>
          <span className="d-none d-sm-inline">Scan Barcode</span>
          <span className="d-inline d-sm-none">Scan</span>
        </button>
        <button 
          className="btn btn-outline-primary btn-lg flex-fill flex-sm-grow-0"
        >
          <i className="bi bi-list me-2"></i>
          <span className="d-none d-sm-inline">Manual Selection</span>
          <span className="d-inline d-sm-none">Manual</span>
        </button>
      </div>

      {/* Items Grid - Responsive */}
      <div className="row g-3">
        {items.map((item) => (
          <div key={item.id} className="col-12 col-sm-6 col-lg-4">
            <div 
              className={`card card-enhanced h-100 ${
                item.status === 'verified' ? 'border-success' : 
                item.status === 'discrepancy' ? 'border-danger' : 'border-warning'
              }`}
              onClick={() => item.status === 'pending' && handleItemSelect(item)}
              style={{ cursor: item.status === 'pending' ? 'pointer' : 'default' }}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold mb-0">{item.sku}</h6>
                  <span className={`badge ${
                    item.status === 'verified' ? 'bg-success' : 
                    item.status === 'discrepancy' ? 'bg-danger' : 'bg-warning'
                  }`}>
                    {item.status === 'verified' ? 'Verified' : 
                     item.status === 'discrepancy' ? 'Discrepancy' : 'Pending'}
                  </span>
                </div>
                
                <p className="text-muted small mb-2">
                  {item.deviceType} - {item.colour} - {item.caseType}
                </p>
                
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small">Expected</div>
                    <div className="fw-medium">{item.expectedQuantity}</div>
                  </div>
                  <div className="text-center">
                    <i className="bi bi-arrow-right text-muted"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Received</div>
                    <div className="fw-medium">{item.receivedQuantity || '-'}</div>
                  </div>
                </div>
                
                {item.notes && (
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="bi bi-chat-text me-1"></i>
                      {item.notes}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-clipboard-check me-2"></i>
                  Verify Received Item
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {currentItem && (
                  <div>
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <h5 className="fw-bold">{currentItem.sku}</h5>
                        <p className="text-muted mb-0">
                          {currentItem.deviceType} - {currentItem.colour} - {currentItem.caseType}
                        </p>
                      </div>
                      <div className="col-md-6 text-end">
                        <div className="bg-light p-3 rounded-3">
                          <div className="text-muted small">Expected Quantity</div>
                          <div className="fw-bold fs-4">{currentItem.expectedQuantity}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">Received Quantity</label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        value={receivedQuantity}
                        onChange={(e) => setReceivedQuantity(parseInt(e.target.value) || 0)}
                        min="0"
                        autoFocus
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">Notes (Optional)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about discrepancies or special conditions..."
                      />
                    </div>

                    {receivedQuantity !== currentItem.expectedQuantity && (
                      <div className="alert alert-warning d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        <div>
                          <strong>Quantity Discrepancy Detected!</strong><br/>
                          Expected: {currentItem.expectedQuantity}, Received: {receivedQuantity}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className={`btn ${receivedQuantity === currentItem?.expectedQuantity ? 'btn-gradient-success' : 'btn-gradient-warning'}`}
                  onClick={handleVerify}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  {receivedQuantity === currentItem?.expectedQuantity ? 'Verify Match' : 'Record Discrepancy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}