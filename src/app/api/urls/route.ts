import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const urls = await db.shortUrl.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      urls: urls.map((u) => ({
        id: u.id,
        shortCode: u.shortCode,
        originalUrl: u.originalUrl,
        title: u.title,
        visits: u.visits,
        createdAt: u.createdAt,
        shortUrl: `/r/${u.shortCode}`,
      })),
      total: urls.length,
      totalVisits: urls.reduce((sum, u) => sum + u.visits, 0),
    })
  } catch (err) {
    console.error('Failed to fetch URLs:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
