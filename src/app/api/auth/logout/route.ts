import { NextResponse } from 'next/server';

const COOKIE = 'kf_token';

export async function GET(req: Request) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.set({
        name: COOKIE,
        value: '',
        path: '/',
        maxAge: 0,
    });
    return res;
}
