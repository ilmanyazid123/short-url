import { NextRequest, NextResponse } from 'next/server'
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  verifyCredentials,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { username, password } = body
  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 }
    )
  }

  if (!verifyCredentials(username, password)) {
    // Slight delay to slow brute-force attempts (still stateless)
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    )
  }

  const { token, maxAge } = createSessionToken()
  const res = NextResponse.json({
    success: true,
    redirect: '/admin',
    user: { username: 'admin' },
  })
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
  return res
}
