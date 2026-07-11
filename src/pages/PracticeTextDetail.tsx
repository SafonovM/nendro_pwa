import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Paperclip, ExternalLink } from 'lucide-react'
import { PracticeTextForm } from '../components/texts/PracticeTextForm'
import type { PracticeText } from '../lib/db'
import { usePracticeTextStore, openPracticeTextFile } from '../store/practiceTextStore'

export function PracticeTextDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const textId = Number(id)
  const getText = usePracticeTextStore((s) => s.getText)
  const getFileBlob = usePracticeTextStore((s) => s.getFileBlob)
  const deleteText = usePracticeTextStore((s) => s.deleteText)

  const [text, setText] = useState<PracticeText | null>(null)
  const [fileBlob, setFileBlob] = useState<Blob | null>(null)

  useEffect(() => {
    getText(textId).then(async (t) => {
      setText(t ?? null)
      if (t?.fileName) {
        const blob = await getFileBlob(textId)
        setFileBlob(blob ?? null)
      }
    })
  }, [textId, getText, getFileBlob])

  if (!text) {
    return <p className="p-4 text-[var(--text-muted)]">Текст не найден</p>
  }

  const handleDelete = async () => {
    if (confirm('Текст и прикреплённый файл будут удалены безвозвратно. Удалить?')) {
      await deleteText(textId)
      navigate('/practice-texts')
    }
  }

  const handleOpenFile = () => {
    if (fileBlob && text.fileName) {
      openPracticeTextFile(fileBlob, text.fileName, text.mimeType)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Назад">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display flex-1 line-clamp-1 text-lg font-semibold text-[var(--color-primary)]">
          {text.title}
        </h1>
        <Link
          to={`/practice-texts/${textId}/edit`}
          className="p-1 text-[var(--text-muted)]"
          aria-label="Редактировать"
        >
          <Pencil className="h-5 w-5" />
        </Link>
        <button type="button" onClick={handleDelete} className="p-1 text-[var(--text-muted)]" aria-label="Удалить">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {text.description && (
          <div className="card p-4">
            <p className="whitespace-pre-wrap text-sm">{text.description}</p>
          </div>
        )}

        {text.fileName && fileBlob ? (
          <div className="card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm">
              <Paperclip className="h-4 w-4 text-[var(--color-secondary)]" />
              <span className="line-clamp-2">{text.fileName}</span>
            </div>
            <button
              type="button"
              onClick={handleOpenFile}
              className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3"
            >
              <ExternalLink className="h-4 w-4" />
              Открыть файл
            </button>
          </div>
        ) : (
          <Link
            to={`/practice-texts/${textId}/edit`}
            className="btn-secondary flex items-center justify-center px-4 py-3"
          >
            Выбрать файл
          </Link>
        )}
      </div>
    </>
  )
}

export function PracticeTextEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const textId = Number(id)

  return (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Назад">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-medium">Редактировать текст</h1>
      </div>
      <PracticeTextForm textId={textId} onDone={() => navigate(`/practice-texts/${textId}`)} />
    </>
  )
}
