import { Link } from 'react-router-dom'
import { ChevronRight, Trash2 } from 'lucide-react'
import type { Practice } from '../../lib/db'
import { getPracticeTitle } from '../../lib/types'
import { getPracticeStats } from '../../store/practiceStore'
import { ProgressBar } from '../ui/ProgressBar'

interface PracticeCardProps {
  practice: Practice
  onDelete: () => void
}

export function PracticeCard({ practice, onDelete }: PracticeCardProps) {
  const { remaining, completionPercent } = getPracticeStats(practice)
  const title = getPracticeTitle(practice)
  const showSubtitle =
    practice.category !== 'custom' && practice.name !== title

  return (
    <div className="relative">
      <Link
        to={`/practices/${practice.id}`}
        className="card block p-4 pr-12 transition-opacity active:opacity-80"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-[var(--color-primary)]">
              {title}
            </h3>
            {showSubtitle && (
              <p className="text-sm text-[var(--text-muted)]">{practice.name}</p>
            )}
          </div>
          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[var(--text-muted)]" />
        </div>

        <div className="mt-3">
          <ProgressBar percent={completionPercent} />
          <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
            <span>
              {practice.completedCount.toLocaleString('ru-RU')} /{' '}
              {practice.targetCount.toLocaleString('ru-RU')}
            </span>
            <span>{completionPercent.toFixed(1)}%</span>
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Осталось: {remaining.toLocaleString('ru-RU')}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete()
        }}
        className="absolute right-4 top-4 z-10 p-1 text-[var(--text-muted)]"
        aria-label="Удалить"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
