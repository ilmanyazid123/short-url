import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function generateUniqueCode(): Promise<string> {
  let code = generateShortCode()
  let attempts = 0
  while (attempts < 10) {
    const existing = await db.shortUrl.findUnique({
      where: { shortCode: code },
    })
    if (!existing) return code
    code = generateShortCode()
    attempts++
  }
  return generateShortCode(10)
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url: originalUrl, customCode, title } = body

    if (!originalUrl || typeof originalUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const trimmedUrl = originalUrl.trim()
    if (!isValidUrl(trimmedUrl)) {
      return NextResponse.json(
        { error: 'Please provide a valid http(s) URL' },
        { status: 400 }
      )
    }

    let shortCode: string
    if (customCode && typeof customCode === 'string' && customCode.trim()) {
      const cleaned = customCode.trim()
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(cleaned)) {
        return NextResponse.json(
          {
            error:
              'Custom alias must be 3-30 chars and only contain letters, numbers, _ or -',
          },
          { status: 400 }
        )
      }
      const existing = await db.shortUrl.findUnique({
        where: { shortCode: cleaned },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'This custom alias is already taken' },
          { status: 409 }
        )
      }
      shortCode = cleaned
    } else {
      shortCode = await generateUniqueCode()
    }

    const record = await db.shortUrl.create({
      data: {
        shortCode,
        originalUrl: trimmedUrl,
        title: title && typeof title === 'string' ? title.trim() : null,
      },
    })

    return NextResponse.json({
      id: record.id,
      shortCode: record.shortCode,
      originalUrl: record.originalUrl,
      title: record.title,
      visits: record.visits,
      shortUrl: `/r/${record.shortCode}`,
      createdAt: record.createdAt,
    })
  } catch (err) {
    console.error('Failed to shorten URL:', err)
    const detail =
      err instanceof Error
        ? `${err.name}: ${err.message}`
        : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Internal server error',
        detail,
        // Also expose env var status (without leaking values) for debugging
        env: {
          POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL
            ? 'set'
            : 'unset',
          DATABASE_URL: process.env.DATABASE_URL
            ? process.env.DATABASE_URL.startsWith('file:')
              ? 'file (SQLite — sandbox default)'
              : 'set (postgres)'
            : 'unset',
        },
      },
      { status: 500 }
    )
  }
}
