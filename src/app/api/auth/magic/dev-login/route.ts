// src/app/api/auth/magic/dev-login/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE = 'kf_token';

declare global {
    // eslint-disable-next-line no-var
    var _kf_mongo_promise: Promise<MongoClient> | undefined;
}

function getClientPromise() {
    if (!global._kf_mongo_promise) {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            // Non valutare mai in build-time: viene letto solo quando chiamato in runtime
            throw new Error('MONGODB_URI is not set');
        }
        const client = new MongoClient(uri);
        global._kf_mongo_promise = client.connect();
    }
    return global._kf_mongo_promise!;
}

async function getDb() {
    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'kaucjaflow');
    return { shops: db.collection('shops'), users: db.collection('users') };
}

function setSessionCookie(res: NextResponse, payload: any) {
    const secret = process.env.SESSION_SECRET || 'dev-secret-please-change';
    const token = jwt.sign(payload, secret, { expiresIn: '14d' });
    res.cookies.set({
        name: COOKIE,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 14,
    });
}

export async function GET(req: Request) {
    // Proteggi la route in produzione, se ti serve
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const url = new URL(req.url);
    const email = url.searchParams.get('email')?.toLowerCase() || '';
    const role = (url.searchParams.get('role') || 'admin') as 'admin' | 'cashier';
    const shopName = url.searchParams.get('shop') || 'Test Shop 1';
    const redirectTo = url.searchParams.get('to') || '/pos';

    if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'email query param required' }, { status: 400 });
    }

    const { shops, users } = await getDb();

    let shop = await shops.findOne({ name: shopName });
    if (!shop) {
        const ins = await shops.insertOne({ name: shopName, createdAt: new Date() });
        shop = await shops.findOne({ _id: ins.insertedId });
    }
    const shopId = String(shop!._id);

    let user = await users.findOne({ email });
    if (!user) {
        const ins = await users.insertOne({
            email, role, shopId, name: email.split('@')[0], active: true, createdAt: new Date(),
        });
        user = await users.findOne({ _id: ins.insertedId });
    } else if (String(user.shopId) !== shopId || user.role !== role) {
        await users.updateOne({ _id: user._id }, { $set: { shopId, role } });
        user = await users.findOne({ _id: user._id });
    }

    // Redirect robusto (supporta assoluto o relativo)
    const base = new URL(req.url);
    const target = redirectTo.startsWith('/')
        ? new URL(redirectTo, base)
        : new URL(redirectTo);

    const res = NextResponse.redirect(target);
    setSessionCookie(res, { userId: String(user!._id), shopId, role: user!.role, email: user!.email });
    return res;
}
