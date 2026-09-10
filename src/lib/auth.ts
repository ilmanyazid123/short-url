import { cookies } from 'next/headers'

const SECRET =
  process.env.AUTH_SECRET ||
  'shorturl-admin-secret-2026-change-in-production-7f3a9b2e'
const COOKIE_NAME = 'admin_session'
const SESSION_DURATION_SEC = 60 * 60 * 24 * 7 // 7 days

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123'

/**
 * Constant-time string comparison (runtime-agnostic).
 * Works in both Node.js and Edge runtimes without importing `node:crypto`.
 */
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Verify credentials against the configured admin user/pass.
 */
export function verifyCredentials(
  username: string,
  password: string
): boolean {
  if (!username || !password) return false
  return (
    timingSafeEqualStr(username, ADMIN_USERNAME) &&
    timingSafeEqualStr(password, ADMIN_PASSWORD)
  )
}

/**
 * Convert bytes to a hex string (avoids Buffer dependency for Edge Runtime).
 */
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Convert a hex string to bytes.
 */
function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

/**
 * Constant-time comparison of two hex strings.
 */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const aBytes = fromHex(a)
  const bBytes = fromHex(b)
  let result = 0
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i]
  }
  return result === 0
}

/**
 * Lazy-imported HMAC CryptoKey (cached after first call).
 * Uses the Web Crypto API (works in both Edge and Node.js runtimes).
 */
let cachedKey: CryptoKey | null = null
async function getHmacKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey
  const encoder = new TextEncoder()
  cachedKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return cachedKey
}

/**
 * Sign a payload with HMAC-SHA256 (Web Crypto API).
 * Returns a hex-encoded signature.
 */
async function sign(payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await getHmacKey()
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  )
  return toHex(new Uint8Array(signature))
}

/**
 * Create a signed session token: `admin:<expiresAtMs>.<signature>`.
 */
export async function createSessionToken(): Promise<{
  token: string
  maxAge: number
}> {
  const expiresAt = Date.now() + SESSION_DURATION_SEC * 1000
  const payload = `admin:${expiresAt}`
  const signature = await sign(payload)
  const token = `${payload}.${signature}`
  return { token, maxAge: SESSION_DURATION_SEC }
}

/**
 * Verify a session token. Returns true if valid & not expired.
 * Async because Web Crypto API returns Promises.
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  const parts = payload.split(':')
  if (parts.length !== 2) return false
  const [username, expiresStr] = parts
  if (username !== 'admin') return false

  const expiresAt = parseInt(expiresStr, 10)
  if (Number.isNaN(expiresAt) || expiresAt < Date.now()) return false

  const expectedSig = await sign(payload)
  return timingSafeEqualHex(signature, expectedSig)
}

export const SESSION_COOKIE_NAME = COOKIE_NAME
export const SESSION_MAX_AGE = SESSION_DURATION_SEC

/**
 * Check whether the current request is authenticated.
 * For use in Server Components / Route Handlers (NOT middleware —
 * middleware uses `request.cookies` directly).
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  return verifySessionToken(token)
}
