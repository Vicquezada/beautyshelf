import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async () => {
    if (!email || !password) { setError('Email e password obbligatorie'); return }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        setSuccess('Account creato! Controlla la tua email per la conferma.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore di autenticazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl font-semibold text-warm-900 tracking-tight">
            BeautyShelf
          </h1>
          <p className="text-warm-500 text-sm">
            Gestione professionale del tuo magazzino
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="w-full px-4 py-3 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-100"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-100"
            />
          </div>

          <Button onClick={handleSubmit} loading={loading} size="lg" className="w-full">
            {mode === 'login' ? 'Accedi' : 'Crea account'}
          </Button>

          <button
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null) }}
            className="w-full text-sm text-warm-500 hover:text-warm-700 transition-colors"
          >
            {mode === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>
        </div>
      </div>
    </div>
  )
}
