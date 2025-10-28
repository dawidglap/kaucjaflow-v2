import "./globals.css";
import Script from "next/script";
import type { Metadata } from "next";

const siteName = "KaucjaFlow – system kaucji dla wszystkich.";
const baseUrl  = "https://partners.kaucjaflow.pl";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "KaucjaFlow — proste rozliczanie kaucji dla wszystkich.",
    template: "%s | KaucjaFlow",
  },
  description:
    "KaucjaFlow pomaga małym i średnim sklepom w Polsce szybko i zgodnie z prawem obsługiwać kaucję za butelki PET, szkło i puszki. Zarejestruj sklep za darmo do 31.12.2025 i uruchom obsługę zwrotów w kilka minut.",
  keywords: [
    "kaucja", "ustawa kaucyjna", "zwroty butelek", "PET", "szkło", "puszki",
    "POS", "SaaS", "mały sklep", "osiedlowy", "Polska", "paragon", "ewidencja kaucji"
  ],
  authors: [{ name: "KaucjaFlow" }],
  creator: "KaucjaFlow",
  publisher: "KaucjaFlow",
  category: "business",
  alternates: {
    canonical: "./", // canonical relativo al path corrente
    languages: {
      "pl-PL": "/",
      "en": "/en",
      "it": "/it",
    },
  },
  openGraph: {
    type: "website",
    url: baseUrl,
    siteName: "KaucjaFlow",
    title: "KaucjaFlow — proste rozliczanie kaucji dla wszystkich.",
    description:
      "Obsługuj kaucję zgodnie z prawem. Darmowy dostęp do 31.12.2025. Działa na każdym urządzeniu.",
    images: [
      { url: "/og/og-image.png", width: 1200, height: 630, alt: "KaucjaFlow — panel POS kaucji" },
    ],
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    site: "@kaucjaflow",
    creator: "@kaucjaflow",
    title: "KaucjaFlow — POS do kaucji",
    description:
      "Szybka obsługa kaucji w sklepie. Darmowy dostęp do 31.12.2025.",
    images: ["/og/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    // segnali extra per serp
    googleBot: { index: true, follow: true, maxSnippet: -1, maxImagePreview: "large", maxVideoPreview: -1 },
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const allowLocalhost = process.env.NODE_ENV !== "production" ? "true" : undefined;

  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <Script
          id="datafast"
          src="https://datafa.st/js/script.js"
          strategy="afterInteractive"
          defer
          data-website-id={process.env.NEXT_PUBLIC_DATAFAST_ID || "dfid_b40SWrSsqJyf7Yi1PCluc"}
          data-domain={process.env.NEXT_PUBLIC_DATAFAST_DOMAIN || "partners.kaucjaflow.pl"}
          {...(allowLocalhost ? { ["data-allow-localhost"]: allowLocalhost } : {})}
        />
      </head>
      <body className="min-h-screen bg-black text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
