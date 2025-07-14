import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams
  
  // Log all requests to see what's happening
  console.log('=== MIDDLEWARE DEBUG ===')
  console.log('Timestamp:', new Date().toISOString())
  console.log('Method:', request.method)
  console.log('Path:', pathname)
  console.log('Full URL:', request.url)
  console.log('Search params:', searchParams.toString())
  console.log('Headers:', {
    host: request.headers.get('host'),
    'x-forwarded-host': request.headers.get('x-forwarded-host'),
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    'user-agent': request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
  })
  
  // Special logging for auth-related routes
  if (pathname.startsWith('/auth')) {
    console.log('🔐 AUTH ROUTE HIT:', pathname)
    console.log('🔐 Code param:', searchParams.get('code'))
    console.log('🔐 Error param:', searchParams.get('error'))
    console.log('🔐 Next param:', searchParams.get('next'))
  }
  
  // Log root route with code parameter (the issue you're seeing)
  if (pathname === '/' && searchParams.get('code')) {
    console.log('🚨 ROOT ROUTE WITH CODE!')
    console.log('🚨 This should have gone to /auth/callback')
    console.log('🚨 Code:', searchParams.get('code'))
  }
  
  console.log('========================')
  
  return NextResponse.next()
}

// Catch all routes to see the full picture
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}