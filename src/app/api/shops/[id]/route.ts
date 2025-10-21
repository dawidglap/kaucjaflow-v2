// src/app/api/shops/[id]/route.ts
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
let client: MongoClient | null = null;
async function getDb() {
    if (!client) client = new MongoClient(MONGODB_URI);
    await client.connect();
    return client.db();
}

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const db = await getDb();

    // prova come ObjectId; se fallisce, trattalo come "nome già pronto"
    try {
        const shop = await db
            .collection('shops')
            .findOne({ _id: new ObjectId(id) }, { projection: { name: 1 } });
        if (shop?.name) return NextResponse.json({ ok: true, name: shop.name });
    } catch {
        // non è un ObjectId → forse già "Shop 1"
        if (id && id.trim()) return NextResponse.json({ ok: true, name: id });
    }
    return NextResponse.json({ ok: false }, { status: 404 });
}
