export function useLoginModal() {
  const isOpen = useState('login-modal', () => false)
  return {
    isOpen,
    open: () => { isOpen.value = true },
  }
}
