import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const role = await verifySessionToken(token)

  // Protect /root/* — root role ONLY (admin cannot access)
  if (pathname.startsWith('/root')) {
    if (role !== 'root') {
      const loginUrl = new URL('/login-root', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Already authed as root hitting /login-root -> send to /root
  if (pathname === '/login-root') {
    if (role === 'root') {
      return NextResponse.redirect(new URL('/root', request.url))
    }
    return NextResponse.next()
  }

  // Protect /admin/* — admin OR root can access
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin' && role !== 'root') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Already authed user hitting /login -> send to /admin (or /root if root)
  if (pathname === '/login') {
    if (role === 'root') {
      return NextResponse.redirect(new URL('/root', request.url))
    }
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/root/:path*', '/login', '/login-root'],
}
