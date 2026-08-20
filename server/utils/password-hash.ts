// Web Crypto PBKDF2 password hashing — drop-in replacement for better-auth's
// default scrypt (N=16384, r=16, p=1) which costs ~2s of pure-JS CPU per
// verify and trips Cloudflare Workers Free's CPU-time limit. SubtleCrypto
// hits the runtime's native PBKDF2 path and stays well under the ceiling.
//
// Storage format: `pbkdf2-sha256$<iterations>$<saltHex>$<keyHex>`. Encoding
// the algo and iteration count in-band lets verify identify each record's
// strength, so future iteration bumps can lazy-rehash without locking out
// existing users.

const PBKDF2_ITERATIONS = 100_000
const PBKDF2_HASH = 'SHA-256'
const PBKDF2_KEY_BYTES = 32
const PBKDF2_SALT_BYTES = 16
const HASH_PREFIX = 'pbkdf2-sha256'

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

async function deriveBits(password: string, salt: Uint8Array, iterations: number, bits: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password.normalize('NFKC')),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  )
  const buf = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: PBKDF2_HASH }, key, bits)
  return new Uint8Array(buf)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES))
  const derived = await deriveBits(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_BYTES * 8)
  return `${HASH_PREFIX}$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(derived)}`
}

export async function verifyPassword({ hash, password }: { hash: string; password: string }): Promise<boolean> {
  const parts = hash.split('$')
  if (parts.length !== 4 || parts[0] !== HASH_PREFIX) return false
  const iterations = parseInt(parts[1], 10)
  if (!Number.isFinite(iterations) || iterations < 1) return false
  const salt = hexToBytes(parts[2])
  const expected = hexToBytes(parts[3])
  const derived = await deriveBits(password, salt, iterations, expected.length * 8)
  return constantTimeEqual(derived, expected)
}
