import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnalyticsGate from "@/components/AnalyticsGate";
import { MobileNavProvider } from "@/components/MobileNavProvider";
import MobileTabBar, { MobileTabBarInset } from "@/components/MobileTabBar";
import MobileMenuSheet from "@/components/MobileMenuSheet";
import { ROUTE_SEO } from "@/lib/seo-copy";
import { siteUrl } from "@/lib/site-url";

const inter = Inter({ subsets: ["latin"] });
const homeSeo = ROUTE_SEO["/"];

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: homeSeo.title,
    template: "%s — CerpaMedia",
  },
  description: homeSeo.description,
  applicationName: "CerpaMedia",
  openGraph: {
    type: "website",
    siteName: "CerpaMedia",
    title: homeSeo.title,
    description: homeSeo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: homeSeo.title,
    description: homeSeo.description,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MobileNavProvider>
          <MobileTabBarInset>
            <Navigation />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </MobileTabBarInset>
          <MobileMenuSheet />
          <MobileTabBar />
        </MobileNavProvider>
        <AnalyticsGate />
      </body>
    </html>
  );
}
