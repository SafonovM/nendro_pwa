import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Paperclip } from 'lucide-react'
import { usePracticeTextStore } from '../../store/practiceTextStore'
import { EmptyState } from '../ui/EmptyState'

export function PracticeTextList() {
  const texts = usePracticeTextStore((s) => s.texts)
  const searchQuery = usePracticeTextStore((s) => s.searchQuery)

  const filteredTexts = useMemo(() => {
    if (!searchQuery.trim()) return texts
    const q = searchQuery.toLowerCase()
    return texts.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false) ||
        (t.fileName?.toLowerCase().includes(q) ?? false),
    )
  }, [texts, searchQuery])

  if (filteredTexts.length === 0) {
    return (
      <EmptyState
        title={searchQuery ? 'Ничего не найдено' : 'Нет текстов практик'}
        subtitle={
          searchQuery
            ? undefined
            : 'Добавьте тексты и прикрепите файлы с вашего устройства'
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {filteredTexts.map((text) => (
        <Link
          key={text.id}
          to={`/practice-texts/${text.id}`}
          className="card block p-4 transition-opacity active:opacity-80"
        >
          <h3 className="font-display line-clamp-1 text-lg font-semibold text-[var(--color-primary)]">
            {text.title}
          </h3>
          {text.description && (
            <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{text.description}</p>
          )}
          {text.fileName && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-secondary)]">
              <Paperclip className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{text.fileName}</span>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
