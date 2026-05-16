import type { Metadata } from "next";
import { Literata } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import HVToggle from "@/components/HVToggle";
import ShareButton from "@/components/ShareButton";
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
          <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-3 sm:px-6">
            <nav className="flex items-center gap-2 sm:gap-3 text-sm text-muted">
              <ShareButton />
              <HVToggle />
            </nav>
          </div>
        </header>
        <main className="w-full flex-1">
          {children}
        </main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted">
          Data compiled from public sources. Editorial assessments — not predictions.
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
