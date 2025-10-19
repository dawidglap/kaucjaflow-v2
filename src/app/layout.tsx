import "./globals.css";
export const metadata = { title: "KaucjaFlow" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className="min-h-screen bg-black text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
