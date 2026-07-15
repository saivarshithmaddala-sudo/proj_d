import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import { Terminal, Users, Database } from "lucide-react";

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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-neutral-950 text-neutral-100 min-h-screen flex flex-col`}
      >
        {/* Navigation Bar */}
        <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                <Database className="h-4.5 w-4.5 text-teal-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-sm tracking-wider font-bold text-neutral-200">ZAMAZON</span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400 font-semibold -mt-1">Identity Engine</span>
              </div>
            </div>

            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium font-mono text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors"
              >
                <Terminal className="h-3.5 w-3.5" />
                Playground
              </Link>
              <Link
                href="/contacts"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium font-mono text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors"
              >
                <Users className="h-3.5 w-3.5" />
                Admin Console
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Engine: Active</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-900 bg-neutral-950/80 py-4 text-center">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>© 2026 Zamazon Tech Inc.</span>
            <span>Version 1.0.0 (MongoDB Cluster)</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
