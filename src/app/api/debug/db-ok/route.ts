import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
let client: MongoClient | null = null;

async function getDb() {
    if (!client) client = new MongoClient(uri);
    // Ensure the client is connected; calling connect() when already connected is safe.
    await client.connect();
    // Se il DB non esiste, verrà creato al primo insert
    const db = client.db(process.env.MONGODB_DB || 'kaucjaflow');
    return db;
}

export async function GET() {
    try {
        const db = await getDb();
        // se la collection 'events' non esiste, verrà creata con questo insert
        const res = await db.collection('events').insertOne({
            type: 'TEST',
            ts: Date.now(),
            note: 'Hello Mongo',
        });
        return NextResponse.json({ ok: true, insertedId: String(res.insertedId) });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message || 'DB_ERROR' }, { status: 500 });
    }
}
