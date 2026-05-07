import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Trash2, Shield, MapPin, Briefcase, User, Bell, BellOff, Pencil } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { supabase } from '../../lib/supabase'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { EditProfileModal } from './EditProfileModal'
import type { UserProfile } from '../../types'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  profile: UserProfile | null
  userId: string | undefined
  onSignOut: () => void
  onSaveProfile: (values: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

const countryLabel: Record<string, string> = { IT: '🇮🇹 Italia', CH: '🇨🇭 Svizzera' }
const businessLabel: Record<string, string> = { freelance: 'Freelance', salone: 'Salone' }
const genderLabel: Record<string, string> = { F: 'Femminile', M: 'Maschile', N: 'Neutro' }

export function SettingsModal({ open, onClose, profile, userId, onSignOut, onSaveProfile }: SettingsModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { permission, subscribed, subscribe } = usePushNotifications(userId)

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      if (!res.ok) throw new Error('Errore durante la cancellazione')
      await supabase.auth.signOut()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore')
      setDeleting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Impostazioni">
      <div className="space-y-5">

        {/* Profile summary */}
        {profile && (
          <div className="bg-cream-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-warm-600 uppercase tracking-wide">
                <User size={12} />
                Il tuo profilo
              </div>
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 text-xs text-warm-500 hover:text-warm-800 transition-colors"
              >
                <Pencil size={12} />
                Modifica
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-warm-800">
                <span className="font-medium">{profile.display_name}</span>
              </div>
              {profile.first_name && (
                <div className="flex items-center gap-2 text-sm text-warm-600">
                  <span>{profile.first_name} · {genderLabel[profile.gender]}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-warm-600">
                <Briefcase size={13} className="text-warm-400" />
                {businessLabel[profile.business_type]}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-warm-600">
                <MapPin size={13} className="text-warm-400" />
                {countryLabel[profile.country]}{profile.city ? ` · ${profile.city}` : ''}
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {'Notification' in window && (
          <button
            onClick={subscribe}
            disabled={permission === 'denied' || subscribed}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-cream-200 bg-white hover:border-cream-400 transition-colors disabled:opacity-50"
          >
            {subscribed || permission === 'granted' ? (
              <Bell size={16} className="text-emerald-500" />
            ) : (
              <BellOff size={16} className="text-warm-400" />
            )}
            <div className="text-left">
              <p className="text-sm text-warm-700">
                {subscribed ? 'Notifiche attive' : permission === 'denied' ? 'Notifiche bloccate' : 'Attiva notifiche scadenze'}
              </p>
              {!subscribed && permission !== 'denied' && (
                <p className="text-xs text-warm-400">Avviso 7 e 30 giorni prima della scadenza</p>
              )}
            </div>
          </button>
        )}

        {/* Privacy & Terms */}
        <Link
          to="/privacy"
          onClick={onClose}
          className="flex items-center gap-3 p-3 rounded-xl border border-cream-200 bg-white hover:border-cream-400 transition-colors"
        >
          <Shield size={16} className="text-warm-500" />
          <span className="text-sm text-warm-700">Privacy Policy</span>
        </Link>
        <Link
          to="/terms"
          onClick={onClose}
          className="flex items-center gap-3 p-3 rounded-xl border border-cream-200 bg-white hover:border-cream-400 transition-colors"
        >
          <Shield size={16} className="text-warm-500" />
          <span className="text-sm text-warm-700">Termini di Servizio</span>
        </Link>

        {/* Logout */}
        <button
          onClick={() => { onSignOut(); onClose() }}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-cream-200 bg-white hover:border-cream-400 transition-colors"
        >
          <LogOut size={16} className="text-warm-500" />
          <span className="text-sm text-warm-700">Esci dall'account</span>
        </button>

        {/* Delete account */}
        <div className="border-t border-cream-200 pt-4 space-y-3">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} className="text-red-500" />
              <span className="text-sm text-red-600">Cancella account e dati</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
                <p className="text-sm font-medium text-red-800">Sei sicura/o?</p>
                <p className="text-xs text-red-600">
                  Tutti i tuoi prodotti, dati e profilo verranno eliminati definitivamente. Questa azione non può essere annullata.
                </p>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setConfirmDelete(false)} className="flex-1">
                  Annulla
                </Button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-50 transition-colors hover:bg-red-700"
                >
                  {deleting ? 'Eliminazione...' : 'Sì, elimina tutto'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {profile && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profile={profile}
          onSave={onSaveProfile}
        />
      )}
    </Modal>
  )
}
