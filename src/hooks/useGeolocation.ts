import { useState, useCallback } from 'react'

interface GeolocationState {
  loading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ loading: false, error: null })

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается'))
        return
      }
      setState({ loading: true, error: null })
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setState({ loading: false, error: null })
          resolve(pos)
        },
        (err) => {
          const message =
            err.code === 1
              ? 'Доступ к геолокации запрещён'
              : 'Не удалось определить местоположение'
          setState({ loading: false, error: message })
          reject(new Error(message))
        },
        { enableHighAccuracy: false, timeout: 10000 },
      )
    })
  }, [])

  return { ...state, getCurrentPosition, isSupported: 'geolocation' in navigator }
}
