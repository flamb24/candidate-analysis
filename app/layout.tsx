import type { Metadata } from "next";
import { Literata } from "next/font/google";
import Link from "next/link";
import HVToggle from "@/components/HVToggle";
import "./globals.css";

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Malta General Election 2026 — Candidate Comparison",
  description:
    "Browse and compare candidates contesting the Malta General Election 2026 by district.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${literata.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Runs before hydration to avoid flash when HV was previously enabled */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('hv')==='1')document.documentElement.classList.add('hv')}catch(e){}` }} />
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="font-semibold tracking-tight leading-tight text-sm sm:text-base">
              Malta General Election 2026
            </Link>
            <nav className="flex items-center gap-3 text-sm text-muted">
              <span className="hidden sm:inline">Election: 30 May 2026</span>
              <span className="sm:hidden">30 May</span>
              <HVToggle />
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted">
          Data compiled from public sources. Editorial assessments — not predictions.
        </footer>
      </body>
    </html>
  );
}
