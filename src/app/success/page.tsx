// src/app/checkout/success/page.tsx
// ⬅️ NON "../checkout/success/page"

import SuccessClient from "./SuccessClient";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sessionId =
    typeof searchParams?.session_id === 'string' ? searchParams.session_id : '';
  return <SuccessClient sessionId={sessionId} />;
}
