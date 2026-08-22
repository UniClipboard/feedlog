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

  seed(key: string, value: string) {
    this.values.set(key, value)
  }
}

test('auth resume state is consumed only once', async () => {
  const authResume = await import('../app/lib/auth-resume.ts').catch(() => null)
  assert.ok(authResume, 'auth resume module should exist')

  const storage = new MemoryStorage()
  const saved = authResume.parkAuthResume(storage, {
    returnTo: '/zh?p=1#comments',
    intent: { type: 'vote-post', postId: '018f47a2-3d5b-7c8d-9e0f-123456789abc' },
  }, {
    origin: 'https://feedback.feedlog.ai',
    now: 1_000,
  })

  assert.equal(saved, true)
  assert.deepEqual(authResume.consumeAuthResume(storage, {
    origin: 'https://feedback.feedlog.ai',
    now: 2_000,
  }), {
    version: 1,
    createdAt: 1_000,
    returnTo: '/zh?p=1#comments',
    intent: { type: 'vote-post', postId: '018f47a2-3d5b-7c8d-9e0f-123456789abc' },
  })
  assert.equal(authResume.consumeAuthResume(storage, {
    origin: 'https://feedback.feedlog.ai',
    now: 2_000,
  }), null)
})

test('auth resume never returns to another origin', async () => {
  const { parkAuthResume, consumeAuthResume } = await import('../app/lib/auth-resume.ts')
  const storage = new MemoryStorage()

  parkAuthResume(storage, {
    returnTo: 'https://malicious.example/steal',
  }, {
    origin: 'https://feedback.feedlog.ai',
    now: 1_000,
  })

  const resumed = consumeAuthResume(storage, {
    origin: 'https://feedback.feedlog.ai',
    now: 2_000,
  })
  assert.equal(resumed?.returnTo, '/')
})

test('tampered stored return paths are normalized again when consumed', async () => {
  const { AUTH_RESUME_KEY, consumeAuthResume } = await import('../app/lib/auth-resume.ts')
  const storage = new MemoryStorage()
  storage.seed(AUTH_RESUME_KEY, JSON.stringify({
    version: 1,
    createdAt: 1_000,
    returnTo: 'https://malicious.example/after-login',
  }))

  assert.equal(consumeAuthResume(storage, {
    origin: 'https://feedback.feedlog.ai',
    now: 2_000,
  })?.returnTo, '/')
})

test('expired auth resume state is discarded', async () => {
  const {
    AUTH_RESUME_MAX_AGE_MS,
    parkAuthResume,
    consumeAuthResume,
  } = await import('../app/lib/auth-resume.ts')
  const storage = new MemoryStorage()

  parkAuthResume(storage, { returnTo: '/invite?id=abc' }, {
    origin: 'https://feedback.feedlog.ai',
    now: 1_000,
  })

  assert.equal(consumeAuthResume(storage, {
    origin: 'https://feedback.feedlog.ai',
    now: 1_000 + AUTH_RESUME_MAX_AGE_MS + 1,
  }), null)
})

test('post draft survives the auth redirect round trip', async () => {
  const { parkAuthResume, consumeAuthResume } = await import('../app/lib/auth-resume.ts')
  const storage = new MemoryStorage()
  const intent = {
    type: 'submit-post' as const,
    boardId: '018f47a2-3d5b-7c8d-9e0f-123456789abc',
    title: 'Mobile sign-in loses my draft',
    content: 'Steps and details that must survive the redirect.',
  }

  assert.equal(parkAuthResume(storage, {
    returnTo: '/zh?b=bugs',
    intent,
  }, {
    origin: 'https://feedback.feedlog.ai',
    now: 1_000,
  }), true)

  assert.deepEqual(consumeAuthResume(storage, {
    origin: 'https://feedback.feedlog.ai',
    now: 2_000,
  })?.intent, intent)
})

test('malformed auth resume state is ignored', async () => {
  const { AUTH_RESUME_KEY, consumeAuthResume } = await import('../app/lib/auth-resume.ts')
  const storage = new MemoryStorage()
  storage.seed(AUTH_RESUME_KEY, '{not-json')

  assert.doesNotThrow(() => {
    assert.equal(consumeAuthResume(storage, {
      origin: 'https://feedback.feedlog.ai',
      now: 2_000,
    }), null)
  })
})

test('new-post intent survives without a draft', async () => {
  const { parkAuthResume, consumeAuthResume } = await import('../app/lib/auth-resume.ts')
  const storage = new MemoryStorage()
  const intent = {
    type: 'open-submit' as const,
    boardId: '018f47a2-3d5b-7c8d-9e0f-123456789abc',
  }

  assert.equal(parkAuthResume(storage, {
    returnTo: '/zh',
    intent,
  }, {
    origin: 'https://feedback.feedlog.ai',
    now: 1_000,
  }), true)
  assert.deepEqual(consumeAuthResume(storage, {
    origin: 'https://feedback.feedlog.ai',
    now: 2_000,
  })?.intent, intent)
})
