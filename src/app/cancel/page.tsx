import Link from 'next/link';

export default function CancelPage() {
  return (
    
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-xl p-8 rounded-2xl border border-white/10 bg-neutral-900/70 backdrop-blur">
        <h1 className="text-2xl font-semibold">Anulowano</h1>
        <p className="mt-2 text-neutral-300">
          Zrezygnowano z finalizacji. Możesz spróbować ponownie w dowolnym momencie.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/login" className="inline-flex items-center justify-center h-11 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition">
            Wróć do logowania
          </Link>
          <Link href="/" className="inline-flex items-center justify-center h-11 rounded-lg border border-white/10 bg-neutral-800 hover:bg-neutral-700 transition">
            Strona główna
          </Link>
        </div>
      </div>
    </main>
  );
}
