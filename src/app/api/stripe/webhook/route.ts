// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient } from 'mongodb';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-09-30.clover' });
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB || 'kaucjaflow';

let client: MongoClient | null = null;
async function getDb() {
    if (!client) client = new MongoClient(MONGODB_URI);
    // @ts-ignore (topology private in types)
    if (!client.topology?.isConnected()) await client.connect();
    const db = client.db(DB_NAME);
    return { users: db.collection('users') };
}

// Consideriamo "attivo" se la sub è attiva, in prova o in past_due (grazia)
function activeFromStatus(status?: Stripe.Subscription.Status | null) {
    return status === 'active' || status === 'trialing' || status === 'past_due';
}

function subSnapshot(s: Stripe.Subscription | null | undefined) {
    if (!s) return {};
    const price = s.items?.data?.[0]?.price?.id;
    // Alcune versioni dei tipi non includono current_period_end: leggiamolo via any.
    const periodEndUnix = (s as any)?.current_period_end as number | undefined;

    return {
        stripeStatus: s.status,
        stripeCancelAtPeriodEnd: s.cancel_at_period_end ?? false,
        stripeCurrentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : undefined,
        stripePriceId: price,
    };
}


export async function POST(req: Request) {
    // 1) Verifica firma
    const body = Buffer.from(await req.arrayBuffer());
    const sig = req.headers.get('stripe-signature') || '';
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } catch (err: any) {
        return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
    }

    const { users } = await getDb();

    switch (event.type) {
        case 'checkout.session.completed': {
            const s = event.data.object as Stripe.Checkout.Session;

            // Email dal checkout / customer
            const email =
                s.customer_details?.email ||
                s.customer_email ||
                (typeof s.customer === 'string'
                    ? (await stripe.customers.retrieve(s.customer))['email']
                    : null);

            const subscriptionId = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id;
            const customerId = typeof s.customer === 'string' ? s.customer : s.customer?.id;

            // Proviamo a espandere la subscription per snapshot stato/periodo
            let sub: Stripe.Subscription | undefined;
            if (subscriptionId) {
                try {
                    sub = await stripe.subscriptions.retrieve(subscriptionId);
                } catch { }
            }

            if (email) {
                await users.updateOne(
                    { email: email.toLowerCase() },
                    {
                        $set: {
                            email: email.toLowerCase(),
                            active: true, // checkout completato → in genere 'trialing' con trial_end
                            stripeCustomerId: customerId,
                            stripeSubscriptionId: subscriptionId,
                            updatedAt: new Date(),
                            ...subSnapshot(sub),
                        },
                        $setOnInsert: { createdAt: new Date(), role: 'cashier', shops: [] },
                    },
                    { upsert: true }
                );
            }
            break;
        }

        case 'invoice.payment_succeeded': {
            const inv = event.data.object as Stripe.Invoice;
            const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
            if (subId) {
                // Recupera la sub per avere status aggiornato e period_end
                let sub: Stripe.Subscription | undefined;
                try {
                    sub = await stripe.subscriptions.retrieve(subId);
                } catch { }
                await users.updateOne(
                    { stripeSubscriptionId: subId },
                    { $set: { active: activeFromStatus(sub?.status), updatedAt: new Date(), ...subSnapshot(sub) } }
                );
            }
            break;
        }

        case 'invoice.payment_failed': {
            const inv = event.data.object as Stripe.Invoice;
            const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
            if (subId) {
                // Se fallisce un rinnovo, segniamo non attivo (puoi tenerlo true se concedi più grazia)
                let sub: Stripe.Subscription | undefined;
                try {
                    sub = await stripe.subscriptions.retrieve(subId);
                } catch { }
                await users.updateOne(
                    { stripeSubscriptionId: subId },
                    { $set: { active: false, updatedAt: new Date(), ...subSnapshot(sub) } }
                );
            }
            break;
        }

        case 'customer.subscription.updated': {
            const sub = event.data.object as Stripe.Subscription;
            // Aggiorna in base allo status ufficiale
            await users.updateOne(
                { stripeSubscriptionId: sub.id },
                { $set: { active: activeFromStatus(sub.status), updatedAt: new Date(), ...subSnapshot(sub) } }
            );
            break;
        }

        case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription;
            await users.updateOne(
                { stripeSubscriptionId: sub.id },
                { $set: { active: false, updatedAt: new Date(), ...subSnapshot(sub) } }
            );
            break;
        }
    }

    return NextResponse.json({ received: true });
}
