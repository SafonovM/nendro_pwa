import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paperclip, X } from 'lucide-react'
import { usePracticeTextStore } from '../../store/practiceTextStore'

interface PracticeTextFormProps {
  textId?: number
  onDone?: () => void
}

export function PracticeTextForm({ textId, onDone }: PracticeTextFormProps) {
  const navigate = useNavigate()
  const getText = usePracticeTextStore((s) => s.getText)
  const addText = usePracticeTextStore((s) => s.addText)
  const updateText = usePracticeTextStore((s) => s.updateText)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [existingFileName, setExistingFileName] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [removeFile, setRemoveFile] = useState(false)
  const [titleError, setTitleError] = useState('')
  const [loading, setLoading] = useState(!!textId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEdit = textId !== undefined

  useEffect(() => {
    if (!textId) return
    getText(textId).then((text) => {
      if (text) {
        setTitle(text.title)
        setDescription(text.description ?? '')
        setExistingFileName(text.fileName ?? null)
      }
      setLoading(false)
    })
  }, [textId, getText])

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingFile(file)
      setRemoveFile(false)
    }
    e.target.value = ''
  }

  const handleRemoveFile = () => {
    setPendingFile(null)
    setRemoveFile(true)
    setExistingFileName(null)
  }

  const displayFileName = pendingFile?.name ?? (removeFile ? null : existingFileName)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError('Введите название')
      return
    }
    setTitleError('')

    if (isEdit && textId) {
      await updateText(textId, {
        title,
        description,
        file: pendingFile,
        removeFile,
      })
      onDone?.()
      navigate(`/practice-texts/${textId}`)
    } else {
      const id = await addText({ title, description, file: pendingFile })
      onDone?.()
      navigate(`/practice-texts/${id}`)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30'

  if (loading) {
    return <p className="p-4 text-sm text-[var(--text-muted)]">Загрузка…</p>
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-4 mb-4 flex flex-col gap-3 p-4">
      <h3 className="font-medium">{isEdit ? 'Редактировать текст' : 'Добавить текст'}</h3>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Название</label>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (titleError) setTitleError('')
          }}
          className={inputClass}
          required
        />
        {titleError && <p className="mt-1 text-xs text-red-600">{titleError}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Описание или заметки</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Прикреплённый файл</label>
        {displayFileName ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Paperclip className="h-4 w-4 shrink-0 text-[var(--color-secondary)]" />
              <span className="truncate text-sm">{displayFileName}</span>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-[var(--text-muted)]"
              aria-label="Удалить файл"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary w-full px-4 py-2.5"
          >
            Выбрать файл
          </button>
        )}
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          PDF, DOC, TXT и другие локальные файлы
        </p>
        <input ref={fileInputRef} type="file" onChange={handleFilePick} className="hidden" />
      </div>

      <button type="submit" className="btn-primary px-4 py-3">
        {isEdit ? 'Сохранить' : 'Создать'}
      </button>
    </form>
  )
}
