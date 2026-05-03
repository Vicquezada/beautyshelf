import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  fullscreen?: boolean
}

export function Modal({ open, onClose, title, children, fullscreen = false }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white w-full max-w-app ${
          fullscreen ? 'h-full rounded-none' : 'max-h-[92vh] rounded-t-3xl'
        } overflow-y-auto`}
      >
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 pt-5 pb-4 border-b border-cream-100">
          <h2 className="font-display text-lg font-semibold text-warm-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-warm-600 hover:bg-cream-200"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4 pb-8">{children}</div>
      </div>
    </div>
  )
}
