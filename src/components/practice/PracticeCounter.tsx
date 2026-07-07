import { CircleDot } from 'lucide-react'
import { DebounceButton } from '../ui/DebounceButton'

interface PracticeCounterProps {
  onIncrement: () => void
  count: number
}

export function PracticeCounter({ onIncrement, count }: PracticeCounterProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <DebounceButton
        onClick={onIncrement}
        delay={500}
        aria-label="Добавить одно повторение"
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-transform active:scale-95"
      >
        <CircleDot className="h-10 w-10" strokeWidth={1.5} />
      </DebounceButton>
      <p className="text-3xl font-semibold tabular-nums">{count.toLocaleString('ru-RU')}</p>
      <p className="text-sm text-[var(--text-muted)]">Нажмите для +1</p>
    </div>
  )
}
