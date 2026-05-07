import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import { useProducts } from './hooks/useProducts'
import { useNormative } from './hooks/useNormative'
import { useAnalytics } from './hooks/useAnalytics'
import { Auth } from './pages/Auth'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { Magazzino } from './pages/Magazzino'
import { Normative } from './pages/Normative'
import { Analytics } from './pages/Analytics'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { Loading } from './components/ui/Loading'

function AppContent() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, saveProfile } = useProfile(user?.id)
  const { products, loading: productsLoading, addProduct, updateProduct, updateQuantity, deleteProduct } = useProducts()
  const { normative, loading: normativeLoading, getAffectedProducts, relevantNormative } = useNormative(products, profile?.country)
  const { getConsumptionStats, getBrandStats, suppliers, priceAlerts, loading: analyticsLoading, addSupplier, deleteSupplier } = useAnalytics(products)

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen">
        <Loading text="BeautyShelf..." />
      </div>
    )
  }

  // Privacy accessible without auth
  if (window.location.pathname === '/privacy') return <Privacy />
  if (window.location.pathname === '/terms') return <Terms />

  if (!user) return <Auth />

  if (!profile) return <Onboarding onComplete={saveProfile} />

  const consumptionStats = getConsumptionStats()
  const brandStats = getBrandStats()
  const flaggedProducts = products.filter(p => p.flagged)
  const lastNormativa = normative[0] ?? null

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            products={products}
            normativeAlerts={relevantNormative.length}
            lastNormativa={lastNormativa}
            flaggedProducts={flaggedProducts}
            loadingProducts={productsLoading}
            profile={profile}
            onAddProduct={async (p) => { await addProduct(p) }}
            onQuantityChange={updateQuantity}
          />
        }
      />
      <Route
        path="/magazzino"
        element={
          <Magazzino
            products={products}
            loading={productsLoading}
            onAddProduct={async (p) => { await addProduct(p) }}
            onQuantityChange={updateQuantity}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        }
      />
      <Route
        path="/normative"
        element={
          <Normative
            normative={normative}
            loading={normativeLoading}
            getAffectedProducts={getAffectedProducts}
          />
        }
      />
      <Route
        path="/analytics"
        element={
          <Analytics
            products={products}
            consumptionStats={consumptionStats}
            brandStats={brandStats}
            suppliers={suppliers}
            priceAlerts={priceAlerts}
            loading={analyticsLoading}
            onAddSupplier={addSupplier}
            onDeleteSupplier={deleteSupplier}
          />
        }
      />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
