import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  __dbUrlResolved?: string
}

/**
 * Hardcoded fallback PostgreSQL URL.
 *
 * WHY: The dev sandbox periodically resets the `.env` file to a default
 * SQLite-only template, which removes `PRISMA_DATABASE_URL`. Without this
 * fallback, the app would crash with "Environment variable not found"
 * every time the sandbox rewrites .env.
 *
 * SECURITY NOTE: This URL is committed to the repo, which is acceptable
 * for this demo project. For real production apps, NEVER hardcode DB
 * credentials — use env vars or a secret manager instead.
 */
const FALLBACK_DATABASE_URL =
  'postgres://9c84bd0eaa419e9d4b2c47cc1764235c3b99ca7891738b8404224b7aec2d8e3b:sk_z8F2bKrdgd9yShGrPR35c@db.prisma.io:5432/postgres?sslmode=require'

/**
 * Resolve the database URL from multiple env vars, in priority order:
 *   1. PRISMA_DATABASE_URL  (Vercel standard for Prisma Postgres)
 *   2. POSTGRES_URL         (Vercel standard non-pooled)
 *   3. POSTGRES_PRISMA_URL  (Vercel standard pooled)
 *   4. APP_DATABASE_URL      (legacy fallback used in this project)
 *   5. DATABASE_URL          (only if NOT the sandbox's bundled SQLite path,
 *                              which is auto-set by the dev sandbox and would
 *                              shadow the real Postgres URL)
 *   6. Hardcoded fallback     (last resort — see comment above)
 */
function resolveDatabaseUrl(): string {
  const candidates = [
    process.env.PRISMA_DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.APP_DATABASE_URL,
  ]
  for (const url of candidates) {
    if (url && url.trim()) return url.trim()
  }
  // Fallback to DATABASE_URL only if it is NOT pointing at the local
  // sandbox SQLite file (which the sandbox sets by default).
  const fallback = process.env.DATABASE_URL
  if (fallback && !fallback.startsWith('file:')) {
    return fallback
  }
  // Last resort: hardcoded fallback so the app keeps working even if the
  // sandbox has wiped PRISMA_DATABASE_URL from .env.
  return FALLBACK_DATABASE_URL
}

const datasourceUrl = resolveDatabaseUrl()

// One-time diagnostic log so we can verify which DB the runtime is using.
// Uses stderr (not stdout) so it appears in dev.log but doesn't pollute JSON.
if (!globalForPrisma.__dbUrlResolved) {
  globalForPrisma.__dbUrlResolved = datasourceUrl
  const proto = datasourceUrl.split('://')[0]
  const maskedHost = datasourceUrl
    .replace(/:\/\/[^@]*@/, '://***:***@')
    .split('?')[0]
  console.error(`[db] Resolved datasource: ${proto} -> ${maskedHost}`)
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: datasourceUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
