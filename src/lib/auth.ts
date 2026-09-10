import crypto from 'crypto'
import { cookies } from 'next/headers'

const SECRET =
  process.env.AUTH_SECRET || 'shorturl-admin-secret-2026-change-in-production-7f3a9b2e'
const COOKIE_NAME = 'admin_session'
const SESSION_DURATION_SEC = 60 * 60 * 24 * 7 // 7 days

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123'

/**
 * Verify credentials against the configured admin user/pass.
 * Uses timingSafeEqual to mitigate timing attacks.
 */
export function verifyCredentials(
  username: string,
  password: string
): boolean {
  if (!username || !password) return false
  try {
    const userBuf = Buffer.from(username)
    const expectedUserBuf = Buffer.from(ADMIN_USERNAME)
    const userOk =
      userBuf.length === expectedUserBuf.length &&
      crypto.timingSafeEqual(userBuf, expectedUserBuf)

    const passBuf = Buffer.from(password)
    const expectedPassBuf = Buffer.from(ADMIN_PASSWORD)
    const passOk =
      passBuf.length === expectedPassBuf.length &&
      crypto.timingSafeEqual(passBuf, expectedPassBuf)

    return userOk && passOk
  } catch {
    return false
  }
}

/**
 * Sign a payload with HMAC-SHA256, returning a hex signature.
 */
function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

/**
 * Create a signed session token: `admin:<expiresAtMs>.<signature>`.
 */
export function createSessionToken(): { token: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_DURATION_SEC * 1000
  const payload = `admin:${expiresAt}`
  const signature = sign(payload)
  const token = `${payload}.${signature}`
  return { token, maxAge: SESSION_DURATION_SEC }
}

/**
 * Verify a session token. Returns true if valid & not expired.
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  const parts = payload.split(':')
  if (parts.length !== 2) return false
  const [username, expiresStr] = parts
  if (username !== 'admin') return false

  const expiresAt = parseInt(expiresStr, 10)
  if (Number.isNaN(expiresAt) || expiresAt < Date.now()) return false

  const expectedSig = sign(payload)
  try {
    const a = Buffer.from(signature, 'hex')
    const b = Buffer.from(expectedSig, 'hex')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME
export const SESSION_MAX_AGE = SESSION_DURATION_SEC

/**
 * Check whether the current request is authenticated.
 * For use in Server Components / Route Handlers.
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  return verifySessionToken(token)
}
