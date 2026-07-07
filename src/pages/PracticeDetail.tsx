import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { PracticeCounter } from '../components/practice/PracticeCounter'
import { ProgressBar } from '../components/ui/ProgressBar'
import { usePracticeStore, getPracticeStats } from '../store/practiceStore'
import { PRACTICE_CATEGORY_LABELS } from '../lib/types'

export function PracticeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const practices = usePracticeStore((s) => s.practices)
  const loadPractices = usePracticeStore((s) => s.loadPractices)
  const incrementCount = usePracticeStore((s) => s.incrementCount)
  const deletePractice = usePracticeStore((s) => s.deletePractice)

  const practiceId = Number(id)
  const practice = practices.find((p) => p.id === practiceId)

  useEffect(() => {
    loadPractices()
  }, [loadPractices])

  if (!practice) {
    return (
      <>
        <Header title="Практика" />
        <p className="p-4 text-[var(--text-muted)]">Практика не найдена</p>
      </>
    )
  }

  const { remaining, completionPercent, dailyNorm } = getPracticeStats(practice)
  const label = PRACTICE_CATEGORY_LABELS[practice.category]

  const handleDelete = async () => {
    if (confirm('Удалить практику?')) {
      await deletePractice(practiceId)
      navigate('/practices')
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Назад">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display flex-1 text-xl font-semibold text-[var(--color-primary)]">
          {label}
        </h1>
        <button type="button" onClick={handleDelete} aria-label="Удалить">
          <Trash2 className="h-5 w-5 text-[var(--text-muted)]" />
        </button>
      </div>

      <div className="px-4 py-6">
        <PracticeCounter
          count={practice.completedCount}
          onIncrement={() => incrementCount(practiceId)}
        />

        <div className="card mt-4 p-4">
          <ProgressBar percent={completionPercent} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-semibold tabular-nums">
                {practice.completedCount.toLocaleString('ru-RU')}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Выполнено</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">
                {remaining.toLocaleString('ru-RU')}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Осталось</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">
                {completionPercent.toFixed(1)}%
              </p>
              <p className="text-xs text-[var(--text-muted)]">Прогресс</p>
            </div>
          </div>
          {dailyNorm > 0 && (
            <p className="mt-3 text-center text-sm text-[var(--text-muted)]">
              Дневная норма: {dailyNorm.toLocaleString('ru-RU')}
            </p>
          )}
          <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
            Цель: {practice.targetCount.toLocaleString('ru-RU')}
          </p>
        </div>
      </div>
    </>
  )
}
