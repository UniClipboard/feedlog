// Stores user's original intent (vote/post) before auth redirect
// so it can be replayed after login/verification completes

interface PendingAction {
  type: 'vote' | 'post'
  postId?: string
}

export function usePendingAction() {
  const pending = useState<PendingAction | null>('pending-action', () => null)

  function setPending(action: PendingAction) {
    pending.value = action
  }

  function consumePending(): PendingAction | null {
    const action = pending.value
    pending.value = null
    return action
  }

  return {
    pending: readonly(pending),
    setPending,
    consumePending,
  }
}
