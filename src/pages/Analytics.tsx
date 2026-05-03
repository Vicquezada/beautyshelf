import { useState } from 'react'
import { BarChart2, TrendingDown, Package, Tag } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { ConsumptionStats } from '../components/analytics/ConsumptionStats'
import { BrandDashboard } from '../components/analytics/BrandDashboard'
import { PriceMonitor } from '../components/analytics/PriceMonitor'
import { Loading } from '../components/ui/Loading'
import type { Product, UserSupplier, PriceAlert, ConsumptionStats as Stats } from '../types'

type Tab = 'consumi' | 'brand' | 'prezzi'

interface AnalyticsProps {
  products: Product[]
  consumptionStats: Stats[]
  brandStats: { brand: string; count: number; products: string[] }[]
  suppliers: UserSupplier[]
  priceAlerts: PriceAlert[]
  loading: boolean
  onAddSupplier: (name: string, url: string) => Promise<void>
  onDeleteSupplier: (id: string) => Promise<void>
}

export function Analytics({
  products,
  consumptionStats,
  brandStats,
  suppliers,
  priceAlerts,
  loading,
  onAddSupplier,
  onDeleteSupplier,
}: AnalyticsProps) {
  const [tab, setTab] = useState<Tab>('consumi')

  const tabs: { key: Tab; label: string; icon: typeof TrendingDown }[] = [
    { key: 'consumi', label: 'Consumi', icon: TrendingDown },
    { key: 'brand', label: 'Brand', icon: Package },
    { key: 'prezzi', label: 'Prezzi', icon: Tag },
  ]

  const header = (
    <div className="flex items-center gap-3">
      <BarChart2 size={20} className="text-warm-700" />
      <h1 className="section-title">Analytics</h1>
    </div>
  )

  return (
    <Layout header={header}>
      {/* Tabs */}
      <div className="flex gap-1 bg-cream-100 p-1 rounded-xl mb-4">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === key ? 'bg-white text-warm-900 shadow-sm' : 'text-warm-500'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          {tab === 'consumi' && <ConsumptionStats stats={consumptionStats} />}
          {tab === 'brand' && <BrandDashboard stats={brandStats} />}
          {tab === 'prezzi' && (
            <PriceMonitor
              suppliers={suppliers}
              alerts={priceAlerts}
              products={products}
              onAddSupplier={onAddSupplier}
              onDeleteSupplier={onDeleteSupplier}
            />
          )}
        </>
      )}
    </Layout>
  )
}
