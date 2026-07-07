import { useState, useEffect } from 'react'
import { assetUrl } from '../../lib/assetUrl'
import { useSettingsStore } from '../../store/settingsStore'

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fade, setFade] = useState(false)
  const markSplashShown = useSettingsStore((s) => s.markSplashShown)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFade(true), 2000)
    const doneTimer = setTimeout(() => {
      markSplashShown()
      onDone()
    }, 2600)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone, markSplashShown])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1A3A6B] ${fade ? 'splash-fade' : ''}`}
    >
      <img
        src={assetUrl('splash.svg')}
        alt="Юнгдрунг Бон"
        className="h-full w-full object-cover"
      />
      <div className="absolute bottom-16 text-center">
        <p className="font-display text-2xl font-bold text-[#D4A853]">Юнгдрунг Бон</p>
        <p className="mt-1 text-sm text-white/70">ཡུང་དྲུང་བོན</p>
      </div>
    </div>
  )
}
