import { useState } from 'react'
import { ChevronDown, Trash2 } from 'lucide-react'
import type { MonthlyHistoryGroup } from '../../lib/backup'
import type { PracticeSession } from '../../lib/db'
import { formatPracticeCount } from '../../lib/format'

interface PracticeHistorySectionProps {
  groups: MonthlyHistoryGroup[]
  onDeleteSession?: (session: PracticeSession) => void
}

export function PracticeHistorySection({ groups, onDeleteSession }: PracticeHistorySectionProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleDay = (key: number) => {
    setExpandedDays((prev) => {
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
                    {group.days.map((day) => {
                      const dayKey = day.date.getTime()
                      const isDayOpen = onDeleteSession != null && expandedDays.has(dayKey)
                      return (
                        <div key={dayKey}>
                          <button
                            type="button"
                            onClick={() => onDeleteSession && toggleDay(dayKey)}
                            className="flex w-full items-center justify-between py-2 text-left text-sm"
                          >
                            <span className="text-[var(--text-muted)]">
                              {day.date.toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                              })}
                            </span>
                            <span className="flex items-center gap-1 font-medium tabular-nums text-[var(--color-primary)]">
                              {formatPracticeCount(day.count)}
                              {onDeleteSession && (
                                <ChevronDown
                                  className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${isDayOpen ? 'rotate-180' : ''}`}
                                />
                              )}
                            </span>
                          </button>

                          {isDayOpen && (
                            <div className="mb-2 flex flex-col gap-1 rounded-xl bg-[var(--surface)]/55 px-3 py-1">
                              {[...day.sessions]
                                .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
                                .map((session, index) => (
                                <div
                                  key={session.id ?? `${dayKey}-${index}`}
                                  className="flex items-center justify-between gap-2 py-1 text-sm"
                                >
                                  <div className="min-w-0">
                                    <p className="tabular-nums">
                                      {formatPracticeCount(session.count)} повторений
                                    </p>
                                    {session.note && (
                                      <p className="truncate text-xs text-[var(--text-muted)]">
                                        {session.note}
                                      </p>
                                    )}
                                  </div>
                                  {session.id != null && (
                                    <button
                                      type="button"
                                      onClick={() => onDeleteSession?.(session)}
                                      aria-label="Удалить подход"
                                      className="shrink-0 p-1 text-[var(--text-muted)]"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
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
          })}
        </div>
      )}
    </div>
  )
}
