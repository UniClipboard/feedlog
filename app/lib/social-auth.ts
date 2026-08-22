import {
  discardAuthResume,
  parkAuthResume,
  type AuthResumeIntent,
  type AuthResumeStorage,
} from './auth-resume'

export type SocialProvider = 'google' | 'github'

interface SocialSignInError {
  code?: string
  message?: string
}

interface SocialSignInInput {
  provider: SocialProvider
  callbackURL: string
  errorCallbackURL: string
}

interface BeginSocialRedirectOptions {
  provider: SocialProvider
  storage: AuthResumeStorage
  origin: string
  returnTo: string
  authDomain?: string
  intent?: AuthResumeIntent
  signIn: (input: SocialSignInInput) => Promise<{ error?: SocialSignInError | null }>
}

function resolveAuthOrigin(authDomain: string | undefined, currentOrigin: string): string {
  if (!authDomain) return currentOrigin
  try {
    const url = new URL(authDomain)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return currentOrigin
    return url.origin
  } catch {
    return currentOrigin
  }
}

function buildCallbackURL(currentOrigin: string, authDomain?: string): string {
  const callbackURL = `${currentOrigin}/auth/callback`
  const authOrigin = resolveAuthOrigin(authDomain, currentOrigin)
  if (authOrigin === currentOrigin) return callbackURL
  return `${authOrigin}/api/auth/post-login?return=${encodeURIComponent(callbackURL)}`
}

export async function beginSocialRedirect(
  options: BeginSocialRedirectOptions,
): Promise<SocialSignInError | null> {
  const parked = parkAuthResume(options.storage, {
    returnTo: options.returnTo,
    intent: options.intent,
  }, {
    origin: options.origin,
  })
  if (!parked) {
    return {
      code: 'RESUME_UNAVAILABLE',
      message: 'Unable to preserve the current page before sign in',
    }
  }

  try {
    const result = await options.signIn({
      provider: options.provider,
      callbackURL: buildCallbackURL(options.origin, options.authDomain),
      errorCallbackURL: `${options.origin}/auth/callback`,
    })
    if (result.error) discardAuthResume(options.storage)
    return result.error ?? null
  } catch (error) {
    discardAuthResume(options.storage)
    throw error
  }
}
