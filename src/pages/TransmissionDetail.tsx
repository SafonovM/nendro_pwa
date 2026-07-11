import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowLeft, Trash2, Pencil } from 'lucide-react'
import { TransmissionForm } from '../components/transmission/TransmissionForm'
import { TRANSMISSION_TYPE_LABELS } from '../lib/types'
import { useTransmissionStore } from '../store/transmissionStore'

export function TransmissionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const transmissions = useTransmissionStore((s) => s.transmissions)
  const loadTransmissions = useTransmissionStore((s) => s.loadTransmissions)
  const deleteTransmission = useTransmissionStore((s) => s.deleteTransmission)

  const transmissionId = Number(id)
  const transmission = transmissions.find((t) => t.id === transmissionId)

  useEffect(() => {
    loadTransmissions()
  }, [loadTransmissions])

  if (!transmission) {
    return (
      <>
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h1 className="text-title text-[var(--color-primary)]">Передача</h1>
        </div>
        <p className="p-4 text-[var(--text-muted)]">Запись не найдена</p>
      </>
    )
  }

  const date = transmission.date instanceof Date ? transmission.date : new Date(transmission.date)

  const handleDelete = async () => {
    if (!confirm(`Удалить передачу «${transmission.name}»? Действие необратимо.`)) {
      return
    }
    await deleteTransmission(transmissionId)
    navigate('/transmissions')
  }

  return (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Назад">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-title flex-1 truncate text-[var(--color-primary)]">
          {transmission.name}
        </h1>
        <Link
          to={`/transmissions/${transmissionId}/edit`}
          className="p-1 text-[var(--text-muted)]"
          aria-label="Редактировать"
        >
          <Pencil className="h-5 w-5" />
        </Link>
        <button type="button" onClick={handleDelete} className="p-1 text-[var(--text-muted)]" aria-label="Удалить">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <span className="mx-auto inline-block rounded-lg bg-[var(--color-primary)]/10 px-3 py-1 text-sm font-medium text-[var(--color-primary)]">
          {TRANSMISSION_TYPE_LABELS[transmission.type]}
        </span>

        <div className="card p-4">
          <h2 className="mb-1 text-sm text-[var(--text-muted)]">Название</h2>
          <p className="text-title text-[var(--color-primary)]">{transmission.name}</p>
        </div>

        <div className="card p-4">
          <h2 className="mb-1 text-sm text-[var(--text-muted)]">Учитель</h2>
          <p className="text-sm">{transmission.teacher}</p>
        </div>

        <div className="card p-4">
          <h2 className="mb-1 text-sm text-[var(--text-muted)]">Дата получения</h2>
          <p className="text-sm">{format(date, 'd MMMM yyyy', { locale: ru })}</p>
        </div>

        {transmission.place && (
          <div className="card p-4">
            <h2 className="mb-1 text-sm text-[var(--text-muted)]">Место</h2>
            <p className="text-sm">{transmission.place}</p>
          </div>
        )}

        {transmission.notes && (
          <div className="card p-4">
            <h2 className="mb-1 text-sm text-[var(--text-muted)]">Заметки</h2>
            <p className="whitespace-pre-wrap text-sm">{transmission.notes}</p>
          </div>
        )}
      </div>
    </>
  )
}

export function TransmissionEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const transmissionId = Number(id)

  return (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Назад">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-title flex-1 text-[var(--color-primary)]">Редактирование</h1>
      </div>
      <TransmissionForm
        transmissionId={transmissionId}
        onDone={() => navigate(`/transmissions/${transmissionId}`)}
      />
    </>
  )
}
