interface ConfirmDialogOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

interface ConfirmDialogState {
  open: boolean
  options: ConfirmDialogOptions
  resolve: ((value: boolean) => void) | null
}

const state = reactive<ConfirmDialogState>({
  open: false,
  options: { title: '' },
  resolve: null,
})

export function useConfirmDialog() {
  function confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      state.options = options
      state.resolve = resolve
      state.open = true
    })
  }
  return { confirm }
}

// Used by ConfirmDialogProvider to render the dialog
export function useConfirmDialogState() {
  function handleConfirm() {
    state.resolve?.(true)
    state.resolve = null
    state.open = false
  }

  function handleCancel() {
    state.resolve?.(false)
    state.resolve = null
    state.open = false
  }

  return { state, handleConfirm, handleCancel }
}
