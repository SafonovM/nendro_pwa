import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Practice } from '../../lib/db'
import { getPracticeTitle } from '../../lib/types'
import { getPracticeStats } from '../../store/practiceStore'
import { ProgressBar } from '../ui/ProgressBar'

interface PracticeCardProps {
  practice: Practice
}

export function PracticeCard({ practice }: PracticeCardProps) {
  const { remaining, completionPercent } = getPracticeStats(practice)
  const title = getPracticeTitle(practice)
  const showSubtitle =
    practice.category !== 'custom' && practice.name !== title

  return (
    <Link to={`/practices/${practice.id}`} className="card block p-4 transition-opacity active:opacity-80">
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
            {practice.completedCount.toLocaleString('ru-RU')} / {practice.targetCount.toLocaleString('ru-RU')}
          </span>
          <span>{completionPercent.toFixed(1)}%</span>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Осталось: {remaining.toLocaleString('ru-RU')}
        </p>
      </div>
    </Link>
  )
}
