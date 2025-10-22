import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export const runtime = 'nodejs';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB || 'kaucjaflow';

let client: MongoClient | null = null;
async function getDb() {
    if (!client) client = new MongoClient(MONGODB_URI);
    // @ts-expect-error private in types, fine in runtime
    if (!client.topology?.isConnected()) await client.connect();
    const db = client.db(DB_NAME);
    return { users: db.collection('users'), shops: db.collection('shops') };
}

// TODO: sostituisci con la tua auth reale (cookie/jwt)
// qui assumiamo che tu abbia messo l'email in header `x-user-email` in middleware
async function getCurrentUserEmail(req: NextRequest) {
    const h = req.headers.get('x-user-email');
    return h ?? null;
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null) as { name?: string; nip?: string | null } | null;
    if (!body?.name?.trim()) {
        return NextResponse.json({ ok: false, error: 'NAME_REQUIRED' }, { status: 400 });
    }

    const email = await getCurrentUserEmail(req);
    if (!email) {
        return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const { users, shops } = await getDb();

    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
        return NextResponse.json({ ok: false, error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    // if user already has a shop, return it (idempotent)
    if (user.shopId) {
        const existing = await shops.findOne({ _id: new ObjectId(user.shopId) });
        return NextResponse.json({ ok: true, shopId: user.shopId, shop: existing }, { status: 200 });
    }

    const now = new Date();
    const ins = await shops.insertOne({
        name: body.name.trim(),
        nip: body.nip?.trim() || null,
        ownerUserId: user._id,
        createdAt: now,
        updatedAt: now,
    });

    await users.updateOne(
        { _id: user._id },
        { $set: { shopId: ins.insertedId, role: user.role ?? 'owner', updatedAt: now } }
    );

    return NextResponse.json({ ok: true, shopId: ins.insertedId.toString() }, { status: 201 });
}
