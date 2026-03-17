import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Middleware runs on EVERY request before the page loads.
// Its job here is to refresh the user's session cookie if it
// is about to expire — keeping them logged in automatically.
// Without this, users get silently logged out after 1 hour.
export async function middleware(request: NextRequest) {
  console.log('middleware hit:', request.nextUrl.pathname)
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write refreshed cookies back into the response
          // so the browser keeps the updated session
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — this is the critical call
  const { data: { user } } = await supabase.auth.getUser()

  // Protect all routes except login and public pages
  const isAuthPage = request.nextUrl.pathname === '/login'
  const isLandingPage = request.nextUrl.pathname === '/'
  const isPublicApi = request.nextUrl.pathname.startsWith('/api/health') ||
    request.nextUrl.pathname.startsWith('/api/v1')

  if (!user && !isAuthPage && !isLandingPage && !isPublicApi) {
    // Not logged in — redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthPage) {
    // Already logged in — redirect away from login
    return NextResponse.redirect(new URL('/network', request.url))
  }

  return supabaseResponse
}

// Tell Next.js which routes this middleware applies to.
// We skip static files and images — no need to check auth on those.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}