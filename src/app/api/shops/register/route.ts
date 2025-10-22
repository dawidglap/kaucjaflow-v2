// src/app/api/shops/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
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
    // @ts-ignore topology set at runtime
    if (!client.topology?.isConnected()) await client.connect();
    const db = client.db(DB_NAME);
    return { users: db.collection('users'), shops: db.collection('shops') };
}

// ✅ Legge il JWT direttamente dal NextRequest (niente cookies() async)
function readSessionFromJWT(req: NextRequest): {
    userId: string; email: string; role: 'admin' | 'cashier' | string; shopId: string | null;
} | null {
    try {
        const token = req.cookies.get(COOKIE)?.value;
        if (!token) return null;
        const p = jwt.verify(token, SESSION_SECRET) as {
            userId: string; email: string; role: 'admin' | 'cashier' | string; shopId?: string;
        };
        const cleanShopId =
            !p.shopId || p.shopId === 'undefined' || p.shopId === 'null' || p.shopId.trim() === ''
                ? null
                : p.shopId;
        return { userId: p.userId, email: p.email, role: p.role, shopId: cleanShopId };
    } catch {
        return null;
    }
}

function setSessionCookie(res: NextResponse, payload: {
    userId: string; email: string; role: string; shopId: string | null;
}) {
    const token = jwt.sign(payload, SESSION_SECRET, { expiresIn: '30d' });
    res.cookies.set(COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
    });
}

export async function POST(req: NextRequest) {
    // 1) Auth dal JWT nel cookie
    const sess = readSessionFromJWT(req);
    if (!sess) {
        return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    // 2) Body
    const body = await req.json().catch(() => null) as { name?: string; nip?: string | null } | null;
    const name = body?.name?.trim();
    const nip = body?.nip?.trim() || null;
    if (!name) {
        return NextResponse.json({ ok: false, error: 'NAME_REQUIRED' }, { status: 400 });
    }

    // 3) DB
    const { users, shops } = await getDb();

    // Trova (o crea) l’utente
    const byId = sess.userId ? await users.findOne({ _id: new ObjectId(sess.userId) }).catch(() => null) : null;
    const user = byId ?? await users.findOne({ email: sess.email.toLowerCase() });

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
            // assicura che il JWT nel cookie contenga shopId (per vecchi token senza)
            setSessionCookie(res, { userId: String(userId), email: sess.email, role: sess.role, shopId: String(user.shopId) });
            return res;
        }
    }

    // 4) Crea shop e collega all’utente
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

    // 5) Rigenera JWT con shopId aggiornato
    const res = NextResponse.json({ ok: true, shopId: String(shopIns.insertedId) }, { status: 201 });
    setSessionCookie(res, {
        userId: String(userId),
        email: sess.email,
        role: sess.role,
        shopId: String(shopIns.insertedId),
    });
    return res;
}
