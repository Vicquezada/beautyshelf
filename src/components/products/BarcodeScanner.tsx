import { useRef, useState, useEffect } from 'react'
import { Scan, Keyboard, Loader2, AlertCircle } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import { Button } from '../ui/Button'
import { lookupBarcode } from '../../lib/openbeauty'
import type { ClaudeProductResult } from '../../types'

interface BarcodeScannerProps {
  onResult: (result: ClaudeProductResult) => void
  onError: (msg: string) => void
}

export function BarcodeScanner({ onResult, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const [scanning, setScanning] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [looking, setLooking] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const stopCamera = () => {
    controlsRef.current?.stop()
    controlsRef.current = null
    readerRef.current = null
  }

  const startScanner = async () => {
    setNotFound(false)
    setScanning(true)
    try {
      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader

      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
        videoRef.current!,
        (result, error) => {
          if (result) {
            const code = result.getText()
            stopCamera()
            setScanning(false)
            handleBarcode(code)
          }
          if (error && !(error instanceof NotFoundException)) {
            // ignore NotFoundException — it just means no barcode in frame yet
          }
        }
      )
      controlsRef.current = controls
    } catch {
      setScanning(false)
      setManualMode(true)
    }
  }

  const handleBarcode = async (code: string) => {
    setLooking(true)
    setNotFound(false)
    try {
      const product = await lookupBarcode(code)
      if (!product) {
        setNotFound(true)
        return
      }
      onResult({
        name: product.name,
        brand: product.brand,
        category: product.category,
        expiry_date: null,
        ingredients: product.ingredients,
        expiry_found: false,
      })
    } catch {
      onError('Errore durante la ricerca del prodotto')
    } finally {
      setLooking(false)
    }
  }

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) return
    await handleBarcode(manualCode.trim())
  }

  if (looking) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 size={32} className="animate-spin text-warm-500" />
        <p className="text-sm text-warm-600">Ricerca prodotto in corso...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notFound && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Prodotto non trovato nel database. Prova con le foto o l'inserimento manuale.
          </p>
        </div>
      )}

      {scanning && (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-32 border-2 border-white rounded-xl opacity-70" />
          </div>
          <p className="absolute bottom-3 left-0 right-0 text-center text-white text-xs opacity-80">
            Inquadra il codice a barre
          </p>
          <button
            onClick={() => { stopCamera(); setScanning(false) }}
            className="absolute top-3 right-3 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full"
          >
            Annulla
          </button>
        </div>
      )}

      {!scanning && !manualMode && (
        <div className="space-y-3">
          <button
            onClick={startScanner}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-cream-200 bg-white hover:border-cream-400 active:scale-[0.98] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-warm-900 flex items-center justify-center">
              <Scan size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-warm-900">Scansiona barcode</p>
              <p className="text-xs text-warm-500">Punta la camera sul codice EAN del prodotto</p>
            </div>
          </button>

          <button
            onClick={() => setManualMode(true)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-cream-200 bg-white hover:border-cream-400 active:scale-[0.98] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-cream-200 flex items-center justify-center">
              <Keyboard size={22} className="text-warm-700" />
            </div>
            <div className="text-left">
              <p className="font-medium text-warm-900">Inserisci codice</p>
              <p className="text-xs text-warm-500">Digita manualmente il codice EAN</p>
            </div>
          </button>
        </div>
      )}

      {manualMode && !scanning && (
        <div className="space-y-3">
          <input
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            placeholder="es. 8005610617664"
            type="number"
            inputMode="numeric"
            className="w-full px-3 py-2.5 text-sm border border-cream-200 rounded-xl focus:outline-none focus:border-cream-400 font-mono tracking-wider"
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setManualMode(false)} className="flex-1">
              Indietro
            </Button>
            <Button onClick={handleManualSubmit} disabled={!manualCode.trim()} className="flex-1">
              Cerca
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
