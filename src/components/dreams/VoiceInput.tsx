import { createPortal } from 'react-dom'
import { Mic, Square } from 'lucide-react'
import { useVoiceInput } from '../../hooks/useVoiceInput'

interface VoiceInputProps {
  onFinalTranscript: (text: string) => void
  onInterimTranscript?: (text: string) => void
}

function VoiceRecordingOverlay({
  interimText,
  onStop,
}: {
  interimText: string
  onStop: () => void
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Голосовой ввод активен"
      onClick={onStop}
    >
      <div
        className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-[var(--surface)] px-6 py-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-red-500/25" />
          <span className="absolute inset-2 animate-pulse rounded-full bg-red-500/20" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30">
            <Mic className="h-9 w-9" />
          </span>
        </div>

        <div className="text-center">
          <p className="text-base font-medium text-[var(--text)]">Слушаю…</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Говорите. Нажмите стоп, когда закончите.
          </p>
        </div>

        {interimText && (
          <p className="max-h-24 w-full overflow-y-auto rounded-xl bg-[var(--bg)] px-3 py-2 text-center text-sm text-[var(--text)]">
            {interimText}
          </p>
        )}

        <button
          type="button"
          onClick={onStop}
          className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white"
        >
          <Square className="h-4 w-4 fill-current" />
          Остановить
        </button>
      </div>
    </div>,
    document.body,
  )
}

export function VoiceInput({ onFinalTranscript, onInterimTranscript }: VoiceInputProps) {
  const { isRecording, interimText, start, stop, isSupported, error, clearError } = useVoiceInput({
    onFinalTranscript,
    onInterimTranscript,
  })

  const handleClick = () => {
    clearError()
    if (isRecording) {
      stop()
    } else {
      void start()
    }
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={handleClick}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            isRecording
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : isSupported
                ? 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
                : 'bg-[var(--bg)] text-[var(--text-muted)]'
          }`}
          aria-label={isRecording ? 'Остановить запись' : 'Голосовой ввод'}
          aria-pressed={isRecording}
          title={
            isSupported
              ? isRecording
                ? 'Остановить запись'
                : 'Голосовой ввод'
              : 'Голосовой ввод доступен в Chrome и Edge'
          }
        >
          {isRecording && (
            <span className="absolute inset-0 animate-ping rounded-full bg-red-500/40" />
          )}
          <Mic className={`relative h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`} />
        </button>
        {error && (
          <p className="max-w-[220px] text-right text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      {isRecording && (
        <VoiceRecordingOverlay interimText={interimText} onStop={stop} />
      )}
    </>
  )
}
