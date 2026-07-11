import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRANSMISSION_TYPE_LABELS, type TransmissionType } from '../../lib/types'
import { useTransmissionStore } from '../../store/transmissionStore'

interface TransmissionFormProps {
  transmissionId?: number
  onDone?: (id?: number) => void
}

export function TransmissionForm({ transmissionId, onDone }: TransmissionFormProps) {
  const navigate = useNavigate()
  const addTransmission = useTransmissionStore((s) => s.addTransmission)
  const updateTransmission = useTransmissionStore((s) => s.updateTransmission)
  const loadTransmissions = useTransmissionStore((s) => s.loadTransmissions)

  const isEdit = transmissionId !== undefined

  const [name, setName] = useState('')
  const [type, setType] = useState<TransmissionType>('lung')
  const [teacher, setTeacher] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [place, setPlace] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!transmissionId) return
    loadTransmissions().then(() => {
      const t = useTransmissionStore.getState().transmissions.find((x) => x.id === transmissionId)
      if (t) {
        setName(t.name)
        setType(t.type)
        setTeacher(t.teacher)
        const d = t.date instanceof Date ? t.date : new Date(t.date)
        setDate(d.toISOString().slice(0, 10))
        setPlace(t.place)
        setNotes(t.notes)
      }
      setLoading(false)
    })
  }, [transmissionId, loadTransmissions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !teacher.trim()) return

    const data = {
      name: name.trim(),
      type,
      teacher: teacher.trim(),
      date: new Date(date),
      place: place.trim(),
      notes: notes.trim(),
    }

    if (isEdit && transmissionId) {
      await updateTransmission(transmissionId, data)
      onDone?.(transmissionId)
    } else {
      const id = await addTransmission(data)
      if (onDone) {
        onDone(id)
      } else {
        navigate(`/transmissions/${id}`)
      }
    }
  }

  const inputClass =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30'

  if (loading) {
    return <p className="p-4 text-[var(--text-muted)]">Загрузка…</p>
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-4 mb-4 flex flex-col gap-3 p-4">
      <h3 className="font-medium">{isEdit ? 'Редактировать передачу' : 'Новая передача'}</h3>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Название</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Тип</label>
        <select value={type} onChange={(e) => setType(e.target.value as TransmissionType)} className={inputClass}>
          {(Object.keys(TRANSMISSION_TYPE_LABELS) as TransmissionType[]).map((t) => (
            <option key={t} value={t}>
              {TRANSMISSION_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Учитель</label>
        <input value={teacher} onChange={(e) => setTeacher(e.target.value)} className={inputClass} required />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Дата</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Место</label>
        <input value={place} onChange={(e) => setPlace(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Заметки</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} />
      </div>

      <button type="submit" className="btn-primary px-4 py-3">
        {isEdit ? 'Сохранить' : 'Сохранить'}
      </button>
    </form>
  )
}
