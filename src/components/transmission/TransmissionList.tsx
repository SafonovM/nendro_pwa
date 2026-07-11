import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Trash2, ChevronRight } from 'lucide-react'
import type { Transmission } from '../../lib/db'
import { TRANSMISSION_TYPE_LABELS } from '../../lib/types'
import { useTransmissionStore } from '../../store/transmissionStore'
import { EmptyState } from '../ui/EmptyState'
import { ConfirmDialog } from '../ui/ConfirmDialog'

const DELETE_CONFIRM_MESSAGE = 'Вы действительно хотите удалить запись?'

export function TransmissionList() {
  const transmissions = useTransmissionStore((s) => s.transmissions)
  const deleteTransmission = useTransmissionStore((s) => s.deleteTransmission)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const handleConfirmDelete = async () => {
    if (pendingDeleteId == null) return
    await deleteTransmission(pendingDeleteId)
    setPendingDeleteId(null)
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
    <>
      <div className="flex flex-col gap-3 p-4">
        {transmissions.map((t) =>
          t.id ? (
            <TransmissionItem
              key={t.id}
              transmission={t}
              onDelete={() => setPendingDeleteId(t.id!)}
            />
          ) : null,
        )}
      </div>

      <ConfirmDialog
        open={pendingDeleteId != null}
        message={DELETE_CONFIRM_MESSAGE}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
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
    <div className="relative">
      <Link
        to={`/transmissions/${t.id}`}
        className="card relative block p-4 pr-12 transition-opacity active:opacity-80"
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
        <ChevronRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete()
        }}
        className="absolute right-10 top-4 z-10 p-1 text-[var(--text-muted)]"
        aria-label="Удалить"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
