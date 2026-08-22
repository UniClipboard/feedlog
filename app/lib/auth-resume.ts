import { z } from 'zod/v4'

export const AUTH_RESUME_KEY = 'feedlog:auth:resume:v1'
export const AUTH_RESUME_MAX_AGE_MS = 10 * 60 * 1000

const votePostIntentSchema = z.object({
  type: z.literal('vote-post'),
  postId: z.uuid(),
})

const submitPostIntentSchema = z.object({
  type: z.literal('submit-post'),
  boardId: z.uuid().nullable(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
})

const openSubmitIntentSchema = z.object({
  type: z.literal('open-submit'),
  boardId: z.uuid().nullable(),
})

const authResumeIntentSchema = z.discriminatedUnion('type', [
  votePostIntentSchema,
  submitPostIntentSchema,
  openSubmitIntentSchema,
])

const authResumeSchema = z.object({
  version: z.literal(1),
  createdAt: z.number().int().nonnegative(),
  returnTo: z.string(),
  intent: authResumeIntentSchema.optional(),
})

export type AuthResumeIntent = z.infer<typeof authResumeIntentSchema>
export type AuthResumeState = z.infer<typeof authResumeSchema>

export interface AuthResumeStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

interface AuthResumeOptions {
  origin: string
  now?: number
}

function normalizeReturnTo(returnTo: string, origin: string): string {
  try {
    const trustedOrigin = new URL(origin).origin
    const target = new URL(returnTo, trustedOrigin)
    if (target.origin !== trustedOrigin) return '/'
    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return '/'
  }
}

export function parkAuthResume(
  storage: AuthResumeStorage,
  input: Pick<AuthResumeState, 'returnTo' | 'intent'>,
  options: AuthResumeOptions,
): boolean {
  try {
    const state = authResumeSchema.parse({
      version: 1,
      createdAt: options.now ?? Date.now(),
      returnTo: normalizeReturnTo(input.returnTo, options.origin),
      intent: input.intent,
    })
    storage.setItem(AUTH_RESUME_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function consumeAuthResume(
  storage: AuthResumeStorage,
  options: AuthResumeOptions,
): AuthResumeState | null {
  try {
    const raw = storage.getItem(AUTH_RESUME_KEY)
    storage.removeItem(AUTH_RESUME_KEY)
    if (!raw) return null

    const parsed = authResumeSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return null
    const now = options.now ?? Date.now()
    if (now - parsed.data.createdAt > AUTH_RESUME_MAX_AGE_MS) return null
    return {
      ...parsed.data,
      returnTo: normalizeReturnTo(parsed.data.returnTo, options.origin),
    }
  } catch {
    return null
  }
}

export function discardAuthResume(storage: AuthResumeStorage): void {
  try {
    storage.removeItem(AUTH_RESUME_KEY)
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}
