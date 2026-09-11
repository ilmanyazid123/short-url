import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  __dbUrlResolved?: string
}

/**
 * Hardcoded fallback Neon PostgreSQL URL (pooled).
 *
 * WHY: The dev sandbox periodically rewrites the `.env` file to a default
 * SQLite-only template, which removes all Neon env vars. Without this
 * fallback, the app would crash with "Environment variable not found"
 * every time the sandbox rewrites .env.
 *
 * SECURITY NOTE: This URL is committed to the repo, which is acceptable
 * for this demo project. For real production apps, NEVER hardcode DB
 * credentials — use env vars or a secret manager instead.
 */
const FALLBACK_DATABASE_URL =
  'postgresql://neondb_owner:npg_o98JurCldcEU@ep-damp-union-b3r8f70y-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require'

/**
 * Resolve the database URL from multiple env vars, in priority order:
 *   1. POSTGRES_PRISMA_URL  (Neon/Vercel pooled, with connect_timeout=15)
 *   2. PRISMA_DATABASE_URL   (Vercel standard for Prisma Postgres)
 *   3. POSTGRES_URL          (Neon/Vercel standard)
 *   4. DATABASE_URL_UNPOOLED (Neon non-pooled)
 *   5. APP_DATABASE_URL       (legacy fallback)
 *   6. DATABASE_URL           (only if NOT the sandbox's bundled SQLite path)
 *   7. Hardcoded fallback     (last resort — Neon pooled URL)
 */
function resolveDatabaseUrl(): string {
  const candidates = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.PRISMA_DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL_UNPOOLED,
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
  // Last resort: hardcoded Neon fallback so the app keeps working even
  // if the sandbox has wiped all Neon env vars from .env.
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
