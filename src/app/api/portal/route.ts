// src/app/api/portal/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' });
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://partners.kaucjaflow.pl';

export async function POST(req: Request) {
    const { customerId } = await req.json().catch(() => ({}));
    if (!customerId) return NextResponse.json({ error: 'MISSING_CUSTOMER' }, { status: 400 });

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${APP_BASE_URL}/account`,
    });

    return NextResponse.json({ url: session.url });
}
