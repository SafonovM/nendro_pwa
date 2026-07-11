import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import type { Transmission } from '../../lib/db'
import { TRANSMISSION_TYPE_LABELS } from '../../lib/types'
import { useTransmissionStore } from '../../store/transmissionStore'
import { EmptyState } from '../ui/EmptyState'

export function TransmissionList() {
  const transmissions = useTransmissionStore((s) => s.transmissions)
  const deleteTransmission = useTransmissionStore((s) => s.deleteTransmission)

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
        <TransmissionItem key={t.id} transmission={t} onDelete={() => t.id && deleteTransmission(t.id)} />
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
  const [confirm, setConfirm] = useState(false)
  const date = t.date instanceof Date ? t.date : new Date(t.date)

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-block rounded-lg bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
            {TRANSMISSION_TYPE_LABELS[t.type]}
          </span>
          <h3 className="mt-1 font-display text-lg font-semibold">{t.name}</h3>
          <p className="text-sm text-[var(--text-muted)]">{t.teacher}</p>
        </div>
        <button
          type="button"
          onClick={() => (confirm ? onDelete() : setConfirm(true))}
          className="text-[var(--text-muted)]"
          aria-label="Удалить"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-sm">
        {format(date, 'd MMMM yyyy', { locale: ru })}
        {t.place && ` · ${t.place}`}
      </p>
      {t.notes && <p className="mt-2 text-sm text-[var(--text-muted)]">{t.notes}</p>}
    </div>
  )
}
