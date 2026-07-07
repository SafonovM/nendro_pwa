import { TibetanA } from '../ui/TibetanA'

interface HeaderProps {
  title?: string
  showLogo?: boolean
}

export function Header({ title, showLogo }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {showLogo && <TibetanA size={36} />}
        {title && (
          <h1 className="font-display text-xl font-semibold text-[var(--color-primary)]">{title}</h1>
        )}
      </div>
    </header>
  )
}
