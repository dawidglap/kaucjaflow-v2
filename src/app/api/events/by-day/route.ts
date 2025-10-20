// app/api/events/by-day/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
let client: MongoClient | null = null;

async function getDb() {
    if (!client) client = new MongoClient(MONGODB_URI);
    // @ts-expect-error topology privato ma ok in dev
    if (!client.topology?.isConnected()) await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'kaucjaflow');
    return { events: db.collection('events') };
}

/**
 * GET /api/events/by-day?from=YYYY-MM-DD&to=YYYY-MM-DD&shopId=...
 * Ritorna aggregato per giorno: { day, PLASTIC, ALU, SZKLO, total }
 */
export async function GET(req: Request) {
    const url = new URL(req.url);
    const from = url.searchParams.get('from')!;
    const to = url.searchParams.get('to')!;
    const shopId = url.searchParams.get('shopId') || null;

    if (!from || !to) {
        return NextResponse.json({ ok: false, error: 'from/to required' }, { status: 400 });
    }

    // costruisco range UTC [fromT00:00Z, toT23:59:59.999Z]
    const fromDate = new Date(from + 'T00:00:00.000Z');
    const toDate = new Date(to + 'T23:59:59.999Z');

    const { events } = await getDb();

    // filtro base
    const match: any = { ts: { $gte: fromDate.getTime(), $lte: toDate.getTime() } };
    if (shopId) match.shop_id = shopId;

    // group per giorno usando ts (ms) → y-m-d UTC
    const pipeline = [
        { $match: match },
        {
            $addFields: {
                _day: {
                    $dateToString: {
                        date: { $toDate: '$ts' },
                        format: '%Y-%m-%d',
                        timezone: 'UTC',
                    },
                },
            },
        },
        {
            $group: {
                _id: '$_day',
                PLASTIC: { $sum: { $cond: [{ $eq: ['$type', 'PLASTIC'] }, 1, 0] } },
                ALU: { $sum: { $cond: [{ $eq: ['$type', 'ALU'] }, 1, 0] } },
                SZKLO: { $sum: { $cond: [{ $eq: ['$type', 'SZKLO'] }, 1, 0] } },
                total: { $sum: 1 },
            },
        },
        { $project: { _id: 0, day: '$_id', PLASTIC: 1, ALU: 1, SZKLO: 1, total: 1 } },
        { $sort: { day: 1 } },
    ];

    const rows = await events.aggregate(pipeline).toArray();

    // totale del range
    const totals = rows.reduce(
        (a, r) => ({
            PLASTIC: a.PLASTIC + (r.PLASTIC || 0),
            ALU: a.ALU + (r.ALU || 0),
            SZKLO: a.SZKLO + (r.SZKLO || 0),
            total: a.total + (r.total || 0),
        }),
        { PLASTIC: 0, ALU: 0, SZKLO: 0, total: 0 }
    );

    return NextResponse.json({ ok: true, rows, totals });
}
