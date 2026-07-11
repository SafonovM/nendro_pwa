import { Mic } from 'lucide-react'
import { useVoiceInput } from '../../hooks/useVoiceInput'

interface VoiceInputProps {
  onFinalTranscript: (text: string) => void
  onInterimTranscript?: (text: string) => void
}

export function VoiceInput({ onFinalTranscript, onInterimTranscript }: VoiceInputProps) {
  const { isRecording, start, stop, isSupported, error, clearError } = useVoiceInput({
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
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          isRecording
            ? 'animate-pulse bg-red-600 text-white'
            : isSupported
              ? 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
              : 'bg-[var(--bg)] text-[var(--text-muted)]'
        }`}
        aria-label={isRecording ? 'Остановить запись' : 'Голосовой ввод'}
        title={
          isSupported
            ? isRecording
              ? 'Остановить запись'
              : 'Голосовой ввод'
            : 'Голосовой ввод доступен в Chrome и Edge'
        }
      >
        <Mic className="h-5 w-5" />
      </button>
      {error && (
        <p className="max-w-[220px] text-right text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
