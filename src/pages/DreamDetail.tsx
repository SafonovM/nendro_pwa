import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { DREAM_CATEGORY_LABELS } from '../lib/types'
import { useDreamStore } from '../store/dreamStore'

export function DreamDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dreams = useDreamStore((s) => s.dreams)
  const loadDreams = useDreamStore((s) => s.loadDreams)
  const deleteDream = useDreamStore((s) => s.deleteDream)

  const dreamId = Number(id)
  const dream = dreams.find((d) => d.id === dreamId)

  useEffect(() => {
    loadDreams()
  }, [loadDreams])

  if (!dream) {
    return (
      <>
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h1 className="font-display text-xl font-semibold text-[var(--color-primary)]">Сон</h1>
        </div>
        <p className="p-4 text-[var(--text-muted)]">Запись не найдена</p>
      </>
    )
  }

  const date = dream.date instanceof Date ? dream.date : new Date(dream.date)

  const handleDelete = async () => {
    if (
      !confirm(
        'Удалить эту запись о сне? Действие необратимо.',
      )
    ) {
      return
    }
    await deleteDream(dreamId)
    navigate('/dreams')
  }

  return (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Назад">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display flex-1 truncate text-lg font-semibold text-[var(--color-primary)]">
          {dream.title || 'Без названия'}
        </h1>
        <button type="button" onClick={handleDelete} className="p-1 text-[var(--text-muted)]" aria-label="Удалить">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block rounded-lg bg-[var(--color-secondary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-secondary)]">
            {DREAM_CATEGORY_LABELS[dream.category]}
          </span>
          <span className="text-sm text-[var(--text-muted)]">
            {format(date, 'd MMMM yyyy', { locale: ru })}
          </span>
          {dream.isSignificant && (
            <span className="text-xs font-medium text-[var(--color-accent)]">Значимый</span>
          )}
        </div>

        <div className="card p-4">
          <h2 className="mb-2 text-sm font-medium text-[var(--text-muted)]">Описание</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{dream.description}</p>
        </div>

        {dream.emotions && (
          <div className="card p-4">
            <h2 className="mb-2 text-sm font-medium text-[var(--text-muted)]">Эмоции</h2>
            <p className="whitespace-pre-wrap text-sm">{dream.emotions}</p>
          </div>
        )}
      </div>
    </>
  )
}
