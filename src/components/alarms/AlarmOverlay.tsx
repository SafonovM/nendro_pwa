import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ActiveAlarm } from '../../lib/notifications'
import { startAlarmFeedback, stopAlarmFeedback } from '../../lib/notifications'

interface AlarmOverlayProps {
  alarm: ActiveAlarm
  onDismiss: () => void
}

export function AlarmOverlay({ alarm, onDismiss }: AlarmOverlayProps) {
  const navigate = useNavigate()

  useEffect(() => {
    startAlarmFeedback(alarm.kind)
    return () => stopAlarmFeedback()
  }, [alarm.kind])

  const handleDismiss = () => {
    stopAlarmFeedback()
    onDismiss()
  }

  const handleAction = () => {
    stopAlarmFeedback()
    onDismiss()
    if (alarm.kind === 'practice') {
      navigate('/practices')
    } else {
      navigate('/dreams')
    }
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 pb-24"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alarm-title"
    >
      <div
        className="card pointer-events-auto w-full max-w-sm p-6 text-center shadow-lg"
        onPointerDown={() => startAlarmFeedback(alarm.kind)}
      >
        <h2
          id="alarm-title"
          className="font-display text-2xl font-bold text-[var(--color-primary)]"
        >
          {alarm.title}
        </h2>
        <p className="mt-3 text-base text-[var(--text)]">{alarm.body}</p>
        {alarm.hint && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">{alarm.hint}</p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <button type="button" onClick={handleAction} className="btn-primary px-4 py-3">
            {alarm.kind === 'practice' ? 'К практике' : 'Записать сон'}
          </button>
          <button type="button" onClick={handleDismiss} className="btn-secondary px-4 py-3">
            {alarm.kind === 'practice' ? 'Отложить' : 'Продолжить сон'}
          </button>
        </div>
      </div>
    </div>
  )
}
