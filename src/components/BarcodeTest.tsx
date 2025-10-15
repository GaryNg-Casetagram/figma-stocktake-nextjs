'use client'

import { useState } from 'react'
import BarcodeScanner from './BarcodeScanner'

export default function BarcodeTest() {
  const [showScanner, setShowScanner] = useState(false)
  const [lastScan, setLastScan] = useState<string>('')
  const [scanHistory, setScanHistory] = useState<string[]>([])

  const handleScan = (result: string) => {
    setLastScan(result)
    setScanHistory(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 scans
  }

  const handleError = (error: string) => {
    console.error('Scanner error:', error)
    alert(`Scanner Error: ${error}`)
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">
                <i className="bi bi-upc-scan me-2"></i>
                Barcode Scanner Test
              </h3>
            </div>
            <div className="card-body">
              <div className="d-grid gap-3">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowScanner(true)}
                >
                  <i className="bi bi-camera me-2"></i>
                  Test Barcode Scanner
                </button>

                {lastScan && (
                  <div className="alert alert-success">
                    <h5 className="alert-heading">Last Scan Result:</h5>
                    <p className="mb-0">
                      <strong>Barcode:</strong> {lastScan}
                    </p>
                    <p className="mb-0">
                      <strong>Length:</strong> {lastScan.length} characters
                    </p>
                    <p className="mb-0">
                      <strong>Type:</strong> {typeof lastScan}
                    </p>
                  </div>
                )}

                {scanHistory.length > 0 && (
                  <div>
                    <h5>Scan History:</h5>
                    <div className="list-group">
                      {scanHistory.map((scan, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="font-monospace">{scan}</span>
                          <span className="badge bg-secondary">{scan.length} chars</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="alert alert-info">
                  <h6>Test Instructions:</h6>
                  <ul className="mb-0">
                    <li>Click "Test Barcode Scanner" to open the camera</li>
                    <li>Allow camera permission when prompted</li>
                    <li>Point camera at any barcode or QR code</li>
                    <li>Check the results below</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        onError={handleError}
      />
    </div>
  )
}
