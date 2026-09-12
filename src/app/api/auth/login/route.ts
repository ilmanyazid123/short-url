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

  const role = verifyCredentials(username, password)
  if (!role) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    )
  }

  const { token, maxAge } = await createSessionToken(role)

  // Root users go to /root, admin users go to /admin
  const redirect = role === 'root' ? '/root' : '/admin'

  const res = NextResponse.json({
    success: true,
    redirect,
    role,
    user: { username },
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
