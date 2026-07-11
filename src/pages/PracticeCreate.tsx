import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PracticeForm } from '../components/practice/PracticeForm'

export function PracticeCreate() {
  const navigate = useNavigate()

  return (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Назад">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display flex-1 text-xl font-semibold text-[var(--color-primary)]">
          Новая практика
        </h1>
      </div>
      <PracticeForm onDone={() => navigate('/practices')} />
    </>
  )
}
