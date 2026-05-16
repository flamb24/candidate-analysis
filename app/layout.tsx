import type { Metadata } from "next";
import { Literata } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
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
        {/* High-vis preference: runs before hydration to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('hv')==='1')document.documentElement.classList.add('hv')}catch(e){}` }} />
        {/* Language preference: auto-redirect to /mt if user previously chose Maltese */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('lang')==='mt'&&!location.pathname.startsWith('/mt'))location.replace('/mt'+location.pathname)}catch(e){}` }} />
        <SiteHeader />
        <main className="w-full flex-1">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
