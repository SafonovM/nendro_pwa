import { useState } from 'react'
import { Plus } from 'lucide-react'
import { usePracticeStore } from '../../store/practiceStore'
import { PracticeCard } from './PracticeCard'
import { PracticeForm } from './PracticeForm'
import { EmptyState } from '../ui/EmptyState'

export function PracticeList() {
  const practices = usePracticeStore((s) => s.practices)
  const [showForm, setShowForm] = useState(false)

  if (practices.length === 0 && !showForm) {
    return (
      <>
        <EmptyState
          title="Практики не добавлены"
          subtitle="Создайте практику Нёндро или выберите из предустановленных категорий"
        />
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3"
          >
            <Plus className="h-5 w-5" />
            Добавить практику
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {practices.map((p) => (
        <PracticeCard key={p.id} practice={p} />
      ))}

      {showForm ? (
        <PracticeForm onDone={() => setShowForm(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-secondary flex items-center justify-center gap-2 px-4 py-3"
        >
          <Plus className="h-5 w-5" />
          Добавить практику
        </button>
      )}
    </div>
  )
}
