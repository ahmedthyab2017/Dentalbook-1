import type { Metadata, Viewport } from "next";
import { Inter, Tajawal } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "dentalbook — Dental Clinic Management",
  description: "Premium dental clinic management platform",
  manifest: "/manifest.json",
  applicationName: "dentalbook",
  keywords: ["dental", "clinic", "pwa", "management"],
  icons: [
    { rel: "icon", url: "/icon.svg" },
    { rel: "apple-touch-icon", url: "/icons/icon-192.svg" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "dentalbook",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0052FF" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${tajawal.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
