import { NavLink } from 'react-router-dom'
import { Home, BookOpen, ScrollText, MoonStar, BookText } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Главная' },
  { to: '/practices', icon: BookOpen, label: 'Практики' },
  { to: '/transmissions', icon: ScrollText, label: 'Передачи' },
  { to: '/dreams', icon: MoonStar, label: 'Сны' },
  { to: '/practice-texts', icon: BookText, label: 'Тексты' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-sm safe-bottom">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--text-muted)]'
              }`
            }
            aria-label={label}
          >
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
