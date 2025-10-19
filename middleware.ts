import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const protectedPaths = ['/pos', '/report', '/api/events', '/api/reports'];
    const needsAuth = protectedPaths.some(p => path === p || path.startsWith(p + '/'));
    if (!needsAuth) return NextResponse.next();

    const hasToken = !!req.cookies.get('kf_token')?.value;
    if (!hasToken) return NextResponse.redirect(new URL('/login', req.url));
    return NextResponse.next();
}

export const config = {
    matcher: ['/pos', '/report', '/api/events/:path*', '/api/reports/:path*'],
};
