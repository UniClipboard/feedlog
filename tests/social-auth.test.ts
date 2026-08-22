import assert from 'node:assert/strict'
import test from 'node:test'

class MemoryStorage {
  private readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }

  removeItem(key: string) {
    this.values.delete(key)
  }
}

test('social sign-in uses a full-page redirect and preserves the return context', async () => {
  const socialAuth = await import('../app/lib/social-auth.ts').catch(() => null)
  assert.ok(socialAuth, 'social auth module should exist')
  const { consumeAuthResume } = await import('../app/lib/auth-resume.ts')
  const storage = new MemoryStorage()
  let request: Record<string, unknown> | undefined

  const error = await socialAuth.beginSocialRedirect({
    provider: 'github',
    storage,
    origin: 'https://feedback.feedlog.ai',
    returnTo: '/zh/invite?id=abc',
    authDomain: 'https://auth.feedlog.ai',
    intent: { type: 'vote-post', postId: '018f47a2-3d5b-7c8d-9e0f-123456789abc' },
    signIn: async (input) => {
      request = input
      return { error: null }
    },
  })

  assert.equal(error, null)
  assert.deepEqual(request, {
    provider: 'github',
    callbackURL: 'https://auth.feedlog.ai/api/auth/post-login?return=https%3A%2F%2Ffeedback.feedlog.ai%2Fauth%2Fcallback',
    errorCallbackURL: 'https://feedback.feedlog.ai/auth/callback',
  })
  assert.deepEqual(consumeAuthResume(storage, {
    origin: 'https://feedback.feedlog.ai',
  })?.intent, {
    type: 'vote-post',
    postId: '018f47a2-3d5b-7c8d-9e0f-123456789abc',
  })
})

test('failed social sign-in discards the parked action', async () => {
  const { beginSocialRedirect } = await import('../app/lib/social-auth.ts')
  const { consumeAuthResume } = await import('../app/lib/auth-resume.ts')
  const storage = new MemoryStorage()

  const error = await beginSocialRedirect({
    provider: 'github',
    storage,
    origin: 'https://feedback.feedlog.ai',
    returnTo: '/zh',
    intent: { type: 'vote-post', postId: '018f47a2-3d5b-7c8d-9e0f-123456789abc' },
    signIn: async () => ({ error: { code: 'NETWORK_ERROR', message: 'offline' } }),
  })

  assert.deepEqual(error, { code: 'NETWORK_ERROR', message: 'offline' })
  assert.equal(consumeAuthResume(storage, {
    origin: 'https://feedback.feedlog.ai',
  }), null)
})

test('social sign-in does not leave when return context cannot be saved', async () => {
  const { beginSocialRedirect } = await import('../app/lib/social-auth.ts')
  let signInCalled = false
  const storage = {
    getItem: () => null,
    setItem: () => { throw new Error('storage disabled') },
    removeItem: () => {},
  }

  const error = await beginSocialRedirect({
    provider: 'github',
    storage,
    origin: 'https://feedback.feedlog.ai',
    returnTo: '/zh',
    signIn: async () => {
      signInCalled = true
      return { error: null }
    },
  })

  assert.equal(signInCalled, false)
  assert.deepEqual(error, {
    code: 'RESUME_UNAVAILABLE',
    message: 'Unable to preserve the current page before sign in',
  })
})
