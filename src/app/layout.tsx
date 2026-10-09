import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnalyticsGate from "@/components/AnalyticsGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CerpaMedia - Technology Services for Small Business",
  description: "Strategic web development, AI integration, and automation consulting for small businesses. Expert guidance to help your business operate more efficiently.",
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
