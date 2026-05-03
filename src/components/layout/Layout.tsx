import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface LayoutProps {
  children: ReactNode
  header?: ReactNode
}

export function Layout({ children, header }: LayoutProps) {
  return (
    <div className="app-shell">
      {header && (
        <header className="sticky top-0 z-30 bg-cream-50/90 backdrop-blur-md border-b border-cream-200 px-5 py-4">
          {header}
        </header>
      )}
      <main className="page-content">{children}</main>
      <BottomNav />
    </div>
  )
}
