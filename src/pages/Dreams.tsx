import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { DreamList } from '../components/dreams/DreamList'
import { DreamForm } from '../components/dreams/DreamForm'
import { useDreamStore } from '../store/dreamStore'

export function Dreams() {
  const navigate = useNavigate()
  const loadDreams = useDreamStore((s) => s.loadDreams)
  const searchQuery = useDreamStore((s) => s.searchQuery)
  const setSearchQuery = useDreamStore((s) => s.setSearchQuery)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadDreams()
  }, [loadDreams])

  return (
    <>
      <Header title="Сны" />
      {!showForm && (
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по снам..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-2.5 pl-10 pr-3 text-sm"
            />
          </div>
        </div>
      )}
      {showForm ? (
        <DreamForm
          onDone={(dreamId) => {
            setShowForm(false)
            navigate(`/dreams/${dreamId}`)
          }}
        />
      ) : (
        <>
          <DreamList />
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3"
            >
              <Plus className="h-5 w-5" />
              Записать сон
            </button>
          </div>
        </>
      )}
    </>
  )
}
