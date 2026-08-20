/**
 * Wraps a reactive boolean so that true→false transitions
 * are held for at least `minMs` milliseconds,
 * while false→true transitions are immediate.
 */
export function useDebouncedLoading(
  source: Ref<boolean> | ComputedRef<boolean>,
  minMs = 400,
): Readonly<Ref<boolean>> {
  const debounced = ref(source.value)
  let startedAt = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(source, (loading) => {
    if (loading) {
      if (timer) { clearTimeout(timer); timer = null }
      startedAt = Date.now()
      debounced.value = true
    } else {
      const remaining = Math.max(0, minMs - (Date.now() - startedAt))
      timer = setTimeout(() => { debounced.value = false; timer = null }, remaining)
    }
  }, { immediate: true })

  return readonly(debounced)
}
