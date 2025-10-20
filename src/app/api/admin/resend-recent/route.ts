import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const apiKey = process.env.RESEND_API_KEY || '';
    if (!apiKey) return NextResponse.json({ ok: false, error: 'NO_API_KEY' }, { status: 500 });
    console.log('[RESEND LIST using key]', (apiKey || '').slice(0, 10));

    const resend = new Resend(apiKey);

    // Alcune versioni supportano list(); altre richiedono search. Proviamo list() prima.
    try {
        // @ts-ignore: types variano tra versioni
        const { data, error } = await resend.emails.list({ limit: 10 });
        if (error) return NextResponse.json({ ok: false, error }, { status: 500 });
        return NextResponse.json({ ok: true, data });
    } catch (e: any) {
        // fallback semplice: nessuna eccezione non gestita
        return NextResponse.json({ ok: false, error: e?.message || 'LIST_FAILED' }, { status: 500 });
    }
}
