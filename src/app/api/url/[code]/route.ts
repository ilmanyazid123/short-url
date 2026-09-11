import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type Params = { params: Promise<{ code: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { code } = await params
    const record = await db.shortUrl.findUnique({
      where: { shortCode: code },
    })

    if (!record) {
      return NextResponse.json({ error: 'Short URL not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: record.id,
      shortCode: record.shortCode,
      originalUrl: record.originalUrl,
      title: record.title,
      visits: record.visits,
      createdAt: record.createdAt,
      shortUrl: `/r/${record.shortCode}`,
    })
  } catch (err) {
    console.error('Failed to fetch URL:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { code } = await params
    const existing = await db.shortUrl.findUnique({
      where: { shortCode: code },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Short URL not found' }, { status: 404 })
    }

    await db.shortUrl.delete({ where: { shortCode: code } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to delete URL:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { code } = await params
    const body = await request.json()
    const { incrementVisit } = body

    const existing = await db.shortUrl.findUnique({
      where: { shortCode: code },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Short URL not found' }, { status: 404 })
    }

    if (incrementVisit) {
      const updated = await db.shortUrl.update({
        where: { shortCode: code },
        data: { visits: { increment: 1 } },
      })
      return NextResponse.json({
        id: updated.id,
        shortCode: updated.shortCode,
        originalUrl: updated.originalUrl,
        title: updated.title,
        visits: updated.visits,
        createdAt: updated.createdAt,
      })
    }

    return NextResponse.json({
      id: existing.id,
      shortCode: existing.shortCode,
      originalUrl: existing.originalUrl,
      title: existing.title,
      visits: existing.visits,
      createdAt: existing.createdAt,
    })
  } catch (err) {
    console.error('Failed to update URL:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
