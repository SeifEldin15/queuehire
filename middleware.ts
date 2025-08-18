import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Temporarily disable middleware for debugging
  console.log('Middleware called for:', req.nextUrl.pathname);
  
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('Middleware session check:', {
    path: req.nextUrl.pathname,
    hasSession: !!session,
    userId: session?.user?.id
  });

  // TEMPORARILY DISABLED - just return next() to allow all access
  // This will help us see if middleware is causing the redirect issue
  return res;

  /* ORIGINAL MIDDLEWARE LOGIC - COMMENTED OUT FOR TESTING
  // If user is accessing dashboard routes without being authenticated
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    console.log('Redirecting to login - no session');
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is authenticated and accessing auth pages, redirect to dashboard
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname.startsWith('/register'))) {
    console.log('Redirecting to dashboard - has session');
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
  */
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register/:path*']
}
