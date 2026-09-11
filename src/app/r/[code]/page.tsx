import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { RedirectClient } from './redirect-client'

type Params = { params: Promise<{ code: string }> }

export const dynamic = 'force-dynamic'

export default async function RedirectPage({ params }: Params) {
  const { code } = await params
  const record = await db.shortUrl.findUnique({
    where: { shortCode: code },
  })

  if (!record) {
    notFound()
  }

  // Serialize for client
  const data = {
    shortCode: record.shortCode,
    originalUrl: record.originalUrl,
    title: record.title,
  }

  return <RedirectClient data={data} />
}
