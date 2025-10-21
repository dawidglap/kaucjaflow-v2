// src/app/api/events/report/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
// @ts-expect-error: pdfkit standalone non ha tipi completi qui
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COOKIE = 'kf_token';

// ---------- MongoDB client cache (lazy, compat v5) ----------
declare global {
    // eslint-disable-next-line no-var
    var _kf_mongo_promise_report: Promise<MongoClient> | undefined;
}

function getClientPromise() {
    if (!global._kf_mongo_promise_report) {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is not set');
        const client = new MongoClient(uri);
        global._kf_mongo_promise_report = client.connect();
    }
    return global._kf_mongo_promise_report!;
}

async function getColl() {
    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'kaucjaflow');
    return db.collection('events');
}

// ---------- Sessione da cookie ----------
function getSession(req: Request) {
    const cookieHeader = new Headers(req.headers).get('cookie') || '';
    const jar = Object.fromEntries(
        cookieHeader.split(';').map((p) => {
            const [k, ...r] = p.trim().split('=');
            return [k, decodeURIComponent(r.join('='))];
        }),
    ) as Record<string, string | undefined>;
    const token = jar[COOKIE];
    if (!token) return null;
    try {
        const secret = process.env.SESSION_SECRET || 'dev-secret-please-change';
        return jwt.verify(token, secret) as { shopId: string; userId: string; email: string };
    } catch {
        return null;
    }
}

function parseDateParam(url: string) {
    const u = new URL(url);
    const d = u.searchParams.get('date'); // YYYY-MM-DD opzionale
    const day = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : new Date().toISOString().slice(0, 10);
    const start = new Date(day);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    return { day, start, end };
}

export async function GET(req: Request) {
    const s = getSession(req);
    if (!s) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

    const { day, start, end } = parseDateParam(req.url);
    const coll = await getColl();

    const agg = await coll
        .aggregate([
            { $match: { shop_id: s.shopId, ts: { $gte: start.getTime(), $lt: end.getTime() } } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
        ])
        .toArray();

    const summary: Record<'PLASTIC' | 'ALU' | 'SZKLO', number> = { PLASTIC: 0, ALU: 0, SZKLO: 0 };
    agg.forEach((r: any) => {
        if (Object.prototype.hasOwnProperty.call(summary, r._id)) {
            summary[r._id as keyof typeof summary] = r.count;
        }
    });
    const total = summary.PLASTIC + summary.ALU + summary.SZKLO;

    // ---------- Genera PDF -> Buffer -> ArrayBuffer ----------
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // header
    doc.fillColor('#111').fontSize(20).text('KaucjaFlow — Report Giornaliero', { align: 'left' });
    doc.moveDown(0.3).fontSize(10).fillColor('#666').text(`Data: ${day}`);
    doc.moveDown(0.1).text(`Shop: ${s.shopId}`);
    doc.moveDown(0.1).text(`Generato per: ${s.email}`);
    doc.moveDown(1);

    // tabella semplice
    const rows: Array<[string, number]> = [
        ['PLASTIC', summary.PLASTIC],
        ['ALU', summary.ALU],
        ['SZKLO', summary.SZKLO],
    ];

    doc.fontSize(12).fillColor('#111').text('Riepilogo', { underline: true });
    doc.moveDown(0.5);

    const startX = 50;
    let y = doc.y;
    const col1 = startX;
    const col2 = 350;

    doc.font('Helvetica-Bold');
    doc.text('Tipo', col1, y);
    doc.text('Conteggio', col2, y);
    y += 18;
    doc.font('Helvetica');

    rows.forEach(([label, value]) => {
        doc.text(label, col1, y);
        doc.text(String(value), col2, y);
        y += 18;
    });

    doc.moveTo(startX, y + 4).lineTo(550, y + 4).strokeColor('#ddd').stroke();
    y += 12;
    doc.font('Helvetica-Bold');
    doc.text('Totale', col1, y);
    doc.text(String(total), col2, y);
    doc.font('Helvetica');

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#7a7a7a').text('© KaucjaFlow', { align: 'right' });

    doc.end();

    const buf = await done; // Buffer da PDFKit

    // Crea un ArrayBuffer "pulito" (evita SharedArrayBuffer/union)
    const ab = new ArrayBuffer(buf.byteLength);
    new Uint8Array(ab).set(buf);

    const filename = `report-${day}.pdf`;
    return new NextResponse(ab, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-store',
        },
    });
}
