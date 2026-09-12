import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthRole } from '@/lib/auth'

/**
 * Root-only: Get system information.
 * Returns database stats, env var status (masked), and connection info.
 */
export async function GET() {
  const role = await getAuthRole()
  if (role !== 'root') {
    return NextResponse.json(
      { error: 'Forbidden: root access required' },
      { status: 403 }
    )
  }

  try {
    // Get total counts
    const [totalUrls, totalVisitsAgg] = await Promise.all([
      db.shortUrl.count(),
      db.shortUrl.aggregate({
        _sum: { visits: true },
        _max: { visits: true },
        _avg: { visits: true },
      }),
    ])

    // Top 5 most-visited URLs
    const topUrls = await db.shortUrl.findMany({
      orderBy: { visits: 'desc' },
      take: 5,
      select: {
        shortCode: true,
        originalUrl: true,
        title: true,
        visits: true,
        createdAt: true,
      },
    })

    // Most recent 5 URLs (activity log)
    const recentUrls = await db.shortUrl.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        shortCode: true,
        originalUrl: true,
        title: true,
        visits: true,
        createdAt: true,
      },
    })

    // Env var status (masked, just 'set' or 'unset')
    const envStatus = {
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'set' : 'unset',
      DATABASE_URL: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.startsWith('file:')
          ? 'file (SQLite)'
          : 'set (postgres)'
        : 'unset',
      AUTH_SECRET: process.env.AUTH_SECRET ? 'set' : 'unset',
      ADMIN_USERNAME: process.env.ADMIN_USERNAME
        ? `set (${process.env.ADMIN_USERNAME})`
        : 'unset (default: admin)',
      ROOT_USERNAME: process.env.ROOT_USERNAME
        ? `set (${process.env.ROOT_USERNAME})`
        : 'unset (default: root)',
      NODE_ENV: process.env.NODE_ENV || 'development',
    }

    return NextResponse.json({
      database: {
        provider: 'postgresql',
        host: 'Neon (serverless Postgres)',
        table: 'ShortUrl',
        totalUrls,
        totalVisits: totalVisitsAgg._sum.visits || 0,
        maxVisits: totalVisitsAgg._max.visits || 0,
        avgVisits: Math.round(totalVisitsAgg._avg.visits || 0),
      },
      topUrls,
      recentUrls,
      env: envStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Failed to fetch system info:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
