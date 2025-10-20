// app/api/events/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

const MONGODB_URI = process.env.MONGODB_URI!;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-please-change';
const COOKIE = 'kf_token';

// ---------- Mongo singleton + collection ----------
let client: MongoClient | null = null;

async function getColl() {
    if (!client) client = new MongoClient(MONGODB_URI);
    // @ts-expect-error topology è privata ma utile per dev
    if (!client.topology?.isConnected()) await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'kaucjaflow');
    return db.collection('events'); // si crea alla prima insert
}

// ---------- Sessione dal cookie JWT ----------
function getSessionFromReq(req: Request) {
    const cookieHeader = new Headers(req.headers).get('cookie') || '';
    const jar = Object.fromEntries(
        cookieHeader.split(';').map((p) => {
            const [k, ...rest] = p.trim().split('=');
            return [k, decodeURIComponent(rest.join('='))];
        })
    );
    const token = jar[COOKIE];
    if (!token) return null;
    try {
        return jwt.verify(token, SESSION_SECRET) as {
            userId: string;
            shopId: string;
            email: string;
            role: 'admin' | 'cashier';
        };
    } catch {
        return null;
    }
}

// ---------- POST: salva eventi [{ type, ts, client_event_id }] ----------
export async function POST(req: Request) {
    const s = getSessionFromReq(req);
    if (!s) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const arr = Array.isArray(body?.events) ? body.events : [];

    // Valida e mappa -> rispetta l'indice unico (shop_id + client_event_id)
    const docs = arr
        .filter(
            (e: any) =>
                e &&
                typeof e.type === 'string' &&
                typeof e.ts === 'number' &&
                e.client_event_id != null
        )
        .map((e: any) => ({
            // campi richiesti dall'indice unico (snake_case)
            shop_id: s.shopId,
            client_event_id: String(e.client_event_id),
            // campi app (facoltativi)
            shopId: s.shopId,
            createdBy: s.userId,
            // payload evento
            type: e.type,
            ts: e.ts,
        }));

    if (!docs.length) {
        return NextResponse.json({ ok: false, error: 'NO_VALID_EVENTS' }, { status: 400 });
    }

    const coll = await getColl();
    try {
        // ordered:false → inserisce tutto ciò che NON è duplicato e ignora i duplicati
        const result = await coll.insertMany(docs, { ordered: false });
        const inserted = (result as any).insertedCount ?? docs.length;
        return NextResponse.json({ ok: true, inserted });
    } catch (err: any) {
        // Se è un BulkWriteError per duplicati, proviamo a leggere quante ne ha inserite
        const nInserted =
            err?.result?.result?.nInserted ??
            err?.result?.nInserted ??
            0;
        if (nInserted > 0) {
            return NextResponse.json({ ok: true, inserted: nInserted });
        }
        return NextResponse.json(
            { ok: false, error: err?.message || 'INSERT_ERROR' },
            { status: 500 }
        );
    }
}

// ---------- GET: eventi di oggi per quello shop ----------
export async function GET(req: Request) {
    const s = getSessionFromReq(req);
    if (!s) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

    const today = new Date().toISOString().slice(0, 10);
    const start = new Date(today);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const coll = await getColl();
    const docs = await coll
        .find({ shop_id: s.shopId, ts: { $gte: start.getTime(), $lt: end.getTime() } })
        .sort({ ts: -1 })
        .toArray();

    return NextResponse.json({ ok: true, events: docs });
}
