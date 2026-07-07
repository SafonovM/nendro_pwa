import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export function useVoiceInput(onTranscript?: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognition = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    const instance = new SpeechRecognitionAPI()
    instance.continuous = true
    instance.interimResults = true
    instance.lang = 'ru-RU'

    instance.onresult = (event) => {
      let text = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }
      setTranscript(text)
      onTranscript?.(text)
    }

    instance.onerror = () => setIsRecording(false)
    instance.onend = () => setIsRecording(false)
    recognition.current = instance

    return () => {
      instance.stop()
    }
  }, [onTranscript])

  const start = useCallback(() => {
    recognition.current?.start()
    setIsRecording(true)
  }, [])

  const stop = useCallback(() => {
    recognition.current?.stop()
    setIsRecording(false)
  }, [])

  return {
    isRecording,
    transcript,
    start,
    stop,
    setTranscript,
    isSupported: !!recognition.current || !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  }
}
