import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI!;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-please-change';
const COOKIE = 'kf_token';

let client: MongoClient | null = null;
async function getDb() {
    if (!client) client = new MongoClient(MONGODB_URI);
    // @ts-expect-error private
    if (!client.topology?.isConnected()) await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'kaucjaflow');
    return { users: db.collection('users'), tokens: db.collection('magic_tokens') };
}

export async function GET(req: Request) {
    const u = new URL(req.url);
    const token = u.searchParams.get('token') || '';
    const redirectTo = u.searchParams.get('to') || '/pos';
    if (!token) return NextResponse.json({ ok: false, error: 'MISSING_TOKEN' }, { status: 400 });

    const { users, tokens } = await getDb();
    const row = await tokens.findOne({ token });

    if (!row) return NextResponse.json({ ok: false, error: 'INVALID_TOKEN' }, { status: 400 });
    if (row.used) return NextResponse.json({ ok: false, error: 'TOKEN_USED' }, { status: 400 });
    if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) {
        return NextResponse.json({ ok: false, error: 'TOKEN_EXPIRED' }, { status: 400 });
    }

    const user = await users.findOne({ _id: new ObjectId(row.userId) });
    if (!user || user.email !== row.email) {
        return NextResponse.json({ ok: false, error: 'USER_NOT_FOUND' }, { status: 400 });
    }

    await tokens.updateOne({ _id: row._id }, { $set: { used: true, usedAt: new Date() } });

    const payload = { userId: String(user._id), shopId: String(user.shopId), role: user.role, email: user.email };
    const jwtToken = jwt.sign(payload, SESSION_SECRET, { expiresIn: '14d' });

    const res = NextResponse.redirect(new URL(redirectTo, req.url));
    res.cookies.set({ name: COOKIE, value: jwtToken, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 14 });
    return res;
}
