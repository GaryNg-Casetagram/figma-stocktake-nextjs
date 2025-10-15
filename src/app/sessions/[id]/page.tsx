import Layout from '@/components/layout'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getSession(id: string) {
  return await prisma.session.findUnique({
    where: { id },
    include: {
      location: true,
      items: {
        include: {
          item: true
        }
      },
      counts: {
        include: {
          session: true
        }
      }
    }
  })
}

export default async function SessionSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession(id)

  if (!session) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-red-600">Session not found</h1>
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

  return (
    <Layout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{session.name}</h1>
            <p className="text-gray-600">{session.description}</p>
            <p className="text-sm text-gray-500 mt-1">
              Location: {session.location.name} - {session.location.locale}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/sessions/${session.id}/count`}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Start Counting
            </Link>
            <Link
              href="/sessions"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Sessions
            </Link>
          </div>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Session Items Summary</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Counts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {session.items.map((sessionItem) => {
                  const counts = itemCounts[sessionItem.item.id] || []
                  const quantities = counts.map(c => c.quantity)
                  
                  return (
                    <tr key={sessionItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sessionItem.item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sessionItem.item.deviceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sessionItem.item.colour}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sessionItem.item.caseType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {counts.length === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Not Counted
                          </span>
                        ) : counts.length === 1 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Count 1 Complete
                          </span>
                        ) : counts.length === 2 ? (
                          quantities[0] === quantities[1] ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Complete (2 counts match)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Count 2 Complete
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Complete (3 counts)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {counts.length > 0 ? (
                          <div className="space-y-1">
                            {counts.map((count) => (
                              <div key={count.id} className="text-xs">
                                Count {count.countNumber}: {count.quantity}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No counts yet</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
