import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { NormativaCard } from '../components/normative/NormativaCard'
import { Loading } from '../components/ui/Loading'
import type { Normativa, Product } from '../types'

type Filter = 'tutte' | 'urgente' | 'attenzione' | 'info' | 'impattanti'

interface NormativeProps {
  normative: Normativa[]
  loading: boolean
  getAffectedProducts: (n: Normativa) => Product[]
}

export function Normative({ normative, loading, getAffectedProducts }: NormativeProps) {
  const location = useLocation()
  const initialFilter = ((location.state as { filter?: string } | null)?.filter ?? 'tutte') as Filter
  const [filter, setFilter] = useState<Filter>(initialFilter)
  const [expanded, setExpanded] = useState<string | null>(null)

  const filters: { key: Filter; label: string }[] = [
    { key: 'tutte', label: 'Tutte' },
    { key: 'urgente', label: 'Urgenti' },
    { key: 'attenzione', label: 'Attenzione' },
    { key: 'info', label: 'Info' },
    { key: 'impattanti', label: 'Sul mio magazzino' },
  ]

  const filtered = normative.filter(n => {
    if (filter === 'tutte') return true
    if (filter === 'impattanti') return getAffectedProducts(n).length > 0
    return n.severity === filter
  })

  const header = (
    <div className="flex items-center gap-3">
      <BookOpen size={20} className="text-warm-700" />
      <h1 className="section-title">Normative</h1>
    </div>
  )

  return (
    <Layout header={header}>
      {/* Filter chips */}
      <div className="-mx-4 px-4 overflow-x-auto flex gap-2 pb-3 scrollbar-hide">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f.key
                ? 'bg-warm-900 text-white border-warm-900'
                : 'bg-white text-warm-600 border-cream-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <BookOpen size={36} className="text-cream-300 mx-auto" />
          <p className="text-warm-400 text-sm">Nessuna normativa trovata</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <NormativaCard
              key={n.id}
              normativa={n}
              affectedProducts={getAffectedProducts(n)}
              expanded={expanded === n.id}
              onPress={() => setExpanded(prev => prev === n.id ? null : n.id)}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}
