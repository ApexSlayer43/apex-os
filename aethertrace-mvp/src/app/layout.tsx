import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * AetherTrace Root Layout
 * Typography: IBM Plex Sans (body) + IBM Plex Mono (hashes)
 * Per PRISM design brief — Trust Fortress style
 *
 * Using next/font/local with Google Fonts CDN fallback in globals.css
 * to avoid build-time fetch failures in restricted network environments.
 * When deploying to Vercel, can switch back to next/font/google.
 */

export const metadata: Metadata = {
  title: "AetherTrace — Evidence Custody",
  description:
    "Cryptographically enforced evidence custody. Prove what happened, when it happened, and whether the record has been altered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
