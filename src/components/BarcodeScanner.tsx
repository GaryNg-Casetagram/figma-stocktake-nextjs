'use client'

import { useState, useEffect, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (result: string) => void
  onError?: (error: string) => void
}

export default function BarcodeScanner({ isOpen, onClose, onScan, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    if (isOpen) {
      initializeScanner()
    } else {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [isOpen])

  const initializeScanner = async () => {
    try {
      setError('')
      setIsScanning(false)
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device')
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      setHasPermission(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Initialize ZXing reader
      readerRef.current = new BrowserMultiFormatReader()
      
      // Start scanning
      startScanning()
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera'
      setError(errorMessage)
      setHasPermission(false)
      onError?.(errorMessage)
    }
  }

  const startScanning = async () => {
    if (!readerRef.current || !videoRef.current) return

    try {
      setIsScanning(true)
      
      const result = await readerRef.current.decodeFromVideoElement(videoRef.current)
      
      if (result) {
        onScan(result.getText())
        stopScanning()
      }
    } catch (err) {
      // Continue scanning - this is normal for ZXing
      if (isScanning) {
        setTimeout(() => startScanning(), 100)
      }
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    
    if (readerRef.current) {
      readerRef.current.reset()
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  const handleRetry = () => {
    setError('')
    initializeScanner()
  }

  if (!isOpen) return null

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content bg-dark">
          <div className="modal-header border-0">
            <h5 className="modal-title text-white">
              <i className="bi bi-upc-scan me-2"></i>
              Scan Barcode
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
            ></button>
          </div>
          
          <div className="modal-body p-0 position-relative">
            {hasPermission === false ? (
              <div className="d-flex flex-column align-items-center justify-content-center text-center text-white" style={{ height: '70vh' }}>
                <i className="bi bi-camera-video-off text-danger mb-3" style={{ fontSize: '4rem' }}></i>
                <h4 className="mb-3">Camera Access Required</h4>
                <p className="mb-4 px-3">
                  {error || 'Please allow camera access to scan barcodes. Make sure your device has a camera and you have granted permission.'}
                </p>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-light" onClick={handleRetry}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Try Again
                  </button>
                  <button className="btn btn-secondary" onClick={handleClose}>
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="position-relative">
                <video
                  ref={videoRef}
                  className="w-100 h-auto"
                  style={{ 
                    minHeight: '70vh',
                    objectFit: 'cover',
                    backgroundColor: '#000'
                  }}
                  playsInline
                  muted
                />
                
                {/* Scanning overlay */}
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                  <div className="text-center text-white">
                    <div className="mb-3">
                      <div 
                        className="border border-white border-3 rounded"
                        style={{
                          width: '250px',
                          height: '150px',
                          position: 'relative'
                        }}
                      >
                        {/* Corner indicators */}
                        <div className="position-absolute top-0 start-0" style={{ width: '20px', height: '20px' }}>
                          <div className="border-top border-start border-white border-3" style={{ width: '100%', height: '100%' }}></div>
                        </div>
                        <div className="position-absolute top-0 end-0" style={{ width: '20px', height: '20px' }}>
                          <div className="border-top border-end border-white border-3" style={{ width: '100%', height: '100%' }}></div>
                        </div>
                        <div className="position-absolute bottom-0 start-0" style={{ width: '20px', height: '20px' }}>
                          <div className="border-bottom border-start border-white border-3" style={{ width: '100%', height: '100%' }}></div>
                        </div>
                        <div className="position-absolute bottom-0 end-0" style={{ width: '20px', height: '20px' }}>
                          <div className="border-bottom border-end border-white border-3" style={{ width: '100%', height: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    {isScanning && (
                      <div className="mb-3">
                        <div className="spinner-border text-white" role="status">
                          <span className="visually-hidden">Scanning...</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="mb-0">
                      {isScanning ? 'Point camera at barcode' : 'Preparing camera...'}
                    </p>
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                  <div className="text-center text-white">
                    <p className="mb-2">
                      <i className="bi bi-info-circle me-2"></i>
                      Position the barcode within the frame
                    </p>
                    <small className="text-muted">
                      Make sure the barcode is well-lit and clearly visible
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer border-0 bg-dark">
            <div className="d-flex gap-2 w-100">
              <button 
                className="btn btn-outline-light flex-fill"
                onClick={handleClose}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancel
              </button>
              {hasPermission === false && (
                <button 
                  className="btn btn-primary flex-fill"
                  onClick={handleRetry}
                >
                  <i className="bi bi-camera me-2"></i>
                  Enable Camera
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
