import { useState, useMemo } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { differenceInDays, parseISO } from 'date-fns'
import { Layout } from '../components/layout/Layout'
import { ProductCard } from '../components/products/ProductCard'
import { AddProductModal } from '../components/products/AddProductModal'
import { ProductForm } from '../components/products/ProductForm'
import { Modal } from '../components/ui/Modal'
import { Loading } from '../components/ui/Loading'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import type { Product, QuantityLevel } from '../types'

const CATEGORIES = [
  'Tutti', 'Siero', 'Crema viso', 'Crema corpo', 'Maschera', 'Detergente',
  'Tonico', 'SPF', 'Shampoo', 'Balsamo', 'Trattamento capelli', 'Smalto', 'Olio', 'Peeling', 'Altro',
]

interface MagazzinoProps {
  products: Product[]
  loading: boolean
  onAddProduct: (p: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onQuantityChange: (id: string, q: QuantityLevel) => void
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>
  onDeleteProduct: (id: string) => Promise<void>
}

export function Magazzino({ products, loading, onAddProduct, onQuantityChange, onUpdateProduct, onDeleteProduct }: MagazzinoProps) {
  const location = useLocation()
  const locationFilter = (location.state as { filter?: string } | null)?.filter ?? null

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Tutti')
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || [p.name, p.brand, p.category].some(
        f => f?.toLowerCase().includes(search.toLowerCase())
      )
      const matchCat = category === 'Tutti' || p.category === category

      if (locationFilter === 'bassa') return matchSearch && p.quantity === 'bassa'
      if (locationFilter === 'expiring') {
        if (!p.expiry_date) return false
        const days = differenceInDays(parseISO(p.expiry_date), new Date())
        return matchSearch && days <= 60
      }

      return matchSearch && matchCat
    })
  }, [products, search, category])

  const handleDelete = async () => {
    if (!selected) return
    setDeleting(true)
    try {
      await onDeleteProduct(selected.id)
      setSelected(null)
    } finally {
      setDeleting(false)
    }
  }

  const header = (
    <div className="space-y-3">
      <h1 className="section-title">Magazzino</h1>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca prodotto, brand..."
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <Layout header={header}>
      {/* Category chips */}
      <div className="-mx-4 px-4 overflow-x-auto flex gap-2 pb-3 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              category === cat
                ? 'bg-warm-900 text-white border-warm-900'
                : 'bg-white text-warm-600 border-cream-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-warm-400 text-sm">
              {search || category !== 'Tutti' ? 'Nessun prodotto trovato' : 'Magazzino vuoto'}
            </div>
          ) : (
            filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onQuantityChange={onQuantityChange}
                onPress={() => setSelected(p)}
              />
            ))
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-warm-900 text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform z-30"
      >
        <Plus size={24} />
      </button>

      <AddProductModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={onAddProduct} />

      {/* Product detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
      >
        {selected && (
          <div className="space-y-4">
            <ProductForm
              initialData={selected}
              onSubmit={async (data) => {
                await onUpdateProduct(selected.id, data)
                setSelected(null)
              }}
              onCancel={() => setSelected(null)}
            />
            <div className="pt-2 border-t border-cream-100">
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
                className="w-full"
              >
                Elimina prodotto
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
