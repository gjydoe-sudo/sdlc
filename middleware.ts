import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/', '/calendar']
const publicRoutes = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get('session')?.value

  const isProtected = protectedRoutes.some((route) => pathname === route)
  const isPublic = publicRoutes.some((route) => pathname === route)

  if (isProtected && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublic && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/calendar', '/login']
}
