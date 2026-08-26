import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { FacebookPixel } from "@/components/FacebookPixel";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Zoma Tech - زوما تك لبيع الأجهزة الإلكترونية",
  description:
    "لابتوبات، كمبيوترات، شاشات، أنظمة كاشير، بروجيكتورات وجميع الأجهزة الإلكترونية  — كل حاجة في مكان واحد.",
  keywords: [
    "electronics", "laptops", "egypt", "tech store",
    "Zoma Tech", "POS systems", "monitors", "لابتوب", "شاشات", "مصر",
  ],
  openGraph: {
    title: "Zoma Tech - زوما تك لبيع الأجهزة الإلكترونية",
    description: "لابتوبات، كمبيوترات، شاشات، أنظمة كاشير، بروجيكتورات وجميع الأجهزة الإلكترونية  — كل حاجة في مكان واحد.",
    url: "/",
    siteName: "Zoma Tech",
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zoma Tech - زوما تك",
    description: "لابتوبات، كمبيوترات، شاشات، أنظمة كاشير، بروجيكتورات وجميع الأجهزة الإلكترونية.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // lang + dir are overridden client-side by LanguageProvider
    // Default to Arabic/RTL as primary language
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
        <FacebookPixel pixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID || ""} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
