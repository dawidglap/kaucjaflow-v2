// app/api/events/summary/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI!;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-please-change';
const COOKIE = 'kf_token';

let client: MongoClient | null = null;
async function getColl() {
    if (!client) client = new MongoClient(MONGODB_URI);
    // @ts-expect-error topology privata ma utile in dev
    if (!client.topology?.isConnected()) await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'kaucjaflow');
    return db.collection('events');
}

function getSession(req: Request) {
    const cookieHeader = new Headers(req.headers).get('cookie') || '';
    const jar = Object.fromEntries(
        cookieHeader.split(';').map((p) => {
            const [k, ...r] = p.trim().split('=');
            return [k, decodeURIComponent(r.join('='))];
        })
    );
    const token = jar[COOKIE];
    if (!token) return null;
    try {
        return jwt.verify(token, SESSION_SECRET) as { shopId: string; userId: string };
    } catch {
        return null;
    }
}

function parseDay(url: string) {
    const u = new URL(url);
    const d = u.searchParams.get('date'); // YYYY-MM-DD
    const day = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : new Date().toISOString().slice(0, 10);
    const start = new Date(day);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    return { day, start, end };
}

export async function GET(req: Request) {
    const s = getSession(req);
    if (!s) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

    const { day, start, end } = parseDay(req.url);

    const coll = await getColl();
    const agg = await coll
        .aggregate([
            { $match: { shop_id: s.shopId, ts: { $gte: start.getTime(), $lt: end.getTime() } } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
        ])
        .toArray();

    const summary = { PLASTIC: 0, ALU: 0, SZKLO: 0 };
    agg.forEach((r: any) => {
        if (summary.hasOwnProperty(r._id)) (summary as any)[r._id] = r.count;
    });

    return NextResponse.json({ ok: true, day, summary });
}
