// src/app/api/shops/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE = 'kf_token';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-please-change';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB || 'kaucjaflow';

if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');

let client: MongoClient | null = null;
async function getDb() {
    if (!client) client = new MongoClient(MONGODB_URI);
    // @ts-ignore - topology only at runtime
    if (!client.topology?.isConnected()) await client.connect();
    const db = client.db(DB_NAME);
    return { users: db.collection('users'), shops: db.collection('shops') };
}

function readSessionFromJWT(): { userId: string; email: string; role: 'admin' | 'cashier'; shopId?: string | null } | null {
    try {
        const jar = cookies();
        const token = jar.get(COOKIE)?.value;
        if (!token) return null;
        const p = jwt.verify(token, SESSION_SECRET) as {
            userId: string; email: string; role: 'admin' | 'cashier'; shopId?: string;
        };
        // normalizza shopId
        const cleanShopId =
            !p.shopId || p.shopId === 'undefined' || p.shopId === 'null' || p.shopId.trim() === ''
                ? null
                : p.shopId;
        return { userId: p.userId, email: p.email, role: p.role, shopId: cleanShopId };
    } catch {
        return null;
    }
}

function setSessionCookie(res: NextResponse, payload: { userId: string; email: string; role: string; shopId: string | null }) {
    const token = jwt.sign(payload, SESSION_SECRET, { expiresIn: '30d' });
    res.cookies.set(COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
    });
}

export async function POST(req: NextRequest) {
    // 1) auth dal JWT (magic link)
    const sess = readSessionFromJWT();
    if (!sess) {
        return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    // 2) body
    const body = await req.json().catch(() => null) as { name?: string; nip?: string | null } | null;
    const name = body?.name?.trim();
    const nip = body?.nip?.trim() || null;

    if (!name) {
        return NextResponse.json({ ok: false, error: 'NAME_REQUIRED' }, { status: 400 });
    }

    // 3) DB
    const { users, shops } = await getDb();

    // trova (o crea) l’utente nel DB
    const user = await users.findOne({ _id: new ObjectId(sess.userId) }).catch(() => null)
        || await users.findOne({ email: sess.email.toLowerCase() });

    let userId: ObjectId;
    if (!user) {
        const now = new Date();
        const ins = await users.insertOne({
            email: sess.email.toLowerCase(),
            role: sess.role ?? 'owner',
            shopId: null,
            createdAt: now,
            updatedAt: now,
        });
        userId = ins.insertedId;
    } else {
        userId = user._id as ObjectId;
        // se già ha shop → idempotente
        if (user.shopId) {
            const existing = await shops.findOne({ _id: new ObjectId(user.shopId) }, { projection: { name: 1 } });
            const res = NextResponse.json({ ok: true, shopId: String(user.shopId), shop: existing ?? null });
            // assicura che il JWT nel cookie contenga shopId (utile per vecchi token sporchi)
            setSessionCookie(res, { userId: String(userId), email: sess.email, role: sess.role, shopId: String(user.shopId) });
            return res;
        }
    }

    // 4) crea shop e collega all’utente
    const now = new Date();
    const shopIns = await shops.insertOne({
        name,
        nip,
        ownerUserId: userId,
        createdAt: now,
        updatedAt: now,
    });

    await users.updateOne(
        { _id: userId },
        { $set: { shopId: shopIns.insertedId, updatedAt: now } }
    );

    // 5) emetti nuovo JWT con shopId aggiornato
    const res = NextResponse.json({ ok: true, shopId: String(shopIns.insertedId) }, { status: 201 });
    setSessionCookie(res, { userId: String(userId), email: sess.email, role: sess.role, shopId: String(shopIns.insertedId) });
    return res;
}
