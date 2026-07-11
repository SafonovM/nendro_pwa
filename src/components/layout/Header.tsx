import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { TibetanA } from '../ui/TibetanA'

interface HeaderProps {
  title?: string
  showLogo?: boolean
  showSettings?: boolean
}

export function Header({ title, showLogo, showSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {showLogo && <TibetanA size={36} />}
        {title && (
          <h1 className="text-title flex-1 text-[var(--color-primary)]">
            {title}
          </h1>
        )}
        {!title && showLogo && <div className="flex-1" />}
        {showSettings && (
          <Link
            to="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
            aria-label="Настройки"
          >
            <Settings className="h-5 w-5" />
          </Link>
        )}
      </div>
    </header>
  )
}
