// src/app/api/billing/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOKIE = 'kf_token';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-please-change';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
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
        const t = req.cookies.get(COOKIE)?.value;
        if (!t) return null;
        const p = jwt.verify(t, SESSION_SECRET) as { userId: string; email: string };
        return { userId: p.userId, email: p.email };
    } catch { return null; }
}

export async function POST(req: NextRequest) {
    const s = readSession(req);
    if (!s) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

    const { users } = await db();
    const user = await users.findOne({ _id: new ObjectId(s.userId) });

    let customerId: string | null = user?.stripeCustomerId || null;
    if (!customerId) {
        const res = await stripe.customers.search({ query: `email:"${s.email}"`, limit: 1 });
        customerId = res.data[0]?.id || null;
        if (customerId) await users.updateOne({ _id: user?._id }, { $set: { stripeCustomerId: customerId } });
    }
    if (!customerId) return NextResponse.json({ ok: false, error: 'NO_STRIPE_CUSTOMER' }, { status: 404 });

    // Trova la subscription attiva
    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 5 });
    const active = subs.data.find(x => ['active', 'trialing', 'past_due'].includes(x.status));
    if (!active) return NextResponse.json({ ok: false, error: 'NO_ACTIVE_SUBSCRIPTION' }, { status: 404 });

    const body = await req.json().catch(() => ({})) as { now?: boolean };
    if (body.now) {
        // Annulla immediatamente
        const cancelled: Stripe.Subscription = await stripe.subscriptions.cancel(active.id);
        return NextResponse.json({
            ok: true,
            cancelled: 'now',
            subscriptionId: cancelled.id,
            status: cancelled.status,
        });
    } else {
        // Annulla a fine periodo
        const upd: Stripe.Subscription = await stripe.subscriptions.update(active.id, {
            cancel_at_period_end: true,
        });
        return NextResponse.json({
            ok: true,
            cancelled: 'period_end',
            subscriptionId: upd.id,
            status: upd.status,
            current_period_end: upd.current_period_end, // unix seconds
        });
    }
}
