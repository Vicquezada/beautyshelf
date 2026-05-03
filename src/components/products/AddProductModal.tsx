import { useState } from 'react'
import { Camera, PenLine } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { PhotoCapture } from './PhotoCapture'
import { ProductForm } from './ProductForm'
import type { Product, ClaudeProductResult } from '../../types'
import { supabase } from '../../lib/supabase'

interface AddProductModalProps {
  open: boolean
  onClose: () => void
  onAdd: (product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
}

type Step = 'choose' | 'photo' | 'form'

export function AddProductModal({ open, onClose, onAdd }: AddProductModalProps) {
  const [step, setStep] = useState<Step>('choose')
  const [prefilled, setPrefilled] = useState<ClaudeProductResult | undefined>()
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [token, setToken] = useState<string>('')

  const handleOpen = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setToken(session?.access_token ?? '')
  }

  const handlePhotoResult = (result: ClaudeProductResult) => {
    setPrefilled(result)
    setStep('form')
  }

  const handleSubmit = async (data: Parameters<typeof onAdd>[0]) => {
    await onAdd(data)
    handleClose()
  }

  const handleClose = () => {
    setStep('choose')
    setPrefilled(undefined)
    setPhotoError(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 'choose' ? 'Aggiungi prodotto' : step === 'photo' ? 'Scatta le foto' : 'Dettagli prodotto'}
      fullscreen={step === 'photo'}
    >
      <div onClick={step === 'choose' ? handleOpen : undefined}>
        {step === 'choose' && (
          <div className="space-y-3">
            <button
              onClick={() => setStep('photo')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-cream-200 bg-white hover:border-cream-400 active:scale-[0.98] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-warm-900 flex items-center justify-center">
                <Camera size={22} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-warm-900">Scatta foto</p>
                <p className="text-xs text-warm-500">AI legge dati dal prodotto automaticamente</p>
              </div>
            </button>

            <button
              onClick={() => setStep('form')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-cream-200 bg-white hover:border-cream-400 active:scale-[0.98] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-cream-200 flex items-center justify-center">
                <PenLine size={22} className="text-warm-700" />
              </div>
              <div className="text-left">
                <p className="font-medium text-warm-900">Inserimento manuale</p>
                <p className="text-xs text-warm-500">Compila i campi a mano</p>
              </div>
            </button>
          </div>
        )}

        {step === 'photo' && (
          <PhotoCapture
            token={token}
            onResult={handlePhotoResult}
            onError={msg => setPhotoError(msg)}
          />
        )}

        {photoError && step === 'photo' && (
          <p className="mt-3 text-sm text-red-600 text-center">{photoError}</p>
        )}

        {step === 'form' && (
          <ProductForm
            prefilled={prefilled}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        )}
      </div>
    </Modal>
  )
}
