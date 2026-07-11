import { useRef, useCallback } from 'react'

export function useDebounce(callback: () => void, delay = 500) {
  const lastClickTime = useRef(0)

  return useCallback(() => {
    const now = Date.now()
    if (now - lastClickTime.current >= delay) {
      lastClickTime.current = now
      callback()
    }
  }, [callback, delay])
}
