'use client'

import { useState, useEffect, useRef } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat } from '@zxing/library'

type ScanFormat = 'all' | 'barcode' | 'qr'

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (result: string) => void
  onError?: (error: string) => void
  defaultFormat?: ScanFormat
}

export default function BarcodeScanner({ isOpen, onClose, onScan, onError, defaultFormat = 'all' }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [scanFormat, setScanFormat] = useState<ScanFormat>(defaultFormat)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  const getBarcodeFormats = (format: ScanFormat): BarcodeFormat[] => {
    switch (format) {
      case 'barcode':
        return [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_93,
          BarcodeFormat.CODABAR,
          BarcodeFormat.ITF,
          BarcodeFormat.RSS_14,
          BarcodeFormat.RSS_EXPANDED
        ]
      case 'qr':
        return [
          BarcodeFormat.QR_CODE,
          BarcodeFormat.DATA_MATRIX,
          BarcodeFormat.AZTEC,
          BarcodeFormat.PDF_417,
          BarcodeFormat.MAXICODE
        ]
      case 'all':
      default:
        return [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_93,
          BarcodeFormat.CODABAR,
          BarcodeFormat.ITF,
          BarcodeFormat.RSS_14,
          BarcodeFormat.RSS_EXPANDED,
          BarcodeFormat.QR_CODE,
          BarcodeFormat.DATA_MATRIX,
          BarcodeFormat.AZTEC,
          BarcodeFormat.PDF_417,
          BarcodeFormat.MAXICODE
        ]
    }
  }

  const initializeScanner = async () => {
    try {
      setIsInitializing(true)
      setError('')
      setIsScanning(false)
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device')
      }

      // Request camera permission with fallback options
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          } 
        })
      } catch (err) {
        // Fallback to any available camera
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          } 
        })
      }
      
      streamRef.current = stream
      setHasPermission(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve
          }
        })
      }

      // Initialize ZXing reader with specific formats
      readerRef.current = new BrowserMultiFormatReader()
      
      // Configure reader with selected formats
      const formats = getBarcodeFormats(scanFormat)
      readerRef.current.hints.set('POSSIBLE_FORMATS', formats)
      
      // Start scanning after a short delay
      setTimeout(() => {
        startScanning()
      }, 1000)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera'
      setError(errorMessage)
      setHasPermission(false)
      setIsInitializing(false)
      onError?.(errorMessage)
    }
  }

  const startScanning = async () => {
    if (!readerRef.current || !videoRef.current || !isOpen) return

    try {
      setIsScanning(true)
      setIsInitializing(false)
      
      // Use a more reliable scanning approach
      const scanFrame = async () => {
        if (!readerRef.current || !videoRef.current || !isScanning) return
        
        try {
          const result = await readerRef.current.decodeFromVideoElement(videoRef.current)
          
          if (result && result.getText()) {
            const scannedText = result.getText().trim()
            if (scannedText) {
              onScan(scannedText)
              stopScanning()
              return
            }
          }
        } catch (err) {
          // Continue scanning - this is normal for ZXing
        }
        
        // Continue scanning
        if (isScanning && isOpen) {
          scanningIntervalRef.current = setTimeout(scanFrame, 100)
        }
      }
      
      scanFrame()
      
    } catch (err) {
      console.error('Scanning error:', err)
      setError('Failed to start scanning')
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    setIsInitializing(false)
    
    // Clear scanning interval
    if (scanningIntervalRef.current) {
      clearTimeout(scanningIntervalRef.current)
      scanningIntervalRef.current = null
    }
    
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    // Reset video element
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    // Reset reader
    if (readerRef.current) {
      readerRef.current.reset()
    }
  }

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  const handleRetry = () => {
    setError('')
    stopScanning()
    setTimeout(() => {
      initializeScanner()
    }, 500)
  }

  const handleFormatChange = (newFormat: ScanFormat) => {
    setScanFormat(newFormat)
    if (isScanning) {
      stopScanning()
      setTimeout(() => {
        initializeScanner()
      }, 500)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content bg-dark">
          <div className="modal-header border-0">
            <h5 className="modal-title text-white">
              <i className="bi bi-upc-scan me-2"></i>
              Scan {scanFormat === 'qr' ? 'QR Code' : scanFormat === 'barcode' ? 'Barcode' : 'Barcode/QR Code'}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
            ></button>
          </div>
          
          {/* Format Selection */}
          <div className="px-3 py-2 bg-dark border-bottom">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn btn-sm ${scanFormat === 'all' ? 'btn-primary' : 'btn-outline-light'}`}
                onClick={() => handleFormatChange('all')}
              >
                <i className="bi bi-grid me-1"></i>
                All
              </button>
              <button
                type="button"
                className={`btn btn-sm ${scanFormat === 'barcode' ? 'btn-primary' : 'btn-outline-light'}`}
                onClick={() => handleFormatChange('barcode')}
              >
                <i className="bi bi-upc-scan me-1"></i>
                Barcode
              </button>
              <button
                type="button"
                className={`btn btn-sm ${scanFormat === 'qr' ? 'btn-primary' : 'btn-outline-light'}`}
                onClick={() => handleFormatChange('qr')}
              >
                <i className="bi bi-qr-code-scan me-1"></i>
                QR Code
              </button>
            </div>
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
                    {isInitializing ? (
                      <div className="mb-3">
                        <div className="spinner-border text-white" role="status">
                          <span className="visually-hidden">Initializing...</span>
                        </div>
                        <p className="mt-3 mb-0">Initializing camera...</p>
                      </div>
                    ) : (
                      <>
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
                          {isScanning ? `Point camera at ${scanFormat === 'qr' ? 'QR code' : scanFormat === 'barcode' ? 'barcode' : 'barcode or QR code'}` : 'Preparing camera...'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                  <div className="text-center text-white">
                    <p className="mb-2">
                      <i className="bi bi-info-circle me-2"></i>
                      Position the {scanFormat === 'qr' ? 'QR code' : scanFormat === 'barcode' ? 'barcode' : 'barcode or QR code'} within the frame
                    </p>
                    <small className="text-muted">
                      Make sure the {scanFormat === 'qr' ? 'QR code' : scanFormat === 'barcode' ? 'barcode' : 'code'} is well-lit and clearly visible
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
