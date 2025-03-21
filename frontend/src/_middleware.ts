import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { role } = jwtDecode<{ role: string }>(token);

    const urlPath = req.nextUrl.pathname;

    if (urlPath.startsWith('/influencer') && role !== 'influencer') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (urlPath.startsWith('/brand') && role !== 'brand') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/brand/:path*', '/influencer/:path*'],
};
