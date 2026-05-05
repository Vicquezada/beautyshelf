import { useState } from 'react'
import { Scissors, Store, MapPin, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import type { BusinessType, Country, Specialization, UserProfile } from '../types'

interface OnboardingProps {
  onComplete: (values: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

const SPECIALIZATIONS: { key: Specialization; label: string; emoji: string }[] = [
  { key: 'viso', label: 'Viso', emoji: '✨' },
  { key: 'corpo', label: 'Corpo', emoji: '💆' },
  { key: 'unghie', label: 'Unghie', emoji: '💅' },
  { key: 'epilazione', label: 'Epilazione', emoji: '🪒' },
  { key: 'massaggio', label: 'Massaggio', emoji: '🤲' },
  { key: 'trucco', label: 'Make-up', emoji: '💄' },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [displayName, setDisplayName] = useState('')
  const [businessType, setBusinessType] = useState<BusinessType | null>(null)
  const [country, setCountry] = useState<Country | null>(null)
  const [city, setCity] = useState('')
  const [specializations, setSpecializations] = useState<Specialization[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleSpec = (s: Specialization) =>
    setSpecializations(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )

  const canNext1 = displayName.trim().length >= 2 && businessType !== null
  const canNext2 = country !== null

  const handleFinish = async () => {
    if (!country || !businessType) return
    setLoading(true)
    setError(null)
    try {
      await onComplete({
        display_name: displayName.trim(),
        business_type: businessType,
        country,
        city: city.trim() || null,
        specializations,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore salvataggio')
      setLoading(false)
    }
  }

  return (
    <div className="app-shell flex flex-col min-h-screen px-6 py-10">
      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-warm-900' : 'bg-cream-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1 — Chi sei */}
      {step === 1 && (
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="font-display text-3xl font-semibold text-warm-900 mb-1">Benvenuta 👋</h1>
            <p className="text-warm-500 text-sm">Parliamo un po' di te per personalizzare l'app.</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-warm-600 uppercase tracking-wide">
              Come si chiama il tuo studio / salone?
            </label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="es. Studio Estetica Marta"
              className="w-full px-4 py-3 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-100"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-warm-600 uppercase tracking-wide">Lavori come...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBusinessType('freelance')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                  businessType === 'freelance'
                    ? 'border-warm-900 bg-warm-900 text-white'
                    : 'border-cream-200 bg-white text-warm-700'
                }`}
              >
                <Scissors size={24} />
                <span className="text-sm font-medium">Freelance</span>
                <span className={`text-xs ${businessType === 'freelance' ? 'text-white/70' : 'text-warm-400'}`}>
                  Lavoro in autonomia
                </span>
              </button>
              <button
                onClick={() => setBusinessType('salone')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                  businessType === 'salone'
                    ? 'border-warm-900 bg-warm-900 text-white'
                    : 'border-cream-200 bg-white text-warm-700'
                }`}
              >
                <Store size={24} />
                <span className="text-sm font-medium">Salone</span>
                <span className={`text-xs ${businessType === 'salone' ? 'text-white/70' : 'text-warm-400'}`}>
                  Ho uno studio fisso
                </span>
              </button>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => setStep(2)}
              disabled={!canNext1}
              size="lg"
              className="w-full"
            >
              Continua →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Dove sei */}
      {step === 2 && (
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="font-display text-3xl font-semibold text-warm-900 mb-1">Dove lavori?</h1>
            <p className="text-warm-500 text-sm">Le normative cambiano in base al paese — mostreremo solo quelle rilevanti per te.</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-warm-600 uppercase tracking-wide">Paese</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCountry('IT')}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                  country === 'IT'
                    ? 'border-warm-900 bg-warm-900 text-white'
                    : 'border-cream-200 bg-white text-warm-700'
                }`}
              >
                <span className="text-3xl">🇮🇹</span>
                <span className="text-sm font-medium">Italia</span>
              </button>
              <button
                onClick={() => setCountry('CH')}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                  country === 'CH'
                    ? 'border-warm-900 bg-warm-900 text-white'
                    : 'border-cream-200 bg-white text-warm-700'
                }`}
              >
                <span className="text-3xl">🇨🇭</span>
                <span className="text-sm font-medium">Svizzera</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-warm-600 uppercase tracking-wide">
              Città <span className="text-warm-400 normal-case">(opzionale)</span>
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400" />
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="es. Milano"
                className="w-full pl-9 pr-4 py-3 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-100"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
              ← Indietro
            </Button>
            <Button onClick={() => setStep(3)} disabled={!canNext2} className="flex-1">
              Continua →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Specializzazioni */}
      {step === 3 && (
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="font-display text-3xl font-semibold text-warm-900 mb-1">Di cosa ti occupi?</h1>
            <p className="text-warm-500 text-sm">Seleziona le tue specializzazioni — anche più di una.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SPECIALIZATIONS.map(s => (
              <button
                key={s.key}
                onClick={() => toggleSpec(s.key)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                  specializations.includes(s.key)
                    ? 'border-warm-900 bg-warm-900 text-white'
                    : 'border-cream-200 bg-white text-warm-700'
                }`}
              >
                <span className="text-xl">{s.emoji}</span>
                <span className="text-sm font-medium">{s.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
              ← Indietro
            </Button>
            <Button onClick={handleFinish} loading={loading} className="flex-1">
              <Sparkles size={15} />
              Inizia →
            </Button>
          </div>

          <button
            onClick={handleFinish}
            className="w-full text-xs text-warm-400 hover:text-warm-600 transition-colors"
          >
            Salta questo step
          </button>
        </div>
      )}
    </div>
  )
}
