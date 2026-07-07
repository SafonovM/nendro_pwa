import { useNavigate } from 'react-router-dom'
import type { ActiveAlarm } from '../../lib/notifications'

interface AlarmOverlayProps {
  alarm: ActiveAlarm
  onDismiss: () => void
}

export function AlarmOverlay({ alarm, onDismiss }: AlarmOverlayProps) {
  const navigate = useNavigate()

  const handleAction = () => {
    onDismiss()
    if (alarm.kind === 'practice') {
      navigate('/practices')
    } else {
      navigate('/dreams')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-dark)]/95 p-6">
      <div className="card w-full max-w-sm p-6 text-center">
        <h2 className="font-display text-2xl font-bold text-[var(--color-primary)]">
          {alarm.title}
        </h2>
        <p className="mt-3 text-lg">{alarm.body}</p>
        {alarm.hint && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">{alarm.hint}</p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <button type="button" onClick={handleAction} className="btn-primary px-4 py-3">
            {alarm.kind === 'practice' ? 'К практике' : 'Записать сон'}
          </button>
          <button type="button" onClick={onDismiss} className="btn-secondary px-4 py-3">
            {alarm.kind === 'practice' ? 'Отложить' : 'Продолжить сон'}
          </button>
        </div>
      </div>
    </div>
  )
}
