import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthRole } from '@/lib/auth'

/**
 * Root-only: Delete ALL short URLs in the database.
 * Requires role === 'root'.
 */
export async function DELETE() {
  const role = await getAuthRole()
  if (role !== 'root') {
    return NextResponse.json(
      { error: 'Forbidden: root access required' },
      { status: 403 }
    )
  }

  try {
    const result = await db.shortUrl.deleteMany({})
    return NextResponse.json({
      success: true,
      deleted: result.count,
    })
  } catch (err) {
    console.error('Failed to delete all URLs:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
