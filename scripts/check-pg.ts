import { PrismaClient } from '@prisma/client'

const url = process.env.PRISMA_DATABASE_URL
if (!url) {
  console.error('PRISMA_DATABASE_URL is not set')
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: { db: { url } },
})

async function main() {
  const count = await prisma.shortUrl.count()
  console.log(`PostgreSQL has ${count} short URLs`)
  const latest = await prisma.shortUrl.findFirst({
    orderBy: { createdAt: 'desc' },
  })
  if (latest) {
    console.log('Latest:', latest.shortCode, latest.originalUrl, 'visits:', latest.visits)
  }
}

main()
  .catch((e) => {
    console.error('Error:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
