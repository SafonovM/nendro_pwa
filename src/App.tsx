import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { SplashScreen } from './components/layout/SplashScreen'
import { AlarmOverlay } from './components/alarms/AlarmOverlay'
import { Dashboard } from './pages/Dashboard'
import { Practices } from './pages/Practices'
import { PracticeDetail } from './pages/PracticeDetail'
import { PracticeEdit } from './pages/PracticeEdit'
import { Transmissions } from './pages/Transmissions'
import { Dreams } from './pages/Dreams'
import { DreamDetail } from './pages/DreamDetail'
import { PracticeTexts } from './pages/PracticeTexts'
import { PracticeTextDetail, PracticeTextEdit } from './pages/PracticeTextDetail'
import { Settings } from './pages/Settings'
import { useSettingsStore } from './store/settingsStore'
import { useAlarmScheduler } from './hooks/useAlarmScheduler'

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useSettingsStore((s) => s.themeMode)

  useEffect(() => {
    const apply = (dark: boolean) => {
      document.documentElement.classList.toggle('dark', dark)
    }
    if (themeMode === 'dark') {
      apply(true)
    } else if (themeMode === 'light') {
      apply(false)
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches)
      const handler = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [themeMode])

  return <>{children}</>
}

export default function App() {
  const splashShown = useSettingsStore((s) => s.splashShown)
  const [showSplash, setShowSplash] = useState(!splashShown)
  const { activeAlarm, dismissAlarm } = useAlarmScheduler()

  return (
    <ThemeProvider>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      {activeAlarm && <AlarmOverlay alarm={activeAlarm} onDismiss={dismissAlarm} />}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/practices" element={<Practices />} />
            <Route path="/practices/:id" element={<PracticeDetail />} />
            <Route path="/practices/:id/edit" element={<PracticeEdit />} />
            <Route path="/transmissions" element={<Transmissions />} />
            <Route path="/dreams" element={<Dreams />} />
            <Route path="/dreams/:id" element={<DreamDetail />} />
            <Route path="/practice-texts" element={<PracticeTexts />} />
            <Route path="/practice-texts/:id/edit" element={<PracticeTextEdit />} />
            <Route path="/practice-texts/:id" element={<PracticeTextDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
