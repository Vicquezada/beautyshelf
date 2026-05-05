import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { AlertTriangle, ExternalLink, FlaskConical, Package, ShieldAlert } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import type { Normativa, Product } from '../../types'

interface NormativaDetailModalProps {
  normativa: Normativa | null
  affectedProducts: Product[]
  onClose: () => void
}

const severityLabel: Record<string, string> = {
  urgente: 'Urgente',
  attenzione: 'Attenzione',
  info: 'Info',
}

function getMatchedIngredients(product: Product, normativa: Normativa): string[] {
  if (!normativa.affected_ingredients?.length || !product.ingredients?.length) return []
  const affected = normativa.affected_ingredients.map(i => i.toLowerCase())
  return product.ingredients.filter(ing =>
    affected.some(a => ing.toLowerCase().includes(a))
  )
}

const severityConfig = {
  urgente: {
    icon: ShieldAlert,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-500',
    reason: 'Questo ingrediente è stato vietato o ritirato dal mercato. I prodotti che lo contengono non possono essere utilizzati o venduti.',
  },
  attenzione: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
    reason: 'Questo ingrediente è sotto restrizione o monitoraggio. Verifica le concentrazioni consentite o considera di sostituire il prodotto.',
  },
  info: {
    icon: FlaskConical,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-500',
    reason: 'Nuova regolamentazione in arrivo. Tieniti aggiornata sugli sviluppi futuri.',
  },
}

export function NormativaDetailModal({ normativa, affectedProducts, onClose }: NormativaDetailModalProps) {
  if (!normativa) return null

  const cfg = severityConfig[normativa.severity as keyof typeof severityConfig] ?? severityConfig.info
  const Icon = cfg.icon

  const productsWithMatches = affectedProducts.map(p => ({
    product: p,
    matched: getMatchedIngredients(p, normativa),
  }))

  return (
    <Modal open={!!normativa} onClose={onClose} title="Dettaglio normativa">
      <div className="space-y-5">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={normativa.severity as 'urgente' | 'attenzione' | 'info'}>
              {severityLabel[normativa.severity]}
            </Badge>
            {normativa.category && <Badge variant="neutral">{normativa.category}</Badge>}
          </div>
          <h2 className="font-medium text-warm-900 text-base leading-snug">{normativa.title}</h2>
          <p className="text-xs text-warm-400">
            {format(parseISO(normativa.date), 'd MMMM yyyy', { locale: it })}
            {normativa.source && ` · ${normativa.source}`}
          </p>
        </div>

        {/* Summary */}
        {normativa.summary && (
          <p className="text-sm text-warm-600 leading-relaxed">{normativa.summary}</p>
        )}

        {/* Affected ingredients */}
        {normativa.affected_ingredients?.length ? (
          <div className={`${cfg.bg} ${cfg.border} border rounded-xl p-4 space-y-3`}>
            <div className={`flex items-center gap-2 text-sm font-medium ${cfg.text}`}>
              <Icon size={15} className={cfg.iconColor} />
              Ingredienti coinvolti
            </div>
            <div className="flex flex-wrap gap-2">
              {normativa.affected_ingredients.map(ing => (
                <span
                  key={ing}
                  className={`text-xs px-2.5 py-1 rounded-full font-mono ${cfg.bg} ${cfg.border} border ${cfg.text}`}
                >
                  {ing}
                </span>
              ))}
            </div>
            <p className={`text-xs ${cfg.text} opacity-80 leading-relaxed`}>{cfg.reason}</p>
          </div>
        ) : null}

        {/* Affected products */}
        {productsWithMatches.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-warm-700">
              <Package size={13} />
              {productsWithMatches.length} prodotto/i nel tuo magazzino
            </div>
            <div className="space-y-2">
              {productsWithMatches.map(({ product, matched }) => (
                <div
                  key={product.id}
                  className="bg-white border border-cream-200 rounded-xl p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-warm-900">{product.name}</p>
                      {product.brand && <p className="text-xs text-warm-400">{product.brand}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                      {matched.length} ingrediente/i
                    </span>
                  </div>
                  {matched.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-warm-500">Ingredienti problematici trovati:</p>
                      {matched.map(ing => (
                        <div key={ing} className="flex items-center gap-1.5 text-xs text-warm-700">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.iconColor.replace('text-', 'bg-')}`} />
                          <span className="font-mono">{ing}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {normativa.source && (
          <div className="flex items-center gap-1.5 text-xs text-warm-400 pt-1">
            <ExternalLink size={11} />
            Fonte: {normativa.source}
          </div>
        )}
      </div>
    </Modal>
  )
}
