import { NavLink } from 'react-router-dom'
import { Home, Package, BookOpen, BarChart2 } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/magazzino', icon: Package, label: 'Magazzino' },
  { to: '/normative', icon: BookOpen, label: 'Normative' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-cream-200 safe-bottom z-40">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-warm-900' : 'text-warm-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
