import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import type { Dream } from '../../lib/db'
import { DREAM_CATEGORY_LABELS } from '../../lib/types'
import { useDreamStore } from '../../store/dreamStore'
import { EmptyState } from '../ui/EmptyState'

export function DreamList() {
  const filteredDreams = useDreamStore((s) => s.filteredDreams())
  const searchQuery = useDreamStore((s) => s.searchQuery)
  const deleteDream = useDreamStore((s) => s.deleteDream)

  if (filteredDreams.length === 0) {
    return (
      <EmptyState
        title={searchQuery ? 'Ничего не найдено' : 'Дневник снов пуст'}
        subtitle={searchQuery ? undefined : 'Запишите свой сон для последующего анализа'}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {filteredDreams.map((d) => (
        <DreamItem key={d.id} dream={d} onDelete={() => d.id && deleteDream(d.id)} />
      ))}
    </div>
  )
}

function DreamItem({ dream: d, onDelete }: { dream: Dream; onDelete: () => void }) {
  const date = d.date instanceof Date ? d.date : new Date(d.date)

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-block rounded-lg bg-[var(--color-secondary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-secondary)]">
            {DREAM_CATEGORY_LABELS[d.category]}
          </span>
          <h3 className="mt-1 font-medium">{d.title || 'Без названия'}</h3>
          <p className="text-sm text-[var(--text-muted)]">
            {format(date, 'd MMMM yyyy', { locale: ru })}
          </p>
        </div>
        <button type="button" onClick={onDelete} className="text-[var(--text-muted)]" aria-label="Удалить">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {d.description && (
        <p className="mt-2 line-clamp-3 text-sm text-[var(--text)]">{d.description}</p>
      )}
      {d.emotions && (
        <p className="mt-1 text-xs text-[var(--text-muted)]">Эмоции: {d.emotions}</p>
      )}
    </div>
  )
}
