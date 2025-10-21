// src/app/api/shops/[id]/route.ts
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// evita la cache del route handler su Vercel
export const dynamic = 'force-dynamic';

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI');
}

/**
 * Singleton MongoClient (serverless-friendly).
 * Usiamo una Promise globale per evitare più connessioni.
 */
declare global {
    // eslint-disable-next-line no-var
    var __mongoClientPromise: Promise<MongoClient> | undefined;
}

const clientPromise: Promise<MongoClient> =
    global.__mongoClientPromise ??
    (global.__mongoClientPromise = new MongoClient(MONGODB_URI).connect());

async function getDb() {
    const client = await clientPromise;
    return client.db();
}

export async function GET(_req: Request, ctx: any) {
    const id = ctx?.params?.id as string | undefined;
    if (!id || typeof id !== 'string') {
        return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
    }

    const db = await getDb();

    // Se è un ObjectId valido, prova a cercare per _id
    if (ObjectId.isValid(id)) {
        const shop = await db
            .collection('shops')
            .findOne({ _id: new ObjectId(id) }, { projection: { name: 1 } });

        if (shop?.name) {
            return NextResponse.json({ ok: true, name: shop.name });
        }
    }

    // Fallback: trattalo come nome già pronto (es. "Shop 1")
    if (id.trim()) {
        return NextResponse.json({ ok: true, name: id });
    }

    return NextResponse.json({ ok: false }, { status: 404 });
}
