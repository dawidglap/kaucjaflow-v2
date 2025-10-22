// src/app/success/page.tsx
import SuccessClient from './SuccessClient';

export default async function Page({
  searchParams,
}: {
  // In Next.js 15, searchParams è una Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const sessionId =
    typeof sp?.session_id === 'string' ? sp.session_id : '';

  return <SuccessClient sessionId={sessionId} />;
}
