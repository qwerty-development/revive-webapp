import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define route patterns
  const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/change-password']
  const adminRoutes = ['/dashboard/admin', '/dashboard/users', '/dashboard/venues']
  const storeRoutes = ['/dashboard/venue', '/dashboard/manage-requests']
  const userRoutes = ['/dashboard/requests', '/dashboard/profile']

  // Get the current path
  const path = req.nextUrl.pathname

  // Public routes check
  if (path.startsWith('/auth')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return res
  }

  // Authentication check
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // For authenticated users, check their profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, password_changed')
    .eq('id', session.user.id)
    .single()

  // Password change check for store users
  if (profile?.role === 'store' && 
      profile?.password_changed === false && 
      !path.startsWith('/auth/change-password')) {
    return NextResponse.redirect(new URL('/auth/change-password', req.url))
  }

  // Role-based access control
  if (profile?.role) {
    // Admin routes protection
    if (adminRoutes.some(route => path.startsWith(route))) {
      if (profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Store routes protection
    if (storeRoutes.some(route => path.startsWith(route))) {
      if (profile.role !== 'store') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Specific user routes protection
    if (path.startsWith('/dashboard/manage-requests') && profile.role !== 'store') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (path.startsWith('/dashboard/admin') && profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}