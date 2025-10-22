import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'node:crypto';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const MONGODB_URI = process.env.MONGODB_URI!;
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_LOGO_URL = process.env.EMAIL_LOGO_URL || `${APP_BASE_URL}/images/logo-email.png`;
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

function renderWelcomeEmail(loginUrl: string) {
    const pre = 'Witamy w KaucjaFlow! Dostęp jest aktywny. Zaloguj się jednym kliknięciem.';
    return `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<meta name="x-apple-disable-message-reformatting"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>KaucjaFlow – witamy!</title>
<style>@media (max-width:600px){.container{width:100%!important}.btn{width:100%!important}}</style>
</head><body style="margin:0;padding:0;background-color:#f6f7f9;">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;color:transparent;">${pre}</div>
<table role="presentation" width="100%" style="background-color:#f6f7f9;padding:24px 0;">
<tr><td align="center"><table role="presentation" width="600" class="container" style="width:600px;max-width:100%;">
<tr><td style="padding:16px 24px;text-align:left;">
  <img src="${EMAIL_LOGO_URL}" width="160" height="48" alt="KaucjaFlow" style="display:block;height:auto;border:0;outline:none;text-decoration:none;">
</td></tr>
<tr><td style="padding:0 24px 24px 24px;">
  <table role="presentation" width="100%" style="background:#fff;border-radius:12px;border:1px solid #e7e8eb;">
    <tr><td style="padding:28px 24px 8px 24px;"><h1 style="margin:0;font-size:20px;line-height:28px;color:#0f1720;font-weight:700;">Witamy w KaucjaFlow 🎉</h1></td></tr>
    <tr><td style="padding:4px 24px 16px 24px;"><p style="margin:0;font-size:14px;line-height:20px;color:#48505e;">
      Dostęp został aktywowany. Zaloguj się – użyj swojego adresu e-mail i wybierz „Wyślij magic link”.</p></td></tr>
    <tr><td style="padding:8px 24px;">
      <table role="presentation" class="btn" style="border-collapse:separate;"><tr>
        <td align="center" bgcolor="#111111" style="border-radius:10px;">
          <a href="${loginUrl}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;padding:12px 20px;font-size:14px;line-height:20px;color:#ffffff;text-decoration:none;font-weight:600;border-radius:10px;background:#111111;">
             Zaloguj się
          </a>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:8px 24px;"><p style="margin:0;font-size:12px;line-height:18px;color:#6b7280;">Wsparcie: support@kaucjaflow.pl</p></td></tr>
  </table>
</td></tr>
</table></td></tr>
</table></body></html>`;
}

function renderWelcomeText(loginUrl: string) {
    return [
        'Witamy w KaucjaFlow!',
        '',
        'Dostęp został aktywny. Zaloguj się pod poniższym adresem:',
        loginUrl,
        '',
        'Użyj swojego adresu e-mail i wybierz „Wyślij magic link”.',
    ].join('\n');
}


const genToken = () => crypto.randomBytes(24).toString('base64url');

// ---------------- Email template (HTML + TEXT) ----------------
function renderMagicEmail(verifyUrl: string) {
    const preheader =
        'Twój jednorazowy link logowania do KaucjaFlow. Link wygaśnie za 15 minut.';
    // NB: stili inline e layout a tabelle per compatibilità
    return `<!doctype html>
<html lang="pl" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>KaucjaFlow – link logowania</title>
  <style>
    /* Alcuni client non leggono <style>, quindi tutto l’essenziale è inline.
       Tenere qui solo reset non critici. */
    @media (max-width: 600px) {
      .container { width: 100% !important; }
      .btn { width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f6f7f9;">
  <!-- Preheader (nascosto) -->
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;color:transparent;">
    ${preheader}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f6f7f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding:16px 24px;text-align:left;">
              <img src="${EMAIL_LOGO_URL}" width="160" height="48" alt="KaucjaFlow" style="display:block;height:auto;border:0;outline:none;text-decoration:none;">
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="padding:0 24px 24px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffffff;border-radius:12px;border:1px solid #e7e8eb;">
                <tr>
                  <td style="padding:28px 24px 8px 24px;text-align:left;">
                    <h1 style="margin:0;font-size:20px;line-height:28px;color:#0f1720;font-weight:700;">Zaloguj się jednym kliknięciem</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 24px 16px 24px;text-align:left;">
                    <p style="margin:0;font-size:14px;line-height:20px;color:#48505e;">
                      Poniżej znajdziesz jednorazowy link logowania do panelu partnera KaucjaFlow.
                      Link wygaśnie za <strong>15 minut</strong>.
                    </p>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding:8px 24px 8px 24px;text-align:left;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="btn" style="border-collapse:separate;">
                      <tr>
                        <td align="center" bgcolor="#111111" style="border-radius:10px;">
                          <a href="${verifyUrl}" target="_blank" rel="noopener noreferrer"
                            style="display:inline-block;padding:12px 20px;font-size:14px;line-height:20px;color:#ffffff;text-decoration:none;font-weight:600;border-radius:10px;background:#111111;">
                            Zaloguj się
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Link alternatywny (kopiuj-wklej) -->
                <tr>
                  <td style="padding:8px 24px 8px 24px;text-align:left;">
                    <p style="margin:0;font-size:12px;line-height:18px;color:#6b7280;">
                      Jeśli przycisk nie działa, skopiuj i wklej ten adres w przeglądarce:
                      <br>
                      <a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" style="color:#0b57d0;text-decoration:underline;word-break:break-all;">
                        ${verifyUrl}
                      </a>
                    </p>
                  </td>
                </tr>

                <!-- Wskazówki -->
                <tr>
                  <td style="padding:12px 24px 8px 24px;text-align:left;">
                    <p style="margin:0;font-size:12px;line-height:18px;color:#6b7280;">
                      Nie widzisz wiadomości w skrzynce? Sprawdź folder SPAM lub poczekaj chwilę i spróbuj ponownie.
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:8px 24px 0 24px;">
                    <hr style="border:none;border-top:1px solid #eceff3;margin:0;">
                  </td>
                </tr>

                <!-- Bezpieczeństwo -->
                <tr>
                  <td style="padding:12px 24px 20px 24px;text-align:left;">
                    <p style="margin:0;font-size:12px;line-height:18px;color:#6b7280;">
                      Jeśli to nie Ty inicjowałeś logowanie, zignoruj tę wiadomość. Link przestanie działać po upływie czasu ważności.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:transparent;">
                <tr>
                  <td style="padding:8px 0 0 0;text-align:left;">
                    <p style="margin:0;font-size:11px;line-height:16px;color:#7b818a;">
                      Kontakt: <a href="mailto:support@kaucjaflow.pl" style="color:#0b57d0;text-decoration:underline;">support@kaucjaflow.pl</a>
                      <br>Ta wiadomość ma charakter transakcyjny.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="height:8px;"></td>
                </tr>
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

function renderMagicText(verifyUrl: string) {
    return [
        'KaucjaFlow — link logowania',
        '',
        'Zaloguj się jednym kliknięciem:',
        verifyUrl,
        '',
        'Link wygaśnie za 15 minut.',
        'Jeśli to nie Ty inicjowałeś logowanie, zignoruj tę wiadomość.',
        '',
        'Kontakt: support@kaucjaflow.pl',
    ].join('\n');
}

// ---------------- Handler ----------------
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

    // 🔒 Verifica abbonamento attivo
    // 🔒 Verifica/Provisioning utente (con invito admin)
    let user = await users.findOne({ email: emailLc });

    const isAdminInvite = !!shopName;   // /admin/invite passa shopName
    let justCreated = false;
    let activatedNow = false;

    if (!user) {
        if (!DEV && !isAdminInvite) {
            return NextResponse.json({ ok: false, error: 'INVITE_REQUIRED' }, { status: 403 });
        }
        // crea shop se serve
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
            active: true,               // attivo per invito admin
            welcomeSent: false,         // flag anti-doppione
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        user = await users.findOne({ _id: insUser.insertedId });
        justCreated = true;
    } else {
        // utente già esiste: se arriva invito admin e non è attivo → attivalo ora
        if (isAdminInvite && user.active !== true) {
            await users.updateOne({ _id: user._id }, { $set: { active: true, updatedAt: new Date() } });
            user = await users.findOne({ _id: user._id });
            activatedNow = true;
        }
    }

    // ✉️ Welcome solo per invito admin (una volta sola)
    if (
        isAdminInvite &&
        RESEND_API_KEY &&
        (justCreated || activatedNow || !user?.welcomeSent)
    ) {
        try {
            const resend = new Resend(RESEND_API_KEY);
            await resend.emails.send({
                from: 'KaucjaFlow <welcome@kaucjaflow.pl>',
                to: [emailLc],
                subject: 'Witamy w KaucjaFlow – dostęp aktywny',
                html: renderWelcomeEmail(`${APP_BASE_URL}/login`),
                text: renderWelcomeText(`${APP_BASE_URL}/login`),
                headers: { 'X-KF-Event': 'admin.invite' },
            });
            await users.updateOne(
                { _id: user!._id },
                { $set: { welcomeSent: true, updatedAt: new Date() } }
            );
        } catch (e) {
            console.error('[WELCOME EMAIL INVITE ERROR]', e);
        }
    }



    // Safety: in produzione prendiamo shop/role dall’utente
    const shopId = String(user!.shopId);
    const finalRole = user!.role;

    // 2) Token monouso (15 min)
    const token = genToken();
    const expiresAt = new Date(Date.now() + 15 * 60_000);

    await tokens.insertOne({
        token,
        userId: String(user!._id),
        shopId,
        role: finalRole,
        email: emailLc,
        createdAt: new Date(),
        expiresAt,
        used: false,
    });

    const verifyUrl = `${APP_BASE_URL}/api/auth/magic/verify?token=${encodeURIComponent(token)}`;

    // 3) Invio email
    if (!RESEND_API_KEY) {
        console.log('[MAGIC LINK]', verifyUrl);
        return NextResponse.json({ ok: true, delivered: false, where: 'console', preview: verifyUrl });
    }

    try {
        const resend = new Resend(RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'KaucjaFlow <login@kaucjaflow.pl>',
            to: [emailLc],
            subject: 'Twój link logowania — KaucjaFlow',
            html: renderMagicEmail(verifyUrl),
            text: renderMagicText(verifyUrl),
            headers: {
                'X-KF-Magic-Token': token,
            },
        });

        if (error) {
            console.error('[RESEND ERROR]', error);
            return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
        }

        return NextResponse.json({ ok: true, delivered: true, id: data?.id });
    } catch (e: any) {
        console.error('[RESEND THROW]', e);
        return NextResponse.json({ ok: false, error: e?.message || 'RESEND_THROW' }, { status: 500 });
    }
}
