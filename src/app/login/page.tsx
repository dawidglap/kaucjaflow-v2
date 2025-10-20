'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin1@demo.local');
  const [advanced, setAdvanced] = useState(false);
  const [shop, setShop] = useState('Shop 1');
  const [role, setRole] = useState<'admin' | 'cashier'>('admin');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setErr(null);
    try {
      const params = new URLSearchParams({
        email, to: '/pos',
        ...(advanced ? { shop, role } : { shop: 'Shop 1', role: 'admin' }),
      });
      window.location.href = `/api/auth/magic/dev-login?${params.toString()}`;
    } catch {
      setErr('Errore inatteso'); setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40"
        style={{background:'radial-gradient(1200px 600px at 80% -10%, #ffffff20 0%, #000000 60%), radial-gradient(900px 500px at -10% 110%, #ffffff15 0%, #000000 60%)'}}/>
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200">
            <span className="inline-block rotate-180 select-none">➜</span> Home
          </a>
        </div>
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-center pt-8">
            <div className="size-12 rounded-xl grid place-items-center bg-white/10">
              <span className="text-white font-semibold text-lg tracking-tight">K</span>
            </div>
          </div>
          <div className="px-8 pt-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Log in</h1>
            <p className="mt-1 text-sm text-neutral-400">Don&apos;t have an account? <span className="underline decoration-dotted">Sign up</span>.</p>
          </div>
          <form onSubmit={onSubmit} className="px-8 mt-6 space-y-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">Email</label>
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}
                placeholder="alan.turing@example.com"
                className="w-full h-11 rounded-lg border border-white/10 bg-black/40 text-white placeholder:text-neutral-500 px-3 outline-none focus:ring-2 focus:ring-white/20"/>
            </div>
            <details className="rounded-lg border border-white/10 bg-black/30 text-neutral-300"
              open={advanced} onToggle={(e)=>setAdvanced((e.target as HTMLDetailsElement).open)}>
              <summary className="cursor-pointer px-3 py-2 text-sm select-none">Advanced (DEV)</summary>
              <div className="p-3 grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Shop</label>
                  <input value={shop} onChange={(e)=>setShop(e.target.value)}
                    className="w-full h-10 rounded-md border border-white/10 bg-black/40 text-white px-3 outline-none focus:ring-2 focus:ring-white/20"/>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Role</label>
                  <select value={role} onChange={(e)=>setRole(e.target.value as any)}
                    className="w-full h-10 rounded-md border border-white/10 bg-black/40 text-white px-3 outline-none focus:ring-2 focus:ring-white/20">
                    <option value="admin">admin</option>
                    <option value="cashier">cashier</option>
                  </select>
                </div>
              </div>
            </details>
            {err && <p className="text-sm text-rose-400">{err}</p>}
            <button type="submit" disabled={submitting}
              className="w-full h-11 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 active:scale-[.99] transition disabled:opacity-50">
              {submitting ? 'Accesso…' : 'Log In'}
            </button>
            
<button
  type="button"
  onClick={async () => {
    const body = { email, shopName: advanced ? shop : 'Shop 1', role };
    const r = await fetch('/api/auth/magic/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (j?.ok) {
      alert(j.delivered ? `Email inviata! (id: ${j.id || 'n/a'})` : 'Link generato: guarda la console del server.');
    } else {
      const msg =
        typeof j?.error === 'string' ? j.error :
        j?.error ? JSON.stringify(j.error) :
        String(r.status);
      alert('Errore invio: ' + msg);
    }
  }}
  className="w-full h-11 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition"
>
  Invia Magic Link
</button>


            <p className="pb-8 text-xs text-neutral-500">By signing in, you agree to our <span className="underline decoration-dotted">Terms</span> and <span className="underline decoration-dotted">Privacy Policy</span>.</p>
          </form>
        </div>
      </div>
    </main>
  );
}
