import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Skip health/SEO routes from canonical/auth logic
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml' || pathname === '/api/health' || pathname.startsWith('/api/health/')) {
    return NextResponse.next();
  }
  // Canonical host/https redirect (if configured)
  const canonicalHost = process.env.CANONICAL_HOST || '';
  if (canonicalHost) {
    const reqHost = req.headers.get('host') || req.nextUrl.host;
    if (reqHost !== canonicalHost) {
      const url = req.nextUrl.clone();
      url.host = canonicalHost;
      url.protocol = 'https:';
      return NextResponse.redirect(url);
    }
    const xfproto = req.headers.get('x-forwarded-proto') || '';
    if (xfproto && xfproto !== 'https') {
      const url = req.nextUrl.clone();
      url.protocol = 'https:';
      return NextResponse.redirect(url);
    }
  }
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!needsAuth) return NextResponse.next();
  const token = req.cookies.get('session_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all paths; internal logic narrows auth checks
  matcher: ['/:path*'],
};
