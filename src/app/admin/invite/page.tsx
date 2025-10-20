'use client';
import { useState } from 'react';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [shop, setShop] = useState('Shop 1');
  const [role, setRole] = useState<'admin'|'cashier'>('cashier');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true); setMsg(null); setPreview(null);
    try {
      const r = await fetch('/api/auth/magic/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, shopName: shop, role }),
      });
      const j = await r.json().catch(() => ({}));
      if (j?.ok) {
        setMsg(`Inviato! id: ${j.id || 'n/a'} ${j.delivered ? '(email inviata)' : '(vedi console)'}`);
        if (j.preview) setPreview(j.preview as string); // link diretto in dev
      } else {
        setMsg('Errore: ' + (typeof j?.error === 'string' ? j.error : JSON.stringify(j?.error || r.status)));
      }
    } finally { setSending(false); }
  }

  return (
    <main className="min-h-[100svh] p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Invita negozio</h1>
      <form onSubmit={onSend} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Shop</label>
          <input value={shop} onChange={e=>setShop(e.target.value)}
            className="w-full h-10 rounded-md border border-white/10 bg-black/40 text-white px-3 outline-none" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
            className="w-full h-10 rounded-md border border-white/10 bg-black/40 text-white px-3 outline-none" />
        </div>
        <div>
          <label className="block text-sm mb-1">Ruolo</label>
          <select value={role} onChange={e=>setRole(e.target.value as 'admin'|'cashier')}
            className="w-full h-10 rounded-md border border-white/10 bg-black/40 text-white px-3 outline-none">
            <option value="cashier">cashier</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <button disabled={sending}
          className="px-4 py-2 rounded-lg bg-white text-black disabled:opacity-50">
          {sending ? 'Invio…' : 'Invia magic link'}
        </button>
      </form>

      {msg && <p className="text-sm">{msg}</p>}
      {preview && (
        <div className="p-3 rounded-lg bg-neutral-900 border border-white/10">
          <div className="text-sm mb-2">Link diretto (dev):</div>
          <a href={preview} className="break-all text-emerald-300 underline">{preview}</a>
        </div>
      )}
      <hr className="border-white/10" />
      <p className="text-sm text-neutral-400">
        Tip: crea <em>Shop 1…Shop 10</em> e manda 1 link per ogni negozio.
        Ogni shop vede solo i propri eventi.
      </p>
    </main>
  );
}
