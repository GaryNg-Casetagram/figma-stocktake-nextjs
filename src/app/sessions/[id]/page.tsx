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

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold gradient-text mb-2">
              <i className={`bi ${isReceivingVerification ? 'bi-truck' : 'bi-clipboard-check'} me-3`}></i>
              {session.name}
            </h1>
            <p className="text-muted lead mb-2">{session.description}</p>
            <div className="d-flex align-items-center text-muted">
              <i className="bi bi-geo-alt me-2"></i>
              <span>{session.location.name} - {session.location.locale}</span>
              <span className="mx-3">•</span>
              <i className="bi bi-box me-2"></i>
              <span>{session.items.length} items</span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link
              href={`/sessions/${session.id}/count`}
              className="btn btn-gradient-success btn-lg"
            >
              <i className="bi bi-play-circle me-2"></i>
              {isReceivingVerification ? 'Start Verification' : 'Start Counting'}
            </Link>
            <Link
              href="/sessions"
              className="btn btn-outline-secondary btn-lg"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Sessions
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

        {/* Session Items Summary */}
        <SessionItemsSummary
          items={sessionItems}
          onItemClick={handleItemClick}
        />
      </div>
    </Layout>
  )
}
