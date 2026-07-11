import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Trash2, ChevronRight } from 'lucide-react'
import type { Transmission } from '../../lib/db'
import { TRANSMISSION_TYPE_LABELS } from '../../lib/types'
import { useTransmissionStore } from '../../store/transmissionStore'
import { EmptyState } from '../ui/EmptyState'

export function TransmissionList() {
  const transmissions = useTransmissionStore((s) => s.transmissions)
  const deleteTransmission = useTransmissionStore((s) => s.deleteTransmission)

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Удалить передачу «${name}»? Действие необратимо.`)) {
      return
    }
    await deleteTransmission(id)
  }

  if (transmissions.length === 0) {
    return (
      <EmptyState
        title="Передачи не записаны"
        subtitle="Запишите полученные посвящения от Учителя"
      />
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {transmissions.map((t) => (
        <TransmissionItem
          key={t.id}
          transmission={t}
          onDelete={() => t.id && handleDelete(t.id, t.name)}
        />
      ))}
    </div>
  )
}

function TransmissionItem({
  transmission: t,
  onDelete,
}: {
  transmission: Transmission
  onDelete: () => void
}) {
  const date = t.date instanceof Date ? t.date : new Date(t.date)

  return (
    <div className="card p-4">
      <div className="flex items-start gap-2">
        <Link
          to={`/transmissions/${t.id}`}
          className="min-w-0 flex-1 transition-opacity active:opacity-80"
        >
          <span className="inline-block rounded-lg bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
            {TRANSMISSION_TYPE_LABELS[t.type]}
          </span>
          <h3 className="mt-1 font-display text-lg font-semibold text-[var(--color-primary)]">
            {t.name}
          </h3>
          <p className="text-sm text-[var(--text-muted)]">{t.teacher}</p>
          <p className="mt-2 text-sm">
            {format(date, 'd MMMM yyyy', { locale: ru })}
            {t.place && ` · ${t.place}`}
          </p>
          {t.notes && (
            <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">{t.notes}</p>
          )}
        </Link>
        <div className="flex shrink-0 flex-col items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onDelete()
            }}
            className="p-1 text-[var(--text-muted)]"
            aria-label="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <Link to={`/transmissions/${t.id}`} className="text-[var(--text-muted)]" aria-label="Открыть">
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
