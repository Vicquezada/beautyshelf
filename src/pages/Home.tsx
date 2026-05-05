import { useState } from 'react'
import { differenceInDays, parseISO, format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Plus, AlertTriangle, Package, BookOpen, TrendingDown, LogOut, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { ProductCard } from '../components/products/ProductCard'
import { AddProductModal } from '../components/products/AddProductModal'
import { Loading } from '../components/ui/Loading'
import { Badge } from '../components/ui/Badge'
import type { Product, UserProfile } from '../types'
import { useAuth } from '../hooks/useAuth'

interface HomeProps {
  products: Product[]
  normativeAlerts: number
  lastNormativa?: { title: string; severity: string; date: string } | null
  flaggedProducts: Product[]
  loadingProducts: boolean
  profile: UserProfile | null
  onAddProduct: (product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onQuantityChange: (id: string, quantity: 'alta' | 'media' | 'bassa') => void
}

export function Home({
  products,
  normativeAlerts,
  lastNormativa,
  flaggedProducts,
  loadingProducts,
  profile,
  onAddProduct,
  onQuantityChange,
}: HomeProps) {
  const [addOpen, setAddOpen] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const expiring = products.filter(p => {
    if (!p.expiry_date) return false
    const days = differenceInDays(parseISO(p.expiry_date), new Date())
    return days >= 0 && days <= 60
  }).sort((a, b) => {
    const dA = differenceInDays(parseISO(a.expiry_date!), new Date())
    const dB = differenceInDays(parseISO(b.expiry_date!), new Date())
    return dA - dB
  })

  const expired = products.filter(p => {
    if (!p.expiry_date) return false
    return differenceInDays(parseISO(p.expiry_date), new Date()) < 0
  })

  const lowStock = products.filter(p => p.quantity === 'bassa')

  const header = (
    <div className="flex items-center justify-between">
      <div>
        {profile?.first_name ? (
          <>
            <p className="text-xs text-warm-400 font-medium uppercase tracking-wide mb-0.5">BeautyShelf</p>
            <h1 className="font-display text-2xl font-semibold text-warm-900">
              Ciao, {profile.first_name} 👋
            </h1>
          </>
        ) : (
          <h1 className="font-display text-2xl font-semibold text-warm-900">BeautyShelf</h1>
        )}
      </div>
      <button
        onClick={() => signOut()}
        className="p-2 rounded-xl text-warm-400 hover:text-warm-700 hover:bg-cream-100 transition-colors"
      >
        <LogOut size={18} />
      </button>
    </div>
  )

  return (
    <Layout header={header}>
      {loadingProducts ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/magazzino')}
              className="card p-4 text-left active:scale-[0.97] transition-transform"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-warm-500" />
                  <span className="text-xs text-warm-500">Prodotti</span>
                </div>
                <ChevronRight size={14} className="text-warm-300" />
              </div>
              <p className="font-display text-3xl font-semibold text-warm-900">{products.length}</p>
            </button>

            <button
              onClick={() => navigate('/magazzino', { state: { filter: 'expiring' } })}
              className={`card p-4 text-left active:scale-[0.97] transition-transform ${expired.length > 0 ? 'border-l-4 border-l-red-400' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className={expired.length > 0 ? 'text-red-500' : 'text-warm-500'} />
                  <span className="text-xs text-warm-500">In scadenza</span>
                </div>
                <ChevronRight size={14} className="text-warm-300" />
              </div>
              <p className={`font-display text-3xl font-semibold ${expired.length > 0 ? 'text-red-600' : 'text-warm-900'}`}>
                {expiring.length + expired.length}
              </p>
            </button>

            <button
              onClick={() => navigate('/normative', { state: { filter: 'impattanti' } })}
              className={`card p-4 text-left active:scale-[0.97] transition-transform ${normativeAlerts > 0 ? 'border-l-4 border-l-amber-400' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className={normativeAlerts > 0 ? 'text-amber-500' : 'text-warm-500'} />
                  <span className="text-xs text-warm-500">Alert normative</span>
                </div>
                <ChevronRight size={14} className="text-warm-300" />
              </div>
              <p className={`font-display text-3xl font-semibold ${normativeAlerts > 0 ? 'text-amber-600' : 'text-warm-900'}`}>
                {normativeAlerts}
              </p>
            </button>

            <button
              onClick={() => navigate('/magazzino', { state: { filter: 'bassa' } })}
              className={`card p-4 text-left active:scale-[0.97] transition-transform ${lowStock.length > 0 ? 'border-l-4 border-l-amber-400' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <TrendingDown size={16} className={lowStock.length > 0 ? 'text-amber-500' : 'text-warm-500'} />
                  <span className="text-xs text-warm-500">Quasi finiti</span>
                </div>
                <ChevronRight size={14} className="text-warm-300" />
              </div>
              <p className={`font-display text-3xl font-semibold ${lowStock.length > 0 ? 'text-amber-600' : 'text-warm-900'}`}>
                {lowStock.length}
              </p>
            </button>
          </div>

          {/* Expired alert */}
          {expired.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-500" />
                <p className="text-sm font-semibold text-red-800">{expired.length} prodotto/i scaduto/i</p>
              </div>
              {expired.map(p => (
                <p key={p.id} className="text-xs text-red-600 ml-6">• {p.name} {p.brand ? `(${p.brand})` : ''}</p>
              ))}
            </div>
          )}

          {/* Last normativa */}
          {lastNormativa && (
            <div className="space-y-2">
              <p className="section-title text-base">Ultima normativa</p>
              <div className="card p-4">
                <div className="flex items-start gap-3">
                  <Badge variant={lastNormativa.severity as 'urgente' | 'attenzione' | 'info'}>
                    {lastNormativa.severity}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-warm-900 line-clamp-2">{lastNormativa.title}</p>
                    <p className="text-xs text-warm-400 mt-1">
                      {format(parseISO(lastNormativa.date), 'd MMM yyyy', { locale: it })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Flagged products */}
          {flaggedProducts.length > 0 && (
            <div className="space-y-2">
              <p className="section-title text-base">Non conformi</p>
              <div className="space-y-2">
                {flaggedProducts.map(p => (
                  <ProductCard key={p.id} product={p} onQuantityChange={onQuantityChange} />
                ))}
              </div>
            </div>
          )}

          {/* Expiring */}
          {expiring.length > 0 && (
            <div className="space-y-2">
              <p className="section-title text-base">In scadenza entro 60 giorni</p>
              <div className="space-y-2">
                {expiring.map(p => (
                  <ProductCard key={p.id} product={p} onQuantityChange={onQuantityChange} />
                ))}
              </div>
            </div>
          )}

          {products.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <Package size={40} className="text-cream-300 mx-auto" />
              <p className="text-warm-500 text-sm">Nessun prodotto nel magazzino</p>
              <p className="text-warm-400 text-xs">Aggiungi il tuo primo prodotto!</p>
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-warm-900 text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-transform z-30"
        style={{ right: '1rem' }}
      >
        <Plus size={24} />
      </button>

      <AddProductModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={onAddProduct}
      />
    </Layout>
  )
}
