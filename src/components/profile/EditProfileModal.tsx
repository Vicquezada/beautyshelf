import { useState } from 'react'
import { MapPin, Scissors, Store } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { BusinessType, Country, Gender, Specialization, UserProfile } from '../../types'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
  profile: UserProfile
  onSave: (values: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

const SPECIALIZATIONS: { key: Specialization; label: string; emoji: string }[] = [
  { key: 'viso', label: 'Viso', emoji: '✨' },
  { key: 'corpo', label: 'Corpo', emoji: '💆' },
  { key: 'unghie', label: 'Unghie', emoji: '💅' },
  { key: 'epilazione', label: 'Epilazione', emoji: '🪒' },
  { key: 'massaggio', label: 'Massaggio', emoji: '🤲' },
  { key: 'trucco', label: 'Make-up', emoji: '💄' },
]

const GENDERS: { key: Gender; label: string }[] = [
  { key: 'F', label: 'Femminile' },
  { key: 'M', label: 'Maschile' },
  { key: 'N', label: 'Neutro' },
]

export function EditProfileModal({ open, onClose, profile, onSave }: EditProfileModalProps) {
  const [firstName, setFirstName] = useState(profile.first_name ?? '')
  const [gender, setGender] = useState<Gender>(profile.gender)
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [businessType, setBusinessType] = useState<BusinessType>(profile.business_type)
  const [country, setCountry] = useState<Country>(profile.country)
  const [city, setCity] = useState(profile.city ?? '')
  const [specializations, setSpecializations] = useState<Specialization[]>(profile.specializations)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleSpec = (s: Specialization) =>
    setSpecializations(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleSave = async () => {
    if (!displayName.trim()) { setError('Nome studio obbligatorio'); return }
    setLoading(true)
    setError(null)
    try {
      await onSave({
        first_name: firstName.trim() || null,
        gender,
        display_name: displayName.trim(),
        business_type: businessType,
        country,
        city: city.trim() || null,
        specializations,
      })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore salvataggio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Modifica profilo">
      <div className="space-y-5">

        {/* Nome personale */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-warm-600 uppercase tracking-wide">Il tuo nome</label>
          <input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="es. Sara"
            className="w-full px-4 py-3 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400"
          />
        </div>

        {/* Genere */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-warm-600 uppercase tracking-wide">Come preferisci essere chiamata/o?</label>
          <div className="grid grid-cols-3 gap-2">
            {GENDERS.map(g => (
              <button
                key={g.key}
                onClick={() => setGender(g.key)}
                className={`py-2.5 px-3 rounded-xl border-2 text-xs font-medium transition-all ${
                  gender === g.key
                    ? 'border-warm-900 bg-warm-900 text-white'
                    : 'border-cream-200 bg-white text-warm-700'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nome studio */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-warm-600 uppercase tracking-wide">Nome studio / salone</label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="es. Studio Estetica Sara"
            className="w-full px-4 py-3 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400"
          />
        </div>

        {/* Tipo attività */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-warm-600 uppercase tracking-wide">Tipo attività</label>
          <div className="grid grid-cols-2 gap-2">
            {([['freelance', 'Freelance', Scissors], ['salone', 'Salone', Store]] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setBusinessType(key)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  businessType === key
                    ? 'border-warm-900 bg-warm-900 text-white'
                    : 'border-cream-200 bg-white text-warm-700'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Paese */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-warm-600 uppercase tracking-wide">Paese</label>
          <div className="grid grid-cols-2 gap-2">
            {([['IT', '🇮🇹 Italia'], ['CH', '🇨🇭 Svizzera']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setCountry(key)}
                className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  country === key
                    ? 'border-warm-900 bg-warm-900 text-white'
                    : 'border-cream-200 bg-white text-warm-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Città */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-warm-600 uppercase tracking-wide">
            Città <span className="text-warm-400 normal-case">(opzionale)</span>
          </label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="es. Milano"
              className="w-full pl-9 pr-4 py-3 text-sm border border-cream-200 rounded-xl bg-white focus:outline-none focus:border-cream-400"
            />
          </div>
        </div>

        {/* Specializzazioni */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-warm-600 uppercase tracking-wide">Specializzazioni</label>
          <div className="grid grid-cols-2 gap-2">
            {SPECIALIZATIONS.map(s => (
              <button
                key={s.key}
                onClick={() => toggleSpec(s.key)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                  specializations.includes(s.key)
                    ? 'border-warm-900 bg-warm-900 text-white'
                    : 'border-cream-200 bg-white text-warm-700'
                }`}
              >
                <span>{s.emoji}</span>
                <span className="text-sm font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <Button onClick={handleSave} loading={loading} className="w-full">
          Salva modifiche
        </Button>
      </div>
    </Modal>
  )
}
