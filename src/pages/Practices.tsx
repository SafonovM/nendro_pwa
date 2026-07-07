import { useEffect } from 'react'
import { Header } from '../components/layout/Header'
import { PracticeList } from '../components/practice/PracticeList'
import { usePracticeStore } from '../store/practiceStore'

export function Practices() {
  const loadPractices = usePracticeStore((s) => s.loadPractices)

  useEffect(() => {
    loadPractices()
  }, [loadPractices])

  return (
    <>
      <Header title="Практики" />
      <PracticeList />
    </>
  )
}
