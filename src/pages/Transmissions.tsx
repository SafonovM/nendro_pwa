import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { TransmissionList } from '../components/transmission/TransmissionList'
import { TransmissionForm } from '../components/transmission/TransmissionForm'
import { useTransmissionStore } from '../store/transmissionStore'

export function Transmissions() {
  const loadTransmissions = useTransmissionStore((s) => s.loadTransmissions)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadTransmissions()
  }, [loadTransmissions])

  return (
    <>
      <Header title="Передачи" />
      {showForm ? (
        <TransmissionForm onDone={() => setShowForm(false)} />
      ) : (
        <>
          <TransmissionList />
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3"
            >
              <Plus className="h-5 w-5" />
              Добавить передачу
            </button>
          </div>
        </>
      )}
    </>
  )
}
