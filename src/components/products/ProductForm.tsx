import { useState } from 'react'
import { Button } from '../ui/Button'
import type { Product, QuantityLevel, ClaudeProductResult } from '../../types'

const CATEGORIES = [
  'Siero', 'Crema viso', 'Crema corpo', 'Maschera', 'Detergente',
  'Tonico', 'Contorno occhi', 'SPF', 'Shampoo', 'Balsamo',
  'Trattamento capelli', 'Smalto', 'Olio', 'Peeling', 'Altro',
]

type FormData = Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>

interface ProductFormProps {
  initialData?: Partial<FormData>
  prefilled?: ClaudeProductResult
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ initialData, prefilled, onSubmit, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<FormData>({
    name: prefilled?.name ?? initialData?.name ?? '',
    brand: prefilled?.brand ?? initialData?.brand ?? '',
    category: prefilled?.category ?? initialData?.category ?? '',
    expiry_date: prefilled?.expiry_date ?? initialData?.expiry_date ?? '',
    quantity: initialData?.quantity ?? 'alta',
    ingredients: prefilled?.ingredients ?? initialData?.ingredients ?? [],
    image_urls: initialData?.image_urls ?? [],
    flagged: initialData?.flagged ?? false,
    flag_reason: initialData?.flag_reason ?? null,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Nome prodotto obbligatorio'); return }
    setSaving(true)
    setError(null)
    try {
      await onSubmit(form)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore salvataggio')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {prefilled && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800">
          Dati pre-compilati dall'AI — verifica e correggi se necessario.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-medium text-warm-700">Nome prodotto *</label>
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="es. Crema Idratante"
          className="w-full px-3 py-2.5 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-100"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-warm-700">Brand</label>
        <input
          value={form.brand ?? ''}
          onChange={e => set('brand', e.target.value || null)}
          placeholder="es. La Roche-Posay"
          className="w-full px-3 py-2.5 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-100"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-warm-700">Categoria</label>
        <select
          value={form.category ?? ''}
          onChange={e => set('category', e.target.value || null)}
          className="w-full px-3 py-2.5 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400"
        >
          <option value="">Seleziona categoria</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-warm-700">Data scadenza</label>
        <input
          type="date"
          value={form.expiry_date ?? ''}
          onChange={e => set('expiry_date', e.target.value || null)}
          className="w-full px-3 py-2.5 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-warm-700">Quantità disponibile</label>
        <div className="grid grid-cols-3 gap-2">
          {(['alta', 'media', 'bassa'] as QuantityLevel[]).map(q => (
            <button
              key={q}
              onClick={() => set('quantity', q)}
              className={`py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${
                form.quantity === q
                  ? 'border-warm-900 bg-warm-900 text-white'
                  : 'border-cream-200 bg-white text-warm-700'
              }`}
            >
              {q.charAt(0).toUpperCase() + q.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {form.ingredients && form.ingredients.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-warm-700">Ingredienti INCI rilevati</label>
          <div className="bg-cream-50 rounded-xl p-3 text-xs text-warm-600 max-h-24 overflow-y-auto">
            {form.ingredients.join(', ')}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Annulla
        </Button>
        <Button onClick={handleSubmit} loading={saving} className="flex-1">
          Salva prodotto
        </Button>
      </div>
    </div>
  )
}
