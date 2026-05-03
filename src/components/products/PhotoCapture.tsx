import { useRef, useState } from 'react'
import { Camera, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { fileToBase64, analyzeProductImages, type CapturedImage } from '../../lib/claude'
import type { ClaudeProductResult } from '../../types'

interface PhotoCaptureProps {
  onResult: (result: ClaudeProductResult) => void
  onError: (msg: string) => void
  token: string
}

type PhotoSlot = 'front' | 'back' | 'bottom'

const slotLabels: Record<PhotoSlot, string> = {
  front: 'Fronte',
  back: 'Retro',
  bottom: 'Fondo',
}

export function PhotoCapture({ onResult, onError, token }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<Partial<Record<PhotoSlot, { file: File; preview: string }>>>({})
  const [analyzing, setAnalyzing] = useState(false)
  const [needsBottom, setNeedsBottom] = useState(false)
  const [partialResult, setPartialResult] = useState<ClaudeProductResult | null>(null)
  const inputRefs = useRef<Partial<Record<PhotoSlot, HTMLInputElement>>>({})

  const handleCapture = async (slot: PhotoSlot, file: File) => {
    const preview = URL.createObjectURL(file)
    setPhotos(prev => ({ ...prev, [slot]: { file, preview } }))
  }

  const analyze = async () => {
    const slots: PhotoSlot[] = needsBottom
      ? (['front', 'back', 'bottom'] as PhotoSlot[])
      : (['front', 'back'] as PhotoSlot[])

    const missing = slots.filter(s => !photos[s])
    if (missing.length > 0) {
      onError(`Aggiungi foto: ${missing.map(s => slotLabels[s]).join(', ')}`)
      return
    }

    setAnalyzing(true)
    try {
      const images: CapturedImage[] = await Promise.all(
        slots.map(s => fileToBase64(photos[s]!.file))
      )

      const result = await analyzeProductImages(images, token)

      if (!result.expiry_found && !needsBottom) {
        setPartialResult(result)
        setNeedsBottom(true)
        setAnalyzing(false)
        return
      }

      onResult(result)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Errore durante l\'analisi')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSkip = () => {
    if (partialResult) {
      onResult({ ...partialResult, expiry_found: true, expiry_date: null })
    }
  }

  const slots: PhotoSlot[] = needsBottom ? ['front', 'back', 'bottom'] : ['front', 'back']

  return (
    <div className="space-y-4">
      {needsBottom && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <p className="text-sm text-amber-800">
            Data scadenza non trovata. Aggiungi la foto del fondo oppure salta se il prodotto non ha scadenza.
          </p>
          <button
            onClick={handleSkip}
            className="text-xs font-medium text-amber-700 underline underline-offset-2"
          >
            Salta — questo prodotto non ha data di scadenza
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {slots.map(slot => (
          <div key={slot} className="space-y-1.5">
            <input
              ref={el => { if (el) inputRefs.current[slot] = el }}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleCapture(slot, file)
              }}
            />
            <button
              onClick={() => inputRefs.current[slot]?.click()}
              className="w-full aspect-square rounded-xl border-2 border-dashed border-cream-300 bg-cream-50 flex flex-col items-center justify-center gap-1 overflow-hidden active:scale-95 transition-transform"
            >
              {photos[slot] ? (
                <div className="relative w-full h-full">
                  <img
                    src={photos[slot]!.preview}
                    alt={slotLabels[slot]}
                    className="w-full h-full object-cover"
                  />
                  <CheckCircle2 size={18} className="absolute top-1 right-1 text-white drop-shadow" />
                </div>
              ) : (
                <>
                  <Camera size={20} className="text-warm-400" />
                  <span className="text-[10px] text-warm-500">Nessuna</span>
                </>
              )}
            </button>
            <p className="text-xs text-center text-warm-500">{slotLabels[slot]}</p>
          </div>
        ))}
      </div>

      <Button
        onClick={analyze}
        loading={analyzing}
        disabled={slots.some(s => !photos[s]) || analyzing}
        className="w-full"
      >
        {analyzing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Analisi in corso...
          </>
        ) : (
          <>
            <Camera size={16} />
            Analizza con AI
          </>
        )}
      </Button>
    </div>
  )
}
