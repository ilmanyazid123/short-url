import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const isAuthed = verifySessionToken(token)

  // Protect /admin/* — redirect to /login if not authed
  if (pathname.startsWith('/admin')) {
    if (!isAuthed) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Already authed user hitting /login -> send to /admin
  if (pathname === '/login') {
    if (isAuthed) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}

// Silence unused import warning (crypto is referenced indirectly via auth lib)
void crypto
