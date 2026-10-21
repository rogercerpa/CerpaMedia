import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnalyticsGate from "@/components/AnalyticsGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CerpaMedia - Technology Services for Business Owners",
  description: "Web development, AI integration, and automation consulting for business owners. A clear plan, practical tools, and systems that run with less friction.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
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
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <AnalyticsGate />
      </body>
    </html>
  );
}
