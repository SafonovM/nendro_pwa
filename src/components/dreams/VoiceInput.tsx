import { Mic, MicOff } from 'lucide-react'
import { useVoiceInput } from '../../hooks/useVoiceInput'

interface VoiceInputProps {
  onTranscript: (text: string) => void
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const { isRecording, start, stop, isSupported } = useVoiceInput(onTranscript)

  if (!isSupported) return null

  return (
    <button
      type="button"
      onClick={isRecording ? stop : start}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
        isRecording
          ? 'bg-red-600 text-white'
          : 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
      }`}
      aria-label={isRecording ? 'Остановить запись' : 'Голосовой ввод'}
    >
      {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </button>
  )
}
