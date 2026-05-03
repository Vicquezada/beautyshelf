import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'urgente' | 'attenzione' | 'info' | 'alta' | 'media' | 'bassa' | 'neutral'
  className?: string
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variantClass = variant === 'neutral'
    ? 'bg-warm-100 text-warm-600 border border-warm-200'
    : `badge-${variant}`

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClass} ${className}`}>
      {children}
    </span>
  )
}
