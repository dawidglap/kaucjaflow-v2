import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const raw = url.searchParams.get('id') ?? '';
    const id = decodeURIComponent(raw).trim();     // ← sanifica

    // UUID v4/v1 semplice
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(id)) {
        return NextResponse.json(
            { ok: false, error: 'INVALID_ID_FORMAT', hint: 'Passa l\'ID esatto che vedi in console/alert, es. d875609b-1996-47b4-a6a3-a602787cf7dc' },
            { status: 400 }
        );
    }

    const apiKey = process.env.RESEND_API_KEY || '';
    if (!apiKey) return NextResponse.json({ ok: false, error: 'NO_API_KEY' }, { status: 500 });
    console.log('[RESEND STATUS using key]', (apiKey || '').slice(0, 10));

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.get(id);

    if (error) return NextResponse.json({ ok: false, error }, { status: 500 });
    return NextResponse.json({ ok: true, data });
}
