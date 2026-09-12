import { cookies } from 'next/headers'

const SECRET =
  process.env.AUTH_SECRET ||
  'shorturl-admin-secret-2026-change-in-production-7f3a9b2e'
const COOKIE_NAME = 'admin_session'
const SESSION_DURATION_SEC = 60 * 60 * 24 * 7 // 7 days

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123'
const ROOT_USERNAME = process.env.ROOT_USERNAME || 'root'
const ROOT_PASSWORD = process.env.ROOT_PASSWORD || 'root-password-2026'

export type Role = 'admin' | 'root'

/**
 * Constant-time string comparison (runtime-agnostic).
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
 * Verify credentials and return the matching role, or null if invalid.
 * Root credentials take precedence over admin (so root can also access
 * the admin area, but admin cannot access the root area).
 */
export function verifyCredentials(
  username: string,
  password: string
): Role | null {
  if (!username || !password) return null

  // Check root first — root is the highest authority
  if (
    timingSafeEqualStr(username, ROOT_USERNAME) &&
    timingSafeEqualStr(password, ROOT_PASSWORD)
  ) {
    return 'root'
  }

  // Then regular admin
  if (
    timingSafeEqualStr(username, ADMIN_USERNAME) &&
    timingSafeEqualStr(password, ADMIN_PASSWORD)
  ) {
    return 'admin'
  }

  return null
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

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
 * Create a signed session token: `<role>:<expiresAtMs>.<signature>`.
 * The role is embedded so middleware/server can know who's calling
 * without an extra DB lookup.
 */
export async function createSessionToken(role: Role): Promise<{
  token: string
  maxAge: number
  role: Role
}> {
  const expiresAt = Date.now() + SESSION_DURATION_SEC * 1000
  const payload = `${role}:${expiresAt}`
  const signature = await sign(payload)
  const token = `${payload}.${signature}`
  return { token, maxAge: SESSION_DURATION_SEC, role }
}

/**
 * Verify a session token. Returns the role if valid & not expired,
 * otherwise null.
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<Role | null> {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const parts = payload.split(':')
  if (parts.length !== 2) return null
  const [role, expiresStr] = parts
  if (role !== 'admin' && role !== 'root') return null

  const expiresAt = parseInt(expiresStr, 10)
  if (Number.isNaN(expiresAt) || expiresAt < Date.now()) return null

  const expectedSig = await sign(payload)
  if (!timingSafeEqualHex(signature, expectedSig)) return null

  return role as Role
}

export const SESSION_COOKIE_NAME = COOKIE_NAME
export const SESSION_MAX_AGE = SESSION_DURATION_SEC

/**
 * Check the role of the current request.
 * For use in Server Components / Route Handlers (NOT middleware).
 */
export async function getAuthRole(): Promise<Role | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  return verifySessionToken(token)
}

/**
 * Backward-compat: returns true if user is authenticated as admin OR root.
 */
export async function isAuthenticated(): Promise<boolean> {
  const role = await getAuthRole()
  return role !== null
}

/**
 * Returns true if user is authenticated as root only.
 */
export async function isRoot(): Promise<boolean> {
  const role = await getAuthRole()
  return role === 'root'
}
