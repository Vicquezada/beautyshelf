import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { ExternalLink, Package } from 'lucide-react'
import { Badge } from '../ui/Badge'
import type { Normativa, Product } from '../../types'

interface NormativaCardProps {
  normativa: Normativa
  affectedProducts?: Product[]
  expanded?: boolean
  onPress?: () => void
}

const severityLabel: Record<string, string> = {
  urgente: 'Urgente',
  attenzione: 'Attenzione',
  info: 'Info',
}

export function NormativaCard({ normativa, affectedProducts = [], expanded = false, onPress }: NormativaCardProps) {
  return (
    <div
      className={`card p-4 space-y-3 cursor-pointer active:scale-[0.99] transition-transform`}
      onClick={onPress}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant={normativa.severity as 'urgente' | 'attenzione' | 'info'}>
              {severityLabel[normativa.severity]}
            </Badge>
            {normativa.category && (
              <Badge variant="neutral">{normativa.category}</Badge>
            )}
          </div>
          <h3 className="font-medium text-warm-900 text-sm leading-snug">{normativa.title}</h3>
          <p className="text-xs text-warm-400 mt-0.5">
            {format(parseISO(normativa.date), 'd MMMM yyyy', { locale: it })}
            {normativa.source && ` · ${normativa.source}`}
          </p>
        </div>
      </div>

      {normativa.summary && (
        <p className={`text-sm text-warm-600 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {normativa.summary}
        </p>
      )}

      {affectedProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
            <Package size={13} />
            {affectedProducts.length} prodotto/i nel magazzino interessato/i
          </div>
          {affectedProducts.slice(0, 3).map(p => (
            <div key={p.id} className="text-xs text-amber-700 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
              {p.name} {p.brand ? `· ${p.brand}` : ''}
            </div>
          ))}
          {affectedProducts.length > 3 && (
            <p className="text-xs text-amber-600">+{affectedProducts.length - 3} altri</p>
          )}
        </div>
      )}

      {normativa.source && (
        <div className="flex items-center gap-1 text-xs text-cream-500">
          <ExternalLink size={11} />
          Fonte: {normativa.source}
        </div>
      )}
    </div>
  )
}
