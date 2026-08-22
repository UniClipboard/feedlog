import type { AuthResumeIntent } from '~/lib/auth-resume'

export function usePendingAction() {
  const pending = useState<AuthResumeIntent | null>('pending-action', () => null)

  function setPending(action: AuthResumeIntent) {
    pending.value = action
  }

  function consumePending<T extends AuthResumeIntent['type']>(type: T): Extract<AuthResumeIntent, { type: T }> | null {
    if (pending.value?.type !== type) return null
    const action = pending.value
    pending.value = null
    return action as Extract<AuthResumeIntent, { type: T }>
  }

  function clearPending() {
    pending.value = null
  }

  return {
    pending: readonly(pending),
    setPending,
    consumePending,
    clearPending,
  }
}
