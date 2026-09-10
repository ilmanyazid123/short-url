import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Resolve the database URL from multiple env vars, in priority order:
 *   1. PRISMA_DATABASE_URL  (Vercel standard for Prisma Postgres)
 *   2. POSTGRES_URL         (Vercel standard non-pooled)
 *   3. POSTGRES_PRISMA_URL   (Vercel standard pooled)
 *   4. APP_DATABASE_URL      (legacy fallback used in this project)
 *   5. DATABASE_URL          (only if NOT the sandbox's bundled SQLite path,
 *                              which is auto-set by the dev sandbox and would
 *                              shadow the real Postgres URL)
 */
function resolveDatabaseUrl(): string | undefined {
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
  return undefined
}

const datasourceUrl = resolveDatabaseUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: datasourceUrl
      ? {
          db: {
            url: datasourceUrl,
          },
        }
      : undefined,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
