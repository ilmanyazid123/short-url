import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Explicitly override the datasource URL so the runtime Prisma Client
// connects to PostgreSQL (APP_DATABASE_URL) instead of any DATABASE_URL
// that the sandbox may have set in the process environment.
const datasourceUrl =
  process.env.APP_DATABASE_URL || process.env.DATABASE_URL

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
