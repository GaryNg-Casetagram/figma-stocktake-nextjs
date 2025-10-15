'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/layout'
import Link from 'next/link'

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

export default function CountPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [quantity, setQuantity] = useState('')
  const [scanMode, setScanMode] = useState(false)

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])


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

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (!session) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-red-600">Session not found</h1>
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
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{session.name}</h1>
              <p className="text-gray-600">{session.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                Location: {session.location.name} - {session.location.locale}
              </p>
            </div>
            <Link
              href={`/sessions/${session.id}`}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Summary
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search and Scan Section */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Scan or Search Item</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setScanMode(!scanMode)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      scanMode 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {scanMode ? 'Stop Scanning' : 'Start Barcode Scan'}
                  </button>
                </div>

                {scanMode && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Scanner mode active. Use your barcode scanner or enter barcode manually below.
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Search by SKU, Device Type, or Colour
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter SKU, device type, or colour..."
                    />
                    <button
                      onClick={handleManualSearch}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {searchTerm && (
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {filteredItems.map((sessionItem) => (
                      <div
                        key={sessionItem.id}
                        onClick={() => setSelectedItem(sessionItem.item)}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                          selectedItem?.id === sessionItem.item.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="font-medium">{sessionItem.item.sku}</div>
                        <div className="text-sm text-gray-600">
                          {sessionItem.item.deviceType} - {sessionItem.item.colour} - {sessionItem.item.caseType}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Count Input Section */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Count Item</h2>
              
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium">{selectedItem.sku}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedItem.deviceType} - {selectedItem.colour} - {selectedItem.caseType}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity Counted
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quantity"
                      min="0"
                    />
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Previous counts:</p>
                    {session.counts
                      .filter(c => c.itemId === selectedItem.id)
                      .map((count) => (
                        <div key={count.id}>
                          Count {count.countNumber}: {count.quantity}
                        </div>
                      ))}
                  </div>

                  <button
                    onClick={handleSubmitCount}
                    disabled={!quantity}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                  >
                    Submit Count
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select an item to start counting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
