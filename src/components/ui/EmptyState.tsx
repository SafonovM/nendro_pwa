import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  subtitle?: string
  icon?: ReactNode
}

export function EmptyState({ title, subtitle, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && <div className="mb-4 text-[var(--text-muted)]">{icon}</div>}
      <p className="text-base font-medium text-[var(--text)]">{title}</p>
      {subtitle && (
        <p className="mt-2 max-w-xs text-sm text-[var(--text-muted)]">{subtitle}</p>
      )}
    </div>
  )
}
