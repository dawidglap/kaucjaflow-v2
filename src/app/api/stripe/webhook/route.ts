// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient } from 'mongodb';
import { Resend } from 'resend';



// ⬇️ aggiungi sotto gli import già presenti
const APP_BASE_URL =
    process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://partners.kaucjaflow.pl';
const EMAIL_LOGO_URL =
    process.env.EMAIL_LOGO_URL || `${APP_BASE_URL}/images/logo-email.png`;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

function isDeletedCustomer(x: any): x is Stripe.DeletedCustomer {
    return !!x && typeof x === 'object' && x.deleted === true;
}

function getTrialEndDate(sub?: Stripe.Subscription | undefined): Date | null {
    const unix = sub && (sub as any)?.trial_end;
    return typeof unix === 'number' ? new Date(unix * 1000) : null;
}



function fmtDate(d?: Date | null) {
    if (!d) return null;
    try {
        return d.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return d.toISOString().slice(0, 10);
    }
}

function renderWelcomeEmail(loginUrl: string, trialEnd?: Date | null) {
    const preheader =
        'Witamy w KaucjaFlow! Dostęp jest aktywny. Zaloguj się jednym kliknięciem.';
    const trialInfo = trialEnd ? `Darmowy okres trwa do <strong>${fmtDate(trialEnd)}</strong>.` : '';
    return `<!doctype html>
<html lang="pl" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>KaucjaFlow – witamy!</title>
  <style>
    @media (max-width: 600px) {
      .container { width: 100% !important; }
      .btn { width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f6f7f9;">
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;color:transparent;">
    ${preheader}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f6f7f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:100%;">
          <tr>
            <td style="padding:16px 24px;text-align:left;">
              <img src="${EMAIL_LOGO_URL}" width="160" height="48" alt="KaucjaFlow" style="display:block;height:auto;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px 24px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;border-radius:12px;border:1px solid #e7e8eb;">
                <tr>
                  <td style="padding:28px 24px 8px 24px;text-align:left;">
                    <h1 style="margin:0;font-size:20px;line-height:28px;color:#0f1720;font-weight:700;">Witamy w KaucjaFlow 🎉</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 24px 16px 24px;text-align:left;">
                    <p style="margin:0;font-size:14px;line-height:20px;color:#48505e;">
                      Dostęp został aktywowany. Zaloguj się, aby rozpocząć pracę kasjerów i generować raporty. ${trialInfo}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 24px 8px 24px;text-align:left;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="btn" style="border-collapse:separate;">
                      <tr>
                        <td align="center" bgcolor="#111111" style="border-radius:10px;">
                          <a href="${loginUrl}" target="_blank" rel="noopener noreferrer"
                            style="display:inline-block;padding:12px 20px;font-size:14px;line-height:20px;color:#ffffff;text-decoration:none;font-weight:600;border-radius:10px;background:#111111;">
                            Zaloguj się
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 24px 8px 24px;text-align:left;">
                    <p style="margin:0;font-size:12px;line-height:18px;color:#6b7280;">
                      Tip: użyj adresu e-mail z zakupu i wybierz „Wyślij magic link”. Jeśli aktywacja nie pojawi się od razu, poczekaj chwilę — potwierdzenie przychodzi przez webhook Stripe.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 24px 0 24px;"><hr style="border:none;border-top:1px solid #eceff3;margin:0;"></td>
                </tr>

                <tr>
                  <td style="padding:12px 24px 20px 24px;text-align:left;">
                    <p style="margin:0;font-size:12px;line-height:18px;color:#6b7280;">
                      Potrzebujesz pomocy? Napisz do nas: <a href="mailto:support@kaucjaflow.pl" style="color:#0b57d0;text-decoration:underline;">support@kaucjaflow.pl</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:transparent;">
                <tr>
                  <td style="padding:8px 0 0 0;text-align:left;">
                    <p style="margin:0;font-size:11px;line-height:16px;color:#7b818a;">
                      Ta wiadomość ma charakter transakcyjny. Dziękujemy za zaufanie!
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderWelcomeText(loginUrl: string, trialEnd?: Date | null) {
    return [
        'Witamy w KaucjaFlow!',
        '',
        'Dostęp został aktywowany. Zaloguj się pod poniższym adresem:',
        loginUrl,
        '',
        trialEnd ? `Darmowy okres trwa do: ${fmtDate(trialEnd)}.` : '',
        '',
        'Użyj adresu e-mail z zakupu i wybierz „Wyślij magic link”.',
        '',
        'Kontakt: support@kaucjaflow.pl',
    ].filter(Boolean).join('\n');
}


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

// active if sub is active/trialing/past_due (grace)
function activeFromStatus(status?: Stripe.Subscription.Status | null) {
    return status === 'active' || status === 'trialing' || status === 'past_due';
}

// snapshot metadata (loose read for current_period_end)
function subSnapshot(s: Stripe.Subscription | null | undefined) {
    if (!s) return {};
    const price = s.items?.data?.[0]?.price?.id;
    const periodEndUnix = (s as any)?.current_period_end as number | undefined;

    return {
        stripeStatus: s.status,
        stripeCancelAtPeriodEnd: s.cancel_at_period_end ?? false,
        stripeCurrentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : undefined,
        stripePriceId: price,
    };
}

export async function POST(req: Request) {
    // verify signature
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

            // 1) prendi email dal checkout o dal customer (fallback)
            let email: string | null =
                s.customer_details?.email ||
                s.customer_email ||
                null;

            if (!email && typeof s.customer === 'string') {
                try {
                    const resp = await stripe.customers.retrieve(s.customer);
                    if (!isDeletedCustomer(resp)) {
                        email = resp.email ?? null;
                    }
                } catch {
                    // ignore
                }
            }

            // 2) id sub e customer
            const subscriptionId =
                typeof s.subscription === 'string' ? s.subscription : s.subscription?.id;
            const customerId =
                typeof s.customer === 'string' ? s.customer : s.customer?.id;

            // 3) snapshot sub per trial_end / stato
            let sub: Stripe.Subscription | undefined;
            if (subscriptionId) {
                try {
                    sub = await stripe.subscriptions.retrieve(subscriptionId);
                } catch { /* ignore */ }
            }
            const trialEndDate = getTrialEndDate(sub);

            // 4) upsert utente
            if (email) {
                await users.updateOne(
                    { email: email.toLowerCase() },
                    {
                        $set: {
                            email: email.toLowerCase(),
                            active: true, // dopo checkout → in genere 'trialing'
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

            // 5) invia welcome (se c’è email e abbiamo chiave Resend)
            if (email && RESEND_API_KEY) {
                try {
                    const resend = new Resend(RESEND_API_KEY);
                    await resend.emails.send({
                        from: 'KaucjaFlow <welcome@kaucjaflow.pl>',
                        to: [email],
                        subject: 'Witamy w KaucjaFlow – dostęp aktywny',
                        html: renderWelcomeEmail(`${APP_BASE_URL}/login`, trialEndDate),
                        text: renderWelcomeText(`${APP_BASE_URL}/login`, trialEndDate),
                        headers: { 'X-KF-Event': 'checkout.session.completed' },
                    });
                } catch (e) {
                    console.error('[WELCOME EMAIL ERROR]', e);
                }
            }

            break;
        }


        case 'invoice.payment_succeeded': {
            const inv = event.data.object as Stripe.Invoice;
            // In this type set, subscription isn't exposed; read loosely.
            const invSub: any = (inv as any).subscription;
            const subId: string | undefined =
                typeof invSub === 'string' ? invSub : invSub?.id;

            if (subId) {
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
            const invSub: any = (inv as any).subscription;
            const subId: string | undefined =
                typeof invSub === 'string' ? invSub : invSub?.id;

            if (subId) {
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
