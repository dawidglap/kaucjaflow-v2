// src/app/api/checkout/success/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' });

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
        return NextResponse.json({ ok: false, error: 'MISSING_SESSION_ID' }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['customer', 'subscription', 'line_items.data.price.product'],
        });

        const customerEmail =
            session.customer_details?.email ||
            session.customer_email ||
            (typeof session.customer === 'string' ? undefined : (session.customer as any)?.email);

        const sub = typeof session.subscription === 'string' ? null : session.subscription;
        const status = sub?.status ?? 'unknown';

        return NextResponse.json({
            ok: true,
            sessionId,
            email: customerEmail ?? null,
            subscriptionStatus: status,
            amountTotal: session.amount_total,
            currency: session.currency,
            lineItems:
                session.line_items?.data?.map((li) => ({
                    qty: li.quantity,
                    priceId: li.price?.id,
                    productName: (li.price?.product as any)?.name,
                })) ?? [],
        });
    } catch (e: any) {
        console.error('Success API error:', e);
        return NextResponse.json({ ok: false, error: 'SESSION_LOOKUP_FAILED' }, { status: 500 });
    }
}
