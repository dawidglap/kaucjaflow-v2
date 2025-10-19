import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI!;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-please-change';
const COOKIE = 'kf_token';

let client: MongoClient | null = null;
async function getDb() {
    if (!client) client = new MongoClient(MONGODB_URI);
    if (!client.topology?.isConnected()) await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'kaucjaflow');
    return { shops: db.collection('shops'), users: db.collection('users') };
}

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
