interface ConfirmDialogProps {
  open: boolean
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  message,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-sm p-4" role="alertdialog" aria-modal="true">
        <p className="text-sm">{message}</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onConfirm} className="btn-primary flex-1 px-4 py-2.5">
            {confirmLabel}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary flex-1 px-4 py-2.5">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
