import { differenceInDays, parseISO, format } from 'date-fns'
import { it } from 'date-fns/locale'
import { TrendingDown, Clock, AlertCircle } from 'lucide-react'
import type { ConsumptionStats as Stats } from '../../types'

export function ConsumptionStats({ stats }: { stats: Stats[] }) {
  const withData = stats.filter(s => s.days_per_cycle !== null)
  const predictions = stats.filter(s => s.predicted_runout !== null)

  if (stats.length === 0) {
    return (
      <div className="text-center py-8 text-warm-400 text-sm">
        Aggiungi prodotti per tracciare i consumi
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {predictions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-warm-500 uppercase tracking-wider">Previsioni esaurimento</h3>
          {predictions.map(s => {
            const days = differenceInDays(parseISO(s.predicted_runout!), new Date())
            const urgent = days <= 14
            return (
              <div
                key={s.product_id}
                className={`card p-3 flex items-center gap-3 border-l-4 ${urgent ? 'border-l-amber-400' : 'border-l-cream-300'}`}
              >
                <AlertCircle size={18} className={urgent ? 'text-amber-500' : 'text-warm-400'} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-900 truncate">{s.product_name}</p>
                  {s.brand && <p className="text-xs text-warm-500">{s.brand}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${urgent ? 'text-amber-600' : 'text-warm-700'}`}>
                    {days > 0 ? `${days}g` : 'Finito'}
                  </p>
                  <p className="text-[10px] text-warm-400">
                    ~{format(parseISO(s.predicted_runout!), 'd MMM', { locale: it })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {withData.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-warm-500 uppercase tracking-wider">Velocità consumo</h3>
          {withData.map(s => (
            <div key={s.product_id} className="card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cream-100 flex items-center justify-center">
                <TrendingDown size={16} className="text-warm-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-900 truncate">{s.product_name}</p>
                <p className="text-xs text-warm-500">{s.cycles_recorded} cicli registrati</p>
              </div>
              <div className="flex items-center gap-1 text-warm-700 shrink-0">
                <Clock size={13} />
                <span className="text-sm font-medium">{s.days_per_cycle}g/ciclo</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {withData.length === 0 && (
        <p className="text-sm text-warm-400 text-center py-4">
          Sono necessari almeno 2 cicli completi (alta→bassa→alta) per calcolare la velocità.
        </p>
      )}
    </div>
  )
}
