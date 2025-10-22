import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE = 'kf_token';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-please-change';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || '';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB || 'kaucjaflow';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' });

let client: MongoClient | null = null;
async function db() {
    if (!client) client = new MongoClient(MONGODB_URI);
    // @ts-ignore
    if (!client.topology?.isConnected()) await client.connect();
    const d = client.db(DB_NAME);
    return { users: d.collection('users') };
}

function readSession(req: NextRequest): { userId: string; email: string } | null {
    try {
        const token = req.cookies.get(COOKIE)?.value;
        if (!token) return null;
        const p = jwt.verify(token, SESSION_SECRET) as { userId: string; email: string };
        return { userId: p.userId, email: p.email };
    } catch { return null; }
}

export async function POST(req: NextRequest) {
    const s = readSession(req);
    if (!s) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

    const { users } = await db();
    const user = await users.findOne({ _id: new ObjectId(s.userId) });
    let customerId: string | null = user?.stripeCustomerId || null;

    // fallback: cerca per email su Stripe se non hai ancora salvato stripeCustomerId
    if (!customerId) {
        const res = await stripe.customers.search({ query: `email:"${s.email}"`, limit: 1 });
        customerId = res.data[0]?.id || null;
        // opzionale: salva in DB per il futuro
        if (customerId) await users.updateOne({ _id: user?._id }, { $set: { stripeCustomerId: customerId } });
    }

    if (!customerId) {
        return NextResponse.json({ ok: false, error: 'NO_STRIPE_CUSTOMER' }, { status: 404 });
    }

    const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${APP_URL || ''}/account`, // o dove vuoi tornare
    });

    return NextResponse.json({ ok: true, url: portal.url });
}
