import { Package } from 'lucide-react'

interface BrandStats {
  brand: string
  count: number
  products: string[]
}

export function BrandDashboard({ stats }: { stats: BrandStats[] }) {
  if (stats.length === 0) {
    return (
      <div className="text-center py-8 text-warm-400 text-sm">
        Nessun dato disponibile
      </div>
    )
  }

  const max = stats[0].count

  return (
    <div className="space-y-3">
      {stats.map(({ brand, count, products }) => (
        <div key={brand} className="card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center">
                <Package size={15} className="text-warm-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-warm-900">{brand}</p>
                <p className="text-xs text-warm-500">{count} prodotto/i</p>
              </div>
            </div>
            <span className="text-2xl font-display font-semibold text-warm-800">{count}</span>
          </div>

          <div className="h-1.5 rounded-full bg-cream-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-warm-800 transition-all"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {products.slice(0, 4).map(p => (
              <span key={p} className="text-[10px] bg-cream-100 text-warm-600 px-2 py-0.5 rounded-full">
                {p}
              </span>
            ))}
            {products.length > 4 && (
              <span className="text-[10px] text-warm-400">+{products.length - 4}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
