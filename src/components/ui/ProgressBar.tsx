interface ProgressBarProps {
  percent: number
  className?: string
}

export function ProgressBar({ percent, className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-[var(--border)] ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${clamped}%`,
          background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))',
        }}
      />
    </div>
  )
}
