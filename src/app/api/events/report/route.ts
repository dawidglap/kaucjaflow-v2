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
    // Stile: minimal, B/W, stampabile, tutto in PL
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Colori (grayscale per stampa)
    const TXT = '#000000';
    const SUB = '#555555';
    const LINE = '#A9A9A9';

    // HEADER
    doc.fillColor(TXT).font('Helvetica-Bold').fontSize(18).text('Raport dzienny', { align: 'left' });
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(10).fillColor(SUB).text(`Dzień: ${day}`);
    doc.moveDown(0.1).text(`Sklep: ${s.shopId}`);
    doc.moveDown(0.1).text(`Wygenerowano dla: ${s.email}`);
    doc.moveDown(0.6);

    // Linea separatrice
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const x0 = doc.page.margins.left;
    const y0 = doc.y;
    doc
        .moveTo(x0, y0)
        .lineTo(x0 + pageWidth, y0)
        .strokeColor(LINE)
        .lineWidth(1)
        .stroke();
    doc.moveDown(1);

    // TITOLO TABELLA
    doc.fillColor(TXT).font('Helvetica-Bold').fontSize(12).text('Podsumowanie');
    doc.moveDown(0.5);

    // TABELLA (colonne allineate, numeri a destra)
    const startX = x0;
    let y = doc.y;
    const col1 = startX;
    const col2 = startX + 350; // colonna numerica a destra

    // Header riga
    doc.font('Helvetica-Bold').fontSize(10).fillColor(TXT);
    doc.text('Typ', col1, y);
    doc.text('Liczba', col2, y, { width: 200, align: 'right' });
    y += 16;

    // Linea
    doc
        .moveTo(startX, y)
        .lineTo(startX + pageWidth, y)
        .strokeColor(LINE)
        .lineWidth(1)
        .stroke();
    y += 6;

    // Righe
    const rows: Array<[string, number]> = [
        ['PLASTIK', summary.PLASTIC],
        ['ALUMINIUM', summary.ALU],
        ['SZKŁO', summary.SZKLO],
    ];

    doc.font('Helvetica').fontSize(10).fillColor(TXT);

    rows.forEach(([label, value], idx) => {
        doc.text(label, col1, y);
        doc.text(String(value), col2, y, { width: 200, align: 'right' });
        y += 18;

        // riga puntinata tra le voci (non dopo l’ultima)
        if (idx < rows.length - 1) {
            doc
                .dash(1, { space: 3 })
                .moveTo(startX, y - 6)
                .lineTo(startX + pageWidth, y - 6)
                .undash()
                .strokeColor(LINE)
                .lineWidth(1)
                .stroke();
        }
    });

    // Totale
    y += 6;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Razem', col1, y);
    doc.text(String(total), col2, y, { width: 200, align: 'right' });

    // NOTE FINALI
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(9).fillColor(SUB).text(
        `Uwaga: raport przedstawia sumę zdarzeń zarejestrowanych w dniu ${day}. ` +
        `W przypadku rozbieżności prosimy o kontakt: support@kaucjaflow.pl`,
        { width: pageWidth },
    );

    // NUMERI DI PAGINA (in basso a destra)
    const addPageNumbers = () => {
        const range = doc.bufferedPageRange();
        for (let i = 0; i < range.count; i++) {
            doc.switchToPage(i);
            const pageNum = `Strona ${i + 1} z ${range.count}`;
            doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor(SUB)
                .text(pageNum, doc.page.margins.left, doc.page.height - 40, {
                    width: pageWidth,
                    align: 'right',
                });
        }
    };
    addPageNumbers();

    doc.end();
    const buf = await done;

    // Crea un ArrayBuffer "pulito"
    const ab = new ArrayBuffer(buf.byteLength);
    new Uint8Array(ab).set(buf);

    const filename = `raport-${day}.pdf`;
    return new NextResponse(ab, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-store',
        },
    });
}
