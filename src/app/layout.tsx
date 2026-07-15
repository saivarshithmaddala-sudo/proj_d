import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { Terminal, Users, Database } from "lucide-react";
import dynamic from "next/dynamic";

const LiquidEtherBackground = dynamic(
  () => import("@/components/LiquidEtherBackground"),
  { ssr: false }
);

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Zamazon Identity Engine — Control Console",
  description:
    "Identity Reconciliation playground and admin console for real-time contact clustering.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-neutral-950 text-neutral-100 min-h-screen flex flex-col relative overflow-x-hidden`}
      >
        {/* ── Adaptive LiquidEther background (client-side, respects device) ── */}
        <LiquidEtherBackground />

        {/* ── Dark overlay keeps text legible on all devices ─────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1,
            background: "rgba(3,7,18,0.75)",
            pointerEvents: "none",
          }}
        />

        {/* ── Navigation Bar ─────────────────────────────────────────────── */}
        <header className="border-b border-neutral-800/80 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-950/20">
                <Database className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs sm:text-sm tracking-wider font-bold text-neutral-100">
                  ZAMAZON
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-mono tracking-widest text-teal-400 font-semibold -mt-0.5">
                  Identity Engine
                </span>
              </div>
            </Link>

            {/* Nav links — icon-only on mobile, icon+text on sm+ */}
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium font-mono text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 active:bg-neutral-900 transition-all"
                title="Playground"
              >
                <Terminal className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Playground</span>
              </Link>
              <Link
                href="/contacts"
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium font-mono text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 active:bg-neutral-900 transition-all"
                title="Admin Console"
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Admin Console</span>
              </Link>
            </nav>

            {/* Status pill */}
            <div className="flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 px-2 sm:px-2.5 py-1 rounded-full shrink-0">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500" />
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono text-neutral-300 uppercase tracking-widest font-semibold">
                <span className="hidden sm:inline">Active</span>
                <span className="sm:hidden">ON</span>
              </span>
            </div>
          </div>
        </header>

        {/* ── Main Content ───────────────────────────────────────────────── */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-5 sm:py-8 relative z-10">
          {children}
        </main>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="border-t border-neutral-900 bg-neutral-950/80 py-4 sm:py-6 relative z-10">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] font-mono text-neutral-500">
            <span>© 2026 Zamazon Tech Inc.</span>
            <span>Version 1.0.0 (MongoDB Cluster)</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
