export function Loading({ text = 'Caricamento...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="w-8 h-8 border-2 border-cream-400 border-t-warm-800 rounded-full animate-spin" />
      <span className="text-sm text-warm-500">{text}</span>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-cream-200 rounded-xl ${className}`} />
}
