import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

let client: MongoClient | null = null;
async function getDb() {
    if (!client) client = new MongoClient(MONGODB_URI);
    // @ts-expect-error private
    if (!client.topology?.isConnected()) await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'kaucjaflow');
    return {
        users: db.collection('users'),
        shops: db.collection('shops'),
        events: db.collection('events'),
        tokens: db.collection('magic_tokens'),
    };
}

export async function GET() {
    const { users, shops, events, tokens } = await getDb();

    // users
    await users.createIndex({ email: 1 }, { unique: true });

    // shops
    await shops.createIndex({ name: 1 }, { unique: true });

    // events: unicità per shop + client_event_id
    await events.createIndex({ shop_id: 1, client_event_id: 1 }, { unique: true, name: 'uniq_shop_clientEvent' });
    await events.createIndex({ shop_id: 1, ts: 1 });

    // magic_tokens: TTL + unicità token
    await tokens.createIndex({ token: 1 }, { unique: true });
    await tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // scade quando expiresAt è passato
    await tokens.createIndex({ email: 1, createdAt: 1 });

    return NextResponse.json({ ok: true, created: true });
}
