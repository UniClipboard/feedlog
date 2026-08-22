import type { AuthResumeIntent } from '~/lib/auth-resume'

export function useLoginModal() {
  const isOpen = useState('login-modal', () => false)
  const { setPending, clearPending } = usePendingAction()

  function open(intent?: AuthResumeIntent) {
    if (intent) setPending(intent)
    else clearPending()
    isOpen.value = true
  }

  return {
    isOpen,
    open,
  }
}
