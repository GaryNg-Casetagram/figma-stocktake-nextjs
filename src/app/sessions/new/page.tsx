
'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/layout'
import { useRouter } from 'next/navigation'

interface Location {
  id: string
  name: string
  locale: string
}

export default function NewSessionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationId: ''
  })
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const session = await response.json()
        router.push(`/sessions/${session.id}`)
      } else {
        const error = await response.json()
        console.error('Error creating session:', error)
        alert('Failed to create session. Please try again.')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create session. Please try again.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="animate-fade-in">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading locations...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            {/* Header - Responsive */}
            <div className="text-center mb-4 mb-md-5">
              <h1 className="display-6 fw-bold gradient-text mb-2 mb-md-3">
                <i className="bi bi-plus-circle me-2 me-md-3"></i>
                <span className="d-none d-sm-inline">Create New Session</span>
                <span className="d-inline d-sm-none">New Session</span>
              </h1>
              <p className="text-muted lead d-none d-md-block">Set up a new stock take session to begin counting inventory</p>
              <p className="text-muted d-block d-md-none">Set up a new session</p>
            </div>

            {/* Form Card */}
            <div className="card card-enhanced">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                  <div className="row g-4">
                    {/* Session Name */}
                    <div className="col-12">
                      <label htmlFor="name" className="form-label fw-semibold">
                        <i className="bi bi-tag me-2 text-primary"></i>
                        Session Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="form-control form-control-lg"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter a descriptive name for your session"
                      />
                      <div className="form-text">Choose a name that clearly identifies this stock take session</div>
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label htmlFor="description" className="form-label fw-semibold">
                        <i className="bi bi-text-paragraph me-2 text-primary"></i>
                        Description
                      </label>
                      <textarea
                        id="description"
                        className="form-control"
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Provide details about this stock take session..."
                      />
                      <div className="form-text">Include purpose, scope, or any special instructions</div>
                    </div>

                    {/* Location */}
                    <div className="col-12">
                      <label htmlFor="location" className="form-label fw-semibold">
                        <i className="bi bi-geo-alt me-2 text-primary"></i>
                        Location
                      </label>
                      <select
                        id="location"
                        className="form-select form-select-lg"
                        required
                        value={formData.locationId}
                        onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                      >
                        <option value="">Select a location for this session</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name} - {location.locale}
                          </option>
                        ))}
                      </select>
                      <div className="form-text">Choose the physical location where counting will take place</div>
                    </div>

                    {/* Session Settings */}
                    <div className="col-12">
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="card-title fw-semibold mb-3">
                            <i className="bi bi-gear me-2 text-secondary"></i>
                            Session Settings
                          </h6>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="enableBarcode" defaultChecked />
                                <label className="form-check-label" htmlFor="enableBarcode">
                                  Enable Barcode Scanning
                                </label>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="requireConfirmation" />
                                <label className="form-check-label" htmlFor="requireConfirmation">
                                  Require Count Confirmation
                                </label>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="allowMultipleCounts" defaultChecked />
                                <label className="form-check-label" htmlFor="allowMultipleCounts">
                                  Allow Multiple Counts
                                </label>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" id="autoSave" defaultChecked />
                                <label className="form-check-label" htmlFor="autoSave">
                                  Auto-save Progress
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-3 mt-5 pt-4 border-top">
                    <button
                      type="submit"
                      className="btn btn-gradient-primary btn-lg flex-grow-1"
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Create Session
                    </button>
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="btn btn-outline-secondary btn-lg"
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Help Card */}
            <div className="card bg-info bg-opacity-10 border-info mt-4">
              <div className="card-body">
                <h6 className="card-title text-info">
                  <i className="bi bi-lightbulb me-2"></i>
                  Pro Tip
                </h6>
                <p className="card-text text-muted mb-0">
                  After creating your session, you&apos;ll be able to add specific items to count and assign team members to help with the counting process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
