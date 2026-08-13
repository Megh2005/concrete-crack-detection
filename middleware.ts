import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname === '/' ||
    pathname === '/auth' ||
    pathname.startsWith('/docs') ||
    pathname.startsWith('/documentation') ||
    pathname.startsWith('/analyze') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/send-email') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'restructor_ai_secret_key_2026_super_secure',
  }).catch(() => null);

  if (!token) {
    const authUrl = new URL('/auth', req.url);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|api/send-email|_next/static|_next/image|favicon.ico).*)'],
};
