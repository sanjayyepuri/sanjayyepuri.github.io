import "./global.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import { Navbar } from "./components/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "./components/footer";
import SkyGradient from "./components/sky-gradient";
import { baseUrl } from "./sitemap";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Sanjay Yepuri",
    template: "%s | Sanjay Yepuri",
  },
  description: "Sanjay Yepuri's personal website",
  openGraph: {
    title: "Sanjay Yepuri",
    description: "Sanjay Yepuri's personal website",
    url: baseUrl,
    siteName: "Sanjay Yepuri",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const departureMono = localFont({
  src: "./fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure",
  weight: "400",
});

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cx(
        "text-black dark:text-white dark",
        GeistSans.variable,
        GeistMono.variable,
        departureMono.variable
      )}
    >
      <body className="antialiased max-w-xl mx-4 mt-8">
        <SkyGradient />
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0 relative z-10">
          <Navbar />
          <div className="flex gap-4">
            <h1 className="writing-mode-vertical flex-shrink-0 tracking-tighter sticky self-start hidden sm:block" style={{ top: '2rem', fontSize: '22px' }}>
              sanjay <span> • engineering </span>
            </h1>
            <div className="flex-1">
              {children}
              <Footer  />
            </div>
          </div>
          <Analytics />
          <SpeedInsights />
        </main>
      </body>
    </html>
  );
}
