import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'node:crypto';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const MONGODB_URI = process.env.MONGODB_URI!;
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const DEV = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEV_LOGIN === '1';

let client: MongoClient | null = null;
async function getDb() {
    if (!client) client = new MongoClient(MONGODB_URI);
    // @ts-expect-error topology is private, but useful in dev
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

    const emailLc = email.toLowerCase().trim();
    const { users, shops, tokens } = await getDb();

    // throttle: 1/min per email
    const oneMinAgo = new Date(Date.now() - 60_000);
    const recent = await tokens.findOne({ email: emailLc, createdAt: { $gte: oneMinAgo } });
    if (recent) {
        return NextResponse.json({ ok: false, error: 'RATE_LIMITED' }, { status: 429 });
    }

    // ─────────────────────────────────────────────────────────────
    // 1) Gating: deve esistere un utente (creato via pagina "Invita")
    //    -> niente auto-provision da /login in produzione
    // ─────────────────────────────────────────────────────────────
    let user = await users.findOne({ email: emailLc });

    if (!user) {
        if (!DEV) {
            // Produzione: serve invito
            return NextResponse.json({ ok: false, error: 'INVITE_REQUIRED' }, { status: 403 });
        }
        // In DEV possiamo opzionalmente fare provisioning rapido per test
        const wantedShop = (shopName && String(shopName)) || 'Shop 1';
        let shop = await shops.findOne({ name: wantedShop });
        if (!shop) {
            const insShop = await shops.insertOne({ name: wantedShop, createdAt: new Date() });
            shop = await shops.findOne({ _id: insShop.insertedId });
        }
        const userRole = (role === 'cashier' || role === 'admin') ? role : 'cashier';
        const insUser = await users.insertOne({
            email: emailLc,
            role: userRole,
            shopId: String(shop!._id),
            active: true,
            createdAt: new Date(),
        });
        user = await users.findOne({ _id: insUser.insertedId });
    }

    // Safety: in produzione NON permettiamo di cambiare shop/role da request
    // Si usano i valori salvati sull'utente
    const shopId = String(user!.shopId);
    const finalRole = user!.role;

    // ─────────────────────────────────────────────────────────────
    // 2) Genera token monouso (15 min)
    // ─────────────────────────────────────────────────────────────
    const token = genToken();
    const expiresAt = new Date(Date.now() + 15 * 60_000);

    await tokens.insertOne({
        token,
        userId: String(user!._id),
        shopId,
        role: finalRole,
        email: emailLc,
        createdAt: new Date(),
        expiresAt, // TTL index lato DB raccomandato
        used: false,
    });

    const verifyUrl = `${APP_BASE_URL}/api/auth/magic/verify?token=${encodeURIComponent(token)}`;

    // ─────────────────────────────────────────────────────────────
    // 3) Invio email
    // ─────────────────────────────────────────────────────────────
    if (!RESEND_API_KEY) {
        console.log('[MAGIC LINK]', verifyUrl);
        return NextResponse.json({ ok: true, delivered: false, where: 'console' });
    }

    try {
        const resend = new Resend(RESEND_API_KEY);
        console.log('[RESEND] using key:', RESEND_API_KEY.slice(0, 6) + '…');

        const { data, error } = await resend.emails.send({
            from: 'KaucjaFlow <login@kaucjaflow.pl>',
            to: [emailLc],
            subject: 'Twój link logowania',
            html: `
        <p>Cześć!</p>
        <p>Kliknij, aby się zalogować: <a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>Link wygaśnie za 15 minut.</p>
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
}
