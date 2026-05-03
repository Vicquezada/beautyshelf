import { useState } from 'react'
import { Plus, Trash2, Globe, Tag } from 'lucide-react'
import { Button } from '../ui/Button'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import type { UserSupplier, PriceAlert, Product } from '../../types'

interface PriceMonitorProps {
  suppliers: UserSupplier[]
  alerts: PriceAlert[]
  products: Product[]
  onAddSupplier: (name: string, url: string) => Promise<void>
  onDeleteSupplier: (id: string) => Promise<void>
}

export function PriceMonitor({ suppliers, alerts, products, onAddSupplier, onDeleteSupplier }: PriceMonitorProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!name.trim() || !url.trim()) { setError('Nome e URL obbligatori'); return }
    setSaving(true)
    setError(null)
    try {
      await onAddSupplier(name.trim(), url.trim())
      setName('')
      setUrl('')
      setShowAddForm(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore salvataggio')
    } finally {
      setSaving(false)
    }
  }

  const getProduct = (id: string) => products.find(p => p.id === id)

  return (
    <div className="space-y-5">
      {/* Price Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-warm-500 uppercase tracking-wider">Promozioni trovate</h3>
          {alerts.map(alert => {
            const product = getProduct(alert.product_id)
            const discount = alert.original_price && alert.discounted_price
              ? Math.round(((alert.original_price - alert.discounted_price) / alert.original_price) * 100)
              : null
            return (
              <div key={alert.id} className="card p-3 flex items-center gap-3 border-l-4 border-l-emerald-400">
                <Tag size={18} className="text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-900 truncate">
                    {product?.name ?? 'Prodotto'}
                  </p>
                  <p className="text-xs text-warm-500">
                    {format(parseISO(alert.found_at), 'd MMM yyyy', { locale: it })}
                  </p>
                </div>
                {discount !== null && (
                  <span className="shrink-0 bg-emerald-100 text-emerald-700 text-sm font-semibold px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Suppliers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-warm-500 uppercase tracking-wider">Distributori monitorati</h3>
          <Button size="sm" variant="ghost" onClick={() => setShowAddForm(v => !v)}>
            <Plus size={14} />
            Aggiungi
          </Button>
        </div>

        {showAddForm && (
          <div className="card p-4 space-y-3">
            {error && <p className="text-xs text-red-600">{error}</p>}
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome distributore"
              className="w-full px-3 py-2 text-sm border border-cream-200 rounded-xl focus:outline-none focus:border-cream-400"
            />
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://distributore.it"
              type="url"
              className="w-full px-3 py-2 text-sm border border-cream-200 rounded-xl focus:outline-none focus:border-cream-400"
            />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowAddForm(false)} className="flex-1">
                Annulla
              </Button>
              <Button size="sm" onClick={handleAdd} loading={saving} className="flex-1">
                Salva
              </Button>
            </div>
          </div>
        )}

        {suppliers.length === 0 && !showAddForm && (
          <p className="text-sm text-warm-400 text-center py-4">
            Nessun distributore. Aggiungine uno per monitorare le promozioni.
          </p>
        )}

        {suppliers.map(s => (
          <div key={s.id} className="card p-3 flex items-center gap-3">
            <Globe size={16} className="text-warm-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-900">{s.name}</p>
              <p className="text-xs text-warm-400 truncate">{s.url}</p>
            </div>
            <button
              onClick={() => onDeleteSupplier(s.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-warm-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-cream-100 rounded-xl p-3 text-xs text-warm-500 text-center">
        Il monitoraggio prezzi richiede un job periodico lato server (Supabase Edge Function + cron).
      </div>
    </div>
  )
}
