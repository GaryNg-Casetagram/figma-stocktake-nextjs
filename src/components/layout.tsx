import { Sidebar } from '@/components/sidebar'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="d-flex h-100" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <main className="flex-grow-1 overflow-auto bg-light">
        <div className="container-fluid p-4">
          {children}
        </div>
      </main>
    </div>
  )
}
