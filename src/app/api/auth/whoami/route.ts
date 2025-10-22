import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const COOKIE = 'kf_token';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-please-change';

export async function GET(req: Request) {
    try {
        const cookieHeader = new Headers(req.headers).get('cookie') || '';
        const jar = Object.fromEntries(
            cookieHeader.split(';').map(p => {
                const [k, ...rest] = p.trim().split('=');
                return [k, decodeURIComponent(rest.join('='))];
            })
        );
        const token = jar[COOKIE];
        if (!token) return NextResponse.json({ loggedIn: false });

        const p = jwt.verify(token, SESSION_SECRET) as {
            userId: string; shopId?: string; role: 'admin' | 'cashier'; email: string;
        };

        // 🔧 normalizza shopId
        let shopId: string | null = (p as any).shopId ?? null;
        if (
            !shopId ||
            shopId === 'undefined' ||
            shopId === 'null' ||
            (typeof shopId === 'string' && shopId.trim() === '')
        ) {
            shopId = null;
        }

        return NextResponse.json({
            loggedIn: true,
            session: { userId: p.userId, email: p.email, role: p.role, shopId },
        });
    } catch {
        return NextResponse.json({ loggedIn: false });
    }
}
