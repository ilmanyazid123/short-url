import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthRole } from '@/lib/auth'

/**
 * Root-only: Reset all visit counters to 0.
 * Requires role === 'root'.
 */
export async function POST() {
  const role = await getAuthRole()
  if (role !== 'root') {
    return NextResponse.json(
      { error: 'Forbidden: root access required' },
      { status: 403 }
    )
  }

  try {
    const result = await db.shortUrl.updateMany({
      data: { visits: 0 },
    })
    return NextResponse.json({
      success: true,
      reset: result.count,
    })
  } catch (err) {
    console.error('Failed to reset visit counters:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
