import { beginSocialRedirect, type SocialProvider } from '~/lib/social-auth'

export function useSocialSignIn() {
  const { signIn } = useAuth()
  const route = useRoute()
  const config = useRuntimeConfig()
  const { pending, clearPending } = usePendingAction()
  const pendingProvider = shallowRef<SocialProvider | null>(null)

  async function start(provider: SocialProvider) {
    pendingProvider.value = provider
    try {
      const error = await beginSocialRedirect({
        provider,
        storage: window.sessionStorage,
        origin: window.location.origin,
        returnTo: route.fullPath,
        authDomain: config.public.authDomain as string | undefined,
        intent: pending.value ?? undefined,
        signIn: input => signIn.social(input),
      })
      if (error) clearPending()
      return error
    } catch (error) {
      clearPending()
      throw error
    } finally {
      pendingProvider.value = null
    }
  }

  return {
    pendingProvider: readonly(pendingProvider),
    start,
  }
}
