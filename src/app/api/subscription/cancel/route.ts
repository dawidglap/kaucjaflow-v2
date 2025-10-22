// src/app/api/subscription/cancel/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient } from 'mongodb';

export const runtime = 'nodejs';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' });
const client = new MongoClient(process.env.MONGODB_URI!);
const DB = process.env.MONGODB_DB || 'kaucjaflow';

export async function POST(req: Request) {
    const { email, at_period_end = false } = await req.json().catch(() => ({}));
    if (!email) return NextResponse.json({ error: 'MISSING_EMAIL' }, { status: 400 });

    await client.connect();
    const db = client.db(DB);
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    const subId = user?.stripeSubscriptionId;
    if (!subId) return NextResponse.json({ error: 'NO_SUBSCRIPTION' }, { status: 404 });

    // Cancella ora oppure a fine periodo
    if (at_period_end) {
        await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
    } else {
        await stripe.subscriptions.cancel(subId);
    }

    return NextResponse.json({ ok: true });
}
