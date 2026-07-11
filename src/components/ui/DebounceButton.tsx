import { useRef, useCallback, type ReactNode } from 'react'

interface DebounceButtonProps {
  onClick: () => void
  delay?: number
  children: ReactNode
  className?: string
  disabled?: boolean
  'aria-label'?: string
}

export function DebounceButton({
  onClick,
  delay = 500,
  children,
  className = '',
  disabled,
  'aria-label': ariaLabel,
}: DebounceButtonProps) {
  const lastClick = useRef(0)

  const handleClick = useCallback(() => {
    const now = Date.now()
    if (now - lastClick.current >= delay) {
      lastClick.current = now
      onClick()
    }
  }, [onClick, delay])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}
