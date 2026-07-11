import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { usePracticeStore } from '../../store/practiceStore'
import { PracticeCard } from './PracticeCard'
import { EmptyState } from '../ui/EmptyState'

export function PracticeList() {
  const practices = usePracticeStore((s) => s.practices)

  if (practices.length === 0) {
    return (
      <>
        <EmptyState
          title="Практики не добавлены"
          subtitle="Создайте практику Нёндро или выберите из предустановленных категорий"
        />
        <div className="px-4 pb-4">
          <Link
            to="/practices/add"
            className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3"
          >
            <Plus className="h-5 w-5" />
            Добавить практику
          </Link>
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {practices.map((p) => (
        <PracticeCard key={p.id} practice={p} />
      ))}

      <Link
        to="/practices/add"
        className="btn-secondary flex items-center justify-center gap-2 px-4 py-3"
      >
        <Plus className="h-5 w-5" />
        Добавить практику
      </Link>
    </div>
  )
}