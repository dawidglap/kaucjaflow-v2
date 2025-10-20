import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import crypto from 'node:crypto';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const MONGODB_URI = process.env.MONGODB_URI!;
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''; // ← deve essere valorizzata

let client: MongoClient | null = null;
async function getDb() {
    if (!client) client = new MongoClient(MONGODB_URI);
    // @ts-expect-error topology è privata ma utile in dev
    if (!client.topology?.isConnected()) await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'kaucjaflow');
    return {
        users: db.collection('users'),
        shops: db.collection('shops'),
        tokens: db.collection('magic_tokens'),
    };
}

const genToken = () => crypto.randomBytes(24).toString('base64url');

export async function POST(req: Request) {
    const { email, shopName, role } = await req.json().catch(() => ({}));
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json({ ok: false, error: 'INVALID_EMAIL' }, { status: 400 });
    }

    const { users, shops, tokens } = await getDb();

    // throttle: max 1 richiesta/min per email
    const oneMinAgo = new Date(Date.now() - 60_000);
    const recent = await tokens.findOne({ email: email.toLowerCase(), createdAt: { $gte: oneMinAgo } });
    if (recent) return NextResponse.json({ ok: false, error: 'RATE_LIMITED' }, { status: 429 });

    // shop
    const wantedShop = (shopName && String(shopName)) || 'Shop 1';
    let shop = await shops.findOne({ name: wantedShop });
    if (!shop) {
        const ins = await shops.insertOne({ name: wantedShop, createdAt: new Date() });
        shop = await shops.findOne({ _id: ins.insertedId });
    }
    const shopId = String(shop!._id);

    // user
    const userRole = (role === 'cashier' || role === 'admin') ? role : 'admin';
    let user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
        const ins = await users.insertOne({
            email: email.toLowerCase(), role: userRole, shopId, active: true, createdAt: new Date(),
        });
        user = await users.findOne({ _id: ins.insertedId });
    } else if (String(user.shopId) !== shopId || user.role !== userRole) {
        await users.updateOne({ _id: user._id }, { $set: { shopId, role: userRole } });
        user = await users.findOne({ _id: user._id });
    }

    // token one-time (15 min)
    const token = genToken();
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    await tokens.insertOne({
        token, userId: String(user!._id), shopId, role: user!.role, email: user!.email,
        createdAt: new Date(), expiresAt, used: false,
    });

    const verifyUrl = `${APP_BASE_URL}/api/auth/magic/verify?token=${encodeURIComponent(token)}`;

    // --- INVIO EMAIL con diagnosi chiara ---
    if (RESEND_API_KEY) {
        try {
            const resend = new Resend(RESEND_API_KEY);
            console.log('[RESEND SEND using key]', (RESEND_API_KEY || '').slice(0, 10));


            // debug minimo (non stampiamo la chiave completa)
            console.log('[RESEND] using key:', RESEND_API_KEY.slice(0, 6) + '…');

            const { data, error } = await resend.emails.send({
                from: 'KaucjaFlow <login@kaucjaflow.pl>',
                to: [user!.email],
                subject: 'Your login link',
                html: `
          <p>Ciao!</p>
          <p>Clicca per accedere: <a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>Il link scade tra 15 minuti.</p>
        `,
            });

            if (error) {
                console.error('[RESEND ERROR]', error);
                return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
            }

            console.log('[RESEND SENT id]', data?.id);
            return NextResponse.json({ ok: true, delivered: true, id: data?.id });
        } catch (e: any) {
            console.error('[RESEND THROW]', e);
            return NextResponse.json({ ok: false, error: e?.message || 'RESEND_THROW' }, { status: 500 });
        }
    } else {
        console.log('[MAGIC LINK]', verifyUrl);
        return NextResponse.json({ ok: true, delivered: false, where: 'console' });
    }
}
