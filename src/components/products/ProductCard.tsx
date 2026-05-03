import { differenceInDays, parseISO, format } from 'date-fns'
import { it } from 'date-fns/locale'
import { AlertTriangle, ChevronRight, Flag } from 'lucide-react'
import { Badge } from '../ui/Badge'
import type { Product, QuantityLevel } from '../../types'

interface ProductCardProps {
  product: Product
  onQuantityChange?: (id: string, quantity: QuantityLevel) => void
  onPress?: () => void
}

function expiryStatus(dateStr: string | null): 'expired' | 'soon30' | 'soon60' | 'ok' | null {
  if (!dateStr) return null
  const days = differenceInDays(parseISO(dateStr), new Date())
  if (days < 0) return 'expired'
  if (days <= 30) return 'soon30'
  if (days <= 60) return 'soon60'
  return 'ok'
}

const quantityLabels: Record<QuantityLevel, string> = { alta: 'Alta', media: 'Media', bassa: 'Bassa' }
const quantityVariants: Record<QuantityLevel, 'alta' | 'media' | 'bassa'> = { alta: 'alta', media: 'media', bassa: 'bassa' }

export function ProductCard({ product, onQuantityChange, onPress }: ProductCardProps) {
  const status = expiryStatus(product.expiry_date)

  const borderColor =
    product.flagged ? 'border-l-red-400' :
    status === 'expired' ? 'border-l-red-400' :
    status === 'soon30' ? 'border-l-amber-400' :
    status === 'soon60' ? 'border-l-yellow-400' :
    'border-l-transparent'

  return (
    <div
      className={`card border-l-4 ${borderColor} p-4 flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-transform`}
      onClick={onPress}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-warm-900 text-sm truncate">{product.name}</span>
          {product.flagged && <Flag size={13} className="text-red-500 shrink-0" />}
        </div>

        {product.brand && (
          <p className="text-xs text-warm-500 mt-0.5">{product.brand}</p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {product.category && (
            <Badge variant="neutral">{product.category}</Badge>
          )}
          <Badge variant={quantityVariants[product.quantity]}>
            {quantityLabels[product.quantity]}
          </Badge>

          {status === 'expired' && (
            <Badge variant="urgente">
              <AlertTriangle size={10} className="mr-1" />
              Scaduto
            </Badge>
          )}
          {status === 'soon30' && (
            <Badge variant="urgente">
              Scade in {differenceInDays(parseISO(product.expiry_date!), new Date())}g
            </Badge>
          )}
          {status === 'soon60' && (
            <Badge variant="attenzione">
              Scade in {differenceInDays(parseISO(product.expiry_date!), new Date())}g
            </Badge>
          )}
          {status === 'ok' && product.expiry_date && (
            <span className="text-xs text-warm-400">
              Scad. {format(parseISO(product.expiry_date), 'MMM yyyy', { locale: it })}
            </span>
          )}
        </div>

        {product.flagged && product.flag_reason && (
          <p className="text-xs text-red-600 mt-1.5 line-clamp-1">{product.flag_reason}</p>
        )}
      </div>

      {onQuantityChange && (
        <select
          value={product.quantity}
          onChange={e => {
            e.stopPropagation()
            onQuantityChange(product.id, e.target.value as QuantityLevel)
          }}
          onClick={e => e.stopPropagation()}
          className="text-xs bg-cream-50 border border-cream-200 rounded-lg px-2 py-1 text-warm-700"
        >
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="bassa">Bassa</option>
        </select>
      )}

      <ChevronRight size={16} className="text-warm-300 shrink-0" />
    </div>
  )
}
