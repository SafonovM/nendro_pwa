import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { AstroCard } from '../components/astro/AstroCard'
import { PracticeCard } from '../components/practice/PracticeCard'
import { usePracticeStore } from '../store/practiceStore'

export function Dashboard() {
  const practices = usePracticeStore((s) => s.practices)
  const loadPractices = usePracticeStore((s) => s.loadPractices)

  useEffect(() => {
    loadPractices()
  }, [loadPractices])

  const recent = practices.slice(0, 3)

  return (
    <>
      <Header showLogo />
      <div className="px-4 py-4">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-[var(--color-primary)]">
            Добро пожаловать на путь практики
          </h2>
          <p className="mt-1 text-lg text-[var(--color-accent)]">ཡུང་དྲུང་བོན</p>
        </div>

        <div className="mb-6">
          <AstroCard />
        </div>

        {recent.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">Практики</h3>
              <Link
                to="/practices"
                className="flex items-center gap-1 text-sm text-[var(--color-secondary)]"
              >
                Все
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recent.map((p) => (
                <PracticeCard key={p.id} practice={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
