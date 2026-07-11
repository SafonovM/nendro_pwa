import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { MonthlyHistoryGroup } from '../../lib/backup'
import { formatPracticeCount } from '../../lib/format'

interface PracticeHistorySectionProps {
  groups: MonthlyHistoryGroup[]
}

export function PracticeHistorySection({ groups }: PracticeHistorySectionProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="mt-2">
      <h3 className="mb-3 font-medium text-[var(--color-primary)]">История</h3>

      {groups.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Подходы ещё не записаны</p>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((group) => {
            const isOpen = expanded.has(group.monthKey)
            return (
              <div key={group.monthKey} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(group.monthKey)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <div>
                    <p className="font-medium capitalize">{group.monthLabel}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatPracticeCount(group.total)} повторений
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--border)] px-4 py-2">
                    {group.days.map((day) => (
                      <div
                        key={day.date.getTime()}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <span className="text-[var(--text-muted)]">
                          {day.date.toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                          })}
                        </span>
                        <span className="font-medium tabular-nums text-[var(--color-primary)]">
                          {formatPracticeCount(day.count)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

