import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { SplashScreen } from './components/layout/SplashScreen'
import { Dashboard } from './pages/Dashboard'
import { Practices } from './pages/Practices'
import { PracticeDetail } from './pages/PracticeDetail'
import { Transmissions } from './pages/Transmissions'
import { Dreams } from './pages/Dreams'
import { Settings } from './pages/Settings'
import { useSettingsStore } from './store/settingsStore'

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

  return (
    <ThemeProvider>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/practices" element={<Practices />} />
            <Route path="/practices/:id" element={<PracticeDetail />} />
            <Route path="/transmissions" element={<Transmissions />} />
            <Route path="/dreams" element={<Dreams />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
