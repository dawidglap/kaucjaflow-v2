// src/app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const PRICE_ID = process.env.SUBS_PRICE_ID!;

function trialEndEpoch() {
    // 31.12.2025 23:59:59 UTC
    return Math.floor(new Date('2025-12-31T23:59:59Z').getTime() / 1000);
}

export async function POST(req: Request) {
    await stripe.prices.retrieve(PRICE_ID); // se è sbagliato, qui esplode con "No such price"

    try {
        const { email } = await req.json().catch(() => ({}));
        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        // 1) Usa/crea Customer by email (evita duplicati)
        const { data: existing } = await stripe.customers.list({ email, limit: 1 });
        const customer = existing[0] ?? await stripe.customers.create({ email });

        // 2) Crea Checkout Session in modalità SUBSCRIPTION con trial fino al 31.12.2025
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: customer.id,
            line_items: [{ price: PRICE_ID, quantity: 1 }],
            allow_promotion_codes: true,
            subscription_data: {
                trial_end: trialEndEpoch(),
                metadata: { product: 'kaucjaflow_subscription', free_until: '2025-12-31' },
            },
            success_url: `${APP_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${APP_BASE_URL}/cancel`,

            // Facoltativo: imposta valuta/paese se vuoi forzare PL
            // currency: 'pln',
            // locale: 'pl',
        });

        return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (err: any) {
        // LOG dettagliati sul server
        console.error('Checkout error:', {
            message: err?.message,
            type: err?.type,
            code: err?.code,
            raw: err?.raw?.message,
        });
        // manda all'UI il messaggio Stripe se disponibile
        const msg = err?.raw?.message || err?.message || 'Internal error';
        return NextResponse.json({ error: msg }, { status: 400 });
    }

}

// (opzionale) blocca GET per sicurezza
export async function GET() {
    return NextResponse.json({ ok: true, hint: 'POST email to create a session' });
}
