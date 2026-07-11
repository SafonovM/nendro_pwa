import { Link } from 'react-router-dom'
import { BookOpen, ScrollText, MoonStar, BookText, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface DashboardSection {
  to: string
  title: string
  subtitle: string
  icon: LucideIcon
}

const sections: DashboardSection[] = [
  {
    to: '/practices',
    title: 'Практики',
    subtitle: 'Учёт практик Нёндро и ежедневных сессий',
    icon: BookOpen,
  },
  {
    to: '/transmissions',
    title: 'Передачи',
    subtitle: 'Лунги, ванги, три и дженанги',
    icon: ScrollText,
  },
  {
    to: '/dreams',
    title: 'Сны',
    subtitle: 'Дневник сновидений и практика осознанности',
    icon: MoonStar,
  },
  {
    to: '/practice-texts',
    title: 'Тексты',
    subtitle: 'Тексты практик и привязанные файлы',
    icon: BookText,
  },
]

export function DashboardNavList() {
  return (
    <div className="flex flex-col gap-3">
      {sections.map(({ to, title, subtitle, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="card block p-5 transition-opacity active:opacity-80"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-[var(--color-primary)]" strokeWidth={1.75} />
                <h3 className="font-display text-lg font-semibold text-[var(--color-primary)]">
                  {title}
                </h3>
              </div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[var(--text-muted)]" />
          </div>
        </Link>
      ))}
    </div>
  )
}
