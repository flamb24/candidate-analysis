import type { Metadata } from "next";
import { Literata } from "next/font/google";
import Script from "next/script";
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
  title: "Distrett. — Malta General Election 2026",
  description:
    "Know who you're really voting for. Every candidate in your district — track record, controversies, and stances on the issues that matter.",
  metadataBase: new URL("https://distrett.com"),
  openGraph: {
    title: "Distrett. — Malta General Election 2026",
    description:
      "Know who you're really voting for. Every candidate in your district — track record, controversies, and stances on the issues that matter.",
    url: "https://distrett.com",
    siteName: "Distrett.",
    locale: "en_MT",
    type: "website",
    images: [{ url: "https://distrett.com/meta.jpg", width: 1200, height: 630, type: "image/jpeg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Distrett. — Malta General Election 2026",
    description:
      "Know who you're really voting for. Every candidate in your district — track record, controversies, and stances on the issues that matter.",
    images: ["https://distrett.com/meta.jpg"],
  },
  manifest: "/manifest.json",
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
        <Script
          id="formbricks"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(){var appUrl="https://app.formbricks.com";var environmentId="cmp8gh0s1wbyasl01wo7j4ie2";var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src=appUrl+"/js/formbricks.umd.cjs",t.onload=function(){window.formbricks?window.formbricks.setup({environmentId:environmentId,appUrl:appUrl}):console.error("Formbricks library failed to load properly. The formbricks object is not available.");};var e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(t,e)}();`,
          }}
        />
      </body>
    </html>
  );
}
