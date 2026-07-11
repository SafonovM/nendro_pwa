import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

function getSpeechRecognitionApi():
  | (new () => SpeechRecognitionInstance)
  | undefined {
  if (typeof window === 'undefined') return undefined
  return window.SpeechRecognition || window.webkitSpeechRecognition
}

interface UseVoiceInputOptions {
  onFinalTranscript?: (text: string) => void
  onInterimTranscript?: (text: string) => void
  lang?: string
}

export function useVoiceInput({
  onFinalTranscript,
  onInterimTranscript,
  lang = 'ru-RU',
}: UseVoiceInputOptions = {}) {
  const [isSupported, setIsSupported] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const onFinalRef = useRef(onFinalTranscript)
  const onInterimRef = useRef(onInterimTranscript)

  onFinalRef.current = onFinalTranscript
  onInterimRef.current = onInterimTranscript

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionApi()
    setIsSupported(!!SpeechRecognitionAPI)
    if (!SpeechRecognitionAPI) return

    const instance = new SpeechRecognitionAPI()
    instance.continuous = true
    instance.interimResults = true
    instance.lang = lang

    instance.onresult = (event) => {
      let interim = ''
      let finalChunk = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0]?.transcript ?? ''
        if (result.isFinal) {
          finalChunk += transcript
        } else {
          interim += transcript
        }
      }

      setInterimText(interim)
      onInterimRef.current?.(interim)

      const trimmedFinal = finalChunk.trim()
      if (trimmedFinal) {
        setInterimText('')
        onInterimRef.current?.('')
        onFinalRef.current?.(trimmedFinal)
      }
    }

    instance.onerror = (event) => {
      setIsRecording(false)
      setInterimText('')
      onInterimRef.current?.('')

      if (event.error === 'aborted' || event.error === 'no-speech') {
        return
      }

      if (event.error === 'not-allowed') {
        setError('Нет доступа к микрофону')
        return
      }

      setError('Не удалось распознать речь')
    }

    instance.onend = () => {
      setIsRecording(false)
      setInterimText('')
      onInterimRef.current?.('')
    }

    recognitionRef.current = instance

    return () => {
      instance.onresult = null
      instance.onerror = null
      instance.onend = null
      instance.abort()
      recognitionRef.current = null
    }
  }, [lang])

  const clearError = useCallback(() => setError(null), [])

  const start = useCallback(async () => {
    const SpeechRecognitionAPI = getSpeechRecognitionApi()
    if (!SpeechRecognitionAPI) {
      setError('Голосовой ввод не поддерживается в этом браузере. Используйте Chrome или Edge.')
      return
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
      }
    } catch {
      setError('Нет доступа к микрофону')
      return
    }

    try {
      setError(null)
      setInterimText('')
      onInterimRef.current?.('')
      recognitionRef.current?.abort()
      recognitionRef.current?.start()
      setIsRecording(true)
    } catch {
      setError('Не удалось начать запись')
      setIsRecording(false)
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
    setInterimText('')
    onInterimRef.current?.('')
  }, [])

  return {
    isSupported,
    isRecording,
    interimText,
    error,
    start,
    stop,
    clearError,
  }
}
