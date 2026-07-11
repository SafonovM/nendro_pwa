import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { PracticeTextList } from '../components/texts/PracticeTextList'
import { PracticeTextForm } from '../components/texts/PracticeTextForm'
import { usePracticeTextStore } from '../store/practiceTextStore'

export function PracticeTexts() {
  const loadTexts = usePracticeTextStore((s) => s.loadTexts)
  const searchQuery = usePracticeTextStore((s) => s.searchQuery)
  const setSearchQuery = usePracticeTextStore((s) => s.setSearchQuery)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadTexts()
  }, [loadTexts])

  return (
    <>
      <Header title="Тексты" />
      {!showForm && (
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию или файлу"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-10 pr-3 text-sm"
            />
          </div>
        </div>
      )}
      {showForm ? (
        <PracticeTextForm onDone={() => setShowForm(false)} />
      ) : (
        <>
          <PracticeTextList />
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3"
            >
              <Plus className="h-5 w-5" />
              Добавить текст
            </button>
          </div>
        </>
      )}
    </>
  )
}
