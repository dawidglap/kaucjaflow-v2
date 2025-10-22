// src/app/checkout/success/page.tsx

import SuccessClient from "../checkout/success/page";


export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sessionId = typeof searchParams?.session_id === 'string' ? searchParams.session_id : '';
  return <SuccessClient sessionId={sessionId} />;
}
