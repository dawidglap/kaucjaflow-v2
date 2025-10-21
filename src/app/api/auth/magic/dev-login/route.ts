// src/app/api/auth/magic/dev-login/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI!;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-please-change';
const COOKIE = 'kf_token';

// ---- NEW: cache globale per il client ----
declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;
if (!global._mongoClientPromise) {
    const _client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = _client.connect(); // v5: safe/idempotente
}
clientPromise = global._mongoClientPromise;

async function getDb() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'kaucjaflow');
    return { shops: db.collection('shops'), users: db.collection('users') };
}

// ---- resto del file invariato ----
function setSessionCookie(res: NextResponse, payload: any) {
    const token = jwt.sign(payload, SESSION_SECRET, { expiresIn: '14d' });
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

    const res = NextResponse.redirect(new URL(redirectTo, req.url));
    setSessionCookie(res, { userId: String(user!._id), shopId, role: user!.role, email: user!.email });
    return res;
}
