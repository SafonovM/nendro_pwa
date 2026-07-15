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
  onstart: (() => void) | null
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

const FINAL_DEDUPE_MS = 1500

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
  const processedFinalIndicesRef = useRef(new Set<number>())
  const lastFinalRef = useRef({ text: '', at: 0 })
  const wantsRecordingRef = useRef(false)

  onFinalRef.current = onFinalTranscript
  onInterimRef.current = onInterimTranscript

  const resetSession = useCallback(() => {
    processedFinalIndicesRef.current.clear()
    lastFinalRef.current = { text: '', at: 0 }
    setInterimText('')
    onInterimRef.current?.('')
  }, [])

  const emitFinal = useCallback((raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    const now = Date.now()
    const last = lastFinalRef.current
    if (last.text === trimmed && now - last.at < FINAL_DEDUPE_MS) {
      return
    }
    lastFinalRef.current = { text: trimmed, at: now }

    setInterimText('')
    onInterimRef.current?.('')
    onFinalRef.current?.(trimmed)
  }, [])

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionApi()
    setIsSupported(!!SpeechRecognitionAPI)
    if (!SpeechRecognitionAPI) return

    const instance = new SpeechRecognitionAPI()
    instance.continuous = true
    instance.interimResults = true
    instance.lang = lang

    instance.onstart = () => {
      setIsRecording(true)
      setError(null)
    }

    instance.onresult = (event) => {
      let interim = ''
      const newFinalParts: string[] = []

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0]?.transcript ?? ''
        if (!transcript) continue

        if (result.isFinal) {
          if (!processedFinalIndicesRef.current.has(i)) {
            processedFinalIndicesRef.current.add(i)
            newFinalParts.push(transcript)
          }
        } else {
          interim += transcript
        }
      }

      setInterimText(interim)
      onInterimRef.current?.(interim)

      if (newFinalParts.length > 0) {
        for (const part of newFinalParts) {
          emitFinal(part)
        }
      }
    }

    instance.onerror = (event) => {
      wantsRecordingRef.current = false
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
      wantsRecordingRef.current = false
    }

    recognitionRef.current = instance

    return () => {
      wantsRecordingRef.current = false
      instance.onstart = null
      instance.onresult = null
      instance.onerror = null
      instance.onend = null
      instance.abort()
      recognitionRef.current = null
    }
  }, [emitFinal, lang])

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
      resetSession()
      wantsRecordingRef.current = true
      recognitionRef.current?.abort()
      recognitionRef.current?.start()
    } catch {
      wantsRecordingRef.current = false
      setError('Не удалось начать запись')
      setIsRecording(false)
    }
  }, [resetSession])

  const stop = useCallback(() => {
    wantsRecordingRef.current = false
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
