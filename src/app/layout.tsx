import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { Terminal, Users, Database } from "lucide-react";
import dynamic from "next/dynamic";

const LiquidEther = dynamic(() => import("@/components/LiquidEther"), { ssr: false });

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

export const metadata: Metadata = {
  title: "Zamazon Identity Engine — Control Console",
  description: "Identity Reconciliation playground and admin console for real-time contact clustering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-neutral-950 text-neutral-100 min-h-screen flex flex-col relative`}
      >
        {/* ── LiquidEther Full-screen Background ────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            // Very subtle: blend the canvas so UI text stays readable
            opacity: 0.55,
            mixBlendMode: "screen",
          }}
        >
          <LiquidEther
            colors={["#0d9488", "#6366f1", "#0891b2", "#14b8a6"]}
            mouseForce={25}
            cursorSize={120}
            resolution={0.5}
            autoDemo={true}
            autoSpeed={0.35}
            autoIntensity={2.5}
            autoResumeDelay={2000}
            autoRampDuration={0.8}
            takeoverDuration={0.3}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* ── Dark base layer so text stays legible ─────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1,
            background: "rgba(3,7,18,0.72)",
            pointerEvents: "none",
          }}
        />

        {/* ── Navigation Bar ─────────────────────────────────────────────── */}
        <header className="border-b border-neutral-800/80 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50 relative">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-950/20">
                <Database className="h-5 w-5 text-teal-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-sm tracking-wider font-bold text-neutral-100">ZAMAZON</span>
                <span className="text-[9px] uppercase font-mono tracking-widest text-teal-400 font-semibold -mt-0.5">
                  Identity Engine
                </span>
              </div>
            </div>

            <nav className="flex items-center gap-1.5">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 transition-all"
              >
                <Terminal className="h-3.5 w-3.5" />
                Playground
              </Link>
              <Link
                href="/contacts"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium font-mono text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 transition-all"
              >
                <Users className="h-3.5 w-3.5" />
                Admin Console
              </Link>
            </nav>

            <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 px-2.5 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-mono text-neutral-300 uppercase tracking-widest font-semibold">
                Active
              </span>
            </div>
          </div>
        </header>

        {/* ── Main Content ───────────────────────────────────────────────── */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 relative z-10">
          {children}
        </main>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="border-t border-neutral-900 bg-neutral-950/80 py-6 relative z-10">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-[10px] font-mono text-neutral-500">
            <span>© 2026 Zamazon Tech Inc.</span>
            <span>Version 1.0.0 (MongoDB Cluster)</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
